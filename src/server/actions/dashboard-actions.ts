'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { markMissedOccurrences } from '@/server/actions/task-actions'
import { getOpenIncidents } from '@/server/actions/incident-actions'
import { getPendingSadaqahDonations, getSadaqahHistory } from '@/server/actions/sadaqah-actions'
import { getRecentReflections } from '@/server/actions/reflection-actions'

/**
 * Load the parent dashboard summary: children, today's activity, points, etc.
 */
export async function getDashboardData() {
  const { user, family } = await requireFamily()

  // Phase 1 (S1.3): Mark old ASSIGNED occurrences as MISSED before loading
  // This is idempotent — only marks ASSIGNED → MISSED, no point deduction
  await markMissedOccurrences()

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const weekStart = new Date(now)
  const dayOfWeek = weekStart.getDay()
  weekStart.setDate(weekStart.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const children = await db.childProfile.findMany({
    where: { familyId: family.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    include: {
      pointsTxns: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  // For each child: today's completion, weekly points, pending approvals
  const childStats = await Promise.all(
    children.map(async (c) => {
      const todayOccurrences = await db.taskOccurrence.findMany({
        where: {
          task: { assignments: { some: { childId: c.id } }, status: 'ACTIVE' },
          scheduledDate: { gte: todayStart, lte: todayEnd },
        },
        include: { task: true },
      })
      const todayTotal = todayOccurrences.length
      const todayApproved = todayOccurrences.filter((o) => o.status === 'APPROVED').length
      const todaySubmitted = todayOccurrences.filter((o) => o.status === 'SUBMITTED').length
      const todayCompletion = todayTotal > 0 ? Math.round((todayApproved / todayTotal) * 100) : 0

      const weekPoints = await db.pointsTransaction.aggregate({
        where: {
          childId: c.id,
          type: 'EARNED',
          createdAt: { gte: weekStart, lte: weekEnd },
        },
        _sum: { amount: true },
      })

      const balance = await db.pointsTransaction.aggregate({
        where: { childId: c.id },
        _sum: { amount: true },
      })

      const pendingSubmissions = await db.taskSubmission.count({
        where: { childId: c.id, decision: null },
      })

      // Next reward progress
      const nextReward = await db.reward.findFirst({
        where: {
          familyId: family.id,
          status: 'ACTIVE',
          rewardType: 'POINTS',
          requiredPoints: { gt: balance._sum.amount || 0 },
        },
        orderBy: { requiredPoints: 'asc' },
      })

      return {
        child: c,
        todayTotal,
        todayApproved,
        todaySubmitted,
        todayCompletion,
        weekPoints: weekPoints._sum.amount || 0,
        balance: balance._sum.amount || 0,
        pendingSubmissions,
        nextReward,
      }
    })
  )

  // Family-wide stats
  const totalChildren = children.length
  const pendingApprovals = await db.taskSubmission.count({
    where: {
      child: { familyId: family.id },
      decision: null,
    },
  })

  const allTodayOccurrences = await db.taskOccurrence.findMany({
    where: {
      task: { familyId: family.id, status: 'ACTIVE' },
      scheduledDate: { gte: todayStart, lte: todayEnd },
    },
  })
  const todayFamilyTotal = allTodayOccurrences.length
  const todayFamilyApproved = allTodayOccurrences.filter((o) => o.status === 'APPROVED').length
  const todayFamilyCompletion = todayFamilyTotal > 0 ? Math.round((todayFamilyApproved / todayFamilyTotal) * 100) : 0

  const weekFamilyPoints = await db.pointsTransaction.aggregate({
    where: {
      familyId: family.id,
      type: 'EARNED',
      createdAt: { gte: weekStart, lte: weekEnd },
    },
    _sum: { amount: true },
  })

  const activeChallenges = await db.weeklyChallenge.count({
    where: { familyId: family.id, status: 'ACTIVE' },
  })

  const upcomingRewards = await db.reward.findMany({
    where: { familyId: family.id, status: 'ACTIVE', rewardType: 'POINTS' },
    orderBy: { requiredPoints: 'asc' },
    take: 5,
  })

  // Recent activity (last 10 submissions)
  const recentSubmissions = await db.taskSubmission.findMany({
    where: { child: { familyId: family.id } },
    orderBy: { submittedAt: 'desc' },
    take: 10,
    include: {
      child: true,
      occurrence: { include: { task: true } },
    },
  })

  // Recent point transactions (last 8)
  const recentTxns = await db.pointsTransaction.findMany({
    where: { familyId: family.id },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { child: true },
  })

  // ── Pending submissions for inline review (with full data) ─────────────
  const pendingReviewSubmissions = await db.taskSubmission.findMany({
    where: {
      child: { familyId: family.id },
      decision: null,
    },
    orderBy: { submittedAt: 'asc' },
    include: {
      child: true,
      occurrence: { include: { task: true } },
    },
  })

  // ── 7-day points trend per child (for line chart) ──────────────────────
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const weekTrendTxns = await db.pointsTransaction.findMany({
    where: {
      familyId: family.id,
      type: 'EARNED',
      createdAt: { gte: sevenDaysAgo },
    },
    select: { childId: true, amount: true, createdAt: true },
  })

  // Build per-child 7-day arrays
  const trendByChild: { childId: string; childName: string; avatarColor: string; days: { date: string; points: number }[] }[] = []
  for (const c of children) {
    const days: { date: string; points: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const points = weekTrendTxns
        .filter((t) => t.childId === c.id && t.createdAt >= d && t.createdAt < next)
        .reduce((sum, t) => sum + t.amount, 0)
      days.push({ date: d.toISOString().slice(0, 10), points })
    }
    trendByChild.push({
      childId: c.id,
      childName: c.displayName,
      avatarColor: c.avatarColor,
      days,
    })
  }

  // ── Category breakdown (last 30 days, for pie/donut chart) ─────────────
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const categoryTxns = await db.taskSubmission.findMany({
    where: {
      child: { familyId: family.id },
      decision: 'APPROVED',
      reviewedAt: { gte: thirtyDaysAgo },
    },
    include: { occurrence: { include: { task: { select: { category: true } } } } },
  })

  const categoryCounts: Record<string, number> = {}
  for (const s of categoryTxns) {
    const cat = s.occurrence.task.category
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  }

  // ── Recent missed tasks (last 7 days, not yet excused) ─────────────────
  const sevenDaysAgoForMissed = new Date()
  sevenDaysAgoForMissed.setDate(sevenDaysAgoForMissed.getDate() - 7)
  sevenDaysAgoForMissed.setHours(0, 0, 0, 0)

  const missedTasks = await db.taskOccurrence.findMany({
    where: {
      task: { familyId: family.id },
      status: 'MISSED',
      scheduledDate: { gte: sevenDaysAgoForMissed },
    },
    orderBy: { scheduledDate: 'desc' },
    take: 15,
    include: {
      task: { select: { title: true, category: true, iconKey: true, pointsValue: true } },
    },
  })

  // Load child info for missed tasks
  const missedChildIds = [...new Set(
    (await db.taskAssignment.findMany({
      where: { taskId: { in: missedTasks.map((m) => m.taskId) } },
      select: { childId: true, taskId: true },
    })).map((a) => a.childId)
  )]
  const missedChildren = await db.childProfile.findMany({
    where: { id: { in: missedChildIds } },
    select: { id: true, displayName: true, avatarColor: true },
  })
  const childMap = new Map(missedChildren.map((c) => [c.id, c]))
  const assignmentMap = new Map<string, string[]>() // taskId → childIds
  const assignments = await db.taskAssignment.findMany({
    where: { taskId: { in: missedTasks.map((m) => m.taskId) } },
    select: { taskId: true, childId: true },
  })
  for (const a of assignments) {
    if (!assignmentMap.has(a.taskId)) assignmentMap.set(a.taskId, [])
    assignmentMap.get(a.taskId)!.push(a.childId)
  }

  const missedTasksWithChildren = missedTasks.map((m) => ({
    id: m.id,
    scheduledDate: m.scheduledDate,
    missedAt: m.missedAt,
    taskTitle: m.task.title,
    taskCategory: m.task.category,
    taskIconKey: m.task.iconKey,
    taskPointsValue: m.task.pointsValue,
    children: (assignmentMap.get(m.taskId) || []).map((cid) => childMap.get(cid)).filter(Boolean),
  }))

  // ── Phase 2 (S2.3): Family reward budget tracking ─────────────────────
  const settings = await db.familySettings.findUnique({
    where: { familyId: family.id },
    select: { monthlyRewardBudget: true },
  })
  let budgetInfo: { monthlyBudget: number; committed: number; remaining: number } | null = null
  if (settings?.monthlyRewardBudget && settings.monthlyRewardBudget > 0) {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthRedemptions = await db.rewardRedemption.findMany({
      where: {
        child: { familyId: family.id },
        status: { in: ['REQUESTED', 'APPROVED', 'FULFILLED'] },
        requestedAt: { gte: monthStart },
      },
      include: { reward: { select: { estimatedCost: true } } },
    })
    const committed = monthRedemptions.reduce((sum, r) => sum + (r.reward.estimatedCost ?? 0), 0)
    budgetInfo = {
      monthlyBudget: settings.monthlyRewardBudget,
      committed,
      remaining: Math.max(0, settings.monthlyRewardBudget - committed),
    }
  }

  // ── Phase 3 (S3.1): Open incidents ────────────────────────────────────
  const openIncidents = await getOpenIncidents()

  // ── Phase 3 (S3.3): Resolved incidents (last 30 days, for history) ────
  const thirtyDaysAgoIncidents = new Date()
  thirtyDaysAgoIncidents.setDate(thirtyDaysAgoIncidents.getDate() - 30)

  const resolvedIncidents = await db.incident.findMany({
    where: {
      familyId: family.id,
      status: 'RESOLVED',
      resolvedAt: { gte: thirtyDaysAgoIncidents },
    },
    orderBy: { resolvedAt: 'desc' },
    take: 10,
    include: {
      reports: {
        include: {
          child: { select: { id: true, displayName: true, avatarColor: true } },
        },
      },
      resolution: true,
    },
  })

  // ── Phase 4 (S4.2): Pending sadaqah donations ──────────────────────────
  const pendingSadaqah = await getPendingSadaqahDonations()
  const sadaqahHistory = await getSadaqahHistory()

  // ── Phase 5 (S5.1): Recent weekly reflections ──────────────────────────
  const recentReflections = await getRecentReflections()

  return {
    family,
    user,
    stats: {
      totalChildren,
      pendingApprovals,
      todayFamilyCompletion,
      weekFamilyPoints: weekFamilyPoints._sum.amount || 0,
      activeChallenges,
      upcomingRewards,
    },
    children: childStats,
    recentSubmissions,
    recentTxns,
    pendingReviewSubmissions,
    trendByChild,
    categoryCounts,
    missedTasks: missedTasksWithChildren,
    budgetInfo,
    openIncidents,
    resolvedIncidents,
    pendingSadaqah,
    sadaqahHistory,
    recentReflections,
  }
}
