import { Heart, BookOpen, HandHeart, Sparkles, ShieldCheck } from 'lucide-react'

const VALUES = [
  {
    icon: BookOpen,
    title: 'Prayer & Quran',
    description: 'Optional templates encourage daily prayer practice and Quran reading — adapted by you to your child\u2019s age and ability.',
  },
  {
    icon: Heart,
    title: 'Good Character',
    description: 'Honesty, kindness, patience, and gratitude are habits too. Celebrate them the same way you celebrate daily routines.',
  },
  {
    icon: HandHeart,
    title: 'Helpfulness & Responsibility',
    description: 'Encourage children to help around the home and take ownership of age-appropriate daily responsibilities.',
  },
  {
    icon: Sparkles,
    title: 'Intrinsic Motivation',
    description: 'Rewards are tools for encouragement and habit development — never a replacement for sincere intention or parental guidance.',
  },
]

export function IslamicValuesSection() {
  return (
    <section id="islamic-values" className="relative overflow-hidden border-t border-border bg-emerald-950 py-20 text-emerald-50">
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, oklch(0.85 0.14 85) 2px, transparent 2px), radial-gradient(circle at 75% 75%, oklch(0.85 0.14 85) 2px, transparent 2px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Islamic Values</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Nurturing faith, character, and responsibility
          </h2>
          <p className="mt-4 text-lg text-emerald-100/80">
            DeenSteps supports parents in encouraging prayer habits, Quran
            learning, honesty, kindness, gratitude, helpfulness, and personal
            responsibility — adapted to every family\u2019s practices.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => {
            const Icon = v.icon
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-emerald-800/50 bg-emerald-900/40 p-6 backdrop-blur-sm"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-emerald-50">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-emerald-100/75">{v.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-amber-300" />
          <p className="mt-3 text-base leading-relaxed text-emerald-50">
            <strong className="font-semibold text-amber-200">Points never measure faith.</strong>{' '}
            DeenSteps does not score a child\u2019s piety, spiritual worth, or
            standing before Allah. Rewards are tools for encouragement and habit
            development — not a replacement for sincere intention, parental
            guidance, or Islamic education.
          </p>
        </div>
      </div>
    </section>
  )
}
