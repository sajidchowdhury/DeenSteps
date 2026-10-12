import Link from 'next/link'
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Star,
  Gift,
  Plus,
  ArrowRight,
  TrendingUp,
  ListChecks,
  AlertCircle,
  Heart,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { getDashboardData } from '@/server/actions/dashboard-actions'
import { getSetupProgress } from '@/server/actions/setup-progress-actions'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SetupProgressBar } from '@/components/deensteps/setup-progress-bar'
import { WeeklyTrendChart, CategoryDonutChart, ChildProgressBars } from '@/components/deensteps/dashboard-charts'
import { MissedTasksSection } from '@/components/deensteps/missed-tasks-section'
import { IncidentsSection } from '@/components/deensteps/incidents-section'
import { ResolvedIncidentsSection } from '@/components/deensteps/resolved-incidents-section'
import { SadaqahReviewSection } from '@/components/deensteps/sadaqah-review-section'
import { SadaqahHistorySection } from '@/components/deensteps/sadaqah-history-section'
import { WeeklyReflectionSection } from '@/components/deensteps/weekly-reflection-section'
import { MilestoneProgressSection } from '@/components/deensteps/milestone-progress-section'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const data = await getDashboardData()
  const setupProgress = await getSetupProgress()

  // Children list for sidebar
  const childrenList = data.children.map((c) => ({
    id: c.child.id,
    displayName: c.child.displayName,
    avatarColor: c.child.avatarColor,
  }))

  return (
    <AppShell familyName={family.name} pendingCount={data.stats.pendingApprovals} childrenList={childrenList}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Greeting */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              আসসালামু আলাইকুম, {user.name?.split(' ')[0] ?? 'সাথী'} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')} · আজকে আপনার পরিবার কেমন আছে দেখুন।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/tasks"><Plus className="mr-1.5 h-4 w-4" /> নতুন কাজ</Link>
            </Button>
          </div>
        </div>

        {/* Setup progress bar — সেটআপ সম্পূর্ণ হলে আপনাআপনি গায়েব */}
        <SetupProgressBar progress={setupProgress} />

        {/* ════════════════════════════════════════════════════════════════
            Phase C (C1): "What to do now" hero
            Surfaces the 3 actionable items at the top: review, incidents, sadaqah.
            Only shows non-zero items. If everything is zero, shows a "all done" message.
            This replaces the old inline review section + makes incidents/sadaqah
            discoverable without scrolling through 17 sections.
            ════════════════════════════════════════════════════════════════ */}
        <WhatToDoNowHero
          pendingReviewCount={data.stats.pendingApprovals}
          openIncidentsCount={data.openIncidents.length}
          pendingSadaqahCount={data.pendingSadaqah.length}
        />

        {/* ════════════════════════════════════════════════════════════════
            Phase C (C2): Quick Actions — moved UP from the bottom of the page.
            Was buried after 15 sections; now right after the hero so parents
            can jump to common tasks immediately.
            ════════════════════════════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">দ্রুত কাজ</CardTitle>
            <CardDescription>প্রয়োজনীয় পৃষ্ঠাগুলোতে দ্রুত যান।</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction icon={Plus} label="নতুন কাজ" href="/tasks" />
            <QuickAction icon={Gift} label="পুরস্কার যোগ" href="/rewards" />
            <QuickAction icon={TrendingUp} label="রিপোর্ট দেখুন" href="/reports" />
            <QuickAction icon={Users} label="সন্তান ম্যানেজ" href="/children" />
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <SummaryCard icon={Users} label="সন্তান" value={data.stats.totalChildren} accent="emerald" href="/children" />
          <SummaryCard icon={ShieldCheck} label="রিভিউ বাকি" value={data.stats.pendingApprovals} accent="amber" href="/review" />
          <SummaryCard icon={CheckCircle2} label="আজকের সম্পন্ন" value={`${data.stats.todayFamilyCompletion}%`} accent="sage" />
          <SummaryCard icon={Star} label="এই সপ্তাহের তারা" value={data.stats.weekFamilyPoints} accent="gold" />
          <SummaryCard icon={ListChecks} label="কাজ" value={data.stats.activeTasks ?? 0} accent="violet" href="/tasks" />
          <SummaryCard icon={Gift} label="উপলব্ধ পুরস্কার" value={data.stats.upcomingRewards.length} accent="rose" href="/rewards" />
        </div>

        {/* Family overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-display">পরিবারের সারসংক্ষেপ</CardTitle>
              <CardDescription>আজ আর এই সপ্তাহে প্রতিটি সন্তানের অগ্রগতি।</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/children">ম্যানেজ <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.children.length === 0 ? (
              <EmptyState
                icon={Users}
                title="এখনো কোনো সন্তান নেই"
                description="প্রথম সন্তানের প্রোফাইল যোগ করে কাজ নির্ধারণ শুরু করুন।"
                action={<Button asChild><Link href="/children">সন্তান যোগ করুন</Link></Button>}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.children.map((c) => (
                  <ChildCard key={c.child.id} data={c} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phase C (C2): Inline review section removed.
            The "What to do now" hero above now surfaces pending reviews with
            a one-click link to /review. The full /review page has filters +
            batch approve (Phase C5). No need to duplicate the review queue on
            the dashboard. */}

        {/* Missed tasks section — Phase 1 (S1.3) */}
        <MissedTasksSection missedTasks={data.missedTasks} />

        {/* Incidents section — Phase 3 (S3.1) */}
        <IncidentsSection incidents={data.openIncidents} childrenList={childrenList} />

        {/* Family reward budget — Phase 2 (S2.3) */}
        {data.budgetInfo && (
          <Card className="border-sky-200 bg-sky-50/30 dark:border-sky-900 dark:bg-sky-950/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">এই মাসের পুরস্কার বাজেট</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
                    ৳{data.budgetInfo.remaining} <span className="text-sm font-normal text-muted-foreground">/ ৳{data.budgetInfo.monthlyBudget}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">খরচ হয়েছে</p>
                  <p className="mt-1 text-lg font-bold text-rose-600">৳{data.budgetInfo.committed}</p>
                </div>
              </div>
              <Progress
                value={Math.min(100, Math.round((data.budgetInfo.committed / data.budgetInfo.monthlyBudget) * 100))}
                className="mt-3 h-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {data.budgetInfo.remaining > 0
                  ? `আর ৳${data.budgetInfo.remaining} বাকি আছে এই মাসে।`
                  : 'এই মাসের বাজেট শেষ — পরের মাসে নতুন পুরস্কার অনুরোধ করা যাবে।'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Charts section — চার্ট ও ইনসাইট */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 7-day trend line chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                গত ৭ দিনের তারা অর্জন
              </CardTitle>
              <CardDescription>প্রতিদিনের পয়েন্ট ট্রেন্ড — সন্তান অনুযায়ী।</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyTrendChart data={data.trendByChild} />
            </CardContent>
          </Card>

          {/* Category donut chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">৩০ দিনের কাজের ধরন</CardTitle>
              <CardDescription>কোন ক্যাটাগরিতে বেশি কাজ হচ্ছে।</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDonutChart counts={data.categoryCounts} />
            </CardContent>
          </Card>
        </div>

        {/* Child-wise progress bars */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              আজকের সম্পন্ন — সন্তান অনুযায়ী
            </CardTitle>
            <CardDescription>প্রতিটি সন্তানের আজকের কাজ সম্পন্নের শতাংশ।</CardDescription>
          </CardHeader>
          <CardContent>
            <ChildProgressBars childStats={data.children} />
          </CardContent>
        </Card>

        {/* Resolved incidents history — Phase 3 (S3.3) */}
        <ResolvedIncidentsSection incidents={data.resolvedIncidents} />

        {/* Sadaqah review section — Phase 4 (S4.2) */}
        <SadaqahReviewSection donations={data.pendingSadaqah} />

        {/* Sadaqah history — Phase 4 (S4.3) */}
        <SadaqahHistorySection history={data.sadaqahHistory} />

        {/* Weekly reflection — Phase 5 (S5.1) */}
        <WeeklyReflectionSection childrenList={childrenList} recentReflections={data.recentReflections} />

        {/* Monthly milestone progress — Phase 5 (S5.2) */}
        <MilestoneProgressSection progress={data.milestoneProgress} />

        {/* Phase C (C2): Removed the old "recent activity + quick actions + recent stars"
            two-column section at the bottom. Quick Actions moved up to right after
            the hero. Recent submissions are now surfaced via the "what to do now"
            hero + the /review page. Recent stars are on /reports. The dashboard
            is now shorter and more focused. */}
      </div>
    </AppShell>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Phase C (C1): "What to do now" hero
// Surfaces the 3 actionable items at the top of the dashboard.
// Only shows non-zero items. If everything is zero, shows a calm "all done" message.
// ────────────────────────────────────────────────────────────────────────────

function WhatToDoNowHero({
  pendingReviewCount,
  openIncidentsCount,
  pendingSadaqahCount,
}: {
  pendingReviewCount: number
  openIncidentsCount: number
  pendingSadaqahCount: number
}) {
  const hasAnything = pendingReviewCount > 0 || openIncidentsCount > 0 || pendingSadaqahCount > 0

  if (!hasAnything) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <CardContent className="flex items-center gap-3 p-5">
          <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-base font-bold text-foreground">সব কাজ শেষ! ✨</p>
            <p className="text-sm text-muted-foreground">এখন কোনো অপেক্ষমান কাজ নেই। পরিবারের সাথে সময় কাটান। 🌿</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-muted-foreground">আজকে যা করতে হবে:</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Review */}
        {pendingReviewCount > 0 && (
          <Link href="/review" className="group">
            <Card className="h-full border-amber-200 bg-amber-50/40 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{pendingReviewCount} টি রিভিউ বাকি</p>
                  <p className="text-xs text-muted-foreground">সন্তানের সাবমিশন অনুমোদন করুন</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-amber-500 transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Incidents */}
        {openIncidentsCount > 0 && (
          <Link href="#incidents" className="group">
            <Card className="h-full border-rose-200 bg-rose-50/40 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{openIncidentsCount} টি ইনসিডেন্ট</p>
                  <p className="text-xs text-muted-foreground">সন্তানের সমস্যা দেখুন</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-rose-500 transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Sadaqah */}
        {pendingSadaqahCount > 0 && (
          <Link href="#sadaqah" className="group">
            <Card className="h-full border-emerald-200 bg-emerald-50/40 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Heart className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{pendingSadaqahCount} টি সাদাকাহ</p>
                  <p className="text-xs text-muted-foreground">সন্তানের দান নিশ্চিত করুন</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-emerald-500 transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  accent: 'emerald' | 'amber' | 'sage' | 'gold' | 'violet' | 'rose'
  href?: string
}) {
  const accentClass: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    sage: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  }
  const content = (
    <Card className="overflow-hidden transition-shadow hover:shadow-premium">
      <CardContent className="p-5">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accentClass[accent]}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}

function ChildCard({ data }: { data: Awaited<ReturnType<typeof getDashboardData>>['children'][number] }) {
  const { child, todayCompletion, balance, weekPoints, pendingSubmissions, nextReward, todayTotal, todayApproved } = data
  const rewardProgress = nextReward && nextReward.requiredPoints > 0
    ? Math.min(100, Math.round((balance / nextReward.requiredPoints) * 100))
    : 0
  const rewardRemaining = nextReward ? Math.max(0, nextReward.requiredPoints - balance) : 0

  return (
    <Link href={`/child/${child.id}`} className="block">
      <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-premium">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Avatar color={child.avatarColor} name={child.displayName} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold text-foreground">{child.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {child.ageRange ? `${child.ageRange} বছর` : 'বয়স সেট করা নেই'}
                {pendingSubmissions > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    {pendingSubmissions} অপেক্ষমাণ
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">আজ</span>
              <span className="font-semibold text-foreground">{todayApproved}/{todayTotal} কাজ · {todayCompletion}%</span>
            </div>
            <Progress value={todayCompletion} className="mt-1.5 h-1.5" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">ব্যালেন্স</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-lg font-bold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {balance}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">এই সপ্তাহ</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-lg font-bold text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                +{weekPoints}
              </p>
            </div>
          </div>

          {nextReward && (
            <div className="mt-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">পরবর্তী: {nextReward.title}</span>
                <span className="text-muted-foreground">আর {rewardRemaining} বাকি</span>
              </div>
              <Progress value={rewardProgress} className="mt-1.5 h-1" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickAction({
  icon: Icon,
  label,
  href,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 text-sm font-medium text-foreground transition-colors hover:bg-accent/40"
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-10 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 font-display font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
