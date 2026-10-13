import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { FamilyGrowingIllustration } from '@/components/marketing/illustrations'

export function CtaSection() {
  return (
    <section className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-cream to-sky-soft px-8 py-14 sm:px-16">
          <div className="pattern-dots absolute inset-0 opacity-40" aria-hidden="true" />

          <div className="relative grid items-center gap-10 sm:grid-cols-2">
            {/* Copy */}
            <div className="text-center sm:text-left">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                সন্তানের সুন্দর আগামী গড়ার শুরু হোক আজই।
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ইসলামি অভ্যাস, সাদাকাহ, বিনিয়োগ — সব এক জায়গায়। একটি ভালো অভ্যাস দিয়ে শুরু করুন, ধীরে ধীরে এগিয়ে চলুন, একসঙ্গে।
              </p>
              <div className="mt-7">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/register">
                    শুরু করি
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Illustration */}
            <div className="mx-auto w-full max-w-xs">
              <FamilyGrowingIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
