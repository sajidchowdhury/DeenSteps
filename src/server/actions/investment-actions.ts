'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

// ────────────────────────────────────────────────────────────────────────────
// Investment system — child invests points as "money" with parents.
//
// Flow:
//   1. Child invests N points → points deducted (ADJUSTMENT, negative)
//      → Investment record created (status=ACTIVE)
//   2. Parent sees the investment + their promise
//   3. Parent returns profit → profit points added to child (EARNED)
//      → Investment marked RETURNED with profitReturned + profitTxnId
//
// The parent's promise is approximate, NOT definite — this avoids riba
// (interest). The parent decides the actual profit returned.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Child creates an investment — deducts points and creates an ACTIVE investment.
 * Atomic: deduction + investment creation in one transaction.
 */
export async function createInvestment(
  childId: string,
  amount: number,
  parentPromise: string
): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()

  // Verify child belongs to family
  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) return { ok: false, error: 'সন্তান পাওয়া যায়নি।' }

  if (amount <= 0) return { ok: false, error: '০ এর বেশি পয়েন্ট লিখুন।' }

  // Check balance
  const balance = await db.pointsTransaction.aggregate({
    where: { childId },
    _sum: { amount: true },
  })
  const currentBalance = balance._sum.amount ?? 0
  if (amount > currentBalance) {
    return { ok: false, error: `তোমার কাছে মাত্র ${currentBalance} পয়েন্ট আছে।` }
  }

  try {
    await db.$transaction(async (tx) => {
      // Deduct points (ADJUSTMENT, negative)
      const last = await tx.pointsTransaction.findFirst({
        where: { childId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      })
      const balanceAfter = (last?.balanceAfter ?? 0) - amount

      const txn = await tx.pointsTransaction.create({
        data: {
          childId,
          familyId: family.id,
          amount: -amount,
          type: 'ADJUSTMENT',
          description: `বিনিয়োগ — ${parentPromise.slice(0, 50)}`,
          balanceAfter,
          reason: 'বিনিয়োগ',
        },
      })

      // Create investment record
      await tx.investment.create({
        data: {
          familyId: family.id,
          childId,
          amountInvested: amount,
          parentPromise: parentPromise.trim(),
          status: 'ACTIVE',
          pointsTxnId: txn.id,
        },
      })

      // Notify parents
      const parents = await tx.familyMembership.findMany({
        where: { familyId: family.id, role: 'PARENT' },
      })
      for (const p of parents) {
        await tx.notification.create({
          data: {
            familyId: family.id,
            userId: p.userId,
            childId,
            type: 'REWARD_REQUESTED',
            title: `${child.displayName} বিনিয়োগ করেছে`,
            message: `${amount} পয়েন্ট বিনিয়োগ করেছে। প্রতিশ্রুতি: "${parentPromise.slice(0, 80)}"`,
          },
        })
      }
    })
  } catch (e) {
    return { ok: false, error: 'বিনিয়োগ করা যায়নি। আবার চেষ্টা করুন।' }
  }

  revalidatePath(`/child/${childId}`)
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Parent returns profit on an investment — adds profit points to child
 * and marks the investment as RETURNED.
 * Atomic: profit addition + investment update in one transaction.
 */
export async function returnInvestmentProfit(
  investmentId: string,
  profitAmount: number
): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()

  if (profitAmount < 0) return { ok: false, error: '০ বা তার বেশি লিখুন।' }

  try {
    await db.$transaction(async (tx) => {
      const investment = await tx.investment.findUnique({
        where: { id: investmentId },
      })
      if (!investment) throw new Error('বিনিয়োগ পাওয়া যায়নি।')
      if (investment.familyId !== family.id) throw new Error('FORBIDDEN')
      if (investment.status === 'RETURNED') throw new Error('এই বিনিয়োগে মুনাফা ফেরত দেওয়া হয়ে গেছে।')

      // Add profit points to child (EARNED)
      const last = await tx.pointsTransaction.findFirst({
        where: { childId: investment.childId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      })
      const balanceAfter = (last?.balanceAfter ?? 0) + profitAmount

      const profitTxn = await tx.pointsTransaction.create({
        data: {
          childId: investment.childId,
          familyId: family.id,
          amount: profitAmount,
          type: 'EARNED',
          description: `বিনিয়োগের মুনাফা — ${investment.amountInvested} পয়েন্ট থেকে`,
          balanceAfter,
        },
      })

      // Mark investment as RETURNED
      await tx.investment.update({
        where: { id: investmentId },
        data: {
          status: 'RETURNED',
          profitReturned: profitAmount,
          profitTxnId: profitTxn.id,
          returnedAt: new Date(),
        },
      })

      // Notify child
      await tx.notification.create({
        data: {
          familyId: family.id,
          childId: investment.childId,
          type: 'TASK_APPROVED',
          title: 'বিনিয়োগের মুনাফা পেয়েছ! 🎉',
          message: `${investment.amountInvested} পয়েন্ট বিনিয়োগ থেকে ${profitAmount} পয়েন্ট মুনাফা পেয়েছ!`,
        },
      })

      // AuditLog
      await tx.auditLog.create({
        data: {
          familyId: family.id,
          actorId: user.id,
          action: 'INVESTMENT_PROFIT_RETURNED',
          entity: 'Investment',
          entityId: investmentId,
          metadata: JSON.stringify({
            amountInvested: investment.amountInvested,
            profitReturned: profitAmount,
            childId: investment.childId,
          }),
        },
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'মুনাফা ফেরত দেওয়া যায়নি।'
    return { ok: false, error: msg === 'FORBIDDEN' ? 'অ্যাক্সেস নেই।' : msg }
  }

  revalidatePath('/dashboard')
  revalidatePath('/planner')
  return { ok: true }
}

/**
 * Get active investments for the parent dashboard.
 */
export async function getActiveInvestments() {
  const { family } = await requireFamily()
  return db.investment.findMany({
    where: { familyId: family.id, status: 'ACTIVE' },
    include: { child: { select: { id: true, displayName: true, avatarColor: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get investment history (RETURNED investments) for parent.
 */
export async function getInvestmentHistory() {
  const { family } = await requireFamily()
  return db.investment.findMany({
    where: { familyId: family.id, status: 'RETURNED' },
    include: { child: { select: { id: true, displayName: true, avatarColor: true } } },
    orderBy: { returnedAt: 'desc' },
    take: 20,
  })
}

/**
 * Get all investments for a child (for their investment ledger).
 */
export async function getChildInvestments(childId: string) {
  const { family } = await requireFamily()
  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) return []

  return db.investment.findMany({
    where: { childId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get investment summary for a child (total invested, total profit, active amount).
 */
export async function getChildInvestmentSummary(childId: string) {
  const { family } = await requireFamily()
  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) return { totalInvested: 0, totalProfit: 0, activeAmount: 0, count: 0 }

  const investments = await db.investment.findMany({
    where: { childId },
  })

  const totalInvested = investments.reduce((s, i) => s + i.amountInvested, 0)
  const totalProfit = investments
    .filter((i) => i.status === 'RETURNED')
    .reduce((s, i) => s + (i.profitReturned ?? 0), 0)
  const activeAmount = investments
    .filter((i) => i.status === 'ACTIVE')
    .reduce((s, i) => s + i.amountInvested, 0)

  return {
    totalInvested,
    totalProfit,
    activeAmount,
    count: investments.length,
  }
}
