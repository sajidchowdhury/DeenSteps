'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar } from '@/components/deensteps/app-shell'
import { returnInvestmentProfit } from '@/server/actions/investment-actions'
import { formatDistanceToNow } from 'date-fns'

type ActiveInvestment = {
  id: string
  amountInvested: number
  parentPromise: string
  status: string
  createdAt: Date
  child: { id: string; displayName: string; avatarColor: string }
}

export function InvestmentReviewSection({ investments }: { investments: ActiveInvestment[] }) {
  if (investments.length === 0) return null

  return (
    <Card className="border-sky-200 bg-sky-50/30 dark:border-sky-900/40 dark:bg-sky-950/10">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sky-600" />
          বিনিয়োগ — মুনাফা ফেরত দিন
        </CardTitle>
        <CardDescription>সন্তান পয়েন্ট বিনিয়োগ করেছে। মুনাফা ফেরত দিন।</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {investments.map((inv) => (
            <ReturnProfitDialog key={inv.id} investment={inv} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function ReturnProfitDialog({ investment }: { investment: ActiveInvestment }) {
  const [open, setOpen] = React.useState(false)
  const [profit, setProfit] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const handleReturn = async () => {
    const profitNum = parseInt(profit, 10)
    if (isNaN(profitNum) || profitNum < 0) {
      toast.error('সঠিক পয়েন্ট লিখুন।')
      return
    }

    setPending(true)
    try {
      const res = await returnInvestmentProfit(investment.id, profitNum)
      if (res.ok) {
        toast.success(`${profitNum} পয়েন্ট মুনাফা ফেরত দেওয়া হয়েছে!`)
        setOpen(false)
        setProfit('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'মুনাফা ফেরত দেওয়া যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Avatar color={investment.child.avatarColor} name={investment.child.displayName} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{investment.child.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(investment.createdAt, { addSuffix: true })}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                {investment.amountInvested} পয়েন্ট বিনিয়োগ
              </Badge>
            </div>
            <div className="mt-2 rounded-lg bg-sky-50/60 p-2.5 text-xs text-foreground dark:bg-sky-950/20">
              <span className="font-medium">প্রতিশ্রুতি: </span>{investment.parentPromise}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="bg-sky-600 hover:bg-sky-700">
          <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> মুনাফা দিন
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>মুনাফা ফেরত দিন</DialogTitle>
            <DialogDescription>
              {investment.child.displayName} {investment.amountInvested} পয়েন্ট বিনিয়োগ করেছিল।
              কত পয়েন্ট মুনাফা দিচ্ছেন?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="profit-amount">মুনাফার পরিমাণ (পয়েন্ট)</Label>
            <Input
              id="profit-amount"
              type="number"
              min={0}
              placeholder="যেমন: 5"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ০ দিলে মূল বিনিয়োগ ফেরত পাবে (কোনো মুনাফা ছাড়া)। বিনিয়োগের পরিমাণ ছাড়া শুধু মুনাফা দিন।
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button onClick={handleReturn} disabled={pending} className="bg-sky-600 hover:bg-sky-700">
              {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
              মুনাফা দিন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}
