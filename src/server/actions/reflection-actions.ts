'use server'

import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { startOfWeek, endOfWeek } from 'date-fns'

// ────────────────────────────────────────────────────────────────────────────
// Phase 5 (S5.1): Weekly Family Reflection
// ────────────────────────────────────────────────────────────────────────────

/**
 * Save or update a weekly reflection for a child (or family-level if childId is null).
 * Idempotent: one reflection per family+child+weekStart (unique constraint).
 *
 * Per spec §7A: At the end of each week, show a simple summary:
 * - What went well?
 * - Which habit is becoming easier?
 * - What was difficult?
 * - What can the family practise together next week?
 *
 * Keep the conversation focused on progress, not blame.
 */
export async function saveWeeklyReflection(
  childId: string | null,
  whatWentWell?: string,
  whatWasHard?: string,
  whatEasier?: string,
  nextWeekPlan?: string
): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()

  // Verify child belongs to family (if childId provided)
  if (childId) {
    const child = await db.childProfile.findFirst({
      where: { id: childId, familyId: family.id },
    })
    if (!child) return { ok: false, error: 'সন্তান পাওয়া যায়নি।' }
  }

  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())

  try {
    // Upsert: one reflection per family+child+week
    await db.weeklyReflection.upsert({
      where: {
        familyId_childId_weekStart: {
          familyId: family.id,
          childId: childId ?? '__family__',
          weekStart,
        },
      },
      update: {
        whatWentWell: whatWentWell?.trim() || null,
        whatWasHard: whatWasHard?.trim() || null,
        whatEasier: whatEasier?.trim() || null,
        nextWeekPlan: nextWeekPlan?.trim() || null,
      },
      create: {
        familyId: family.id,
        childId: childId || null,
        weekStart,
        weekEnd,
        whatWentWell: whatWentWell?.trim() || null,
        whatWasHard: whatWasHard?.trim() || null,
        whatEasier: whatEasier?.trim() || null,
        nextWeekPlan: nextWeekPlan?.trim() || null,
      },
    })
  } catch (e) {
    // If unique constraint fails with null childId, try without the composite key
    try {
      const existing = await db.weeklyReflection.findFirst({
        where: { familyId: family.id, childId: childId ?? null, weekStart },
      })
      if (existing) {
        await db.weeklyReflection.update({
          where: { id: existing.id },
          data: {
            whatWentWell: whatWentWell?.trim() || null,
            whatWasHard: whatWasHard?.trim() || null,
            whatEasier: whatEasier?.trim() || null,
            nextWeekPlan: nextWeekPlan?.trim() || null,
          },
        })
      } else {
        await db.weeklyReflection.create({
          data: {
            familyId: family.id,
            childId: childId || null,
            weekStart,
            weekEnd,
            whatWentWell: whatWentWell?.trim() || null,
            whatWasHard: whatWasHard?.trim() || null,
            whatEasier: whatEasier?.trim() || null,
            nextWeekPlan: nextWeekPlan?.trim() || null,
          },
        })
      }
    } catch (e2) {
      return { ok: false, error: 'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।' }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/planner')

  // Phase 5 (S5.3): Evaluate family achievements triggered by reflection saves.
  // Best-effort — never fails the save.
  try {
    const { evaluateFamilyAchievements } = await import('@/server/actions/planner-actions')
    await evaluateFamilyAchievements('first_reflection')
    await evaluateFamilyAchievements('three_consecutive_reflections')
  } catch {
    // Best-effort
  }

  return { ok: true }
}

/**
 * Get this week's reflection for a child (or family-level if childId is null).
 */
export async function getThisWeekReflection(childId?: string) {
  const { family } = await requireFamily()
  const weekStart = startOfWeek(new Date())

  return db.weeklyReflection.findFirst({
    where: {
      familyId: family.id,
      childId: childId ?? null,
      weekStart,
    },
  })
}

/**
 * Get recent reflections (last 4 weeks) for the family.
 */
export async function getRecentReflections() {
  const { family } = await requireFamily()
  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

  return db.weeklyReflection.findMany({
    where: {
      familyId: family.id,
      weekStart: { gte: fourWeeksAgo },
    },
    orderBy: { weekStart: 'desc' },
    take: 8,
    include: {
      child: { select: { id: true, displayName: true, avatarColor: true } },
    },
  })
}
