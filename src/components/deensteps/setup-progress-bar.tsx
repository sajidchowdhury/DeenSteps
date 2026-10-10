'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { SetupProgress } from '@/server/actions/setup-progress-actions'

export function SetupProgressBar({ progress }: { progress: SetupProgress }) {
  if (progress.isComplete) return null

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-foreground">
                চলুন আপনার পরিবার সেট আপ করি
              </p>
              <p className="text-xs text-muted-foreground">
                {progress.completedSteps} / {progress.totalSteps} ধাপ সম্পন্ন · {progress.percent}%
              </p>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <span className="font-display text-2xl font-extrabold text-primary">{progress.percent}%</span>
          </div>
        </div>

        <Progress value={progress.percent} className="mt-3 h-2" />

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {progress.steps.map((step) => {
            const Icon = step.done ? CheckCircle2 : Circle
            return (
              <Link
                key={step.key}
                href={step.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5',
                  step.done
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                    : 'border-border bg-card hover:border-primary/40 hover:shadow-soft'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    step.done ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', step.done ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground')}>
                    {step.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{step.description}</p>
                </div>
                {!step.done && (
                  <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                )}
              </Link>
            )
          })}
        </div>

        {!progress.steps.every((s) => s.done) && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/50 p-2.5">
            <p className="text-xs text-muted-foreground">
              পরবর্তী ধাপ: <span className="font-medium text-foreground">{progress.steps.find((s) => !s.done)?.label}</span>
            </p>
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
              <Link href={progress.steps.find((s) => !s.done)?.href ?? '/dashboard'}>
                শুরু করুন <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
