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
  pointsName: z.string().min(1).max(40).default('Points'),
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
    // Cascading deletes are configured on Family relations, so deleting the
    // family row removes everything tied to it. We also drop the user's
    // family memberships so they can create a new workspace.
    await db.familyMembership.deleteMany({ where: { familyId: family.id } })
    await db.family.delete({ where: { id: family.id } })
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not delete family data.' }
  }
  revalidatePath('/dashboard')
  return { ok: true }
}
