'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShieldCheck, Loader2, Filter, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { ReviewActions } from '@/components/deensteps/review-actions'
import { reviewSubmission } from '@/server/actions/review-actions'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// Phase C (C5): Review Queue with filters + batch approve
//
// Replaces the flat list on /review with:
//   - Per-child filter chips (সব সন্তান + one chip per child)
//   - Sort dropdown (নতুন প্রথমে / পুরোনো প্রথমে)
//   - "সব অনুমোদন করুন" batch-approve button
//
// The batch approve calls reviewSubmission in sequence for each visible item.
// This is intentional (not Promise.all) because each reviewSubmission runs
// a transaction that updates the child's balance, and parallel calls could
// cause balance race conditions. Sequential is safe and fast enough for
// typical family sizes (5-20 items).
// ────────────────────────────────────────────────────────────────────────────

export type ReviewQueueItem = {
  id: string
  submittedAt: string // ISO
  childId: string
  childName: string
  childAvatarColor: string
  taskTitle: string
  taskIconKey: string
  taskCategory: string
  pointsValue: number
  approvalPolicy: string
  note: string | null
}

export function ReviewQueueClient({ items }: { items: ReviewQueueItem[] }) {
  const router = useRouter()
  const [childFilter, setChildFilter] = React.useState<string>('ALL')
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest')
  const [batchPending, setBatchPending] = React.useState(false)

  // Build child filter options from the data
  const childOptions = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string; count: number }>()
    for (const item of items) {
      const existing = map.get(item.childId)
      if (existing) {
        existing.count++
      } else {
        map.set(item.childId, {
          id: item.childId,
          name: item.childName,
          color: item.childAvatarColor,
          count: 1,
        })
      }
    }
    return Array.from(map.values())
  }, [items])

  // Apply filter + sort
  const visibleItems = React.useMemo(() => {
    let result = items
    if (childFilter !== 'ALL') {
      result = result.filter((i) => i.childId === childFilter)
    }
    result = [...result].sort((a, b) => {
      const aTime = new Date(a.submittedAt).getTime()
      const bTime = new Date(b.submittedAt).getTime()
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
    })
    return result
  }, [items, childFilter, sortOrder])

  // Batch approve all visible items
  const handleBatchApprove = async () => {
    setBatchPending(true)
    let approved = 0
    let failed = 0
    for (const item of visibleItems) {
      const res = await reviewSubmission(item.id, 'APPROVED')
      if (res.ok) {
        approved++
      } else {
        failed++
      }
    }
    setBatchPending(false)
    if (approved > 0) {
      toast.success(`${approved} টি সাবমিশন অনুমোদিত!`)
    }
    if (failed > 0) {
      toast.error(`${failed} টি অনুমোদন করা যায়নি।`)
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              রিভিউ বাকি
            </CardTitle>
            <CardDescription>{visibleItems.length} টি সাবমিশন অপেক্ষমাণ।</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground"
            >
              <option value="newest">নতুন প্রথমে</option>
              <option value="oldest">পুরোনো প্রথমে</option>
            </select>

            {/* Batch approve */}
            {visibleItems.length > 1 && (
              <Button
                size="sm"
                onClick={handleBatchApprove}
                disabled={batchPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {batchPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                )}
                সব অনুমোদন ({visibleItems.length})
              </Button>
            )}
          </div>
        </div>

        {/* Per-child filter chips */}
        {childOptions.length > 1 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="h-3 w-3" /> ফিল্টার:
            </span>
            <button
              onClick={() => setChildFilter('ALL')}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                childFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
            >
              সব ({items.length})
            </button>
            {childOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => setChildFilter(c.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                  childFilter === c.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                )}
              >
                <Avatar color={c.color} name={c.name} size="sm" />
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {visibleItems.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-2 font-display text-base font-semibold text-foreground">সব শেষ!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {childFilter === 'ALL'
                ? 'এখন কোনো সাবমিশন রিভিউর জন্য বাকি নেই।'
                : 'এই সন্তানের কোনো অপেক্ষমাণ সাবমিশন নেই।'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleItems.map((s) => (
              <li key={s.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar color={s.childAvatarColor} name={s.childName} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{s.childName}</p>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(s.submittedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <DynamicIcon iconKey={s.taskIconKey} className="h-3.5 w-3.5" />
                        </span>
                        <p className="font-medium text-foreground">{s.taskTitle}</p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">{s.taskCategory}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          +{s.pointsValue} {s.approvalPolicy === 'AUTO' ? '(স্বয়ংক্রিয়)' : 'পয়েন্ট'}
                        </Badge>
                      </div>
                      {s.note && (
                        <div className="mt-2 rounded-lg bg-secondary/60 p-2.5 text-xs text-foreground">
                          <span className="font-medium">সন্তানের নোট: </span>{s.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0">
                    <ReviewActions
                      submissionId={s.id}
                      pointsValue={s.pointsValue}
                      taskTitle={s.taskTitle}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
