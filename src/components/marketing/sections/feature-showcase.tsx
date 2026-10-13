import { BookOpen, ShieldCheck, Star, Target, Gift, Users, Heart, TrendingUp, Trophy } from 'lucide-react'
import { CentralChildIllustration } from '@/components/marketing/illustrations'

const FEATURES = [
  { icon: BookOpen, title: 'দৈনিক ইসলামি অভ্যাস', desc: 'নামাজ, কুরআন, আজকার, ভালো আচরণ।', color: 'emerald', pos: 'top-left' },
  { icon: ShieldCheck, title: 'অভিভাবকের গাইড', desc: 'কাজ দেখুন, অনুমোদন দিন, ফলোআপ করুন।', color: 'sky', pos: 'top-right' },
  { icon: Star, title: 'পয়েন্ট জমানো', desc: 'ভালো কাজে পয়েন্ট, অগ্রগতি চোখের সামনে।', color: 'amber', pos: 'mid-left' },
  { icon: Gift, title: 'পুরস্কার নেওয়া', desc: 'পয়েন্ট দিয়ে পারিবারিক পুরস্কার।', color: 'emerald', pos: 'mid-right' },
  { icon: Heart, title: 'সাদাকাহ দেওয়া', desc: 'পয়েন্ট দিয়ে দান, বাবা-মা নিশ্চিত করবেন।', color: 'amber', pos: 'bottom-left' },
  { icon: TrendingUp, title: 'বিনিয়োগ করা', desc: 'পয়েন্ট বিনিয়োগ, মুনাফা পাওয়া।', color: 'sky', pos: 'bottom-right' },
]

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-soft', text: 'text-emerald-deep' },
  sky: { bg: 'bg-sky-soft', text: 'text-sky-deep' },
  amber: { bg: 'bg-sunshine', text: 'text-sunshine-deep' },
}

export function FeatureShowcaseSection() {
  return (
    <section id="features" className="border-t border-border bg-warm-mint py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            আপনার পরিবারের জন্য যা যা থাকছে
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            সন্তানের প্রতিদিনের অভ্যাস গড়ার সব কিছু, এক জায়গায়।
          </p>
        </div>

        {/* Desktop: infographic composition */}
        <div className="relative mt-16 hidden lg:block">
          <div className="relative mx-auto h-[520px] max-w-5xl">
            {/* Center child */}
            <div className="absolute left-1/2 top-1/2 z-10 w-56 -translate-x-1/2 -translate-y-1/2">
              <CentralChildIllustration />
            </div>

            {/* Decorative connecting circles */}
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/15" aria-hidden="true" />
            <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/10" aria-hidden="true" />

            {/* Feature cards positioned around center */}
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>

        {/* Mobile: vertical cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:hidden">
          {FEATURES.map((f) => {
            const Icon = f.icon
            const c = COLOR_MAP[f.color]
            return (
              <div key={f.title} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
                  <Icon className={`h-5 w-5 ${c.text}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: typeof FEATURES[number] }) {
  const Icon = feature.icon
  const c = COLOR_MAP[feature.color]
  const posClass: Record<string, string> = {
    'top-left': 'left-[2%] top-[8%]',
    'top-right': 'right-[2%] top-[8%]',
    'mid-left': 'left-0 top-1/2 -translate-y-1/2',
    'mid-right': 'right-0 top-1/2 -translate-y-1/2',
    'bottom-left': 'left-[6%] bottom-[8%]',
    'bottom-right': 'right-[6%] bottom-[8%]',
  }
  return (
    <div className={`absolute w-52 ${posClass[feature.pos]}`}>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-premium transition-transform hover:-translate-y-1">
        <div className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-foreground">{feature.title}</p>
          <p className="text-xs text-muted-foreground">{feature.desc}</p>
        </div>
      </div>
    </div>
  )
}
