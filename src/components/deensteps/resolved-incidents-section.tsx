'use client'

import { HeartHandshake, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/deensteps/app-shell'
import { formatDistanceToNow } from 'date-fns'

type IncidentChild = {
  id: string
  displayName: string
  avatarColor: string
}

type IncidentReport = {
  id: string
  whatHappened: string
  child: IncidentChild
}

type IncidentResolution = {
  id: string
  outcomeType: string
  description: string
  pointsAdjusted: number
  reason: string | null
}

type Incident = {
  id: string
  status: string
  resolvedAt: Date | null
  reports: IncidentReport[]
  resolution: IncidentResolution | null
}

const OUTCOME_LABELS: Record<string, string> = {
  NO_ACTION: 'আর কিছু করা লাগবে না',
  APOLOGY: 'ক্ষমা চাওয়া ও মীমাংসা',
  RETURN_ITEM: 'জিনিস ফেরত দেওয়া',
  REPAIR: 'ক্ষতি মেরামত করা',
  HELPFUL_ACTION: 'উপকারী কাজ করা',
  CONSEQUENCE: 'পরিণতি',
}

export function ResolvedIncidentsSection({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-600" />
          সমাধান হওয়া সমস্যা ({incidents.length})
        </CardTitle>
        <CardDescription>গত ৩০ দিনে সমাধান হওয়া সমস্যাগুলোর ইতিহাস।</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {incidents.map((incident) => (
            <li key={incident.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-start gap-3">
                {incident.reports[0] && (
                  <Avatar color={incident.reports[0].child.avatarColor} name={incident.reports[0].child.displayName} size="sm" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {incident.reports[0]?.child.displayName ?? 'সন্তান'}
                    </p>
                    {incident.resolvedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {incident.resolution && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          {OUTCOME_LABELS[incident.resolution.outcomeType] || incident.resolution.outcomeType}
                        </Badge>
                        {incident.resolution.pointsAdjusted !== 0 && (
                          <Badge variant="outline" className={incident.resolution.pointsAdjusted < 0 ? 'text-[9px] text-rose-600' : 'text-[9px] text-emerald-600'}>
                            {incident.resolution.pointsAdjusted > 0 ? '+' : ''}{incident.resolution.pointsAdjusted} তারা
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{incident.resolution.description}</p>
                      {incident.resolution.reason && (
                        <p className="text-[10px] text-muted-foreground/70">কারণ: {incident.resolution.reason}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
