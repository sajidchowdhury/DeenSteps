'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Gift, Loader2, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { requestRedemption } from '@/server/actions/reward-actions'

export function RewardRequestButton({
  rewardId,
  childId,
  eligible,
  requiredPoints,
  currentBalance,
}: {
  rewardId: string
  childId: string
  eligible: boolean
  requiredPoints: number
  currentBalance: number
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleRequest = () => {
    startTransition(async () => {
      const res = await requestRedemption(rewardId, childId)
      if (res.ok) {
        toast.success('রিডিম্পশন অনুরোধ করা হয়েছে! বাবা-মা শীঘ্রই রিভিউ করবেন।')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'পুরস্কার অনুরোধ করা যায়নি।')
      }
    })
  }

  if (!eligible) {
    return (
      <Button size="sm" variant="ghost" disabled className="mt-2 w-full text-xs">
        <Lock className="mr-1 h-3 w-3" /> আরও {requiredPoints - currentBalance} তারা দরকার
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mt-2 w-full bg-amber-500 text-xs text-white hover:bg-amber-600">
          <Gift className="mr-1 h-3 w-3" /> পুরস্কার নাও
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>এই পুরস্কারটি নিতে চাও?</DialogTitle>
          <DialogDescription>
            {requiredPoints} তারা তোমার ব্যালেন্স থেকে আরক্ষিত হবে। বাবা-মা নোটিফাই হবেন আর অনুমোদন বা প্রত্যাখ্যান করতে পারবেন। প্রত্যাখ্যাত হলে তোমার তারা ফেরত পাবে।
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-secondary/60 p-3 text-sm">
          <p className="text-foreground">বর্তমান ব্যালেন্স: <strong>{currentBalance} তারা</strong></p>
          <p className="text-foreground">রিডিম্পশনের পর: <strong>{currentBalance - requiredPoints} তারা</strong></p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
          <Button onClick={handleRequest} disabled={pending} className="bg-amber-500 hover:bg-amber-600 text-white">
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
            রিডিম্পশন নিশ্চিত করো
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
