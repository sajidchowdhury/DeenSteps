import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, CheckCheck, Star } from 'lucide-react'
import { HeroFamilyScene } from '@/components/marketing/illustrations'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-warm-cream">
      <div className="pattern-dots absolute inset-0 opacity-60" aria-hidden="true" />
      {/* Soft color blobs */}
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-soft blur-3xl opacity-50" aria-hidden="true" />
      <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-sunshine blur-3xl opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>পরিবার মিলে ভালো অভ্যাস গড়ুন</span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              ছোট ছোট ভালো অভ্যাসে,{' '}
              <span className="text-gradient-emerald">সুন্দর মানুষ হয়ে ওঠা।</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
              নামাজ, কুরআন, ভালো আচরণ আর দায়িত্ববোধ — সন্তানের প্রতিদিনের শেখাকে আনন্দময় করে তুলুন।
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">
                  পরিবারের যাত্রা শুরু করুন
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="#how-it-works">কীভাবে কাজ করে দেখুন</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>ফ্রি প্ল্যান চিরকাল</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>শিশু-নিরাপদ ডিজাইন</span>
              </div>
            </div>
          </div>

          {/* Right — illustrated scene */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroFamilyScene />
          </div>
        </div>
      </div>
    </section>
  )
}
