import { redirect } from 'next/navigation'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReviewQueueClient, type ReviewQueueItem } from '@/components/deensteps/review-queue-client'
import { TASK_STATUS_META } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'

export default async function ReviewPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const childrenList = await db.childProfile.findMany({
    where: { familyId: family.id, status: 'ACTIVE' },
    select: { id: true, displayName: true, avatarColor: true },
    orderBy: { createdAt: 'asc' },
  })

  // Pending submissions
  const pending = await db.taskSubmission.findMany({
    where: {
      child: { familyId: family.id },
      decision: null,
    },
    orderBy: { submittedAt: 'asc' },
    include: {
      child: true,
      occurrence: { include: { task: true } },
    },
  })

  // Recently reviewed (last 20)
  const recent = await db.taskSubmission.findMany({
    where: {
      child: { familyId: family.id },
      decision: { not: null },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 20,
    include: {
      child: true,
      occurrence: { include: { task: true } },
    },
  })

  const pendingCount = pending.length

  // Phase C (C5): Map pending submissions to the client component's shape
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

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            রিভিউ সেন্টার
          </h1>
          <p className="text-sm text-muted-foreground">
            কাজের সাবমিশন রিভিউ করুন। অনুমোদন দিলে তারা যোগ হয়, সংশোধন চান, বা গঠনমূলক মন্তব্যসহ ফেরত পাঠান।
          </p>
        </div>

        {/* Phase C (C5): Review queue with filters + batch approve */}
        <ReviewQueueClient items={queueItems} />

        {/* Recently reviewed */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">সাম্প্রতিক রিভিউ</CardTitle>
            <CardDescription>সর্বশেষ ২০টি রিভিউ সিদ্ধান্ত।</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">এখনো কোনো রিভিউ নেই।</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-border">
                {recent.map((s) => {
                  const meta = TASK_STATUS_META[s.decision ?? '']
                  return (
                    <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <Avatar color={s.child.avatarColor} name={s.child.displayName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          <span className="font-medium">{s.child.displayName}</span> · {s.occurrence.task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.reviewedAt ? formatDistanceToNow(s.reviewedAt, { addSuffix: true }) : '—'}
                          {s.reviewerNote && ` · "${s.reviewerNote}"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={meta?.tone}>{meta?.label ?? s.decision}</Badge>
                        {s.pointsAwarded > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600">
                            +{s.pointsAwarded}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
