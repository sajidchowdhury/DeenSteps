'use server'

import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

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
