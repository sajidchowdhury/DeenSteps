'use server'

import * as React from 'react'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

// ────────────────────────────────────────────────────────────────────────────
// Child submission (from child dashboard)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Child submits a task occurrence for parent review.
 * Atomic: creates a submission + updates occurrence status.
 */
export async function submitTaskOccurrence(occurrenceId: string, childId: string, note?: string) {
  const { family } = await requireFamily()
  // Verify child belongs to family
  const child = await db.childProfile.findFirst({ where: { id: childId, familyId: family.id } })
  if (!child) return { ok: false, error: 'Child not found.' }

  // Verify occurrence belongs to a task assigned to this child
  const occ = await db.taskOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { task: { include: { assignments: true } } },
  })
  if (!occ) return { ok: false, error: 'Task occurrence not found.' }
  if (!occ.task.assignments.some((a) => a.childId === childId)) {
    return { ok: false, error: 'This task is not assigned to this child.' }
  }
  if (occ.status !== 'ASSIGNED') {
    return { ok: false, error: 'This task has already been submitted.' }
  }

  // Use a transaction so submission + occurrence update are atomic
  try {
    await db.$transaction(async (tx) => {
      const submission = await tx.taskSubmission.create({
        data: {
          occurrenceId,
          childId,
          note,
          submittedAt: new Date(),
        },
      })
      await tx.taskOccurrence.update({
        where: { id: occurrenceId },
        data: { status: 'SUBMITTED' },
      })

      // If auto-approval, immediately approve and award points
      if (occ.task.approvalPolicy === 'AUTO') {
        await approveSubmissionInternal(tx, submission.id, family.id, childId, occ.task.pointsValue, occ.task.title, 'AUTO', null, occ.task.createdBy)
      }

      // Notify the parent (family creator) — best-effort
      const memberships = await tx.familyMembership.findMany({
        where: { familyId: family.id, role: 'PARENT' },
      })
      for (const m of memberships) {
        await tx.notification.create({
          data: {
            userId: m.userId,
            familyId: family.id,
            childId,
            type: 'TASK_SUBMITTED',
            title: 'New submission to review',
            message: `${child.displayName} submitted "${occ.task.title}".`,
          },
        })
      }
    })
  } catch (e) {
    return { ok: false, error: 'Could not submit task. Please try again.' }
  }

  // Phase 5 (S5.2): If the task auto-approved, the child just earned an APPROVED
  // occurrence — re-evaluate the monthly milestone so progress is fresh.
  if (occ.task.approvalPolicy === 'AUTO') {
    try {
      const { evaluateMonthlyMilestone } = await import('@/server/actions/milestone-actions')
      await evaluateMonthlyMilestone(childId)
    } catch {
      // Best-effort — do not fail the submission
    }
  }

  revalidatePath(`/child/${childId}`)
  revalidatePath('/review')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Parent review (approve / request revision / reject)
// ────────────────────────────────────────────────────────────────────────────

export type ReviewDecision = 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED'

/**
 * Parent reviews a submission. Points are awarded atomically when APPROVED.
 * Idempotent: a submission that already has a decision cannot be re-reviewed.
 */
export async function reviewSubmission(
  submissionId: string,
  decision: ReviewDecision,
  reviewerNote?: string
): Promise<{ ok: boolean; error?: string }> {
  const { user, family } = await requireFamily()

  try {
    await db.$transaction(async (tx) => {
      const submission = await tx.taskSubmission.findUnique({
        where: { id: submissionId },
        include: { occurrence: { include: { task: true } }, child: true },
      })
      if (!submission) throw new Error('Submission not found.')
      if (submission.child.familyId !== family.id) throw new Error('FORBIDDEN')
      if (submission.decision) throw new Error('This submission has already been reviewed.')

      // Create the review record
      await tx.taskReview.create({
        data: {
          submissionId,
          reviewerId: user.id,
          decision,
          note: reviewerNote,
          pointsAwarded: decision === 'APPROVED' ? submission.occurrence.task.pointsValue : 0,
        },
      })

      if (decision === 'APPROVED') {
        // Award points atomically
        await approveSubmissionInternal(
          tx,
          submissionId,
          family.id,
          submission.childId,
          submission.occurrence.task.pointsValue,
          submission.occurrence.task.title,
          'MANUAL',
          reviewerNote,
          user.id
        )
        await tx.taskOccurrence.update({
          where: { id: submission.occurrenceId },
          data: { status: 'APPROVED' },
        })
        // Notify child (stored against child, surfaced on child dashboard)
        await tx.notification.create({
          data: {
            familyId: family.id,
            childId: submission.childId,
            type: 'TASK_APPROVED',
            title: 'Task approved!',
            message: `"${submission.occurrence.task.title}" was approved. +${submission.occurrence.task.pointsValue} ${'stars'} earned!`,
          },
        })
      } else if (decision === 'NEEDS_REVISION') {
        await tx.taskSubmission.update({
          where: { id: submissionId },
          data: { reviewedAt: new Date(), reviewedById: user.id, decision, reviewerNote },
        })
        await tx.taskOccurrence.update({
          where: { id: submission.occurrenceId },
          data: { status: 'NEEDS_ATTENTION' },
        })
      } else {
        // REJECTED
        await tx.taskSubmission.update({
          where: { id: submissionId },
          data: { reviewedAt: new Date(), reviewedById: user.id, decision, reviewerNote },
        })
        await tx.taskOccurrence.update({
          where: { id: submission.occurrenceId },
          data: { status: 'ASSIGNED' }, // allow re-submission
        })
      }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not review submission.'
    return { ok: false, error: msg === 'FORBIDDEN' ? 'You do not have access to this submission.' : msg }
  }

  // Phase 5 (S5.2): Re-evaluate the monthly milestone for this child.
  // This is best-effort and non-blocking for the review itself — wrap in try/catch
  // so a milestone engine failure does not surface as a review failure.
  if (decision === 'APPROVED') {
    try {
      // The submission record was updated inside the transaction above. Fetch it
      // outside to get the childId, then evaluate the milestone.
      const submission = await db.taskSubmission.findUnique({
        where: { id: submissionId },
        select: { childId: true },
      })
      if (submission?.childId) {
        const { evaluateMonthlyMilestone } = await import('@/server/actions/milestone-actions')
        await evaluateMonthlyMilestone(submission.childId)
      }
    } catch {
      // Best-effort — do not fail the review
    }
  }

  revalidatePath('/review')
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Internal helper — awards points within a transaction.
 * Computes the new balance and creates a ledger entry. Idempotent because the
 * caller checks submission.decision === null before invoking.
 */
async function approveSubmissionInternal(
  tx: Prisma.TransactionClient,
  submissionId: string,
  familyId: string,
  childId: string,
  points: number,
  taskTitle: string,
  mode: 'AUTO' | 'MANUAL',
  reviewerNote: string | null,
  reviewerId: string
) {
  // Compute current balance
  const last = await tx.pointsTransaction.findFirst({
    where: { childId },
    orderBy: { createdAt: 'desc' },
    select: { balanceAfter: true },
  })
  const balanceAfter = (last?.balanceAfter ?? 0) + points

  const txn = await tx.pointsTransaction.create({
    data: {
      childId,
      familyId,
      amount: points,
      type: 'EARNED',
      reference: submissionId,
      description: `Earned ${points} ${'stars'} — ${taskTitle}`,
      balanceAfter,
    },
  })

  await tx.taskSubmission.update({
    where: { id: submissionId },
    data: {
      reviewedAt: new Date(),
      reviewedById: reviewerId,
      decision: 'APPROVED',
      reviewerNote,
      pointsAwarded: points,
      pointsTxnId: txn.id,
    },
  })
}
