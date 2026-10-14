import { TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

type InvestmentRecord = {
  id: string
  amountInvested: number
  parentPromise: string
  status: string
  profitReturned: number | null
  createdAt: Date
  returnedAt: Date | null
}

export function InvestmentHistory({
  investments,
  summary,
}: {
  investments: InvestmentRecord[]
  summary: { totalInvested: number; totalProfit: number; activeAmount: number; count: number }
}) {
  if (investments.length === 0) return null

  return (
    <Card className="border-sky-200 bg-sky-50/20 dark:border-sky-900/40 dark:bg-sky-950/10">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sky-600" />
          আমার বিনিয়োগ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary tiles */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-card/50 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">মোট বিনিয়োগ</p>
            <p className="mt-0.5 font-display text-lg font-bold text-foreground">{summary.totalInvested}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">চলমান</p>
            <p className="mt-0.5 font-display text-lg font-bold text-sky-600">{summary.activeAmount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">মুনাফা পেয়েছ</p>
            <p className="mt-0.5 font-display text-lg font-bold text-emerald-600">+{summary.totalProfit}</p>
          </div>
        </div>

        {/* Investment list */}
        <div className="max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {investments.map((inv) => (
              <li
                key={inv.id}
                className={cn(
                  'rounded-lg border p-2.5',
                  inv.status === 'RETURNED'
                    ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/10'
                    : 'border-sky-200 bg-sky-50/30 dark:border-sky-900/40 dark:bg-sky-950/10'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {inv.status === 'RETURNED' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-sky-500" />
                    )}
                    <span className="text-xs font-medium text-foreground">
                      {inv.amountInvested} পয়েন্ট বিনিয়োগ
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(inv.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  প্রতিশ্রুতি: {inv.parentPromise}
                </p>
                {inv.status === 'RETURNED' && inv.profitReturned !== null && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {inv.profitReturned > 0 ? `+${inv.profitReturned} মুনাফা` : 'মূল ফেরত'}
                    </Badge>
                    {inv.returnedAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(inv.returnedAt, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
