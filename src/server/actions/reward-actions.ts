'use server'

import * as React from 'react'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { REWARD_LIBRARY } from '@/lib/constants'

// ────────────────────────────────────────────────────────────────────────────
// Reward catalog management
// ────────────────────────────────────────────────────────────────────────────

const RewardSchema = z.object({
  title: z.string().min(1, 'Please enter a title.').max(120),
  description: z.string().max(500).optional(),
  iconKey: z.string().default('gift'),
  requiredPoints: z.number().int().min(0).max(10000).default(50),
  rewardType: z.enum(['POINTS', 'ACHIEVEMENT']).default('POINTS'),
  requiresApproval: z.boolean().default(true),
  redemptionLimit: z.number().int().min(1).optional(),
  expirationDate: z.string().optional(),
  // Phase 2 (S2.1): Category, frequency limits, estimated cost
  category: z.enum(['EXPERIENCE', 'LEARNING', 'PRIVILEGE', 'FOOD']).default('EXPERIENCE'),
  maxPerWeek: z.number().int().min(1).nullable().optional(),
  maxPerMonth: z.number().int().min(1).nullable().optional(),
  cooldownDays: z.number().int().min(0).default(0),
  estimatedCost: z.number().min(0).nullable().optional(),
})

export type RewardResult = { ok: true; rewardId: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function createReward(input: z.infer<typeof RewardSchema>): Promise<RewardResult> {
  const { family } = await requireFamily()
  const parsed = RewardSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const d = parsed.data

  const reward = await db.reward.create({
    data: {
      familyId: family.id,
      title: d.title,
      description: d.description,
      iconKey: d.iconKey,
      requiredPoints: d.requiredPoints,
      rewardType: d.rewardType,
      requiresApproval: d.requiresApproval,
      redemptionLimit: d.redemptionLimit,
      expirationDate: d.expirationDate ? new Date(d.expirationDate) : null,
      status: 'ACTIVE',
      category: d.category,
      maxPerWeek: d.maxPerWeek ?? null,
      maxPerMonth: d.maxPerMonth ?? null,
      cooldownDays: d.cooldownDays,
      estimatedCost: d.estimatedCost ?? null,
    },
  })

  revalidatePath('/rewards')
  revalidatePath('/dashboard')
  return { ok: true, rewardId: reward.id }
}

export async function updateReward(rewardId: string, input: Partial<z.infer<typeof RewardSchema>>): Promise<RewardResult> {
  const { family } = await requireFamily()
  const reward = await db.reward.findFirst({ where: { id: rewardId, familyId: family.id } })
  if (!reward) return { ok: false, error: 'Reward not found.' }

  const parsed = RewardSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid input.' }
  const d = parsed.data

  await db.reward.update({
    where: { id: rewardId },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.iconKey !== undefined && { iconKey: d.iconKey }),
      ...(d.requiredPoints !== undefined && { requiredPoints: d.requiredPoints }),
      ...(d.rewardType !== undefined && { rewardType: d.rewardType }),
      ...(d.requiresApproval !== undefined && { requiresApproval: d.requiresApproval }),
      ...(d.redemptionLimit !== undefined && { redemptionLimit: d.redemptionLimit }),
      ...(d.expirationDate !== undefined && { expirationDate: d.expirationDate ? new Date(d.expirationDate) : null }),
      ...(d.category !== undefined && { category: d.category }),
      ...(d.maxPerWeek !== undefined && { maxPerWeek: d.maxPerWeek }),
      ...(d.maxPerMonth !== undefined && { maxPerMonth: d.maxPerMonth }),
      ...(d.cooldownDays !== undefined && { cooldownDays: d.cooldownDays }),
      ...(d.estimatedCost !== undefined && { estimatedCost: d.estimatedCost }),
    },
  })

  revalidatePath('/rewards')
  revalidatePath('/dashboard')
  return { ok: true, rewardId }
}

export async function archiveReward(rewardId: string): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const reward = await db.reward.findFirst({ where: { id: rewardId, familyId: family.id } })
  if (!reward) return { ok: false, error: 'Reward not found.' }
  await db.reward.update({ where: { id: rewardId }, data: { status: 'ARCHIVED' } })
  revalidatePath('/rewards')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function importLibraryReward(libraryIndex: number) {
  const lib = REWARD_LIBRARY[libraryIndex]
  if (!lib) return { ok: false, error: 'Library reward not found.' }
  return createReward({
    title: lib.title,
    description: lib.description,
    iconKey: lib.iconKey,
    requiredPoints: lib.requiredPoints,
    rewardType: 'POINTS',
    requiresApproval: true,
    category: lib.category as 'EXPERIENCE' | 'LEARNING' | 'PRIVILEGE' | 'FOOD',
    maxPerWeek: lib.maxPerWeek,
    maxPerMonth: lib.maxPerMonth,
    cooldownDays: lib.cooldownDays,
    estimatedCost: lib.estimatedCost,
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Redemption workflow
// ────────────────────────────────────────────────────────────────────────────

/**
 * Child requests a reward redemption.
 * Atomic: verifies balance, reserves points (creates a debit txn linked to the redemption),
 * and creates the redemption in REQUESTED state.
 *
 * If the reward does not require approval, immediately marks as APPROVED.
 */
export async function requestRedemption(rewardId: string, childId: string): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const child = await db.childProfile.findFirst({ where: { id: childId, familyId: family.id, status: 'ACTIVE' } })
  if (!child) return { ok: false, error: 'Child not found.' }

  const reward = await db.reward.findFirst({ where: { id: rewardId, familyId: family.id, status: 'ACTIVE' } })
  if (!reward) return { ok: false, error: 'Reward not available.' }
  if (reward.rewardType !== 'POINTS') return { ok: false, error: 'This reward is achievement-based and cannot be redeemed with points.' }

  try {
    await db.$transaction(async (tx) => {
      // Lock-style check: re-fetch reward inside transaction
      const r = await tx.reward.findUnique({ where: { id: rewardId } })
      if (!r || r.status !== 'ACTIVE') throw new Error('Reward not available.')

      // Compute current balance
      const last = await tx.pointsTransaction.findFirst({
        where: { childId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      })
      const balance = last?.balanceAfter ?? 0
      if (balance < r.requiredPoints) {
        throw new Error(`Not enough stars. You need ${r.requiredPoints}, you have ${balance}.`)
      }

      // Check redemption limit per child
      if (r.redemptionLimit) {
        const count = await tx.rewardRedemption.count({
          where: { rewardId, childId, status: { in: ['REQUESTED', 'APPROVED', 'FULFILLED'] } },
        })
        if (count >= r.redemptionLimit) {
          throw new Error('Redemption limit reached for this reward.')
        }
      }

      // Deduct points atomically
      const txn = await tx.pointsTransaction.create({
        data: {
          childId,
          familyId: family.id,
          amount: -r.requiredPoints,
          type: 'REDEMPTION',
          description: `Spent ${r.requiredPoints} ${'stars'} — ${r.title}`,
          balanceAfter: balance - r.requiredPoints,
        },
      })

      const redemption = await tx.rewardRedemption.create({
        data: {
          rewardId,
          childId,
          status: r.requiresApproval ? 'REQUESTED' : 'APPROVED',
          pointsCost: r.requiredPoints,
          pointsTxnId: txn.id,
          reviewedAt: r.requiresApproval ? null : new Date(),
          reviewedById: r.requiresApproval ? null : undefined,
        },
      })

      // Notify parent
      const memberships = await tx.familyMembership.findMany({
        where: { familyId: family.id, role: 'PARENT' },
      })
      for (const m of memberships) {
        await tx.notification.create({
          data: {
            userId: m.userId,
            familyId: family.id,
            childId,
            type: 'REWARD_REQUESTED',
            title: 'Reward redemption requested',
            message: `${child.displayName} requested "${r.title}" for ${r.requiredPoints} ${'stars'}.`,
          },
        })
      }
    })
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not request reward.' }
  }

  revalidatePath(`/child/${childId}`)
  revalidatePath('/rewards')
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Parent approves a redemption request. Points are already reserved.
 */
export async function approveRedemption(redemptionId: string): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()
  try {
    await db.$transaction(async (tx) => {
      const redemption = await tx.rewardRedemption.findUnique({
        where: { id: redemptionId },
        include: { reward: true, child: true },
      })
      if (!redemption) throw new Error('Redemption not found.')
      if (redemption.child.familyId !== family.id) throw new Error('FORBIDDEN')
      if (redemption.status !== 'REQUESTED') throw new Error('This redemption is no longer pending.')

      await tx.rewardRedemption.update({
        where: { id: redemptionId },
        data: { status: 'APPROVED', reviewedAt: new Date(), reviewedById: user.id },
      })
    })
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not approve redemption.' }
  }
  revalidatePath('/rewards')
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Parent declines a redemption request. Refunds the reserved points.
 */
export async function declineRedemption(redemptionId: string, note?: string): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()
  try {
    await db.$transaction(async (tx) => {
      const redemption = await tx.rewardRedemption.findUnique({
        where: { id: redemptionId },
        include: { child: true },
      })
      if (!redemption) throw new Error('Redemption not found.')
      if (redemption.child.familyId !== family.id) throw new Error('FORBIDDEN')
      if (redemption.status !== 'REQUESTED') throw new Error('This redemption is no longer pending.')

      // Refund the reserved points
      if (redemption.pointsTxnId) {
        const last = await tx.pointsTransaction.findFirst({
          where: { childId: redemption.childId },
          orderBy: { createdAt: 'desc' },
          select: { balanceAfter: true },
        })
        const balance = last?.balanceAfter ?? 0
        const refund = await tx.pointsTransaction.create({
          data: {
            childId: redemption.childId,
            familyId: family.id,
            amount: redemption.pointsCost,
            type: 'REFUND',
            reference: redemptionId,
            description: `Refund — ${note || 'Redemption declined'}`,
            balanceAfter: balance + redemption.pointsCost,
          },
        })
        await tx.rewardRedemption.update({
          where: { id: redemptionId },
          data: {
            status: 'DECLINED',
            reviewedAt: new Date(),
            reviewedById: user.id,
            note,
          },
        })
      }
    })
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not decline redemption.' }
  }
  revalidatePath('/rewards')
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Parent marks a redemption as fulfilled.
 */
export async function fulfillRedemption(redemptionId: string): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()
  try {
    const redemption = await db.rewardRedemption.findUnique({
      where: { id: redemptionId },
      include: { child: true },
    })
    if (!redemption) return { ok: false, error: 'Redemption not found.' }
    if (redemption.child.familyId !== family.id) return { ok: false, error: 'FORBIDDEN' }
    if (redemption.status !== 'APPROVED') return { ok: false, error: 'Only approved redemptions can be fulfilled.' }

    await db.rewardRedemption.update({
      where: { id: redemptionId },
      data: { status: 'FULFILLED', fulfilledAt: new Date() },
    })
  } catch (e) {
    return { ok: false, error: 'Could not fulfill redemption.' }
  }
  revalidatePath('/rewards')
  revalidatePath('/dashboard')
  return { ok: true }
}
