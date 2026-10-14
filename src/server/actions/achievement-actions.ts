'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { CHILD_ACHIEVEMENT_LIBRARY } from '@/lib/constants'
import { differenceInCalendarDays, startOfWeek, endOfWeek, subDays } from 'date-fns'

// ────────────────────────────────────────────────────────────────────────────
// Phase D (D2): Child Achievement Engine
//
// Awards child-level achievements based on actions. Each achievement in
// CHILD_ACHIEVEMENT_LIBRARY has a `trigger` and a `condition`. The engine
// evaluates all achievements matching a given trigger and awards any that
// are newly satisfied.
//
// Idempotency: ChildAchievement has @@unique([achievementId, childId]),
// so re-evaluating a satisfied condition is a no-op.
//
// The Achievement model is per-family — we upsert the definition from the
// library into the family's Achievement table on first award, then create
// the ChildAchievement junction record.
// ────────────────────────────────────────────────────────────────────────────

export type ChildAchievementTrigger = 'task_approved' | 'sadaqah_requested' | 'milestone_qualified'

export type ChildAchievementStatus = {
  key: string
  name: string
  description: string
  iconKey: string
  awarded: boolean
  awardedAt: string | null
}

/**
 * Ensure the Achievement definition exists in the family's table.
 * Upserts from the library entry. Returns the Achievement record.
 */
async function ensureAchievementExists(familyId: string, libEntry: typeof CHILD_ACHIEVEMENT_LIBRARY[number]) {
  return db.achievement.upsert({
    where: {
      familyId_key: { familyId, key: libEntry.key },
    },
    update: {
      name: libEntry.name,
      description: libEntry.description,
      iconKey: libEntry.iconKey,
    },
    create: {
      familyId,
      key: libEntry.key,
      name: libEntry.name,
      description: libEntry.description,
      iconKey: libEntry.iconKey,
      criteria: JSON.stringify(libEntry.condition),
    },
  })
}

/**
 * Award a child achievement by library key. Idempotent.
 * Returns { newlyAwarded: boolean, achievement: Achievement | null }.
 */
async function awardChildAchievement(childId: string, libKey: string): Promise<{ newlyAwarded: boolean; achievementId: string | null }> {
  const { family } = await requireFamily()
  const libEntry = CHILD_ACHIEVEMENT_LIBRARY.find((a) => a.key === libKey)
  if (!libEntry) return { newlyAwarded: false, achievementId: null }

  // Ensure the Achievement definition exists
  const achievement = await ensureAchievementExists(family.id, libEntry)

  // Check if already awarded (idempotent)
  const existing = await db.childAchievement.findUnique({
    where: {
      achievementId_childId: { achievementId: achievement.id, childId },
    },
  })
  if (existing) {
    return { newlyAwarded: false, achievementId: achievement.id }
  }

  // Award it
  await db.childAchievement.create({
    data: {
      achievementId: achievement.id,
      childId,
    },
  })

  // Notify the child
  await db.notification.create({
    data: {
      familyId: family.id,
      childId,
      type: 'MILESTONE_REACHED',
      title: `নতুন অর্জন! ${libEntry.name} 🎉`,
      message: libEntry.description,
    },
  })

  revalidatePath(`/child/${childId}`)
  return { newlyAwarded: true, achievementId: achievement.id }
}

// ────────────────────────────────────────────────────────────────────────────
// Condition checkers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compute the child's current streak (consecutive days with ≥1 APPROVED task,
* ending today or yesterday).
 */
async function computeStreak(childId: string): Promise<number> {
  const recentApproved = await db.taskOccurrence.findMany({
    where: {
      task: { assignments: { some: { childId } } },
      status: 'APPROVED',
      scheduledDate: { gte: subDays(new Date(), 30) },
    },
    select: { scheduledDate: true },
    distinct: ['scheduledDate'],
    orderBy: { scheduledDate: 'desc' },
  })

  if (recentApproved.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const first = new Date(recentApproved[0].scheduledDate)
  first.setHours(0, 0, 0, 0)

  if (differenceInCalendarDays(today, first) > 1) return 0

  let streak = 1
  for (let i = 1; i < recentApproved.length; i++) {
    const prev = new Date(recentApproved[i - 1].scheduledDate)
    prev.setHours(0, 0, 0, 0)
    const curr = new Date(recentApproved[i].scheduledDate)
    curr.setHours(0, 0, 0, 0)
    if (differenceInCalendarDays(prev, curr) === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/**
 * Count total APPROVED tasks for a child.
 */
async function countTotalApproved(childId: string): Promise<number> {
  return db.taskOccurrence.count({
    where: {
      task: { assignments: { some: { childId } } },
      status: 'APPROVED',
    },
  })
}

/**
 * Count APPROVED tasks today matching a category (and optionally subcategory).
 */
async function countCategoryInDay(childId: string, category: string, subcategory: string | null): Promise<number> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  return db.taskOccurrence.count({
    where: {
      task: {
        assignments: { some: { childId } },
        category,
        ...(subcategory ? { subcategory } : {}),
      },
      status: 'APPROVED',
      scheduledDate: { gte: todayStart, lte: todayEnd },
    },
  })
}

/**
 * Count APPROVED tasks this week matching a category.
 */
async function countCategoryInWeek(childId: string, category: string): Promise<number> {
  const ws = startOfWeek(new Date(), { weekStartsOn: 0 })
  const we = endOfWeek(new Date(), { weekStartsOn: 0 })

  const occurrences = await db.taskOccurrence.findMany({
    where: {
      task: { assignments: { some: { childId } }, category },
      status: 'APPROVED',
      scheduledDate: { gte: ws, lte: we },
    },
    select: { scheduledDate: true },
    distinct: ['scheduledDate'],
  })

  // Count distinct days
  const days = new Set(occurrences.map((o) => o.scheduledDate.toDateString()))
  return days.size
}

/**
 * Count total APPROVED tasks matching a category.
 */
async function countCategoryTotal(childId: string, category: string): Promise<number> {
  return db.taskOccurrence.count({
    where: {
      task: { assignments: { some: { childId } }, category },
      status: 'APPROVED',
    },
  })
}

/**
 * Count total APPROVED tasks matching a subcategory.
 */
async function countSubcategoryTotal(childId: string, subcategory: string): Promise<number> {
  return db.taskOccurrence.count({
    where: {
      task: { assignments: { some: { childId } }, subcategory },
      status: 'APPROVED',
    },
  })
}

/**
 * Compute the longest streak of consecutive days with ≥1 APPROVED task
 * matching a subcategory, ending today or yesterday.
 */
async function computeSubcategoryStreak(childId: string, subcategory: string): Promise<number> {
  const recentApproved = await db.taskOccurrence.findMany({
    where: {
      task: { assignments: { some: { childId } }, subcategory },
      status: 'APPROVED',
      scheduledDate: { gte: subDays(new Date(), 30) },
    },
    select: { scheduledDate: true },
    distinct: ['scheduledDate'],
    orderBy: { scheduledDate: 'desc' },
  })

  if (recentApproved.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const first = new Date(recentApproved[0].scheduledDate)
  first.setHours(0, 0, 0, 0)

  if (differenceInCalendarDays(today, first) > 1) return 0

  let streak = 1
  for (let i = 1; i < recentApproved.length; i++) {
    const prev = new Date(recentApproved[i - 1].scheduledDate)
    prev.setHours(0, 0, 0, 0)
    const curr = new Date(recentApproved[i].scheduledDate)
    curr.setHours(0, 0, 0, 0)
    if (differenceInCalendarDays(prev, curr) === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/**
 * Check if the child has qualified for a monthly milestone.
 */
async function hasMilestoneQualified(childId: string): Promise<boolean> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const milestone = await db.monthlyMilestone.findFirst({
    where: { childId, periodStart: monthStart, qualified: true },
  })
  return !!milestone
}

// ────────────────────────────────────────────────────────────────────────────
// Main evaluation function
// ────────────────────────────────────────────────────────────────────────────

/**
 * Evaluate all child achievements matching a trigger.
 * Awards any newly-satisfied ones. Best-effort — never throws.
 *
 * Returns the list of newly-awarded achievement keys (for celebration UI).
 */
export async function evaluateChildAchievements(
  childId: string,
  trigger: ChildAchievementTrigger
): Promise<string[]> {
  const newlyAwarded: string[] = []

  try {
    const matching = CHILD_ACHIEVEMENT_LIBRARY.filter((a) => a.trigger === trigger)

    for (const lib of matching) {
      const cond = lib.condition as any
      let satisfied = false

      switch (cond.type) {
        case 'total_approved': {
          const count = await countTotalApproved(childId)
          satisfied = count >= cond.min
          break
        }
        case 'streak': {
          const streak = await computeStreak(childId)
          satisfied = streak >= cond.min
          break
        }
        case 'category_in_day': {
          const count = await countCategoryInDay(childId, cond.category, cond.subcategory ?? null)
          satisfied = count >= cond.min
          break
        }
        case 'category_in_week': {
          const count = await countCategoryInWeek(childId, cond.category)
          satisfied = count >= cond.min
          break
        }
        case 'category_total': {
          const count = await countCategoryTotal(childId, cond.category)
          satisfied = count >= cond.min
          break
        }
        case 'subcategory_total': {
          const count = await countSubcategoryTotal(childId, cond.subcategory)
          satisfied = count >= cond.min
          break
        }
        case 'subcategory_streak': {
          const streak = await computeSubcategoryStreak(childId, cond.subcategory)
          satisfied = streak >= cond.min
          break
        }
        case 'sadaqah_count': {
          const count = await db.sadaqahDonation.count({
            where: { childId, status: { in: ['PENDING', 'CONFIRMED'] } },
          })
          satisfied = count >= cond.min
          break
        }
        case 'milestone_qualified': {
          satisfied = await hasMilestoneQualified(childId)
          break
        }
      }

      if (satisfied) {
        const result = await awardChildAchievement(childId, lib.key)
        if (result.newlyAwarded) {
          newlyAwarded.push(lib.key)
        }
      }
    }
  } catch (e) {
    // Best-effort — never fail the parent operation
    console.error('evaluateChildAchievements error:', e)
  }

  return newlyAwarded
}

// ────────────────────────────────────────────────────────────────────────────
// Read functions for the UI
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get all child achievements for a child — returns the library entries
 * with awarded status + awardedAt timestamp.
 *
 * Also ensures all Achievement definitions exist in the family table
 * (upsert from library) so the UI can render all 12 badges.
 */
export async function getChildAchievementStatus(childId: string): Promise<ChildAchievementStatus[]> {
  const { family } = await requireFamily()

  // Ensure all Achievement definitions exist
  for (const lib of CHILD_ACHIEVEMENT_LIBRARY) {
    await ensureAchievementExists(family.id, lib)
  }

  // Load all ChildAchievement records for this child
  const awarded = await db.childAchievement.findMany({
    where: { childId },
    include: { achievement: true },
  })

  const awardedMap = new Map(awarded.map((a) => [a.achievement.key, a]))

  return CHILD_ACHIEVEMENT_LIBRARY.map((lib) => {
    const a = awardedMap.get(lib.key)
    return {
      key: lib.key,
      name: lib.name,
      description: lib.description,
      iconKey: lib.iconKey,
      awarded: !!a,
      awardedAt: a?.awardedAt.toISOString() ?? null,
    }
  })
}

/**
 * Get all earned child achievements (awarded = true only).
 * Used by the celebration overlay to detect newly-unlocked badges.
 */
export async function getEarnedChildAchievements(childId: string) {
  const { family } = await requireFamily()

  const awarded = await db.childAchievement.findMany({
    where: { childId },
    include: { achievement: true },
    orderBy: { awardedAt: 'desc' },
  })

  return awarded.map((a) => ({
    id: a.id,
    key: a.achievement.key,
    name: a.achievement.name,
    description: a.achievement.description,
    iconKey: a.achievement.iconKey,
    awardedAt: a.awardedAt.toISOString(),
  }))
}
