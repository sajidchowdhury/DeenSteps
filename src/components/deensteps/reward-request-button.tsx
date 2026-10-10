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
        toast.success('Redemption requested! Your parent will review it soon.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'Could not request reward.')
      }
    })
  }

  if (!eligible) {
    return (
      <Button size="sm" variant="ghost" disabled className="mt-2 w-full text-xs">
        <Lock className="mr-1 h-3 w-3" /> Need {requiredPoints - currentBalance} more
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mt-2 w-full bg-amber-500 text-xs text-white hover:bg-amber-600">
          <Gift className="mr-1 h-3 w-3" /> Redeem reward
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem this reward?</DialogTitle>
          <DialogDescription>
            {requiredPoints} stars will be reserved from your balance. Your parent
            will be notified and can approve or decline. If declined, your stars
            are returned to your balance.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-secondary/60 p-3 text-sm">
          <p className="text-foreground">Current balance: <strong>{currentBalance} stars</strong></p>
          <p className="text-foreground">After redemption: <strong>{currentBalance - requiredPoints} stars</strong></p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleRequest} disabled={pending} className="bg-amber-500 hover:bg-amber-600 text-white">
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
            Confirm redemption
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
