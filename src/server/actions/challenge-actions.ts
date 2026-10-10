'use server'

import * as React from 'react'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

// ────────────────────────────────────────────────────────────────────────────
// Weekly challenges
// ────────────────────────────────────────────────────────────────────────────

const ChallengeSchema = z.object({
  name: z.string().min(1, 'Please enter a name.').max(120),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, 'Pick a start date.'),
  endDate: z.string().min(1, 'Pick an end date.'),
  targetPercent: z.number().int().min(1).max(100).default(80),
  eligibleChildIds: z.array(z.string()).default([]),
  rewardTitle: z.string().max(120).optional(),
})

export type ChallengeResult =
  | { ok: true; challengeId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function createChallenge(input: z.infer<typeof ChallengeSchema>): Promise<ChallengeResult> {
  const { family } = await requireFamily()
  const parsed = ChallengeSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const d = parsed.data

  const start = new Date(d.startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(d.endDate)
  end.setHours(23, 59, 59, 999)
  if (end < start) {
    return { ok: false, error: 'End date must be after the start date.', fieldErrors: { endDate: 'End date must be after the start date.' } }
  }

  // Validate eligible children belong to the family
  if (d.eligibleChildIds.length > 0) {
    const valid = await db.childProfile.count({
      where: { id: { in: d.eligibleChildIds }, familyId: family.id, status: 'ACTIVE' },
    })
    if (valid !== d.eligibleChildIds.length) {
      return { ok: false, error: 'One or more selected children are invalid.' }
    }
  }

  const challenge = await db.weeklyChallenge.create({
    data: {
      familyId: family.id,
      name: d.name,
      description: d.description,
      startDate: start,
      endDate: end,
      targetPercent: d.targetPercent,
      rewardTitle: d.rewardTitle,
      status: 'ACTIVE',
      participants:
        d.eligibleChildIds.length > 0
          ? {
              create: d.eligibleChildIds.map((childId) => ({
                childId,
                targetPercent: d.targetPercent,
              })),
            }
          : undefined,
    },
  })

  revalidatePath('/challenges')
  revalidatePath('/dashboard')
  return { ok: true, challengeId: challenge.id }
}

export async function cancelChallenge(challengeId: string): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const challenge = await db.weeklyChallenge.findFirst({ where: { id: challengeId, familyId: family.id } })
  if (!challenge) return { ok: false, error: 'Challenge not found.' }
  await db.weeklyChallenge.update({ where: { id: challengeId }, data: { status: 'CANCELLED' } })
  revalidatePath('/challenges')
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Recalculate participant completion percentages for a challenge based on
 * occurrences inside the challenge window. Best-effort — does not handle every
 * edge case (e.g. category filters). Used to keep the UI in sync when the
 * parent views the challenges page.
 */
export async function refreshChallengeProgress(challengeId: string) {
  const { family } = await requireFamily()
  const challenge = await db.weeklyChallenge.findFirst({
    where: { id: challengeId, familyId: family.id },
    include: { participants: true },
  })
  if (!challenge) return { ok: false, error: 'Challenge not found.' }

  for (const p of challenge.participants) {
    const occurrences = await db.taskOccurrence.findMany({
      where: {
        task: { assignments: { some: { childId: p.childId } }, status: 'ACTIVE' },
        scheduledDate: { gte: challenge.startDate, lte: challenge.endDate },
      },
    })
    const eligible = occurrences.length
    const completed = occurrences.filter((o) => o.status === 'APPROVED').length
    const pct = eligible > 0 ? Math.round((completed / eligible) * 100) : 0
    await db.challengeParticipant.update({
      where: { id: p.id },
      data: {
        eligibleCount: eligible,
        completedCount: completed,
        completionPercent: pct,
        qualified: pct >= challenge.targetPercent,
        qualifiedAt: pct >= challenge.targetPercent && !p.qualified ? new Date() : p.qualifiedAt,
      },
    })
  }
  revalidatePath('/challenges')
  return { ok: true }
}
