'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, TrendingUp, TrendingDown, RotateCcw, Plus, Minus, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { LedgerData } from '@/server/actions/ledger-actions'

const FILTER_TABS = [
  { value: 'today', label: 'আজ' },
  { value: 'week', label: 'এই সপ্তাহ' },
  { value: 'month', label: 'এই মাস' },
  { value: 'all', label: 'সব' },
] as const

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  EARNED: { label: 'অর্জিত', icon: Plus, color: 'text-emerald-600' },
  REDEMPTION: { label: 'খরচ', icon: Minus, color: 'text-rose-600' },
  ADJUSTMENT: { label: 'সমন্বয়', icon: TrendingDown, color: 'text-amber-600' },
  REFUND: { label: 'ফেরত', icon: RotateCcw, color: 'text-sky-600' },
}

export function LedgerClient({ data }: { data: LedgerData }) {
  const [filter, setFilter] = React.useState<string>('all')

  // Filter entries by date range
  const filteredEntries = React.useMemo(() => {
    if (filter === 'all') return data.entries

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return data.entries.filter((e) => {
      const d = new Date(e.date)
      if (filter === 'today') return d >= todayStart
      if (filter === 'week') return d >= weekStart
      if (filter === 'month') return d >= monthStart
      return true
    })
  }, [data.entries, filter])

  // Calculate summary stats for the filtered range
  const earned = filteredEntries.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0)
  const spent = filteredEntries.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0)

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/child/${data.childId}`}>
              <ArrowLeft className="mr-1 h-4 w-4" /> ফিরে যান
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">আমার তারার হিসাব</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Balance summary */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">বর্তমান ব্যালেন্স</p>
                <p className="mt-1 inline-flex items-center gap-1.5 font-display text-4xl font-extrabold text-foreground">
                  <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
                  {data.currentBalance}
                </p>
              </div>
              <div className="text-right">
                <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                  <p className="text-xs text-muted-foreground">অর্জিত (এই পর্যায়ে)</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-lg font-bold text-emerald-600">
                    <Plus className="h-3.5 w-3.5" />
                    {earned}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-1.5">
          {FILTER_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                filter === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent/40',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Ledger table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">লেনদেনের তালিকা</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">এই সময়ে কোনো লেনদেন নেই।</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Desktop table header */}
                <div className="hidden grid-cols-12 gap-2 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                  <div className="col-span-3">তারিখ</div>
                  <div className="col-span-5">বিবরণ</div>
                  <div className="col-span-2 text-right">পরিবর্তন</div>
                  <div className="col-span-2 text-right">ব্যালেন্স</div>
                </div>

                {/* Entries */}
                {filteredEntries.map((entry) => {
                  const meta = TYPE_META[entry.type] || TYPE_META.EARNED
                  const Icon = meta.icon
                  return (
                    <div
                      key={entry.id}
                      className="grid grid-cols-1 gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/20 sm:grid-cols-12 sm:items-center sm:gap-2"
                    >
                      {/* Date */}
                      <div className="col-span-3 text-xs text-muted-foreground">
                        {format(new Date(entry.date), 'd MMM, h:mm a')}
                      </div>

                      {/* Description */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-md bg-secondary', meta.color)}>
                            <Icon className="h-3 w-3" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{entry.description}</p>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[9px]">{meta.label}</Badge>
                              {entry.reason && (
                                <span className="truncate text-[10px] text-muted-foreground">কারণ: {entry.reason}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Change */}
                      <div className="col-span-2 text-right">
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 font-display text-sm font-bold',
                            entry.amount >= 0 ? 'text-emerald-600' : 'text-rose-600',
                          )}
                        >
                          {entry.amount >= 0 ? '+' : ''}
                          {entry.amount}
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </span>
                      </div>

                      {/* Balance */}
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-semibold text-foreground">{entry.balanceAfter}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info note */}
        <div className="mt-4 rounded-lg border border-dashed border-border bg-card/30 p-3 text-center text-xs text-muted-foreground">
          প্রতিটি তারা একটি অডিটযোগ্য লেজারে ট্র্যাক করা হয়। কখনোই মুছে ফেলা হয় না।
          <br />
          দৈনিক কাজ রিসেট হয়, অর্জিত তারা হয় না।
        </div>
      </main>
    </div>
  )
}
