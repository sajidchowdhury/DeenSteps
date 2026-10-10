import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 px-8 py-14 text-center text-white sm:px-16">
          <div
            className="absolute inset-0 opacity-10"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, oklch(0.95 0.05 95) 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, oklch(0.95 0.05 95) 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ফ্রি প্ল্যান চিরকাল — ক্রেডিট কার্ড লাগবে না</span>
            </div>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              আজই ভালো অভ্যাস গড়া শুরু করুন
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50/90">
              পরিবারের সাথে যুক্ত হন — ইসলামি অভ্যাস, সুন্দর চরিত্র আর দৈনন্দিন দায়িত্ব গড়ে তুলুন। একেকটি ছোট, অর্থপূর্ণ পদক্ষেপে।
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/register">
                  আপনার পরিবার শুরু করুন
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto">
                <Link href="/login">সাইন ইন</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
