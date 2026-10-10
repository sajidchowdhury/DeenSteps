import { Users, ListChecks, Trophy } from 'lucide-react'

const STEPS = [
  {
    icon: Users,
    title: '1. Create Your Family',
    description:
      'Register your parent account, set your family name, timezone, and add your children\u2019s profiles. No email needed for kids — they access their dashboard through your family workspace.',
  },
  {
    icon: ListChecks,
    title: '2. Build Good Habits',
    description:
      'Assign age-appropriate daily, weekly, and personal tasks from our Islamic habit library or create your own. Configure points, schedules, and approval policies for each task.',
  },
  {
    icon: Trophy,
    title: '3. Celebrate Progress',
    description:
      'Review completed tasks, award points through auditable transactions, and unlock meaningful family rewards. Track weekly challenges and monthly milestones together.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">How It Works</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three simple steps to better family habits
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Set up your family in minutes. Add tasks your children will love
            completing. Watch good habits grow, one step at a time.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={s.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-premium"
              >
                <div className="absolute -right-4 -top-4 font-display text-7xl font-extrabold text-primary/5">
                  {i + 1}
                </div>
                <div className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-foreground">{s.title.replace(/^\d+\.\s/, '')}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
