'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'

/**
 * Load the parent dashboard summary: children, today's activity, points, etc.
 */
export async function getDashboardData() {
  const { user, family } = await requireFamily()

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
  }
}
