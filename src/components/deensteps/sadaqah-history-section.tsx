'use client'

import { Heart, Star, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { formatDistanceToNow } from 'date-fns'

type SadaqahHistoryItem = {
  id: string
  starsDedicated: number
  status: string
  realAmount: number | null
  confirmationNote: string | null
  createdAt: Date
  child: { id: string; displayName: string; avatarColor: string }
  cause: { id: string; title: string; iconKey: string }
}

export function SadaqahHistorySection({ history }: { history: SadaqahHistoryItem[] }) {
  if (history.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-emerald-600" />
          সাদাকাহ ইতিহাস ({history.length})
        </CardTitle>
        <CardDescription>নিশ্চিত ও বাতিল হওয়া সাদাকাহ দানের ইতিহাস।</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {history.map((d) => (
            <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <Avatar color={d.child.avatarColor} name={d.child.displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{d.child.displayName}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <DynamicIcon iconKey={d.cause.iconKey} className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">{d.cause.title}</span>
                  <span className="text-xs text-muted-foreground">· {d.starsDedicated} তারা</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.status === 'CONFIRMED' ? (
                  <>
                    <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <Check className="mr-0.5 h-2.5 w-2.5" /> নিশ্চিত
                    </Badge>
                    {d.realAmount != null && (
                      <span className="text-xs font-medium text-emerald-600">৳{d.realAmount}</span>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="text-[9px] text-rose-600">
                    <X className="mr-0.5 h-2.5 w-2.5" /> বাতিল
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
