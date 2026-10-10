import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Sparkles, CheckCheck, Trophy, Flame, Sun, BookOpen } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="pattern-geometric absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* কপি */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>পরিবার মিলে ভালো অভ্যাস গড়ুন</span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              ভালো অভ্যাস গড়ুন।{' '}
              <span className="text-gradient-emerald">প্রতিটি পদক্ষেপ উদযাপন করুন।</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
              একটি আনন্দময় পরিবার-কেন্দ্রিক প্ল্যাটফর্ম। বাবা-মা তাদের সন্তানদের শেখান ইসলামি অভ্যাস, সুন্দর চরিত্র, দৈনন্দিন দায়িত্ব আর ধারাবাহিকতা — ছোট ছোট কাজ আর অর্থপূর্ণ পুরস্কারের মাধ্যমে।
            </p>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              আজকের ছোট ভালো কাজ — আখিরাতে বড় পুরস্কার। দুনিয়ায় সুন্দর জীবন। আর আল্লাহর ভালোবাসা।
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">
                  আপনার পরিবার শুরু করুন
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="#how-it-works">যেভাবে কাজ করে দেখুন</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>ক্রেডিট কার্ড লাগবে না</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>ফ্রি প্ল্যান চিরকাল</span>
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>শিশু-নিরাপদ ডিজাইন</span>
              </div>
            </div>
          </div>

          {/* প্রোডাক্ট মকআপ */}
          <div className="relative">
            <HeroProductMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroProductMockup() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      {/* প্যারেন্ট ড্যাশবোর্ড কার্ড */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">পরিবারের সারসংক্ষেপ</p>
            <p className="font-display text-lg font-bold text-foreground">রহমান পরিবার</p>
          </div>
          <div className="flex -space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-2 ring-card">জ</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white ring-2 ring-card">ম</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">আজ</p>
            <p className="mt-1 text-lg font-bold text-foreground">৮২%</p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">অপেক্ষমান</p>
            <p className="mt-1 text-lg font-bold text-foreground">২</p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">তারা</p>
            <p className="mt-1 text-lg font-bold text-foreground">৯৫</p>
          </div>
        </div>
      </div>

      {/* চাইল্ড চেকলিস্ট কার্ড */}
      <div className="absolute -bottom-8 -left-2 w-56 rounded-2xl border border-border bg-card p-4 shadow-premium sm:-left-6 lg:-left-10">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold text-foreground">জাইদের আজকের কাজ</p>
          <Sun className="h-4 w-4 text-amber-500" />
        </div>
        <ul className="mt-3 space-y-2">
          <li className="flex items-center gap-2 text-xs">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCheck className="h-2.5 w-2.5" />
            </span>
            <span className="text-foreground line-through opacity-70">বিছানা গুছিয়ে নাও</span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCheck className="h-2.5 w-2.5" />
            </span>
            <span className="text-foreground line-through opacity-70">সকালে কুরআন পড়া</span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            <span className="h-4 w-4 rounded-full border-2 border-amber-400" />
            <span className="text-foreground">দোয়া অনুশীলন</span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            <span className="text-muted-foreground">বই পড়ার সময়</span>
          </li>
        </ul>
      </div>

      {/* পুরস্কার প্রগ্রেস কার্ড */}
      <div className="absolute -right-2 -top-6 w-52 rounded-2xl border border-border bg-card p-4 shadow-premium sm:-right-6 lg:-right-10">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold text-foreground">পরবর্তী পুরস্কার</p>
          <Trophy className="h-4 w-4 text-amber-500" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">পরিবারের সাথে বেড়াতে যাওয়া</p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            ৭২ / ১০০
          </span>
          <span className="text-muted-foreground">৭২%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '72%' }} />
        </div>
      </div>

      {/* ভাসমান সাপ্তাহিক সারসংক্ষেপ চিপ */}
      <div className="absolute -bottom-4 right-6 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft sm:flex">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-xs font-medium text-foreground">৫ দিন ধারাবাহিক</span>
        <BookOpen className="ml-1 h-3.5 w-3.5 text-emerald-600" />
        <span className="text-xs font-medium text-foreground">কুরআন মাইলস্টোন</span>
      </div>
    </div>
  )
}
