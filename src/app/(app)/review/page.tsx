import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, RotateCcw, Clock, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/deensteps/empty-state'
import { ReviewActions } from '@/components/deensteps/review-actions'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { TASK_STATUS_META } from '@/lib/constants'
import { format, formatDistanceToNow } from 'date-fns'

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

        {/* Pending */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  রিভিউ বাকি
                </CardTitle>
                <CardDescription>এখানে সব অপেক্ষমান সাবমিশন দেখা যাচ্ছে।</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">{pending.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="সব শেষ!"
                description="এখন কোনো সাবমিশন রিভিউর জন্য বাকি নেই। সন্তান কাজ জমা দিলে এখানে দেখা যাবে।"
              />
            ) : (
              <ul className="space-y-3">
                {pending.map((s) => (
                  <li key={s.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar color={s.child.avatarColor} name={s.child.displayName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{s.child.displayName}</p>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(s.submittedAt, { addSuffix: true })}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <DynamicIcon iconKey={s.occurrence.task.iconKey} className="h-3.5 w-3.5" />
                            </span>
                            <p className="font-medium text-foreground">{s.occurrence.task.title}</p>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="text-xs">{s.occurrence.task.category}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {format(s.occurrence.scheduledDate, 'MMM d')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {s.occurrence.task.pointsValue} {s.occurrence.task.approvalPolicy === 'AUTO' ? '(স্বয়ংক্রিয়)' : 'তারা'}
                            </Badge>
                          </div>
                          {s.note && (
                            <div className="mt-2 rounded-lg bg-secondary/60 p-2.5 text-xs text-foreground">
                              <span className="font-medium">সন্তানের নোট: </span>{s.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 gap-2">
                        <ReviewActions submissionId={s.id} pointsValue={s.occurrence.task.pointsValue} taskTitle={s.occurrence.task.title} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

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
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
