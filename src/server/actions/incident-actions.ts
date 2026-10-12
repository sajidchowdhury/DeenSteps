'use server'

import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

// ────────────────────────────────────────────────────────────────────────────
// Phase 3 (S3.1): Incident reporting — child-to-parent private report
// ────────────────────────────────────────────────────────────────────────────

/**
 * Child submits a private incident report to their parent.
 * The child describes what happened, who was involved, how they felt,
 * and what help they need.
 *
 * IMPORTANT: A child CANNOT deduct another child's points or impose
 * punishment. They can only request parental attention.
 * Reports are private — not visible to other children.
 */
export async function submitIncident(
  childId: string,
  whatHappened: string,
  whoInvolved?: string,
  howFelt?: string,
  helpNeeded?: string
): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()

  // Verify child belongs to family
  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id, status: 'ACTIVE' },
  })
  if (!child) return { ok: false, error: 'Child not found.' }

  if (!whatHappened.trim()) {
    return { ok: false, error: 'কী হয়েছে তা লিখুন।' }
  }

  try {
    await db.$transaction(async (tx) => {
      // Create incident
      const incident = await tx.incident.create({
        data: {
          familyId: family.id,
          status: 'OPEN',
        },
      })

      // Create the child's report
      await tx.incidentReport.create({
        data: {
          incidentId: incident.id,
          childId: child.id,
          whatHappened: whatHappened.trim(),
          whoInvolved: whoInvolved?.trim() || null,
          howFelt: howFelt?.trim() || null,
          helpNeeded: helpNeeded?.trim() || null,
        },
      })

      // Notify all parents
      const memberships = await tx.familyMembership.findMany({
        where: { familyId: family.id, role: 'PARENT' },
      })
      for (const m of memberships) {
        await tx.notification.create({
          data: {
            userId: m.userId,
            familyId: family.id,
            childId: child.id,
            type: 'INCIDENT_REPORTED',
            title: 'সন্তান সাহায্য চেয়েছে',
            message: `${child.displayName} একটি সমস্যায় সাহায্য চাইছে। দয়া করে দেখুন।`,
          },
        })
      }
    })
  } catch (e) {
    return { ok: false, error: 'রিপোর্ট পাঠানো যায়নি। আবার চেষ্টা করুন।' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/child/${childId}`)
  return { ok: true }
}

/**
 * Get all open incidents for the family (parent dashboard).
 */
export async function getOpenIncidents() {
  const { family } = await requireFamily()

  const incidents = await db.incident.findMany({
    where: { familyId: family.id, status: { in: ['OPEN', 'IN_MEDIATION'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      reports: {
        include: {
          child: { select: { id: true, displayName: true, avatarColor: true } },
        },
      },
    },
  })

  return incidents
}

// ────────────────────────────────────────────────────────────────────────────
// Phase 3 (S3.2): Parent mediation workflow
// ────────────────────────────────────────────────────────────────────────────

export type IncidentOutcomeType = 'NO_ACTION' | 'APOLOGY' | 'RETURN_ITEM' | 'REPAIR' | 'HELPFUL_ACTION' | 'CONSEQUENCE'

const OUTCOME_LABELS: Record<string, string> = {
  NO_ACTION: 'আর কিছু করা লাগবে না',
  APOLOGY: 'ক্ষমা চাওয়া ও মীমাংসা',
  RETURN_ITEM: 'জিনিস ফেরত দেওয়া',
  REPAIR: 'ক্ষতি মেরামত করা',
  HELPFUL_ACTION: 'উপকারী কাজ করা',
  CONSEQUENCE: 'পরিণতি (শাস্তি নয়)',
}

/**
 * Parent resolves an incident with a restorative outcome.
 *
 * Per spec §5.3:
 * - Parent hears each child's perspective
 * - Parent determines what happened
 * - Children discuss a suitable way to resolve
 * - Parent records the outcome
 *
 * Per spec §5.4:
 * - A sincere apology should NOT automatically erase wrongdoing
 * - Avoid automatically deducting points for every argument
 * - Prefer restorative outcomes
 * - If parent chooses a point adjustment, require explicit confirmation + reason + audit
 *
 * Point adjustments are OPTIONAL. If pointsAdjusted != 0:
 * - reason is REQUIRED
 * - A PointsTransaction is created with type=ADJUSTMENT
 * - The transaction is linked to IncidentResolution via pointsTxnId
 */
export async function resolveIncident(
  incidentId: string,
  outcomeType: IncidentOutcomeType,
  description: string,
  pointsAdjusted?: number,
  reason?: string,
  affectedChildId?: string
): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()

  // Validate
  if (!description.trim()) {
    return { ok: false, error: 'বিবরণ লিখুন।' }
  }
  if (pointsAdjusted && pointsAdjusted !== 0 && !reason?.trim()) {
    return { ok: false, error: 'পয়েন্ট সমন্বয়ের জন্য কারণ লিখুন।' }
  }

  try {
    await db.$transaction(async (tx) => {
      // Verify incident belongs to family and is not resolved
      const incident = await tx.incident.findUnique({
        where: { id: incidentId },
      })
      if (!incident) throw new Error('ইনসিডেন্ট পাওয়া যায়নি।')
      if (incident.familyId !== family.id) throw new Error('FORBIDDEN')
      if (incident.status === 'RESOLVED') throw new Error('এই ইনসিডেন্ট ইতিমধ্যে সমাধান হয়ে গেছে।')

      // Check if already has a resolution
      const existingResolution = await tx.incidentResolution.findUnique({
        where: { incidentId },
      })
      if (existingResolution) throw new Error('এই ইনসিডেন্টের সমাধান ইতিমধ্যে রেকর্ড করা হয়েছে।')

      // If point adjustment, create PointsTransaction
      let pointsTxnId: string | null = null
      if (pointsAdjusted && pointsAdjusted !== 0 && affectedChildId) {
        // Verify child belongs to family
        const child = await tx.childProfile.findFirst({
          where: { id: affectedChildId, familyId: family.id },
        })
        if (!child) throw new Error('সন্তান পাওয়া যায়নি।')

        // Compute current balance
        const last = await tx.pointsTransaction.findFirst({
          where: { childId: affectedChildId },
          orderBy: { createdAt: 'desc' },
          select: { balanceAfter: true },
        })
        const balanceAfter = (last?.balanceAfter ?? 0) + pointsAdjusted

        const txn = await tx.pointsTransaction.create({
          data: {
            childId: affectedChildId,
            familyId: family.id,
            amount: pointsAdjusted,
            type: 'ADJUSTMENT',
            description: `সমন্বয় — ${OUTCOME_LABELS[outcomeType] || outcomeType}`,
            balanceAfter,
            reason: reason?.trim() || null,
            adjustedById: user.id,
          },
        })
        pointsTxnId = txn.id
      }

      // Create the resolution
      await tx.incidentResolution.create({
        data: {
          incidentId,
          outcomeType,
          description: description.trim(),
          pointsAdjusted: pointsAdjusted ?? 0,
          pointsTxnId,
          reason: reason?.trim() || null,
          resolvedById: user.id,
        },
      })

      // Mark incident as resolved
      await tx.incident.update({
        where: { id: incidentId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      })

      // Notify the child who reported
      const reports = await tx.incidentReport.findMany({
        where: { incidentId },
        select: { childId: true },
      })
      for (const r of reports) {
        await tx.notification.create({
          data: {
            familyId: family.id,
            childId: r.childId,
            type: 'INCIDENT_RESOLVED',
            title: 'তোমার সমস্যাটি দেখা হয়েছে',
            message: `বাবা-মা তোমার সমস্যাটি নিয়ে কথা বলেছেন। ${OUTCOME_LABELS[outcomeType] || 'সমাধান হয়েছে'}।`,
          },
        })
      }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'সমাধান করা যায়নি।'
    return { ok: false, error: msg === 'FORBIDDEN' ? 'আপনার এই ইনসিডেন্টে অ্যাক্সেস নেই।' : msg }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}
