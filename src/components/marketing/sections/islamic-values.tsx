import { BookOpen, Heart, HandHeart, TrendingUp } from 'lucide-react'

const VALUES = [
  {
    icon: BookOpen,
    title: 'আল্লাহর সঙ্গে সম্পর্ক',
    desc: 'নামাজ, কুরআন ও আল্লাহকে স্মরণ করার অভ্যাস। পয়েন্ট ঈমান মাপে না — শুধু উৎসাহ জোগায়।',
    color: 'emerald',
  },
  {
    icon: Heart,
    title: 'সুন্দর চরিত্র ও দানশীলতা',
    desc: 'সত্যবাদিতা, দয়া, সম্মান — আর সাদাকাহ দিয়ে দানশীলতা শেখা। পয়েন্ট দিয়ে গরিবদের সাহায্য করো।',
    color: 'amber',
  },
  {
    icon: TrendingUp,
    title: 'দায়িত্বশীল ও বিনিয়োগবান জীবন',
    desc: 'পরিবারকে সাহায্য করা, পয়েন্ট বিনিয়োগ করে বাড়ানো — আর্থিক দায়িত্ব ছোটবেলা থেকেই শেখা।',
    color: 'sky',
  },
]

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-soft', text: 'text-emerald-deep' },
  amber: { bg: 'bg-sunshine', text: 'text-sunshine-deep' },
  sky: { bg: 'bg-sky-soft', text: 'text-sky-deep' },
}

export function IslamicValuesSection() {
  return (
    <section id="islamic-values" className="border-t border-border bg-warm-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            সন্তানকে শুধু সফল নয়, সুন্দর মানুষ হিসেবেও গড়ে তুলুন
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            পয়েন্ট ঈমান বা তাকওয়া মাপে না — শুধু উৎসাহ জোগায়, অভ্যাস গড়ে।
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => {
            const Icon = v.icon
            const c = COLOR_MAP[v.color]
            return (
              <div
                key={v.title}
                className="rounded-3xl border border-border bg-card p-7 text-center shadow-soft transition-transform hover:-translate-y-1"
              >
                <div className={`mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl ${c.bg}`}>
                  <Icon className={`h-7 w-7 ${c.text}`} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Qur'anic verse panel */}
        <div className="relative mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cream p-8 text-center shadow-soft dark:border-emerald-900 dark:from-emerald-950/40">
          <div className="pattern-dots-amber absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-xl font-semibold leading-relaxed text-emerald-deep sm:text-2xl">
              &ldquo;তোমরা নিজেদেরকে এবং নিজেদের পরিবারকে আগুন থেকে রক্ষা করো।&rdquo;
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              সূরা আত-তাহরীম, ৬৬:৬
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
