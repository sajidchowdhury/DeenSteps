'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TIER_STYLES: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  2: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  3: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  4: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  5: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
}

const TIER_LABELS: Record<number, string> = {
  1: 'Tier ১',
  2: 'Tier ২',
  3: 'Tier ৩',
  4: 'Tier ৪',
  5: 'Tier ৫',
}

/**
 * TierBadge — shows the priority tier (1-5) of a task.
 * Tier 1 = core worship, Tier 5 = optional growth.
 * This is an educational priority structure, NOT a religious ranking.
 */
export function TierBadge({ tier, className }: { tier: number; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-0.5 text-[10px] font-semibold', TIER_STYLES[tier] || TIER_STYLES[3], className)}
    >
      {TIER_LABELS[tier] || `Tier ${tier}`}
    </Badge>
  )
}

/**
 * AgeIndicator — shows if a task is age-appropriate.
 * Renders a small text label.
 */
export function AgeIndicator({ minAge, maxAge }: { minAge: number | null; maxAge: number | null }) {
  if (minAge === null && maxAge === null) return null

  let label = ''
  if (minAge !== null && maxAge !== null) {
    if (maxAge >= 99) {
      label = `${minAge}+ বছর`
    } else {
      label = `${minAge}-${maxAge} বছর`
    }
  } else if (minAge !== null) {
    label = `${minAge}+ বছর`
  } else if (maxAge !== null) {
    if (maxAge >= 99) return null
    label = `-${maxAge} বছর`
  }

  return (
    <span className="text-[10px] text-muted-foreground">{label}</span>
  )
}
