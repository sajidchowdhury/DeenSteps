'use client'

import * as React from 'react'
import { HeartHandshake } from 'lucide-react'
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
  whoInvolved: string | null
  howFelt: string | null
  helpNeeded: string | null
  createdAt: Date
  child: IncidentChild
}

type Incident = {
  id: string
  status: string
  createdAt: Date
  reports: IncidentReport[]
}

export function IncidentsSection({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) return null

  return (
    <Card className="border-rose-200 bg-rose-50/30 dark:border-rose-900 dark:bg-rose-950/10">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-rose-500" />
          সন্তানের সাহায্যের অনুরোধ ({incidents.length})
        </CardTitle>
        <CardDescription>
          সন্তান একটি সমস্যায় সাহায্য চেয়েছে। কোমলভাবে শুনুন, বুঝুন, সমাধান করুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {incidents.map((incident) => (
            <li key={incident.id} className="rounded-xl border border-border bg-card p-4">
              {incident.reports.map((report) => (
                <div key={report.id} className="flex items-start gap-3">
                  <Avatar color={report.child.avatarColor} name={report.child.displayName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{report.child.displayName}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </span>
                      <Badge variant="outline" className="text-[9px] text-rose-600">
                        {incident.status === 'OPEN' ? 'খোলা' : 'পর্যালোচনায়'}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div>
                        <span className="text-xs font-medium text-foreground">কী হয়েছে: </span>
                        <span className="text-sm text-muted-foreground">{report.whatHappened}</span>
                      </div>
                      {report.whoInvolved && (
                        <div>
                          <span className="text-xs font-medium text-foreground">কার সাথে: </span>
                          <span className="text-sm text-muted-foreground">{report.whoInvolved}</span>
                        </div>
                      )}
                      {report.howFelt && (
                        <div>
                          <span className="text-xs font-medium text-foreground">কেমন লেগেছে: </span>
                          <span className="text-sm text-muted-foreground">{report.howFelt}</span>
                        </div>
                      )}
                      {report.helpNeeded && (
                        <div>
                          <span className="text-xs font-medium text-foreground">সাহায্য চায়: </span>
                          <span className="text-sm text-muted-foreground">{report.helpNeeded}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                💡 সন্তানকে ভালোভাবে শুনুন। রেস্টোরেটিভ সমাধান বেছে নিন — ক্ষমা, মেরামত, সাহায্য। শাস্তি নয়।
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
