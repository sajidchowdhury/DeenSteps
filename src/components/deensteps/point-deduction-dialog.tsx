'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Minus, AlertTriangle } from 'lucide-react'
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
import { Avatar } from '@/components/deensteps/app-shell'
import { deductPoints } from '@/server/actions/point-deduction-actions'
import { cn } from '@/lib/utils'

// Common deduction reasons — defined here because "use server" files
// can only export async functions.
const COMMON_REASONS = [
  'অশালীন আচরণ',
  'মিথ্যা বলা',
  'বাবা-মা/বয়োজ্যেষ্ঠদের অবাধ্যতা',
  'ভাই-বোনের সাথে খারাপ ব্যবহার',
  'প্রতিশ্রুতি ভঙ্গ',
  'অন্যান্য',
] as const

type ChildOption = { id: string; displayName: string; avatarColor: string }

export function PointDeductionButton({
  children,
  childrenList,
}: {
  children?: React.ReactNode
  childrenList: ChildOption[]
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedChild, setSelectedChild] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [reason, setReason] = React.useState('')
  const [customReason, setCustomReason] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const handleDeduct = async () => {
    const amountNum = parseInt(amount, 10)
    if (!selectedChild) {
      toast.error('একজন সন্তান নির্বাচন করুন।')
      return
    }
    if (!amountNum || amountNum <= 0) {
      toast.error('সঠিক পয়েন্ট লিখুন।')
      return
    }
    const finalReason = reason === 'অন্যান্য' ? customReason.trim() : reason
    if (!finalReason) {
      toast.error('কারণ নির্বাচন করুন বা লিখুন।')
      return
    }

    setPending(true)
    try {
      const res = await deductPoints(selectedChild, amountNum, finalReason)
      if (res.ok) {
        toast.success(`${amountNum} পয়েন্ট কর্তন করা হয়েছে।`)
        setOpen(false)
        setAmount('')
        setReason('')
        setCustomReason('')
        setSelectedChild('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'পয়েন্ট কর্তন করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="destructive" size="sm">
            <Minus className="mr-1.5 h-3.5 w-3.5" />
            পয়েন্ট কর্তন
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            পয়েন্ট কর্তন
          </DialogTitle>
          <DialogDescription>
            সন্তানের আচরণের জন্য পয়েন্ট কর্তন করুন। এটি তাদের হিসাবে দেখাবে এবং তারা জানতে পারবে।
          </DialogDescription>
        </DialogHeader>

        {/* Child selector */}
        <div className="space-y-1.5">
          <Label>সন্তান নির্বাচন করুন</Label>
          <div className="grid grid-cols-2 gap-2">
            {childrenList.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border-2 p-2.5 transition-all',
                  selectedChild === c.id
                    ? 'border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/20'
                    : 'border-border hover:border-rose-200'
                )}
              >
                <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                <span className="text-sm font-medium text-foreground">{c.displayName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="deduct-amount">কত পয়েন্ট কর্তন?</Label>
          <Input
            id="deduct-amount"
            type="number"
            min={1}
            placeholder="যেমন: 5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Reason selector */}
        <div className="space-y-1.5">
          <Label>কারণ</Label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  reason === r
                    ? 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/20 dark:text-rose-300'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent/40'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === 'অন্যান্য' && (
            <Textarea
              placeholder="বিস্তারিত কারণ লিখুন..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={2}
            />
          )}
        </div>

        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/20 dark:text-rose-200">
          ⚠️ এই কর্তন সন্তানের হিসাবে দেখাবে এবং তাকে জানানো হবে। মিসড ইবাদতের জন্য পয়েন্ট কর্তন করবেন না।
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            বাতিল
          </Button>
          <Button variant="destructive" onClick={handleDeduct} disabled={pending}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Minus className="mr-1.5 h-3.5 w-3.5" />}
            কর্তন করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
