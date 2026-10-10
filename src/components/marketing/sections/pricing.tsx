import Link from 'next/link'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRICING_PLANS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pricing</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple plans for every family
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, forever. Upgrade when you need more profiles, advanced
            reports, or monthly milestones. Pricing is configurable and stored
            separately from application code.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-7 shadow-soft transition-all',
                plan.highlight
                  ? 'border-primary/40 shadow-premium lg:-translate-y-2'
                  : 'border-border hover:-translate-y-1 hover:shadow-premium'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Star className="h-3 w-3 fill-current" />
                  Most popular
                </div>
              )}
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-7 w-full"
                variant={plan.highlight ? 'default' : 'outline'}
              >
                <Link href={plan.comingSoon ? '#' : '/register'}>{plan.cta}</Link>
              </Button>
              {plan.comingSoon && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Join the waitlist to be notified.
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Sample pricing shown. Payment integration is not configured in this
          deployment — DeenSteps never simulates successful payments.
        </p>
      </div>
    </section>
  )
}
