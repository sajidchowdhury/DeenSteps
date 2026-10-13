import { redirect } from 'next/navigation'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ClipboardCheck, AlertCircle, Heart, TrendingUp, Minus, CheckCircle2 } from 'lucide-react'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewQueueClient, type ReviewQueueItem } from '@/components/deensteps/review-queue-client'
import { PointDeductionButton } from '@/components/deensteps/point-deduction-dialog'
import { InvestmentReviewSection } from '@/components/deensteps/investment-review-section'
import { getActiveInvestments } from '@/server/actions/investment-actions'
import { getRecentDeductions } from '@/server/actions/point-deduction-actions'

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

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
      take: 20,
      include: { child: true, occurrence: { include: { task: true } } },
    }),
    db.incident.findMany({
      where: { familyId: family.id, status: 'RESOLVED' },
      orderBy: { resolvedAt: 'desc' },
      take: 10,
      include: {
        reports: { include: { child: { select: { displayName: true, avatarColor: true } } } },
        resolution: true,
      },
    }),
    db.sadaqahDonation.findMany({
      where: { familyId: family.id, status: { in: ['CONFIRMED', 'CANCELLED'] } },
      orderBy: { parentConfirmedAt: 'desc' },
      take: 10,
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

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
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

        {/* Tabs */}
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="review" className="gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5" />
              রিভিউ
              {pendingCount > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              ইনসিডেন্ট
              {resolvedIncidents.length > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground">({resolvedIncidents.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sadaqah" className="gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              সাদাকাহ
              {sadaqahHistory.length > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground">({sadaqahHistory.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="investment" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              বিনিয়োগ
              {activeInvestments.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">
                  {activeInvestments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="deductions" className="gap-1.5">
              <Minus className="h-3.5 w-3.5" />
              কর্তন
              {recentDeductions.length > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground">({recentDeductions.length})</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── Review tab ─── */}
          <TabsContent value="review" className="mt-4 space-y-4">
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
                  <div className="max-h-64 overflow-y-auto">
                    <ul className="divide-y divide-border">
                      {recent.map((s) => {
                        const statusMeta: Record<string, { label: string; tone: string }> = {
                          APPROVED: { label: 'অনুমোদিত', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
                          NEEDS_REVISION: { label: 'সংশোধন', tone: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
                          REJECTED: { label: 'প্রত্যাখ্যাত', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
                        }
                        const meta = statusMeta[s.decision ?? '']
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
                            <Badge variant="outline" className={meta?.tone}>{meta?.label ?? s.decision}</Badge>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Incidents tab ─── */}
          <TabsContent value="incidents" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  সমাধান হওয়া সমস্যা
                </CardTitle>
                <CardDescription>সম্প্রতি মীমাংসিত ইনসিডেন্টগুলি।</CardDescription>
              </CardHeader>
              <CardContent>
                {resolvedIncidents.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো সমাধান হওয়া সমস্যা নেই।</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="space-y-3">
                      {resolvedIncidents.map((inc) => (
                        <li key={inc.id} className="rounded-xl border border-border bg-card p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {inc.reports[0] && (
                                <Avatar color={inc.reports[0].child.avatarColor} name={inc.reports[0].child.displayName} size="sm" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {inc.reports.map((r) => r.child.displayName).join(', ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {inc.resolvedAt ? formatDistanceToNow(inc.resolvedAt, { addSuffix: true }) : '—'}
                                </p>
                              </div>
                            </div>
                            {inc.resolution && (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 text-[10px]">
                                সমাধান হয়েছে
                              </Badge>
                            )}
                          </div>
                          {inc.resolution?.description && (
                            <p className="mt-2 rounded-lg bg-secondary/40 p-2 text-xs text-foreground">
                              {inc.resolution.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Sadaqah tab ─── */}
          <TabsContent value="sadaqah" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-emerald-500" />
                  সাদাকাহ ইতিহাস
                </CardTitle>
                <CardDescription>নিশ্চিত ও বাতিল সাদাকাহ দান।</CardDescription>
              </CardHeader>
              <CardContent>
                {sadaqahHistory.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো সাদাকাহ ইতিহাস নেই।</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="space-y-2">
                      {sadaqahHistory.map((d) => (
                        <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                          <Avatar color={d.child.avatarColor} name={d.child.displayName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {d.child.displayName} — {d.cause?.title ?? 'অজানা কারণ'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {d.parentConfirmedAt ? formatDistanceToNow(d.parentConfirmedAt, { addSuffix: true }) : '—'}
                              {d.realAmount && ` · ৳${d.realAmount}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {d.starsDedicated} পয়েন্ট
                            </Badge>
                            <Badge className={
                              d.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 text-[10px]'
                                : 'bg-muted text-muted-foreground text-[10px]'
                            }>
                              {d.status === 'CONFIRMED' ? 'নিশ্চিত' : 'বাতিল'}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Investment tab ─── */}
          <TabsContent value="investment" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-sky-500" />
                  বিনিয়োগ — মুনাফা ফেরত দিন
                </CardTitle>
                <CardDescription>সন্তানের সক্রিয় বিনিয়োগ। মুনাফা ফেরত দিন।</CardDescription>
              </CardHeader>
              <CardContent>
                {activeInvestments.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">কোনো সক্রিয় বিনিয়োগ নেই।</p>
                ) : (
                  <InvestmentReviewSection investments={activeInvestments as any} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Deductions tab ─── */}
          <TabsContent value="deductions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Minus className="h-5 w-5 text-rose-500" />
                  সাম্প্রতিক পয়েন্ট কর্তন
                </CardTitle>
                <CardDescription>আচরণের জন্য কর্তন করা পয়েন্ট।</CardDescription>
              </CardHeader>
              <CardContent>
                {recentDeductions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো পয়েন্ট কর্তন হয়নি।</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="space-y-2">
                      {recentDeductions.map((d) => (
                        <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                          <Avatar color={d.childAvatarColor} name={d.childName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{d.childName}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.reason} · {formatDistanceToNow(parseISO(d.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <span className="font-bold text-rose-600">{d.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
