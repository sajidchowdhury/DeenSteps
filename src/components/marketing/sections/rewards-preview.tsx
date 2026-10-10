import { Star, Trophy, Target, Gift, CheckCheck } from 'lucide-react'

const PREVIEW_CARDS = [
  {
    icon: Star,
    label: 'Current points',
    value: '72',
    accent: 'amber',
    description: 'Available balance earned through approved tasks. Tracked in an immutable ledger — every point is auditable.',
  },
  {
    icon: Gift,
    label: 'Available rewards',
    value: '5',
    accent: 'emerald',
    description: 'Family-configured rewards your child can work toward. Each shows the points required and current progress.',
  },
  {
    icon: Target,
    label: 'Weekly challenge',
    value: '64%',
    accent: 'sage',
    description: 'Live progress toward the weekly target. Completion is calculated from eligible scheduled tasks, not from the number of tasks created.',
  },
  {
    icon: Trophy,
    label: 'Monthly milestone',
    value: '2 / 4',
    accent: 'gold',
    description: 'Qualifying weeks so far this month. Once earned, a qualification is never silently removed by a later unsuccessful week.',
  },
]

const ACCENT_CLASSES: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  sage: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
  gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200',
}

export function RewardsPreviewSection() {
  return (
    <section id="rewards" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Rewards</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Make progress visible and motivating
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Children see exactly how close they are to their next reward. Parents
              control the catalog, the points required, and whether approval is
              needed before redemption.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'Points balance, progress bar, and remaining points for every reward.',
                'Two redemption models: point-based purchases and achievement-based rewards.',
                'Atomic transactions prevent overspending and duplicate redemptions.',
                'Eligibility rules, expiration, and per-child limits fully configurable.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {PREVIEW_CARDS.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.label}
                  className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${ACCENT_CLASSES[c.accent]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-extrabold text-foreground">{c.value}</p>
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
