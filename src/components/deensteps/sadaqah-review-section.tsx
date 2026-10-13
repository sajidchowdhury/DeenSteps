'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Heart, Loader2, Check, X, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { formatDistanceToNow } from 'date-fns'
import { confirmSadaqahDonation, cancelSadaqahDonation } from '@/server/actions/sadaqah-actions'

type SadaqahDonation = {
  id: string
  starsDedicated: number
  status: string
  createdAt: Date
  child: { id: string; displayName: string; avatarColor: string }
  cause: { id: string; title: string; iconKey: string }
}

export function SadaqahReviewSection({ donations }: { donations: SadaqahDonation[] }) {
  if (donations.length === 0) return null

  return (
    <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/10">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-emerald-600" />
          সাদাকাহ অনুরোধ ({donations.length})
        </CardTitle>
        <CardDescription>
          সন্তান তার পয়েন্ট সাদাকাহর জন্য দিতে চায়। নিশ্চিত করুন বা বাতিল করুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {donations.map((d) => (
            <SadaqahRow key={d.id} donation={d} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function SadaqahRow({ donation }: { donation: SadaqahDonation }) {
  const [confirming, setConfirming] = React.useState(false)
  const [cancelling, setCancelling] = React.useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const res = await confirmSadaqahDonation(donation.id)
      if (res.ok) {
        toast.success('সাদাকাহ নিশ্চিত হয়েছে! আল্লাহ সন্তানকে উত্তম প্রতিদান দিন। 🤲')
        router.refresh()
      } else {
        toast.error(res.error ?? 'নিশ্চিত করা যায়নি।')
      }
    } finally {
      setConfirming(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await cancelSadaqahDonation(donation.id, 'বাবা-মা বাতিল করেছেন')
      if (res.ok) {
        toast.success('সাদাকাহ বাতিল হয়েছে। পয়েন্ট ফেরত দেওয়া হয়েছে।')
        router.refresh()
      } else {
        toast.error(res.error ?? 'বাতিল করা যায়নি।')
      }
    } finally {
      setCancelling(false)
    }
  }

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar color={donation.child.avatarColor} name={donation.child.displayName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{donation.child.displayName}</p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
              <DynamicIcon iconKey={donation.cause.iconKey} className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm text-foreground">{donation.cause.title}</p>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Badge variant="outline" className="gap-1 text-emerald-700 dark:text-emerald-300">
              <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" />
              {donation.starsDedicated} পয়েন্ট
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={confirming || cancelling}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {confirming ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
            নিশ্চিত
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={confirming || cancelling}
          >
            {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </li>
  )
}
