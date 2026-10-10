import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Sparkles, CheckCheck, Trophy, Flame, Sun, BookOpen } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="pattern-geometric absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>For families building good habits together</span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Raise Good Habits.{' '}
              <span className="text-gradient-emerald">Celebrate Every Step.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
              A joyful family habit-building platform that helps parents nurture
              Islamic practices, good character, daily responsibility, and
              consistency — through personalized tasks and meaningful rewards.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">
                  Start Your Family Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="#how-it-works">Explore How It Works</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>Free forever plan</span>
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>Child-safe by design</span>
              </div>
            </div>
          </div>

          {/* Product mockup */}
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
      {/* Parent dashboard card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Family Overview</p>
            <p className="font-display text-lg font-bold text-foreground">The Rahman Family</p>
          </div>
          <div className="flex -space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-2 ring-card">Z</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white ring-2 ring-card">M</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="mt-1 text-lg font-bold text-foreground">82%</p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="mt-1 text-lg font-bold text-foreground">2</p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Stars</p>
            <p className="mt-1 text-lg font-bold text-foreground">95</p>
          </div>
        </div>
      </div>

      {/* Child checklist card — overlapping */}
      <div className="absolute -bottom-8 -left-2 w-56 rounded-2xl border border-border bg-card p-4 shadow-premium sm:-left-6 lg:-left-10">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold text-foreground">Zayd&apos;s today</p>
          <Sun className="h-4 w-4 text-amber-500" />
        </div>
        <ul className="mt-3 space-y-2">
          <li className="flex items-center gap-2 text-xs">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCheck className="h-2.5 w-2.5" />
            </span>
            <span className="text-foreground line-through opacity-70">Make my bed</span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCheck className="h-2.5 w-2.5" />
            </span>
            <span className="text-foreground line-through opacity-70">Morning Quran</span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            <span className="h-4 w-4 rounded-full border-2 border-amber-400" />
            <span className="text-foreground">Practice dua</span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            <span className="text-muted-foreground">Reading time</span>
          </li>
        </ul>
      </div>

      {/* Reward progress card — overlapping */}
      <div className="absolute -right-2 -top-6 w-52 rounded-2xl border border-border bg-card p-4 shadow-premium sm:-right-6 lg:-right-10">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold text-foreground">Next reward</p>
          <Trophy className="h-4 w-4 text-amber-500" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Family Outing</p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            72 / 100
          </span>
          <span className="text-muted-foreground">72%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '72%' }} />
        </div>
      </div>

      {/* Floating weekly summary chip */}
      <div className="absolute -bottom-4 right-6 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft sm:flex">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-xs font-medium text-foreground">5-day streak</span>
        <BookOpen className="ml-1 h-3.5 w-3.5 text-emerald-600" />
        <span className="text-xs font-medium text-foreground">Quran milestone</span>
      </div>
    </div>
  )
}
