'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { format, isToday, isTomorrow, parseISO, isThisWeek } from 'date-fns'
import { FAMILY_ACHIEVEMENT_LIBRARY } from '@/lib/constants'

// ────────────────────────────────────────────────────────────────────────────
// Phase 5 (S5.3): Parent Weekly Planner + Family Celebration
//
// Two responsibilities:
//   1. getPlannerData() — one-call loader that returns everything the planner
//      page needs (today's schedule, review queue, rewards config snapshot,
//      reflection status, start-small guidance).
//   2. Family Achievement engine — awardFamilyAchievement(key) writes a
//      FamilyAchievement record (idempotent via @@unique [familyId, key]).
//      evaluateFamilyAchievements(trigger) runs all achievements matching a
//      given trigger and awards any that are now satisfied but not yet
//      recorded. Called from the relevant action sites (review, reflection,
//      sadaqah, incident, milestone).
// ────────────────────────────────────────────────────────────────────────────

const RECOMMENDED_MIN_TASKS = 3
const RECOMMENDED_MAX_TASKS = 5

export type PlannerOverview = {
  stats: {
    activeTasks: number
    todayOccurrences: number
    todayApproved: number
    pendingSubmissions: number
    activeRewards: number
    childrenCount: number
  }
  guidance: {
    withinRecommendedRange: boolean
    message: string
    severity: 'good' | 'warn' | 'info'
  }
  todaysSchedule: Array<{
    id: string
    taskId: string
    title: string
    iconKey: string
    category: string
    dueTime: string | null
    status: string
    pointsValue: number
    sortOrder: number
    assignedChildren: Array<{ id: string; displayName: string; avatarColor: string }>
  }>
  reviewQueue: {
    count: number
    items: Array<{
      id: string
      childName: string
      avatarColor: string
      taskTitle: string
      submittedAt: string
    }>
  }
  rewards: {
    activeCount: number
    monthlyBudget: number | null
    spentThisMonth: number
  }
  reflection: {
    thisWeekCompleted: boolean
    lastWeekCompleted: boolean
    consecutiveWeeks: number
  }
  familyAchievements: Array<{
    id: string
    key: string
    name: string
    description: string
    iconKey: string
    awardedAt: string
  }>
  quickLinks: {
    tasks: number
    rewards: number
    review: number
    settings: number
  }
}

/**
 * Load everything the planner page needs in a single call.
 * This is the "one-page consolidated view" the spec calls for.
 */
export async function getPlannerData(): Promise<PlannerOverview> {
  const { family } = await requireFamily()

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  // ── Load children, tasks, today's occurrences, pending submissions, rewards ──
  const [
    children,
    activeTasks,
    todayOccurrencesRaw,
    pendingSubmissions,
    activeRewards,
    familySettings,
    weekReflections,
    lastWeekReflections,
    familyAchievementsRaw,
    monthRedemptions,
  ] = await Promise.all([
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
      orderBy: { createdAt: 'asc' },
    }),
    db.taskTemplate.count({
      where: { familyId: family.id, status: 'ACTIVE' },
    }),
    db.taskOccurrence.findMany({
      where: {
        task: { familyId: family.id, status: 'ACTIVE' },
        scheduledDate: { gte: todayStart, lte: todayEnd },
      },
      include: {
        task: {
          select: { id: true, title: true, iconKey: true, category: true, pointsValue: true },
        },
        submission: { select: { id: true, submittedAt: true } },
      },
      orderBy: { dueTime: 'asc' },
    }),
    db.taskSubmission.findMany({
      where: {
        child: { familyId: family.id },
        decision: null,
      },
      include: {
        child: { select: { id: true, displayName: true, avatarColor: true } },
        occurrence: { include: { task: { select: { title: true } } } },
      },
      orderBy: { submittedAt: 'asc' },
      take: 6,
    }),
    db.reward.count({
      where: { familyId: family.id, status: 'ACTIVE' },
    }),
    db.familySettings.findUnique({
      where: { familyId: family.id },
      select: { monthlyRewardBudget: true },
    }),
    db.weeklyReflection.findMany({
      where: {
        familyId: family.id,
        // Last 4 weeks — enough to compute consecutive streak
        weekStart: { gte: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { weekStart: 'desc' },
      take: 4,
    }),
    db.weeklyReflection.findMany({
      where: {
        familyId: family.id,
        // For "last week" check we need slightly older too
        weekStart: { gte: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { weekStart: 'desc' },
      take: 5,
    }),
    db.familyAchievement.findMany({
      where: { familyId: family.id },
      orderBy: { awardedAt: 'desc' },
    }),
    db.rewardRedemption.findMany({
      where: {
        child: { familyId: family.id },
        requestedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
        status: { in: ['APPROVED', 'FULFILLED'] },
      },
      include: { reward: { select: { estimatedCost: true } } },
    }),
  ])

  // ── Build today's schedule with assigned children ──
  // Group occurrences by task to look up assignments
  const taskIds = Array.from(new Set(todayOccurrencesRaw.map((o) => o.task.id)))
  const assignmentsByTask = new Map<string, Array<{ id: string; displayName: string; avatarColor: string }>>()
  if (taskIds.length > 0) {
    const assignments = await db.taskAssignment.findMany({
      where: { taskId: { in: taskIds } },
      include: { child: { select: { id: true, displayName: true, avatarColor: true } } },
    })
    for (const a of assignments) {
      const list = assignmentsByTask.get(a.taskId) ?? []
      list.push(a.child)
      assignmentsByTask.set(a.taskId, list)
    }
  }

  const todaysSchedule = todayOccurrencesRaw.map((o) => ({
    id: o.id,
    taskId: o.task.id,
    title: o.task.title,
    iconKey: o.task.iconKey,
    category: o.task.category,
    dueTime: o.dueTime,
    status: o.status,
    pointsValue: o.task.pointsValue,
    sortOrder: o.task.sortOrder,
    assignedChildren: assignmentsByTask.get(o.task.id) ?? [],
  })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  // ── Reflection state ──
  // "This week" = the most recent reflection's weekStart falls within the
  // current week (Sun→Sat). Simpler: if we have any reflection from the
  // current week, it counts.
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)

  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  const thisWeekReflections = weekReflections.filter(
    (r) => r.weekStart >= startOfThisWeek,
  )
  const lastWeekReflectionsFiltered = lastWeekReflections.filter(
    (r) => r.weekStart >= startOfLastWeek && r.weekStart < startOfThisWeek,
  )

  // Compute consecutive weeks ending this week OR last week
  let consecutiveWeeks = 0
  if (thisWeekReflections.length > 0) {
    consecutiveWeeks = 1
    let cursor = new Date(startOfThisWeek)
    for (let i = 1; i < 4; i++) {
      cursor = new Date(cursor)
      cursor.setDate(cursor.getDate() - 7)
      const hasWeek = weekReflections.some(
        (r) => Math.abs(r.weekStart.getTime() - cursor.getTime()) < 24 * 60 * 60 * 1000,
      )
      if (hasWeek) consecutiveWeeks++
      else break
    }
  } else if (lastWeekReflectionsFiltered.length > 0) {
    // Carry streak from last week if this week not done yet
    consecutiveWeeks = 1
    let cursor = new Date(startOfLastWeek)
    for (let i = 1; i < 4; i++) {
      cursor = new Date(cursor)
      cursor.setDate(cursor.getDate() - 7)
      const hasWeek = weekReflections.some(
        (r) => Math.abs(r.weekStart.getTime() - cursor.getTime()) < 24 * 60 * 60 * 1000,
      )
      if (hasWeek) consecutiveWeeks++
      else break
    }
  }

  // ── Compute monthly spent ──
  const spentThisMonth = monthRedemptions.reduce(
    (sum, r) => sum + (r.reward?.estimatedCost ?? 0),
    0,
  )

  // ── Build guidance message ──
  let guidance: PlannerOverview['guidance']
  if (activeTasks < RECOMMENDED_MIN_TASKS) {
    guidance = {
      withinRecommendedRange: false,
      severity: 'warn',
      message: `শুরু করুন ${RECOMMENDED_MIN_TASKS}-${RECOMMENDED_MAX_TASKS} টি কাজ দিয়ে। বেশি কাজ একসাথে শুরু করলে সন্তান হতাশ হতে পারে। এখন ${activeTasks} টি সক্রিয় — আরও ${RECOMMENDED_MIN_TASKS - activeTasks} টি যোগ করুন।`,
    }
  } else if (activeTasks > RECOMMENDED_MAX_TASKS) {
    guidance = {
      withinRecommendedRange: false,
      severity: 'info',
      message: `এখন ${activeTasks} টি সক্রিয় কাজ আছে। ${RECOMMENDED_MAX_TASKS} টির বেশি হলে সন্তানের উপর চাপ পড়তে পারে — কয়েকটি PAUSE করে দেখুন।`,
    }
  } else {
    guidance = {
      withinRecommendedRange: true,
      severity: 'good',
      message: `${activeTasks} টি সক্রিয় কাজ — ভালো সংখ্যা! মনে রাখুন, ধারাবাহিকতা সংখ্যার চেয়ে গুরুত্বপূর্ণ।`,
    }
  }

  // ── Map family achievements to UI shape ──
  const familyAchievements = familyAchievementsRaw.map((a) => ({
    id: a.id,
    key: a.key,
    name: a.name,
    description: a.description,
    iconKey: a.iconKey,
    awardedAt: a.awardedAt.toISOString(),
  }))

  return {
    stats: {
      activeTasks,
      todayOccurrences: todayOccurrencesRaw.length,
      todayApproved: todayOccurrencesRaw.filter((o) => o.status === 'APPROVED').length,
      pendingSubmissions: pendingSubmissions.length,
      activeRewards,
      childrenCount: children.length,
    },
    guidance,
    todaysSchedule,
    reviewQueue: {
      count: pendingSubmissions.length,
      items: pendingSubmissions.map((s) => ({
        id: s.id,
        childName: s.child.displayName,
        avatarColor: s.child.avatarColor,
        taskTitle: s.occurrence.task.title,
        submittedAt: s.submittedAt.toISOString(),
      })),
    },
    rewards: {
      activeCount: activeRewards,
      monthlyBudget: familySettings?.monthlyRewardBudget ?? null,
      spentThisMonth,
    },
    reflection: {
      thisWeekCompleted: thisWeekReflections.length > 0,
      lastWeekCompleted: lastWeekReflectionsFiltered.length > 0,
      consecutiveWeeks,
    },
    familyAchievements,
    quickLinks: {
      tasks: activeTasks,
      rewards: activeRewards,
      review: pendingSubmissions.length,
      settings: 0,
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Family Achievement engine
// ────────────────────────────────────────────────────────────────────────────

/**
 * Award a family achievement by key. Idempotent: if already awarded, no-op.
 * Records the achievement with name + description + iconKey from the library.
 *
 * Also fires a notification to all parents of the family.
 */
export async function awardFamilyAchievement(key: string): Promise<{ ok: boolean; alreadyAwarded?: boolean }> {
  const { family } = await requireFamily()

  const lib = FAMILY_ACHIEVEMENT_LIBRARY.find((a) => a.key === key)
  if (!lib) {
    return { ok: false }
  }

  // Check if already awarded (idempotent)
  const existing = await db.familyAchievement.findUnique({
    where: {
      familyId_key: { familyId: family.id, key },
    },
  })
  if (existing) {
    return { ok: true, alreadyAwarded: true }
  }

  try {
    await db.familyAchievement.create({
      data: {
        familyId: family.id,
        key: lib.key,
        name: lib.name,
        description: lib.description,
        iconKey: lib.iconKey,
      },
    })

    // Notify all parents
    const parents = await db.familyMembership.findMany({
      where: { familyId: family.id, role: 'PARENT' },
      select: { userId: true },
    })
    for (const p of parents) {
      await db.notification.create({
        data: {
          familyId: family.id,
          userId: p.userId,
          type: 'MILESTONE_REACHED', // reuse — no separate type
          title: `পরিবারিক অর্জন: ${lib.name} 🎉`,
          message: lib.description,
        },
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/planner')
    return { ok: true }
  } catch (e) {
    // Unique constraint race — another call already inserted it. Treat as success.
    return { ok: true, alreadyAwarded: true }
  }
}

/**
 * Evaluate family achievements matching a trigger and award any newly-satisfied ones.
 * Called from action sites (review, reflection, sadaqah, etc.).
 *
 * Each trigger maps to a specific check. The check is best-effort — if it fails
 * for any reason, the family still gets the rest.
 */
export async function evaluateFamilyAchievements(
  trigger: 'first_approved_task' | 'first_reflection' | 'first_sadaqah_confirmed' | 'all_children_milestone' | 'family_service_task' | 'first_incident_resolved' | 'three_consecutive_reflections' | 'first_challenge_completed'
): Promise<void> {
  const { family } = await requireFamily()

  try {
    switch (trigger) {
      case 'first_approved_task': {
        // Award if the family has at least one APPROVED task occurrence
        const approvedCount = await db.taskOccurrence.count({
          where: {
            task: { familyId: family.id },
            status: 'APPROVED',
          },
        })
        if (approvedCount >= 1) {
          await awardFamilyAchievement('first_week')
        }
        break
      }
      case 'first_reflection': {
        const reflectionCount = await db.weeklyReflection.count({
          where: { familyId: family.id },
        })
        if (reflectionCount >= 1) {
          await awardFamilyAchievement('first_reflection')
        }
        break
      }
      case 'first_sadaqah_confirmed': {
        const confirmedCount = await db.sadaqahDonation.count({
          where: { familyId: family.id, status: 'CONFIRMED' },
        })
        if (confirmedCount >= 1) {
          await awardFamilyAchievement('first_sadaqah')
        }
        break
      }
      case 'all_children_milestone': {
        // Check: every active child has qualified in the current period
        const children = await db.childProfile.findMany({
          where: { familyId: family.id, status: 'ACTIVE' },
          select: { id: true },
        })
        if (children.length === 0) break
        const now = new Date()
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const milestones = await db.monthlyMilestone.findMany({
          where: {
            familyId: family.id,
            childId: { in: children.map((c) => c.id) },
            periodStart,
            qualified: true,
          },
        })
        if (milestones.length === children.length) {
          await awardFamilyAchievement('all_milestone_month')
        }
        break
      }
      case 'family_service_task': {
        // Award if family has a Generosity & Community task that's been APPROVED
        const serviceApproved = await db.taskOccurrence.findFirst({
          where: {
            task: { familyId: family.id, category: 'Generosity & Community' },
            status: 'APPROVED',
          },
        })
        if (serviceApproved) {
          await awardFamilyAchievement('family_service')
        }
        break
      }
      case 'first_incident_resolved': {
        const resolvedCount = await db.incident.count({
          where: { familyId: family.id, status: 'RESOLVED' },
        })
        if (resolvedCount >= 1) {
          await awardFamilyAchievement('first_incident_resolved')
        }
        break
      }
      case 'three_consecutive_reflections': {
        // Load last 3 weeks of reflections and check if all 3 are present
        const now = new Date()
        const threeWeeksAgo = new Date(now)
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)
        const reflections = await db.weeklyReflection.findMany({
          where: {
            familyId: family.id,
            weekStart: { gte: threeWeeksAgo },
          },
          orderBy: { weekStart: 'desc' },
        })
        // Need at least 3 distinct weeks
        const weekKeys = new Set(
          reflections.map((r) => format(r.weekStart, 'yyyy-MM-dd')),
        )
        if (weekKeys.size >= 3) {
          await awardFamilyAchievement('three_reflections')
        }
        break
      }
      case 'first_challenge_completed': {
        const completedChallenge = await db.weeklyChallenge.findFirst({
          where: { familyId: family.id, status: 'COMPLETED' },
        })
        if (completedChallenge) {
          await awardFamilyAchievement('first_challenge_completed')
        }
        break
      }
    }
  } catch {
    // Best-effort — never fail the parent operation
  }
}

/**
 * Get all family achievements (for the planner celebration section).
 */
export async function getFamilyAchievements() {
  const { family } = await requireFamily()
  return db.familyAchievement.findMany({
    where: { familyId: family.id },
    orderBy: { awardedAt: 'desc' },
  })
}

/**
 * Get all achievements in the library with their awarded status for this family.
 * Used to render the celebration section with both earned and locked badges.
 */
export async function getFamilyAchievementStatus() {
  const { family } = await requireFamily()

  const awarded = await db.familyAchievement.findMany({
    where: { familyId: family.id },
  })
  const awardedMap = new Map(awarded.map((a) => [a.key, a]))

  return FAMILY_ACHIEVEMENT_LIBRARY.map((lib) => {
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
