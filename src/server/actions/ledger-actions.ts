'use server'

import { db } from '@/lib/db'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export type LedgerEntry = {
  id: string
  date: Date
  description: string
  amount: number
  type: string
  balanceAfter: number
  previousBalance: number
  reason: string | null
  status: string
}

export type LedgerData = {
  childId: string
  childName: string
  avatarColor: string
  currentBalance: number
  entries: LedgerEntry[]
}

/**
 * Get the full points ledger for a child.
 * The ledger is the source of truth for every point balance.
 * Daily tasks reset; earned points do not.
 */
export async function getChildLedger(childId: string): Promise<LedgerData> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  // Verify child belongs to family
  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
    select: { id: true, displayName: true, avatarColor: true },
  })
  if (!child) redirect('/dashboard')

  const txns = await db.pointsTransaction.findMany({
    where: { childId },
    orderBy: { createdAt: 'desc' },
    take: 200, // reasonable limit for UI
    select: {
      id: true,
      createdAt: true,
      description: true,
      amount: true,
      type: true,
      balanceAfter: true,
      reason: true,
      reference: true,
    },
  })

  const entries: LedgerEntry[] = txns.map((t) => ({
    id: t.id,
    date: t.createdAt,
    description: t.description,
    amount: t.amount,
    type: t.type,
    balanceAfter: t.balanceAfter,
    previousBalance: t.balanceAfter - t.amount,
    reason: t.reason,
    status: t.type, // EARNED, REDEMPTION, ADJUSTMENT, REFUND
  }))

  const currentBalance = entries.length > 0 ? entries[0].balanceAfter : 0

  return {
    childId: child.id,
    childName: child.displayName,
    avatarColor: child.avatarColor,
    currentBalance,
    entries,
  }
}
