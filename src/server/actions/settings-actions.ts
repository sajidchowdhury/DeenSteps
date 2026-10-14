'use server'

import * as React from 'react'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

// ────────────────────────────────────────────────────────────────────────────
// Family + settings
// ────────────────────────────────────────────────────────────────────────────

const FamilySchema = z.object({
  name: z.string().min(1, 'Please enter a family name.').max(120),
  timezone: z.string().max(120).default('UTC'),
  locale: z.string().max(20).default('en'),
})

const SettingsSchema = z.object({
  pointsName: z.string().min(1).max(40).default('পয়েন্ট'),
  defaultApprovalPolicy: z.enum(['MANUAL', 'AUTO']).default('MANUAL'),
  weeklyStartDay: z.enum(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']).default('SUNDAY'),
  monthlyPlanType: z.enum(['FOUR_WEEK', 'CALENDAR_MONTH']).default('FOUR_WEEK'),
  monthlyQualifyingWeeks: z.number().int().min(1).max(8).default(3),
  notifyOnSubmission: z.boolean().default(true),
  notifyOnRedemption: z.boolean().default(true),
  notifyOnChallengeEnd: z.boolean().default(true),
  notifyOnMilestone: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
  theme: z.enum(['light', 'dark']).default('light'),
  // Phase 2 (S2.3): Monthly reward budget
  monthlyRewardBudget: z.number().min(0).nullable().optional(),
  // Phase 4 (S4.1): Sadaqah pledge configuration
  sadaqahPledgeEnabled: z.boolean().default(false),
  sadaqahStarsPerUnit: z.number().int().min(1).default(100),
  sadaqahCurrency: z.string().max(10).default('BDT'),
  sadaqahAmountPerUnit: z.number().min(0).default(100),
  // Parent lock PIN (4 digits, optional)
  parentPin: z.string().max(4).optional(),
})

const ParentProfileSchema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(120),
})

export type SettingsResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function updateFamily(input: z.infer<typeof FamilySchema>): Promise<SettingsResult> {
  const { family } = await requireFamily()
  const parsed = FamilySchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  await db.family.update({
    where: { id: family.id },
    data: {
      name: parsed.data.name,
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
    },
  })
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateFamilySettings(input: z.infer<typeof SettingsSchema>): Promise<SettingsResult> {
  const { family } = await requireFamily()
  const parsed = SettingsSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const d = parsed.data
  await db.familySettings.upsert({
    where: { familyId: family.id },
    update: {
      pointsName: d.pointsName,
      defaultApprovalPolicy: d.defaultApprovalPolicy,
      weeklyStartDay: d.weeklyStartDay,
      monthlyPlanType: d.monthlyPlanType,
      monthlyQualifyingWeeks: d.monthlyQualifyingWeeks,
      notifyOnSubmission: d.notifyOnSubmission,
      notifyOnRedemption: d.notifyOnRedemption,
      notifyOnChallengeEnd: d.notifyOnChallengeEnd,
      notifyOnMilestone: d.notifyOnMilestone,
      emailNotifications: d.emailNotifications,
      theme: d.theme,
      monthlyRewardBudget: d.monthlyRewardBudget ?? null,
      sadaqahPledgeEnabled: d.sadaqahPledgeEnabled,
      sadaqahStarsPerUnit: d.sadaqahStarsPerUnit,
      sadaqahCurrency: d.sadaqahCurrency,
      sadaqahAmountPerUnit: d.sadaqahAmountPerUnit,
      ...(d.parentPin !== undefined && { parentPin: d.parentPin || null }),
    },
    create: {
      familyId: family.id,
      pointsName: d.pointsName,
      defaultApprovalPolicy: d.defaultApprovalPolicy,
      weeklyStartDay: d.weeklyStartDay,
      monthlyPlanType: d.monthlyPlanType,
      monthlyQualifyingWeeks: d.monthlyQualifyingWeeks,
      notifyOnSubmission: d.notifyOnSubmission,
      notifyOnRedemption: d.notifyOnRedemption,
      notifyOnChallengeEnd: d.notifyOnChallengeEnd,
      notifyOnMilestone: d.notifyOnMilestone,
      emailNotifications: d.emailNotifications,
      theme: d.theme,
      monthlyRewardBudget: d.monthlyRewardBudget ?? null,
      sadaqahPledgeEnabled: d.sadaqahPledgeEnabled,
      sadaqahStarsPerUnit: d.sadaqahStarsPerUnit,
      sadaqahCurrency: d.sadaqahCurrency,
      sadaqahAmountPerUnit: d.sadaqahAmountPerUnit,
      ...(d.parentPin !== undefined && { parentPin: d.parentPin || null }),
    },
  })
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateParentProfile(input: z.infer<typeof ParentProfileSchema>): Promise<SettingsResult> {
  const { user } = await requireFamily()
  const parsed = ParentProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Please enter your name.' }
  }
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name } })
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Privacy & data — export / delete
// ────────────────────────────────────────────────────────────────────────────

/**
 * Returns a JSON-serializable snapshot of the entire family workspace.
 * Used for the data-export button in Settings → Privacy & data.
 */
export async function exportFamilyData() {
  const { family } = await requireFamily()

  const [
    settings,
    children,
    tasks,
    rewards,
    redemptions,
    challenges,
    achievements,
    pointsTxns,
    submissions,
    notifications,
    auditLogs,
  ] = await Promise.all([
    db.familySettings.findUnique({ where: { familyId: family.id } }),
    db.childProfile.findMany({ where: { familyId: family.id } }),
    db.taskTemplate.findMany({
      where: { familyId: family.id },
      include: { assignments: true, occurrences: { include: { submission: true } } },
    }),
    db.reward.findMany({ where: { familyId: family.id }, include: { eligibilities: true, redemptions: true } }),
    db.rewardRedemption.findMany({ where: { child: { familyId: family.id } }, include: { child: true, reward: true } }),
    db.weeklyChallenge.findMany({ where: { familyId: family.id }, include: { participants: true } }),
    db.achievement.findMany({ where: { familyId: family.id }, include: { childAchievements: true } }),
    db.pointsTransaction.findMany({ where: { familyId: family.id }, include: { child: true } }),
    db.taskSubmission.findMany({ where: { child: { familyId: family.id } }, include: { child: true, occurrence: { include: { task: true } } } }),
    db.notification.findMany({ where: { familyId: family.id } }),
    db.auditLog.findMany({ where: { familyId: family.id } }),
  ])

  return {
    exportedAt: new Date().toISOString(),
    family: {
      id: family.id,
      name: family.name,
      timezone: family.timezone,
      locale: family.locale,
      createdAt: family.createdAt.toISOString(),
    },
    settings,
    children: children.map((c) => ({
      ...c,
      birthDate: c.birthDate?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    tasks: tasks.map((t) => ({
      ...t,
      startDate: t.startDate?.toISOString() ?? null,
      endDate: t.endDate?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      occurrences: t.occurrences.map((o) => ({
        ...o,
        scheduledDate: o.scheduledDate.toISOString(),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
    })),
    rewards,
    redemptions: redemptions.map((r) => ({
      ...r,
      requestedAt: r.requestedAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      fulfilledAt: r.fulfilledAt?.toISOString() ?? null,
    })),
    challenges: challenges.map((c) => ({
      ...c,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    achievements,
    pointsTxns: pointsTxns.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    submissions: submissions.map((s) => ({
      ...s,
      submittedAt: s.submittedAt.toISOString(),
      reviewedAt: s.reviewedAt?.toISOString() ?? null,
    })),
    notifications: notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
    auditLogs: auditLogs.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
  }
}

/**
 * Permanently delete the family workspace and all related data.
 * This action cannot be undone.
 */
export async function deleteFamilyData(): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  try {
    // Per user request: do NOT delete the account, family, or children.
    // Only delete activity data: tasks, occurrences, submissions, reviews,
    // rewards, redemptions, transactions, incidents, sadaqah, investments,
    // reflections, achievements, challenges, notifications, audit logs.
    // The family, children, settings, and user account are preserved.

    // Get all child IDs for this family
    const children = await db.childProfile.findMany({
      where: { familyId: family.id },
      select: { id: true },
    })
    const childIds = children.map((c) => c.id)

    // Delete in dependency order (children first, then parents)
    // 1. Child achievements
    await db.childAchievement.deleteMany({
      where: { childId: { in: childIds } },
    })

    // 2. Incident reports (must be before incidents)
    await db.incidentReport.deleteMany({
      where: { incident: { familyId: family.id } },
    })

    // 3. Incident resolutions (must be before incidents)
    await db.incidentResolution.deleteMany({
      where: { incident: { familyId: family.id } },
    })

    // 4. Incidents
    await db.incident.deleteMany({
      where: { familyId: family.id },
    })

    // 5. Sadaqah donations (must be before causes)
    await db.sadaqahDonation.deleteMany({
      where: { familyId: family.id },
    })

    // 6. Sadaqah causes
    await db.sadaqahCause.deleteMany({
      where: { familyId: family.id },
    })

    // 7. Investments
    await db.investment.deleteMany({
      where: { familyId: family.id },
    })

    // 8. Weekly reflections
    await db.weeklyReflection.deleteMany({
      where: { familyId: family.id },
    })

    // 9. Family achievements
    await db.familyAchievement.deleteMany({
      where: { familyId: family.id },
    })

    // 10. Achievement definitions
    await db.achievement.deleteMany({
      where: { familyId: family.id },
    })

    // 11. Monthly milestones
    await db.monthlyMilestone.deleteMany({
      where: { familyId: family.id },
    })

    // 12. Challenge participants (must be before challenges)
    await db.challengeParticipant.deleteMany({
      where: { challenge: { familyId: family.id } },
    })

    // 13. Weekly challenges
    await db.weeklyChallenge.deleteMany({
      where: { familyId: family.id },
    })

    // 14. Task reviews (must be before submissions)
    await db.taskReview.deleteMany({
      where: { submission: { child: { familyId: family.id } } },
    })

    // 15. Task submissions (must be before occurrences)
    await db.taskSubmission.deleteMany({
      where: { child: { familyId: family.id } },
    })

    // 16. Task excusals (must be before occurrences)
    await db.taskExcusal.deleteMany({
      where: { occurrence: { task: { familyId: family.id } } },
    })

    // 17. Task occurrences (must be before tasks)
    await db.taskOccurrence.deleteMany({
      where: { task: { familyId: family.id } },
    })

    // 18. Task assignments (must be before tasks)
    await db.taskAssignment.deleteMany({
      where: { task: { familyId: family.id } },
    })

    // 19. Task templates
    await db.taskTemplate.deleteMany({
      where: { familyId: family.id },
    })

    // 20. Reward redemptions (must be before rewards)
    await db.rewardRedemption.deleteMany({
      where: { child: { familyId: family.id } },
    })

    // 21. Reward eligibilities
    if (db.rewardEligibility) {
      await db.rewardEligibility.deleteMany({
        where: { reward: { familyId: family.id } },
      })
    }

    // 22. Rewards
    await db.reward.deleteMany({
      where: { familyId: family.id },
    })

    // 23. Points transactions
    await db.pointsTransaction.deleteMany({
      where: { familyId: family.id },
    })

    // 24. Notifications
    await db.notification.deleteMany({
      where: { familyId: family.id },
    })

    // 25. Audit logs
    await db.auditLog.deleteMany({
      where: { familyId: family.id },
    })

    // Family, children, settings, and user account are PRESERVED.
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not delete family data.' }
  }
  revalidatePath('/dashboard')
  return { ok: true }
}
