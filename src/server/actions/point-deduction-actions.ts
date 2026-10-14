'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

// ────────────────────────────────────────────────────────────────────────────
// Point Deduction — parent can deduct points for bad behavior, lying,
// disrespect, etc. The parent decides the reason + amount.
//
// This is NOT for missed worship (guardrails §2.3 — no auto-deduction for
// missed ibadah). This is for character/behavior issues where the parent
// chooses to apply a consequence.
//
// The deduction appears in the child's ledger as an ADJUSTMENT transaction
// with the reason + adjustedById recorded for audit.
// ────────────────────────────────────────────────────────────────────────────

// Common reasons are defined in the component, not here — "use server" files
// can only export async functions.

/**
 * Deduct points from a child. Atomic — creates ADJUSTMENT transaction
 * with negative amount + AuditLog entry.
 *
 * @param childId - The child to deduct from
 * @param amount - Positive number (will be negated in the transaction)
 * @param reason - Why the points are being deducted
 * @returns { ok, error? }
 */
export async function deductPoints(
  childId: string,
  amount: number,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()

  // Validate
  if (amount <= 0) return { ok: false, error: '০ এর বেশি পয়েন্ট লিখুন।' }
  if (!reason.trim()) return { ok: false, error: 'কারণ লিখুন।' }

  // Verify child belongs to family
  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) return { ok: false, error: 'সন্তান পাওয়া যায়নি।' }

  try {
    await db.$transaction(async (tx) => {
      // Compute current balance
      const last = await tx.pointsTransaction.findFirst({
        where: { childId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      })
      const currentBalance = last?.balanceAfter ?? 0

      // Don't allow balance to go below 0
      const deductionAmount = Math.min(amount, currentBalance)
      if (deductionAmount <= 0) {
        throw new Error('সন্তানের ব্যালেন্সে পর্যাপ্ত পয়েন্ট নেই।')
      }

      const balanceAfter = currentBalance - deductionAmount

      // Create the deduction transaction
      const txn = await tx.pointsTransaction.create({
        data: {
          childId,
          familyId: family.id,
          amount: -deductionAmount,
          type: 'ADJUSTMENT',
          description: `পয়েন্ট কর্তন — ${reason.trim()}`,
          balanceAfter,
          reason: reason.trim(),
          adjustedById: user.id,
        },
      })

      // AuditLog
      await tx.auditLog.create({
        data: {
          familyId: family.id,
          actorId: user.id,
          action: 'POINT_DEDUCTION',
          entity: 'ChildProfile',
          entityId: childId,
          metadata: JSON.stringify({
            amount: deductionAmount,
            reason: reason.trim(),
            childName: child.displayName,
            previousBalance: currentBalance,
            newBalance: balanceAfter,
          }),
        },
      })

      // Notify child
      await tx.notification.create({
        data: {
          familyId: family.id,
          childId,
          type: 'TASK_APPROVED',
          title: 'পয়েন্ট কর্তন',
          message: `${deductionAmount} পয়েন্ট কর্তন করা হয়েছে। কারণ: ${reason.trim()}`,
        },
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'পয়েন্ট কর্তন করা যায়নি।'
    return { ok: false, error: msg }
  }

  revalidatePath('/dashboard')
  revalidatePath('/review')
  revalidatePath(`/child/${childId}`)
  return { ok: true }
}

/**
 * Get recent point deductions for the activity center.
 */
export async function getRecentDeductions() {
  const { family } = await requireFamily()
  const txns = await db.pointsTransaction.findMany({
    where: {
      familyId: family.id,
      type: 'ADJUSTMENT',
      amount: { lt: 0 },
      reason: { not: null },
    },
    include: {
      child: { select: { id: true, displayName: true, avatarColor: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return txns
    .filter((t) => t.reason && !t.reason.includes('সাদাকাহ') && !t.reason.includes('বিনিয়োগ'))
    .map((t) => ({
      id: t.id,
      childId: t.childId,
      childName: t.child.displayName,
      childAvatarColor: t.child.avatarColor,
      amount: t.amount,
      reason: t.reason,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    }))
}
