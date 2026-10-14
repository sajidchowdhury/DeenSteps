'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, TrendingUp, Minus, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Nur } from '@/components/deensteps/mascot'
import { createInvestment } from '@/server/actions/investment-actions'
import { cn } from '@/lib/utils'

export function InvestmentButton({
  childId,
  currentBalance,
}: {
  childId: string
  currentBalance: number
}) {
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState(10)
  const [promise, setPromise] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [celebrationOpen, setCelebrationOpen] = React.useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (amount <= 0) {
      toast.error('০ এর বেশি পয়েন্ট লিখুন।')
      return
    }
    if (amount > currentBalance) {
      toast.error(`তোমার কাছে মাত্র ${currentBalance} পয়েন্ট আছে।`)
      return
    }
    if (!promise.trim()) {
      toast.error('বাবা-মা কী প্রতিশ্রুতি দিয়েছেন লিখুন।')
      return
    }

    setPending(true)
    try {
      const res = await createInvestment(childId, amount, promise)
      if (res.ok) {
        setOpen(false)
        setCelebrationOpen(true)
        setAmount(10)
        setPromise('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'বিনিয়োগ করা যায়নি।')
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
          <button className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
            <TrendingUp className="h-3.5 w-3.5" />
            বিনিয়োগ করো
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              পয়েন্ট বিনিয়োগ করো
            </DialogTitle>
            <DialogDescription>
              তোমার পয়েন্ট বাবা-মার কাছে বিনিয়োগ করো। পয়েন্ট যখন মুনাফা ফেরত দেবেন, তোমার পয়েন্ট বাড়বে!
            </DialogDescription>
          </DialogHeader>

          {/* Balance display */}
          <div className="rounded-lg bg-sky-50 p-3 text-center dark:bg-sky-950/30">
            <p className="text-xs text-muted-foreground">তোমার বর্তমান পয়েন্ট</p>
            <p className="mt-0.5 font-display text-2xl font-extrabold text-foreground">
              {currentBalance}
            </p>
          </div>

          {/* Amount stepper */}
          <div className="space-y-1.5">
            <Label>কত পয়েন্ট বিনিয়োগ করবে?</Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent/40"
                disabled={amount <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-card">
                <span className="font-display text-lg font-bold text-foreground">{amount}</span>
              </div>
              <button
                onClick={() => setAmount(Math.min(currentBalance, amount + 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent/40"
                disabled={amount >= currentBalance}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(Math.min(currentBalance, amt))}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                    amount === amt
                      ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/30 dark:text-sky-300'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent/40'
                  )}
                >
                  {amt}
                </button>
              ))}
              <button
                onClick={() => setAmount(currentBalance)}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                  amount === currentBalance
                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/30 dark:text-sky-300'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent/40'
                )}
              >
                সব দাও
              </button>
            </div>
          </div>

          {/* Parent promise */}
          <div className="space-y-1.5">
            <Label htmlFor="promise">বাবা-মা কী প্রতিশ্রুতি দিয়েছেন?</Label>
            <Textarea
              id="promise"
              placeholder="যেমন: বাবা বলেছেন ১ মাসে আনুমানিক ৫ পয়েন্ট মুনাফা দেবেন"
              value={promise}
              onChange={(e) => setPromise(e.target.value)}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ এটি নিশ্চিত নয় — বাবা-মা যা মুনাফা দিতে পারেন তাই দেবেন।
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            বিনিয়োগের পর ব্যালেন্স থাকবে: <span className="font-bold text-foreground">{currentBalance - amount} পয়েন্ট</span>
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              বাতিল
            </Button>
            <Button onClick={handleSubmit} disabled={pending || !promise.trim()} className="bg-sky-600 hover:bg-sky-700">
              {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="mr-1.5 h-3.5 w-3.5" />}
              বিনিয়োগ করো
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration after investment */}
      <Dialog open={celebrationOpen} onOpenChange={setCelebrationOpen}>
        <DialogContent className="max-w-sm border-sky-200 bg-gradient-to-br from-sky-50 via-cream to-emerald-50/50 dark:border-sky-900/40 dark:from-sky-950/30 dark:via-secondary dark:to-emerald-950/20">
          <div className="flex flex-col items-center py-4 text-center">
            <Nur state="encouraging" size="xl" />
            <p className="mt-3 font-display text-xl font-extrabold text-foreground">
              বিনিয়োগ সফল! 📈
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              তুমি তোমার পয়েন্ট বিনিয়োগ করেছ। বাবা-মা যখন মুনাফা ফেরত দেবেন, তোমার পয়েন্ট বাড়বে।
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ধৈর্য ধরো — মুনাফা আসতে সময় লাগে।
            </p>
            <Button
              onClick={() => setCelebrationOpen(false)}
              className="mt-4 w-full bg-sky-500 hover:bg-sky-600"
            >
              চমৎকার ✨
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
