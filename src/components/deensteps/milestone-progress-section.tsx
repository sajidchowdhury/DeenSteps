import * as React from 'react'
import { Award, Trophy, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/deensteps/app-shell'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// Phase 5 (S5.2): Monthly Milestone Progress Section (parent dashboard)
//
// Per spec §7B: 3/4 qualifying weeks → monthly milestone.
// This section gives the parent a quick at-a-glance view of where each child
// stands in the current period — gentle progress, not competition.
// ────────────────────────────────────────────────────────────────────────────

export type MilestoneProgress = {
  child: { id: string; displayName: string; avatarColor: string }
  periodStart: string
  periodEnd: string
  qualifyingWeeks: number
  requiredWeeks: number
  qualified: boolean
  qualifiedAt: string | null
}

export function MilestoneProgressSection({ progress }: { progress: MilestoneProgress[] }) {
  if (progress.length === 0) return null

  const anyQualified = progress.some((p) => p.qualified)
  const title = anyQualified ? 'এই মাসের মাইলস্টোন 🎉' : 'এই মাসের অগ্রগতি'

  return (
    <Card className="border-violet-200 bg-violet-50/30 dark:border-violet-900/40 dark:bg-violet-950/10">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-violet-600" />
          {title}
        </CardTitle>
        <CardDescription>
          প্রতিটি সপ্তাহে অন্তত একটি কাজ সম্পন্ন করলে সেটি গণ্য হয়।
          {progress[0] && (
            <> লক্ষ্য: {progress[0].requiredWeeks} সপ্তাহ।</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {progress.map((p) => {
          const percent = Math.min(100, Math.round((p.qualifyingWeeks / p.requiredWeeks) * 100))
          const remaining = Math.max(0, p.requiredWeeks - p.qualifyingWeeks)
          return (
            <div
              key={p.child.id}
              className={cn(
                'rounded-xl border bg-card p-3.5 transition-colors',
                p.qualified
                  ? 'border-violet-300 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/30'
                  : 'border-border'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar color={p.child.avatarColor} name={p.child.displayName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {p.child.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.qualified ? (
                        <span className="inline-flex items-center gap-1 text-violet-700 dark:text-violet-300">
                          <CheckCircle2 className="h-3 w-3" /> মাইলস্টোন অর্জিত!
                        </span>
                      ) : remaining === 1 ? (
                        <>আর মাত্র ১ সপ্তাহ বাকি</>
                      ) : (
                        <>আর {remaining} সপ্তাহ বাকি</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                      p.qualified
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {p.qualified && <Award className="h-3 w-3" />}
                    {p.qualifyingWeeks}/{p.requiredWeeks} সপ্তাহ
                  </span>
                </div>
              </div>
              <Progress value={percent} className="mt-2.5 h-1.5" />
            </div>
          )
        })}
        <p className="pt-1 text-xs text-muted-foreground">
          💜 মাইলস্টোন হলো ধারাবাহিকতার উদযাপন — নিখুঁত হওয়ার নয়। সন্তানের চেষ্টা উদযাপন করুন।
        </p>
      </CardContent>
    </Card>
  )
}
