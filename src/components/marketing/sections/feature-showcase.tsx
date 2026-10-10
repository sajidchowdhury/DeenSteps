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
  { icon: Users, title: 'একাধিক সন্তান প্রোফাইল', description: 'প্রতিটি সন্তানের নিজস্ব প্রাইভেট প্রোফাইল, কাজ আর পুরস্কারের অগ্রগতি — একটি পারিবারিক ওয়ার্কস্পেসে।' },
  { icon: ListChecks, title: 'কাস্টমাইজযোগ্য কাজ', description: 'একবারি, দৈনিক, সাপ্তাহিক বা কাস্টম কাজ তৈরি করুন। পয়েন্ট, সময় আর অনুমোদন নীতি নির্ধারণ করুন।' },
  { icon: CalendarDays, title: 'দৈনিক ও সাপ্তাহিক ট্র্যাকিং', description: 'আপনার পরিবারের টাইমজোন অনুযায়ী কাজ তৈরি হয় — কোনো ডুপ্লিকেট নেই, কোনো মিসড দিন নেই।' },
  { icon: ShieldCheck, title: 'বাবা-মায়ের অনুমোদন', description: 'প্রতিটি সাবমিশন রিভিউ করুন। অনুমোদন দিন, সংশোধন চান, বা গঠনমূলক মন্তব্যসহ ফেরত পাঠান।' },
  { icon: Star, title: 'পয়েন্ট ও পুরস্কার', description: 'একটি আসল লেজার প্রতিটি পয়েন্ট ট্র্যাক করে — অর্জিত, খরচ হওয়া, ফেরত পাওয়া। কখনোই শুধু একটি এডিটযোগ্য সংখ্যা নয়।' },
  { icon: Target, title: 'সাপ্তাহিক চ্যালেঞ্জ', description: 'সপ্তাহের জন্য একটি লক্ষ্য নির্ধারণ করুন আর সন্তানকে একটি অর্থপূর্ণ পুরস্কারের দিকে এগিয়ে যেতে দিন।' },
  { icon: Trophy, title: 'মাসিক মাইলস্টোন', description: 'সাপ্তাহিক ফলাফল মাসিক মাইলস্টোনে পরিণত হয় — কনফিগারযোগ্য কোয়ালিফিকেশন নিয়মসহ।' },
  { icon: BarChart3, title: 'পারিবারিক অগ্রগতি রিপোর্ট', description: 'দৈনিক, সাপ্তাহিক আর মাসিক রিপোর্ট দেখুন — চার্ট সহ, যা গঠনমূলক কথোপকথনে সাহায্য করে।' },
  { icon: Sparkles, title: 'ইসলামি অভ্যাস টেমপ্লেট', description: 'নামাজ, কুরআন, দোয়া, সততা, দয়া আর কৃতজ্ঞতার জন্য অপশনাল টেমপ্লেট — সম্পূর্ণ কনফিগারযোগ্য।' },
  { icon: Heart, title: 'শিশু-বান্ধব ড্যাশবোর্ড', description: 'রঙিন, বয়স-উপযোগী ড্যাশবোর্ড যা ব্যক্তিগত অগ্রগতি উদযাপন করে — কখনো ভাই-বোনের তুলনা করে না।' },
  { icon: Smartphone, title: 'মোবাইল-ফার্স্ট অভিজ্ঞতা', description: 'ফোন, ট্যাবলেট, ল্যাপটপ আর ডেস্কটপ — সব স্ক্রিনে রেসপন্সিভ। সর্বত্র টাচ-ফ্রেন্ডলি।' },
  { icon: Baby, title: 'শিশুদের ইমেইল লাগে না', description: 'সন্তানের আলাদা অ্যাকাউন্ট লাগে না — তারা আপনার পরিবারের ওয়ার্কস্পেস থেকেই নিরাপদে তাদের ড্যাশবোর্ড দেখে।' },
]

export function FeatureShowcaseSection() {
  return (
    <section id="features" className="border-t border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">ফিচার</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ভালো অভ্যাস গড়তে যা যা দরকার
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            একটি সম্পূর্ণ, প্রোডাকশন-গ্রেড অভ্যাস ও পুরস্কার প্ল্যাটফর্ম — শুধু একটি স্ট্যাটিক প্রোটোটাইপ নয়। প্রতিটি কাজ সত্যিকারের পারসিস্টেন্ট ডেটার সাথে যুক্ত।
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
