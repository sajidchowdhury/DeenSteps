import { Users, ListChecks, Trophy } from 'lucide-react'

const STEPS = [
  {
    icon: Users,
    title: '১. আপনার পরিবার তৈরি করুন',
    description:
      'বাবা-মা হিসেবে রেজিস্টার করুন। পরিবারের নাম দিন, টাইমজোন সিলেক্ট করুন, আর সন্তানদের প্রোফাইল যোগ করুন। সন্তানদের আলাদা ইমেইল লাগে না — তারা আপনার পরিবারের ওয়ার্কস্পেস থেকেই তাদের ড্যাশবোর্ড দেখবে।',
  },
  {
    icon: ListChecks,
    title: '২. ভালো অভ্যাস গড়ে তুলুন',
    description:
      'বয়স অনুযায়ী দৈনিক, সাপ্তাহিক বা ব্যক্তিগত কাজ যোগ করুন। আমাদের ইসলামি অভ্যাস লাইব্রেরি থেকে বেছে নিন, নাহলে নিজেই তৈরি করুন। প্রতিটি কাজের জন্য পয়েন্ট, সময়সূচি আর অনুমোদন নীতি নির্ধারণ করুন।',
  },
  {
    icon: Trophy,
    title: '৩. অগ্রগতি উদযাপন করুন',
    description:
      'সম্পন্ন কাজ রিভিউ করুন, পয়েন্ট প্রদান করুন, আর অর্থপূর্ণ পারিবারিক পুরস্কার আনলক করুন। সাপ্তাহিক চ্যালেঞ্জ আর মাসিক মাইলস্টোন একসাথে ট্র্যাক করুন। প্রতিটি ভালো কাজ আল্লাহর কাছে গণ্য — পয়েন্ট শুধু উৎসাহ জোগায়।',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">যেভাবে কাজ করে</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ভালো পরিবারিক অভ্যাসের তিনটি সহজ ধাপ
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            মাত্র কয়েক মিনিটে আপনার পরিবার সেট আপ করুন। সন্তান যে কাজগুলো ভালোবাসে তা যোগ করুন। দেখুন ভালো অভ্যাস বাড়ে, একেক পদক্ষেপে।
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
                  {['১', '২', '৩'][i]}
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
