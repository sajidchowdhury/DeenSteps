'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Heart, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { requestSadaqah } from '@/server/actions/sadaqah-actions'

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
  const [causeId, setCauseId] = React.useState('')
  const [stars, setStars] = React.useState('')
  const [pending, setPending] = React.useState(false)
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
    if (!causeId) {
      toast.error('একটি কারণ নির্বাচন করো।')
      return
    }
    const starsNum = parseInt(stars, 10)
    if (!starsNum || starsNum <= 0) {
      toast.error('কত তারা দিতে চাও তা লিখো।')
      return
    }
    if (starsNum > currentBalance) {
      toast.error(`তোমার কাছে মাত্র ${currentBalance} তারা আছে।`)
      return
    }

    setPending(true)
    try {
      const res = await requestSadaqah(childId, causeId, starsNum)
      if (res.ok) {
        toast.success(`${starsNum} তারা সাদাকাহর জন্য নিবেদিত! বাবা-মা নিশ্চিত করবেন। 🤲`)
        setCauseId('')
        setStars('')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'অনুরোধ করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Heart className="h-3.5 w-3.5" />
          আমার সাদাকাহ সঞ্চয়
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

        <div className="space-y-3">
          <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
            <p className="text-xs text-muted-foreground">তোমার বর্তমান তারা</p>
            <p className="mt-0.5 inline-flex items-center gap-1 font-display text-2xl font-extrabold text-foreground">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              {currentBalance}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>কোন কারণে দিতে চাও?</Label>
            <Select value={causeId} onValueChange={setCauseId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="কারণ নির্বাচন করো" />
              </SelectTrigger>
              <SelectContent>
                {causes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="inline-flex items-center gap-2">
                      <DynamicIcon iconKey={c.iconKey} size={14} />
                      {c.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sadaqah-stars">কত তারা দিতে চাও?</Label>
            <Input
              id="sadaqah-stars"
              type="number"
              min={1}
              max={currentBalance}
              placeholder="যেমন: ১০"
              value={stars}
              onChange={(e) => setStars(e.target.value)}
            />
            {stars && parseInt(stars, 10) > 0 && (
              <p className="text-xs text-muted-foreground">
                দেওয়ার পর তোমার ব্যালেন্স থাকবে: {currentBalance - parseInt(stars, 10)} তারা
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            বাতিল
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !causeId || !stars}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Heart className="mr-1.5 h-3.5 w-3.5" />}
            সাদাকাহ দিন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
