import { Star, Trophy, Target, Gift, CheckCheck } from 'lucide-react'

const PREVIEW_CARDS = [
  {
    icon: Star,
    label: 'বর্তমান পয়েন্ট',
    value: '৭২',
    accent: 'amber',
    description: 'অনুমোদিত কাজ থেকে অর্জিত। প্রতিটি পয়েন্ট একটি অডিটযোগ্য লেজারে ট্র্যাক করা — কখনোই মুছে ফেলা যায় না।',
  },
  {
    icon: Gift,
    label: 'উপলব্ধ পুরস্কার',
    value: '৫',
    accent: 'emerald',
    description: 'পরিবার-কনফিগার করা পুরস্কার যা আপনার সন্তান অর্জন করতে পারে। প্রয়োজনীয় পয়েন্ট আর বর্তমান অগ্রগতি দেখায়।',
  },
  {
    icon: Target,
    label: 'সাপ্তাহিক চ্যালেঞ্জ',
    value: '৬৪%',
    accent: 'sage',
    description: 'সাপ্তাহিক লক্ষ্যের দিকে লাইভ অগ্রগতি। শুধু তৈরি করা কাজ নয়, নির্ধারিত কাজ থেকে সম্পন্ন হওয়া কাজ গণনা করে।',
  },
  {
    icon: Trophy,
    label: 'মাসিক মাইলস্টোন',
    value: '২ / ৪',
    accent: 'gold',
    description: 'এই মাসে কোয়ালিফাইং সপ্তাহ। একবার অর্জিত হলে, পরবর্তী ব্যর্থ সপ্তাহ তা মুছে দেয় না।',
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
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">পুরস্কার</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              অগ্রগতি দৃশ্যমান আর উৎসাহজনক করুন
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              সন্তান ঠিক দেখতে পায় কতটা কাছে আছে তার পরবর্তী পুরস্কার। বাবা-মা নিয়ন্ত্রণ করেন ক্যাটালগ, প্রয়োজনীয় পয়েন্ট, আর রিডিম্পশনের আগে অনুমোদন লাগবে কিনা।
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'প্রতিটি পুরস্কারের জন্য পয়েন্টর ব্যালেন্স, প্রগ্রেস বার, আর বাকি পয়েন্ট।',
                'দুই ধরনের রিডিম্পশন: পয়েন্ট-ভিত্তিক আর অর্জন-ভিত্তিক পুরস্কার।',
                'অ্যাটমিক ট্রানজেকশন ওভারস্পেন্ড আর ডুপ্লিকেট রিডিম্পশন রোধ করে।',
                'এলিজিবিলিটি নিয়ম, মেয়াদ শেষ, আর সন্তান-ভিত্তিক লিমিট সম্পূর্ণ কনফিগারযোগ্য।',
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
