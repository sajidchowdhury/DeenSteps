'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, Loader2, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { REWARD_LIBRARY, REWARD_CATEGORIES } from '@/lib/constants'
import { importLibraryReward } from '@/server/actions/reward-actions'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  EXPERIENCE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  LEARNING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  PRIVILEGE: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  FOOD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
}

export function RewardQuickAdd() {
  const [open, setOpen] = useState(false)
  const [pendingIndex, startTransition] = useTransition()
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set())
  const [addingIndex, setAddingIndex] = useState<number | null>(null)
  const router = useRouter()

  const handleAdd = (index: number) => {
    setAddingIndex(index)
    startTransition(async () => {
      const res = await importLibraryReward(index)
      if (res.ok) {
        setAddedIndices((prev) => new Set(prev).add(index))
        toast.success(`"${REWARD_LIBRARY[index].title}" যোগ হয়েছে!`)
        router.refresh()
      } else {
        toast.error(res.error ?? 'যোগ করা যায়নি।')
      }
      setAddingIndex(null)
    })
  }

  // Group rewards by category
  const grouped = REWARD_CATEGORIES.map((cat) => ({
    cat,
    items: REWARD_LIBRARY.map((r, i) => ({ r, i })).filter(({ r }) => r.category === cat.key),
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-1.5 h-4 w-4" /> সাজেশন থেকে বাছাই
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>পুরস্কার সাজেশন</DialogTitle>
          <DialogDescription>
            অভিজ্ঞতা, শেখা, বিশেষ সুবিধা ও খাবার — ক্যাটাগরি অনুযায়ী। যেটি পছন্দ করুন, এক ক্লিকে যোগ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto scroll-area-custom pr-1">
          <div className="space-y-4">
            {grouped.map(({ cat, items }) => (
              <div key={cat.key}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px] font-semibold', CATEGORY_COLORS[cat.key])}>
                    {cat.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{cat.description}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map(({ r, i }) => {
                    const isAdded = addedIndices.has(i)
                    const isAdding = addingIndex === i
                    return (
                      <button
                        key={r.title}
                        onClick={() => !isAdded && handleAdd(i)}
                        disabled={isAdded || isAdding}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          isAdded
                            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                            : 'border-border bg-card hover:border-primary/40 hover:shadow-soft',
                          !isAdded && !isAdding && 'cursor-pointer'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{r.title}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground">{r.requiredPoints} তারা</p>
                            {r.maxPerWeek && (
                              <span className="text-[10px] text-muted-foreground">· সপ্তাহে {r.maxPerWeek}×</span>
                            )}
                            {r.maxPerMonth && (
                              <span className="text-[10px] text-muted-foreground">· মাসে {r.maxPerMonth}×</span>
                            )}
                          </div>
                        </div>
                        {isAdded ? (
                          <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                        ) : isAdding ? (
                          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-primary" />
                        ) : (
                          <Plus className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
