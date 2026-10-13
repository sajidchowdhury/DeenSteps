'use server'

import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { SADAQAH_CAUSES } from '@/lib/constants'

// ────────────────────────────────────────────────────────────────────────────
// Phase 4 (S4.1): Sadaqah cause catalog management
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get all active sadaqah causes for the family.
 */
export async function getSadaqahCauses() {
  const { family } = await requireFamily()
  return db.sadaqahCause.findMany({
    where: { familyId: family.id, active: true },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { donations: true } } },
  })
}

/**
 * Create a custom sadaqah cause.
 */
export async function createSadaqahCause(
  title: string,
  description?: string,
  iconKey?: string
): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  if (!title.trim()) return { ok: false, error: 'শিরোনাম লিখুন।' }

  await db.sadaqahCause.create({
    data: {
      familyId: family.id,
      title: title.trim(),
      description: description?.trim() || null,
      iconKey: iconKey || 'heart',
    },
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Import a cause from the SADAQAH_CAUSES library.
 */
export async function importSadaqahCause(libraryIndex: number): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const lib = SADAQAH_CAUSES[libraryIndex]
  if (!lib) return { ok: false, error: 'কারণ পাওয়া যায়নি।' }

  // Check if already exists (by title)
  const existing = await db.sadaqahCause.findFirst({
    where: { familyId: family.id, title: lib.title },
  })
  if (existing) return { ok: false, error: 'এই কারণটি ইতিমধ্যে আছে।' }

  await db.sadaqahCause.create({
    data: {
      familyId: family.id,
      title: lib.title,
      description: lib.description,
      iconKey: lib.iconKey,
    },
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Deactivate a sadaqah cause (soft delete — preserves donation history).
 */
export async function deactivateSadaqahCause(causeId: string): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const cause = await db.sadaqahCause.findFirst({ where: { id: causeId, familyId: family.id } })
  if (!cause) return { ok: false, error: 'কারণ পাওয়া যায়নি।' }

  await db.sadaqahCause.update({ where: { id: causeId }, data: { active: false } })
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 4 (S4.2): Child sadaqah request flow (will be implemented in S4.2)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Child requests to dedicate stars to a sadaqah cause.
 * Atomic: deducts stars + creates SadaqahDonation in PENDING state.
 *
 * Per spec §6.2: points must never automatically represent guaranteed cash.
 * The parent pledge (sadaqahPledgeEnabled, sadaqahStarsPerUnit, etc.)
 * is a family commitment, not an inherent cash value.
 */
export async function requestSadaqah(
  childId: string,
  causeId: string,
  starsToDedicate: number
): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()

  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id, status: 'ACTIVE' },
  })
  if (!child) return { ok: false, error: 'সন্তান পাওয়া যায়নি।' }

  const cause = await db.sadaqahCause.findFirst({
    where: { id: causeId, familyId: family.id, active: true },
  })
  if (!cause) return { ok: false, error: 'কারণ পাওয়া যায়নি।' }

  if (starsToDedicate <= 0) return { ok: false, error: 'অন্তত ১ পয়েন্ট দিন।' }

  try {
    await db.$transaction(async (tx) => {
      // Check balance
      const last = await tx.pointsTransaction.findFirst({
        where: { childId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      })
      const balance = last?.balanceAfter ?? 0
      if (balance < starsToDedicate) {
        throw new Error(`পর্যাপ্ত পয়েন্ট নেই। তোমার আছে ${balance}, দিতে চেয়েছ ${starsToDedicate}।`)
      }

      // Deduct stars atomically
      const txn = await tx.pointsTransaction.create({
        data: {
          childId,
          familyId: family.id,
          amount: -starsToDedicate,
          type: 'ADJUSTMENT',
          description: `সাদাকাহ — ${cause.title} (${starsToDedicate} পয়েন্ট)`,
          balanceAfter: balance - starsToDedicate,
          reason: `সাদাকাহ: ${cause.title}`,
          adjustedById: null, // child initiated
        },
      })

      // Create donation record
      await tx.sadaqahDonation.create({
        data: {
          familyId: family.id,
          childId,
          causeId,
          starsDedicated: starsToDedicate,
          pointsTxnId: txn.id,
          status: 'PENDING',
        },
      })

      // Notify parents
      const memberships = await tx.familyMembership.findMany({
        where: { familyId: family.id, role: 'PARENT' },
      })
      for (const m of memberships) {
        await tx.notification.create({
          data: {
            userId: m.userId,
            familyId: family.id,
            childId,
            type: 'SADAQAH_REQUESTED',
            title: 'সাদাকাহ অনুরোধ',
            message: `${child.displayName} ${starsToDedicate} পয়েন্ট "${cause.title}"-এ দিতে চায়।`,
          },
        })
      }
    })
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'অনুরোধ করা যায়নি।' }
  }

  revalidatePath(`/child/${childId}`)
  revalidatePath('/dashboard')

  // Phase D (D3): Evaluate child achievements triggered by sadaqah requests.
  try {
    const { evaluateChildAchievements } = await import('@/server/actions/achievement-actions')
    await evaluateChildAchievements(childId, 'sadaqah_requested')
  } catch {
    // Best-effort
  }

  return { ok: true }
}

/**
 * Parent confirms a sadaqah donation — records the real-world donation.
 */
export async function confirmSadaqahDonation(
  donationId: string,
  realAmount?: number,
  confirmationNote?: string
): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()

  try {
    await db.$transaction(async (tx) => {
      const donation = await tx.sadaqahDonation.findUnique({
        where: { id: donationId },
        include: { child: true },
      })
      if (!donation) throw new Error('দান পাওয়া যায়নি।')
      if (donation.familyId !== family.id) throw new Error('FORBIDDEN')
      if (donation.status !== 'PENDING') throw new Error('এই দান আর অপেক্ষমান নেই।')

      await tx.sadaqahDonation.update({
        where: { id: donationId },
        data: {
          status: 'CONFIRMED',
          parentConfirmedAt: new Date(),
          realAmount: realAmount ?? null,
          realDate: new Date(),
          confirmationNote: confirmationNote?.trim() || null,
        },
      })

      // Notify child
      await tx.notification.create({
        data: {
          familyId: family.id,
          childId: donation.childId,
          type: 'SADAQAH_CONFIRMED',
          title: 'তোমার সাদাকাহ নিশ্চিত হয়েছে! 🤲',
          message: `বাবা-মা তোমার ${donation.starsDedicated} পয়েন্ট সাদাকাহ নিশ্চিত করেছেন। আল্লাহ তোমাকে উত্তম প্রতিদান দিন।`,
        },
      })

      // AuditLog
      await tx.auditLog.create({
        data: {
          familyId: family.id,
          actorId: user.id,
          action: 'SADAQAH_CONFIRMED',
          entity: 'SadaqahDonation',
          entityId: donationId,
          metadata: JSON.stringify({ starsDedicated: donation.starsDedicated, realAmount }),
        },
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'নিশ্চিত করা যায়নি।'
    return { ok: false, error: msg === 'FORBIDDEN' ? 'অ্যাক্সেস নেই।' : msg }
  }

  revalidatePath('/dashboard')
  revalidatePath('/planner')

  // Phase 5 (S5.3): Evaluate first_sadaqah family achievement.
  try {
    const { evaluateFamilyAchievements } = await import('@/server/actions/planner-actions')
    await evaluateFamilyAchievements('first_sadaqah_confirmed')
  } catch {
    // Best-effort
  }

  return { ok: true }
}

/**
 * Cancel a sadaqah donation — refunds the stars.
 */
export async function cancelSadaqahDonation(
  donationId: string,
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()

  try {
    await db.$transaction(async (tx) => {
      const donation = await tx.sadaqahDonation.findUnique({
        where: { id: donationId },
        include: { child: true },
      })
      if (!donation) throw new Error('দান পাওয়া যায়নি।')
      if (donation.familyId !== family.id) throw new Error('FORBIDDEN')
      if (donation.status !== 'PENDING') throw new Error('এই দান আর বাতিল করা যায় না।')

      // Refund stars
      const last = await tx.pointsTransaction.findFirst({
        where: { childId: donation.childId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      })
      const balance = last?.balanceAfter ?? 0

      await tx.pointsTransaction.create({
        data: {
          childId: donation.childId,
          familyId: family.id,
          amount: donation.starsDedicated,
          type: 'REFUND',
          reference: donationId,
          description: `ফেরত — সাদাকাহ বাতিল (${reason || 'কারণ উল্লেখ নেই'})`,
          balanceAfter: balance + donation.starsDedicated,
          reason: reason || null,
          adjustedById: user.id,
        },
      })

      await tx.sadaqahDonation.update({
        where: { id: donationId },
        data: { status: 'CANCELLED' },
      })

      // AuditLog
      await tx.auditLog.create({
        data: {
          familyId: family.id,
          actorId: user.id,
          action: 'SADAQAH_CANCELLED',
          entity: 'SadaqahDonation',
          entityId: donationId,
          metadata: JSON.stringify({ starsDedicated: donation.starsDedicated, reason }),
        },
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'বাতিল করা যায়নি।'
    return { ok: false, error: msg === 'FORBIDDEN' ? 'অ্যাক্সেস নেই।' : msg }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Get pending sadaqah donations for the family (parent dashboard).
 */
export async function getPendingSadaqahDonations() {
  const { family } = await requireFamily()
  return db.sadaqahDonation.findMany({
    where: { familyId: family.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      child: { select: { id: true, displayName: true, avatarColor: true } },
      cause: { select: { id: true, title: true, iconKey: true } },
    },
  })
}

/**
 * Get all sadaqah donations for the family (history).
 */
export async function getSadaqahHistory() {
  const { family } = await requireFamily()
  return db.sadaqahDonation.findMany({
    where: { familyId: family.id, status: { in: ['CONFIRMED', 'CANCELLED'] } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      child: { select: { id: true, displayName: true, avatarColor: true } },
      cause: { select: { id: true, title: true, iconKey: true } },
    },
  })
}
