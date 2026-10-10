import {
  Users,
  ListChecks,
  CalendarDays,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  BarChart3,
  Sparkles,
  Heart,
  Smartphone,
  Baby,
} from 'lucide-react'

const FEATURES = [
  { icon: Users, title: 'Multiple child profiles', description: 'Each child gets their own private profile, tasks, and reward progress within one family workspace.' },
  { icon: ListChecks, title: 'Customizable tasks', description: 'Create one-time, daily, weekday, or weekly tasks. Set points, due times, and approval policies.' },
  { icon: CalendarDays, title: 'Daily & weekly tracking', description: 'Tasks generate reliable occurrences based on your family\u2019s timezone — no duplicates, no missed days.' },
  { icon: ShieldCheck, title: 'Parent approval workflow', description: 'Review each submission, approve, request revisions, or reject with a constructive note.' },
  { icon: Star, title: 'Points & rewards', description: 'A real ledger tracks every point earned, spent, and adjusted — never just an editable number.' },
  { icon: Target, title: 'Weekly challenges', description: 'Set a target completion percentage for the week and let children chase a meaningful reward.' },
  { icon: Trophy, title: 'Monthly milestones', description: 'Aggregate weekly results into monthly milestones with configurable qualification rules.' },
  { icon: BarChart3, title: 'Family progress reports', description: 'See daily, weekly, and monthly reports with charts that support constructive conversations.' },
  { icon: Sparkles, title: 'Islamic habit templates', description: 'Optional templates for prayer, Quran, dua, honesty, kindness, and gratitude — fully configurable.' },
  { icon: Heart, title: 'Child-friendly dashboards', description: 'Colorful, age-appropriate dashboards that celebrate personal progress, never sibling comparison.' },
  { icon: Smartphone, title: 'Mobile-first experience', description: 'Responsive on every screen — phones, tablets, laptops, and desktops. Touch-friendly throughout.' },
  { icon: Baby, title: 'No email needed for kids', description: 'Children access their profile through your parent-managed family environment, safely and privately.' },
]

export function FeatureShowcaseSection() {
  return (
    <section id="features" className="border-t border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Features</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to nurture good habits
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete, production-grade habit and rewards platform — not just a
            static prototype. Every action connects to real, persistent data.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-premium"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
