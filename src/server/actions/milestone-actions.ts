'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { startOfWeek, startOfMonth, isWithinInterval } from 'date-fns'

// ────────────────────────────────────────────────────────────────────────────
// Phase 5 (S5.2): Flexible Monthly Milestone Engine
//
// Per spec §7B: 3/4 qualifying weeks → monthly milestone reached.
//
// "Qualifying week" = a week (Sun→Sat by default, or per family's weeklyStartDay)
// where the child has at least one APPROVED task occurrence. This is the gentle
// criterion — the child showed up, not necessarily perfectly.
//
// The threshold (requiredWeeks) is configurable per family in Settings
// (monthlyQualifyingWeeks, default 3). The engine reads this value at
// evaluation time so changes take effect immediately.
//
// Evaluation is idempotent: re-running the engine on the same period does not
// re-fire the qualification notification. The qualified flag transitions
// false→true only once, then stays true for the period.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compute the current period (month) for a family based on FamilySettings.
 *
 * - CALENDAR_MONTH: period = [1st of this month, 1st of next month)
 * - FOUR_WEEK: period = [1st of this month, +28 days) — simple 4-week cycle
 *   anchored to the month. (A more sophisticated 4-week cycle tied to
 *   weeklyStartDay is possible but adds complexity; for now, calendar-month
 *   anchoring is clean and predictable for families.)
 *
 * Returns { periodStart, periodEnd } where periodEnd is exclusive.
 */
function getCurrentPeriod(monthlyPlanType: string | null | undefined, now = new Date()) {
  const periodStart = startOfMonth(now)
  const periodEnd = new Date(periodStart)
  if (monthlyPlanType === 'FOUR_WEEK') {
    periodEnd.setDate(periodEnd.getDate() + 28)
  } else {
    // CALENDAR_MONTH (default)
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }
  return { periodStart, periodEnd }
}

/**
 * Map a JS day number (0=Sun … 6=Sat) to the date-fns weekStartsOn option.
 */
function weekStartsOnFromSetting(weeklyStartDay: string | null | undefined): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const map: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  }
  return map[weeklyStartDay ?? 'SUNDAY'] ?? 0
}

/**
 * Evaluate the monthly milestone for a child.
 *
 * Called automatically after a task is APPROVED (see review-actions.ts).
 * Also safe to call manually (e.g., from a dashboard refresh) — it's idempotent.
 *
 * Returns the current milestone record for the child+period.
 */
export async function evaluateMonthlyMilestone(childId: string) {
  const { family } = await requireFamily()

  // Verify child belongs to family
  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) {
    return { ok: false as const, error: 'সন্তান পাওয়া যায়নি।' }
  }

  // Load family settings
  const settings = await db.familySettings.findUnique({
    where: { familyId: family.id },
    select: {
      monthlyPlanType: true,
      monthlyQualifyingWeeks: true,
      weeklyStartDay: true,
      notifyOnMilestone: true,
    },
  })

  const requiredWeeks = settings?.monthlyQualifyingWeeks ?? 3
  const { periodStart, periodEnd } = getCurrentPeriod(settings?.monthlyPlanType)
  const weekStartsOn = weekStartsOnFromSetting(settings?.weeklyStartDay)

  // Count qualifying weeks: distinct week starts where the child has at least
  // one APPROVED task occurrence within the current period.
  const approvedOccurrences = await db.taskOccurrence.findMany({
    where: {
      task: { assignments: { some: { childId } } },
      status: 'APPROVED',
      scheduledDate: { gte: periodStart, lt: periodEnd },
    },
    select: { scheduledDate: true },
    distinct: ['scheduledDate'],
  })

  // Group approved dates by their week start
  const qualifyingWeekStarts = new Set<string>()
  for (const occ of approvedOccurrences) {
    const ws = startOfWeek(occ.scheduledDate, { weekStartsOn })
    // Only count weeks that fall within the period (defensive — should always be true)
    if (isWithinInterval(ws, { start: periodStart, end: new Date(periodEnd.getTime() - 1) })) {
      qualifyingWeekStarts.add(ws.toISOString())
    }
  }
  const qualifyingWeeks = qualifyingWeekStarts.size

  // Load existing milestone record (if any)
  const existing = await db.monthlyMilestone.findUnique({
    where: {
      familyId_childId_periodStart: {
        familyId: family.id,
        childId,
        periodStart,
      },
    },
  })

  const wasQualified = existing?.qualified ?? false
  const isQualified = qualifyingWeeks >= requiredWeeks

  // Upsert the milestone record
  const milestone = await db.monthlyMilestone.upsert({
    where: {
      familyId_childId_periodStart: {
        familyId: family.id,
        childId,
        periodStart,
      },
    },
    update: {
      qualifyingWeeks,
      requiredWeeks,
      qualified: isQualified,
      qualifiedAt: isQualified && !wasQualified ? new Date() : existing?.qualifiedAt ?? null,
    },
    create: {
      familyId: family.id,
      childId,
      periodStart,
      periodEnd,
      qualifyingWeeks,
      requiredWeeks,
      qualified: isQualified,
      qualifiedAt: isQualified ? new Date() : null,
    },
  })

  // If newly qualified (false → true), fire notifications.
  // We do this OUTSIDE the upsert transaction to keep the upsert atomic and
  // because notification failures should not roll back the milestone update.
  if (isQualified && !wasQualified && (settings?.notifyOnMilestone ?? true)) {
    try {
      // Notify the child
      await db.notification.create({
        data: {
          familyId: family.id,
          childId,
          type: 'MILESTONE_REACHED',
          title: 'মাইলস্টোন অর্জিত! 🎉',
          message: `${child.displayName}, এই মাসে তুমি ${qualifyingWeeks} সপ্তাহ কোয়ালিফাই করেছ! আল্লাহ তোমার চেষ্টা কবুল করুন।`,
        },
      })

      // Notify all parents of the family
      const parentMemberships = await db.familyMembership.findMany({
        where: { familyId: family.id, role: 'PARENT' },
        select: { userId: true },
      })
      for (const m of parentMemberships) {
        await db.notification.create({
          data: {
            familyId: family.id,
            userId: m.userId,
            childId,
            type: 'MILESTONE_REACHED',
            title: `${child.displayName} মাইলস্টোন অর্জন করেছে 🎉`,
            message: `এই মাসে ${qualifyingWeeks}/${requiredWeeks} সপ্তাহ কোয়ালিফাই করেছে। সন্তানের চেষ্টা উদযাপন করুন!`,
          },
        })
      }
    } catch {
      // Best-effort — do not fail the milestone update if notifications fail
    }
  }

  revalidatePath(`/child/${childId}`)
  revalidatePath('/dashboard')
  revalidatePath('/reports')

  return { ok: true as const, milestone }
}

/**
 * Get milestone progress for all active children in the family.
 * Used by the parent dashboard's milestone progress section.
 *
 * Returns an array of { child, qualifyingWeeks, requiredWeeks, qualified, periodStart, qualifiedAt }.
 *
 * If a milestone record doesn't yet exist for the current period, we compute the
 * qualifying weeks on the fly (without persisting or firing notifications) so
 * the dashboard always shows fresh progress.
 */
export async function getMilestoneProgressForFamily() {
  const { family } = await requireFamily()

  const settings = await db.familySettings.findUnique({
    where: { familyId: family.id },
    select: {
      monthlyPlanType: true,
      monthlyQualifyingWeeks: true,
      weeklyStartDay: true,
    },
  })

  const requiredWeeks = settings?.monthlyQualifyingWeeks ?? 3
  const { periodStart, periodEnd } = getCurrentPeriod(settings?.monthlyPlanType)
  const weekStartsOn = weekStartsOnFromSetting(settings?.weeklyStartDay)

  const children = await db.childProfile.findMany({
    where: { familyId: family.id, status: 'ACTIVE' },
    select: { id: true, displayName: true, avatarColor: true },
    orderBy: { createdAt: 'asc' },
  })

  const result = await Promise.all(
    children.map(async (c) => {
      // Load existing milestone record
      const milestone = await db.monthlyMilestone.findUnique({
        where: {
          familyId_childId_periodStart: {
            familyId: family.id,
            childId: c.id,
            periodStart,
          },
        },
      })

      // Always compute fresh qualifying weeks (so dashboard is accurate even
      // if the engine hasn't been re-run since the last approval)
      const approvedOccurrences = await db.taskOccurrence.findMany({
        where: {
          task: { assignments: { some: { childId: c.id } } },
          status: 'APPROVED',
          scheduledDate: { gte: periodStart, lt: periodEnd },
        },
        select: { scheduledDate: true },
        distinct: ['scheduledDate'],
      })

      const weekStarts = new Set<string>()
      for (const occ of approvedOccurrences) {
        const ws = startOfWeek(occ.scheduledDate, { weekStartsOn })
        if (isWithinInterval(ws, { start: periodStart, end: new Date(periodEnd.getTime() - 1) })) {
          weekStarts.add(ws.toISOString())
        }
      }
      const qualifyingWeeks = weekStarts.size

      // If the persisted record is stale, the in-memory qualifier reflects
      // fresh data. We do NOT persist here — the engine persists (and notifies)
      // to keep this read-only function idempotent and side-effect-free.
      const persistedQualifyingWeeks = milestone?.qualifyingWeeks ?? 0
      const displayQualifyingWeeks = Math.max(persistedQualifyingWeeks, qualifyingWeeks)
      const displayQualified = displayQualifyingWeeks >= requiredWeeks

      return {
        child: c,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        qualifyingWeeks: displayQualifyingWeeks,
        requiredWeeks,
        qualified: displayQualified,
        qualifiedAt: milestone?.qualifiedAt?.toISOString() ?? null,
      }
    }),
  )

  return result
}

/**
 * Get milestone progress for a single child.
 * Used by the child dashboard's gentle progress card.
 */
export async function getMilestoneProgressForChild(childId: string) {
  const progress = await getMilestoneProgressForFamily()
  return progress.find((p) => p.child.id === childId) ?? null
}
