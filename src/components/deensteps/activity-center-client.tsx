'use client'

import * as React from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { AlertCircle, Heart, TrendingUp, Minus, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/deensteps/app-shell'
import { ReviewQueueClient, type ReviewQueueItem } from '@/components/deensteps/review-queue-client'
import { InvestmentReviewSection } from '@/components/deensteps/investment-review-section'
import { LoadMore } from '@/components/deensteps/load-more'
import { GameTabs, useTabFromUrl, type TabKey } from '@/components/deensteps/game-tabs'

// ────────────────────────────────────────────────────────────────────────────
// Activity Center — client component with game-like tabs + load-more
// ────────────────────────────────────────────────────────────────────────────

type RecentReview = {
  id: string
  childName: string
  childAvatarColor: string
  taskTitle: string
  reviewedAt: string | null
  reviewerNote: string | null
  decisionLabel: string
  decisionTone: string
  pointsAwarded: number
}

type ResolvedIncident = {
  id: string
  childNames: string[]
  childAvatarColor: string
  resolvedAt: string | null
  resolutionDescription: string | null
}

type SadaqahRecord = {
  id: string
  childName: string
  childAvatarColor: string
  causeTitle: string
  starsDedicated: number
  status: string
  realAmount: number | null
  confirmedAt: string | null
}

type DeductionRecord = {
  id: string
  childName: string
  childAvatarColor: string
  amount: number
  reason: string
  createdAt: string
}

export function ActivityCenterClient({
  queueItems,
  recentReviews,
  resolvedIncidents,
  sadaqahHistory,
  activeInvestments,
  recentDeductions,
  badges,
}: {
  queueItems: ReviewQueueItem[]
  recentReviews: RecentReview[]
  resolvedIncidents: ResolvedIncident[]
  sadaqahHistory: SadaqahRecord[]
  activeInvestments: any[]
  recentDeductions: DeductionRecord[]
  badges: Partial<Record<TabKey, number>>
}) {
  const [activeTab, setActiveTab] = useTabFromUrl()

  return (
    <div className="space-y-4">
      {/* Game-like tabs */}
      <GameTabs activeTab={activeTab} onTabChange={setActiveTab} badges={badges} />

      {/* Tab content */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <ReviewQueueClient items={queueItems} />

          {/* Recent reviews with load-more */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">সাম্প্রতিক রিভিউ</CardTitle>
              <CardDescription>সর্বশেষ রিভিউ সিদ্ধান্ত।</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো রিভিউ নেই।</p>
              ) : (
                <LoadMore
                  items={recentReviews}
                  renderItem={(s) => (
                    <div key={s.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                      <Avatar color={s.childAvatarColor} name={s.childName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          <span className="font-medium">{s.childName}</span> · {s.taskTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.reviewedAt ? formatDistanceToNow(new Date(s.reviewedAt), { addSuffix: true }) : '—'}
                          {s.reviewerNote && ` · "${s.reviewerNote}"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={s.decisionTone}>{s.decisionLabel}</Badge>
                        {s.pointsAwarded > 0 && (
                          <span className="text-xs font-medium text-amber-600">+{s.pointsAwarded}</span>
                        )}
                      </div>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'incidents' && (
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
              <LoadMore
                items={resolvedIncidents}
                renderItem={(inc) => (
                  <div key={inc.id} className="rounded-xl border border-border bg-card p-3 mb-3 last:mb-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar color={inc.childAvatarColor} name={inc.childNames[0] ?? ''} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{inc.childNames.join(', ')}</p>
                          <p className="text-xs text-muted-foreground">
                            {inc.resolvedAt ? formatDistanceToNow(new Date(inc.resolvedAt), { addSuffix: true }) : '—'}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 text-[10px]">
                        সমাধান হয়েছে
                      </Badge>
                    </div>
                    {inc.resolutionDescription && (
                      <p className="mt-2 rounded-lg bg-secondary/40 p-2 text-xs text-foreground">
                        {inc.resolutionDescription}
                      </p>
                    )}
                  </div>
                )}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'sadaqah' && (
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
              <LoadMore
                items={sadaqahHistory}
                renderItem={(d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 mb-2 last:mb-0">
                    <Avatar color={d.childAvatarColor} name={d.childName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {d.childName} — {d.causeTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.confirmedAt ? formatDistanceToNow(new Date(d.confirmedAt), { addSuffix: true }) : '—'}
                        {d.realAmount && ` · ৳${d.realAmount}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{d.starsDedicated} পয়েন্ট</Badge>
                      <Badge className={
                        d.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 text-[10px]'
                          : 'bg-muted text-muted-foreground text-[10px]'
                      }>
                        {d.status === 'CONFIRMED' ? 'নিশ্চিত' : 'বাতিল'}
                      </Badge>
                    </div>
                  </div>
                )}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'investment' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-500" />
              বিনিয়োগ
            </CardTitle>
            <CardDescription>সন্তানের সক্রিয় বিনিয়োগ। মুনাফা ফেরত দিন।</CardDescription>
          </CardHeader>
          <CardContent>
            {activeInvestments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">কোনো সক্রিয় বিনিয়োগ নেই।</p>
            ) : (
              <InvestmentReviewSection investments={activeInvestments} />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'deductions' && (
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
              <LoadMore
                items={recentDeductions}
                renderItem={(d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 mb-2 last:mb-0">
                    <Avatar color={d.childAvatarColor} name={d.childName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{d.childName}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.reason} · {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span className="font-bold text-rose-600">{d.amount}</span>
                  </div>
                )}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
