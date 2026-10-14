import { redirect } from 'next/navigation'
import { getPinAndFirstChild } from "@/server/actions/pin-actions"
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ClipboardCheck, AlertCircle, Heart, TrendingUp, Minus, CheckCircle2 } from 'lucide-react'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReviewQueueClient, type ReviewQueueItem } from '@/components/deensteps/review-queue-client'
import { PointDeductionButton } from '@/components/deensteps/point-deduction-dialog'
import { InvestmentReviewSection } from '@/components/deensteps/investment-review-section'
import { LoadMore } from '@/components/deensteps/load-more'
import { ActivityCenterClient } from '@/components/deensteps/activity-center-client'
import { getActiveInvestments } from '@/server/actions/investment-actions'
import { getRecentDeductions } from '@/server/actions/point-deduction-actions'

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')
  const { pinSettings, firstChildId } = await getPinAndFirstChild()

  const [childrenList, pending, recent, resolvedIncidents, sadaqahHistory, activeInvestments, recentDeductions] = await Promise.all([
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
      orderBy: { createdAt: 'asc' },
    }),
    db.taskSubmission.findMany({
      where: { child: { familyId: family.id }, decision: null },
      orderBy: { submittedAt: 'asc' },
      include: { child: true, occurrence: { include: { task: true } } },
    }),
    db.taskSubmission.findMany({
      where: { child: { familyId: family.id }, decision: { not: null } },
      orderBy: { reviewedAt: 'desc' },
      take: 50,
      include: { child: true, occurrence: { include: { task: true } } },
    }),
    db.incident.findMany({
      where: { familyId: family.id, status: 'RESOLVED' },
      orderBy: { resolvedAt: 'desc' },
      take: 50,
      include: {
        reports: { include: { child: { select: { displayName: true, avatarColor: true } } } },
        resolution: true,
      },
    }),
    db.sadaqahDonation.findMany({
      where: { familyId: family.id, status: { in: ['CONFIRMED', 'CANCELLED'] } },
      orderBy: { parentConfirmedAt: 'desc' },
      take: 50,
      include: {
        child: { select: { displayName: true, avatarColor: true } },
        cause: { select: { title: true, iconKey: true } },
      },
    }),
    getActiveInvestments(),
    getRecentDeductions(),
  ])

  const queueItems: ReviewQueueItem[] = pending.map((s) => ({
    id: s.id,
    submittedAt: s.submittedAt.toISOString(),
    childId: s.childId,
    childName: s.child.displayName,
    childAvatarColor: s.child.avatarColor,
    taskTitle: s.occurrence.task.title,
    taskIconKey: s.occurrence.task.iconKey,
    taskCategory: s.occurrence.task.category,
    pointsValue: s.occurrence.task.pointsValue,
    approvalPolicy: s.occurrence.task.approvalPolicy,
    note: s.note,
  }))

  const pendingCount = pending.length

  // Serialize recent reviews for client
  const recentSerialized = recent.map((s) => {
    const statusMeta: Record<string, { label: string; tone: string }> = {
      APPROVED: { label: 'অনুমোদিত', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
      NEEDS_REVISION: { label: 'সংশোধন', tone: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
      REJECTED: { label: 'প্রত্যাখ্যাত', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
    }
    const meta = statusMeta[s.decision ?? '']
    return {
      id: s.id,
      childName: s.child.displayName,
      childAvatarColor: s.child.avatarColor,
      taskTitle: s.occurrence.task.title,
      reviewedAt: s.reviewedAt?.toISOString() ?? null,
      reviewerNote: s.reviewerNote,
      decisionLabel: meta?.label ?? s.decision,
      decisionTone: meta?.tone ?? '',
      pointsAwarded: s.pointsAwarded,
    }
  })

  // Serialize resolved incidents for client
  const incidentsSerialized = resolvedIncidents.map((inc) => ({
    id: inc.id,
    childNames: inc.reports.map((r) => r.child.displayName),
    childAvatarColor: inc.reports[0]?.child.avatarColor ?? 'emerald',
    resolvedAt: inc.resolvedAt?.toISOString() ?? null,
    resolutionDescription: inc.resolution?.description ?? null,
  }))

  // Serialize sadaqah history for client
  const sadaqahSerialized = sadaqahHistory.map((d) => ({
    id: d.id,
    childName: d.child.displayName,
    childAvatarColor: d.child.avatarColor,
    causeTitle: d.cause?.title ?? 'অজানা কারণ',
    starsDedicated: d.starsDedicated,
    status: d.status,
    realAmount: d.realAmount,
    confirmedAt: d.parentConfirmedAt?.toISOString() ?? null,
  }))

  // Serialize deductions for client
  const deductionsSerialized = recentDeductions.map((d) => ({
    id: d.id,
    childName: d.childName,
    childAvatarColor: d.childAvatarColor,
    amount: d.amount,
    reason: d.reason,
    createdAt: d.createdAt,
  }))

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList} hasPin={!!pinSettings?.parentPin} firstChildId={firstChildId}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              কার্যকলাপ কেন্দ্র
            </h1>
            <p className="text-sm text-muted-foreground">
              সব কাজ এক জায়গায় — রিভিউ, ইনসিডেন্ট, সাদাকাহ, বিনিয়োগ, পয়েন্ট কর্তন।
            </p>
          </div>
          <PointDeductionButton childrenList={childrenList} />
        </div>

        {/* Activity center client — handles tabs + load more */}
        <ActivityCenterClient
          queueItems={queueItems}
          recentReviews={recentSerialized}
          resolvedIncidents={incidentsSerialized}
          sadaqahHistory={sadaqahSerialized}
          activeInvestments={activeInvestments as any}
          recentDeductions={deductionsSerialized}
          badges={{
            review: pendingCount,
            investment: activeInvestments.length,
          }}
        />
      </div>
    </AppShell>
  )
}
