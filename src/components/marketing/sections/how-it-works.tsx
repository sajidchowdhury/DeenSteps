import { ClipboardList, HeartHandshake, PartyPopper } from 'lucide-react'

const STEPS = [
  {
    num: '০১',
    icon: ClipboardList,
    title: 'অভ্যাস ঠিক করুন',
    desc: 'সন্তানের উপযোগী দৈনিক কাজ বেছে নিন।',
    color: 'emerald',
  },
  {
    num: '০২',
    icon: HeartHandshake,
    title: 'একসঙ্গে এগিয়ে চলুন',
    desc: 'সন্তান কাজ সম্পন্ন করে, আপনি দেখেন ও উৎসাহ দেন।',
    color: 'sky',
  },
  {
    num: '০৩',
    icon: PartyPopper,
    title: 'আনন্দ ভাগ করে নিন',
    desc: 'পারিবারিক আনন্দ ও পুরস্কারে অগ্রগতি উদযাপন করুন।',
    color: 'amber',
  },
]

const COLOR_MAP: Record<string, { bg: string; ring: string; text: string }> = {
  emerald: { bg: 'bg-emerald-soft', ring: 'ring-emerald-200', text: 'text-emerald-deep' },
  sky: { bg: 'bg-sky-soft', ring: 'ring-sky-200', text: 'text-sky-deep' },
  amber: { bg: 'bg-sunshine', ring: 'ring-amber-200', text: 'text-sunshine-deep' },
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ভালো অভ্যাস গড়ে উঠুক প্রতিদিন
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            তিনটি সহজ ধাপে শুরু হয় পরিবারের সুন্দর যাত্রা।
          </p>
        </div>

        {/* Steps with connecting journey */}
        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-emerald-200 via-sky-200 to-amber-200 lg:block" aria-hidden="true" />

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const c = COLOR_MAP[step.color]
              return (
                <div key={step.num} className="relative flex flex-col items-center text-center">
                  {/* Number circle */}
                  <div className={`relative z-10 inline-flex h-24 w-24 items-center justify-center rounded-full ${c.bg} ring-4 ${c.ring} shadow-soft`}>
                    <Icon className={`h-9 w-9 ${c.text}`} />
                    <span className={`absolute -top-2 -right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background`}>
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">{step.desc}</p>

                  {/* Arrow between steps (mobile) */}
                  {i < STEPS.length - 1 && (
                    <div className="mt-6 lg:hidden">
                      <svg width="20" height="28" viewBox="0 0 20 28" fill="none" aria-hidden="true">
                        <path d="M10 2v22m0 0l-7-7m7 7l7-7" stroke="oklch(0.7 0.02 140)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
