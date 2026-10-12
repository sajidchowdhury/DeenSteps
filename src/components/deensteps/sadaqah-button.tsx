'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Heart, Star, Check, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { Nur } from '@/components/deensteps/mascot'
import { requestSadaqah } from '@/server/actions/sadaqah-actions'
import { playSound } from '@/lib/sounds'
import { cn } from '@/lib/utils'

type SadaqahCause = {
  id: string
  title: string
  description: string | null
  iconKey: string
}

export function SadaqahButton({
  childId,
  causes,
  currentBalance,
}: {
  childId: string
  causes: SadaqahCause[]
  currentBalance: number
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedCause, setSelectedCause] = React.useState<string>('')
  const [stars, setStars] = React.useState(10)
  const [pending, setPending] = React.useState(false)
  const [celebrationOpen, setCelebrationOpen] = React.useState(false)
  const router = useRouter()

  // Phase A (UI audit): previously this component returned `null` when no
  // causes were configured, silently hiding the sadaqah feature entirely.
  // Now we show an empty-state pill that informs the child the feature
  // exists but needs parent setup. See UI_UX_IMPROVEMENT_PLAN.md §4 Phase A A9.
  if (causes.length === 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-emerald-300 bg-emerald-50/40 px-3 py-1.5 text-xs text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
        title="বাবা-মা এখনো কোনো সাদাকাহ কারণ যোগ করেননি।"
      >
        <Heart className="h-3.5 w-3.5" />
        সাদাকাহ (শীঘ্রই আসছে)
      </span>
    )
  }

  const handleSubmit = async () => {
    if (!selectedCause) {
      toast.error('একটি কারণ নির্বাচন করো।')
      return
    }
    if (!stars || stars <= 0) {
      toast.error('কত তারা দিতে চাও তা লিখো।')
      return
    }
    if (stars > currentBalance) {
      toast.error(`তোমার কাছে মাত্র ${currentBalance} তারা আছে।`)
      return
    }

    setPending(true)
    try {
      const res = await requestSadaqah(childId, selectedCause, stars)
      if (res.ok) {
        setOpen(false)
        setCelebrationOpen(true)
        // Phase E (E3): Play sadaqah celebration sound.
        playSound('sadaqah-confirmed')
        setSelectedCause('')
        setStars(10)
        router.refresh()
      } else {
        toast.error(res.error ?? 'অনুরোধ করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  const quickAmounts = [10, 25, 50]

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            <Heart className="h-3.5 w-3.5" />
            সাদাকাহ দিন
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600" />
              সাদাকাহ দিন
            </DialogTitle>
            <DialogDescription>
              তোমার তারা দিয়ে একটি ভালো কাজে সাহায্য করো। বাবা-মা নিশ্চিত করবেন।
            </DialogDescription>
          </DialogHeader>

          {/* Balance display */}
          <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
            <p className="text-xs text-muted-foreground">তোমার বর্তমান তারা</p>
            <p className="mt-0.5 inline-flex items-center gap-1 font-display text-2xl font-extrabold text-foreground">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              {currentBalance}
            </p>
          </div>

          {/* Cause cards — replaces the dropdown */}
          <div className="space-y-1.5">
            <Label>একটি কারণ বেছে নাও</Label>
            <div className="grid grid-cols-2 gap-2">
              {causes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCause(c.id)}
                  className={cn(
                    'flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all',
                    selectedCause === c.id
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30'
                      : 'border-border bg-card hover:border-emerald-300 hover:bg-emerald-50/30'
                  )}
                >
                  <span className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                    selectedCause === c.id
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-primary/10 text-primary'
                  )}>
                    <DynamicIcon iconKey={c.iconKey} className="h-5 w-5" />
                  </span>
                  <p className="mt-1.5 text-xs font-medium text-foreground">{c.title}</p>
                  {selectedCause === c.id && (
                    <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                      <Check className="h-3 w-3" /> নির্বাচিত
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper — replaces the number input */}
          <div className="space-y-1.5">
            <Label>কত তারা নিবেদন করবে?</Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStars(Math.max(1, stars - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent/40"
                disabled={stars <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-card">
                <Star className="mr-1.5 h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-display text-lg font-bold text-foreground">{stars}</span>
              </div>
              <button
                onClick={() => setStars(Math.min(currentBalance, stars + 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent/40"
                disabled={stars >= currentBalance}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Quick-select chips */}
            <div className="flex gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStars(Math.min(currentBalance, amt))}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                    stars === amt
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent/40'
                  )}
                >
                  {amt}
                </button>
              ))}
              <button
                onClick={() => setStars(currentBalance)}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                  stars === currentBalance
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent/40'
                )}
              >
                সব দাও
              </button>
            </div>
          </div>

          {/* Balance preview */}
          <p className="text-xs text-muted-foreground">
            নিবেদনের পর ব্যালেন্স থাকবে: <span className="font-bold text-foreground">{currentBalance - stars} তারা</span>
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              বাতিল
            </Button>
            <Button onClick={handleSubmit} disabled={pending || !selectedCause} className="bg-emerald-600 hover:bg-emerald-700">
              {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Heart className="mr-1.5 h-3.5 w-3.5" />}
              নিবেদন করো
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase D (D6): Celebration overlay after donation */}
      <Dialog open={celebrationOpen} onOpenChange={setCelebrationOpen}>
        <DialogContent className="max-w-sm border-amber-200 bg-gradient-to-br from-amber-50 via-cream to-emerald-50/50 dark:border-amber-900/40 dark:from-amber-950/30 dark:via-secondary dark:to-emerald-950/20">
          <div className="flex flex-col items-center py-4 text-center">
            <Nur state="proud" size="xl" />
            <p className="mt-3 font-display text-xl font-extrabold text-foreground">
              জাযাকাল্লাহু খাইরান 🤲
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              তুমি তোমার তারা সাদাকাহর জন্য নিবেদন করেছ। আল্লাহ তোমার নিয়ামত বাড়িয়ে দিন।
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              বাবা-মা শীঘ্রই প্রকৃত দান নিশ্চিত করবেন।
            </p>
            <Button
              onClick={() => setCelebrationOpen(false)}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-600"
            >
              চমৎকার ✨
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
