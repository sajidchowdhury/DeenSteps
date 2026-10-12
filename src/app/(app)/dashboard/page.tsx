import Link from 'next/link'
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Star,
  Target,
  Gift,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  ListChecks,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { getDashboardData } from '@/server/actions/dashboard-actions'
import { getSetupProgress } from '@/server/actions/setup-progress-actions'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TASK_STATUS_META } from '@/lib/constants'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { SetupProgressBar } from '@/components/deensteps/setup-progress-bar'
import { ReviewActions } from '@/components/deensteps/review-actions'
import { WeeklyTrendChart, CategoryDonutChart, ChildProgressBars } from '@/components/deensteps/dashboard-charts'
import { MissedTasksSection } from '@/components/deensteps/missed-tasks-section'
import { IncidentsSection } from '@/components/deensteps/incidents-section'
import { ResolvedIncidentsSection } from '@/components/deensteps/resolved-incidents-section'
import { SadaqahReviewSection } from '@/components/deensteps/sadaqah-review-section'
import { SadaqahHistorySection } from '@/components/deensteps/sadaqah-history-section'
import { WeeklyReflectionSection } from '@/components/deensteps/weekly-reflection-section'
import { MilestoneProgressSection } from '@/components/deensteps/milestone-progress-section'
import { format, formatDistanceToNow } from 'date-fns'

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
              <Link href="/tasks"><Plus className="mr-1.5 h-4 w-4" /> নতুন চ্যালেঞ্জ</Link>
            </Button>
            {data.stats.pendingApprovals > 0 && (
              <Button asChild size="sm">
                <Link href="#review">
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> রিভিউ ({data.stats.pendingApprovals})
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Setup progress bar — সেটআপ সম্পূর্ণ হলে আপনাআপনি গায়েব */}
        <SetupProgressBar progress={setupProgress} />

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <SummaryCard icon={Users} label="সন্তান" value={data.stats.totalChildren} accent="emerald" href="/children" />
          <SummaryCard icon={ShieldCheck} label="রিভিউ বাকি" value={data.stats.pendingApprovals} accent="amber" href="/review" />
          <SummaryCard icon={CheckCircle2} label="আজকের সম্পন্ন" value={`${data.stats.todayFamilyCompletion}%`} accent="sage" />
          <SummaryCard icon={Star} label="এই সপ্তাহের তারা" value={data.stats.weekFamilyPoints} accent="gold" />
          <SummaryCard icon={ListChecks} label="চ্যালেঞ্জ" value={data.stats.totalChildren > 0 ? '✓' : '—'} accent="violet" href="/tasks" />
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

        {/* Inline Review section — ড্যাশবোর্ডেই রিভিউ করুন */}
        {data.pendingReviewSubmissions.length > 0 && (
          <Card id="review" className="scroll-mt-20 border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                    রিভিউ বাকি ({data.pendingReviewSubmissions.length})
                  </CardTitle>
                  <CardDescription>সন্তানের সাবমিশন এখানেই অনুমোদন বা ফেরত দিন।</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.pendingReviewSubmissions.map((s) => (
                  <li key={s.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar color={s.child.avatarColor} name={s.child.displayName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{s.child.displayName}</p>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(s.submittedAt, { addSuffix: true })}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <DynamicIcon iconKey={s.occurrence.task.iconKey} className="h-3.5 w-3.5" />
                            </span>
                            <p className="font-medium text-foreground">{s.occurrence.task.title}</p>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="text-xs">{s.occurrence.task.category}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              +{s.occurrence.task.pointsValue} {s.occurrence.task.approvalPolicy === 'AUTO' ? '(অটো)' : 'তারা'}
                            </Badge>
                          </div>
                          {s.note && (
                            <div className="mt-2 rounded-lg bg-secondary/60 p-2.5 text-xs text-foreground">
                              <span className="font-medium">সন্তানের নোট: </span>{s.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0">
                        <ReviewActions submissionId={s.id} pointsValue={s.occurrence.task.pointsValue} taskTitle={s.occurrence.task.title} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

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

        {/* Two-column: activity + quick actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent submissions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg">সাম্প্রতিক কার্যকলাপ</CardTitle>
              <CardDescription>আপনার পরিবারের সর্বশেষ কাজের সাবমিশন।</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentSubmissions.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="এখনো কোনো সাবমিশন নেই"
                  description="সন্তান কাজ জমা দিলে এখানে দেখা যাবে।"
                />
              ) : (
                <ul className="space-y-3">
                  {data.recentSubmissions.map((s) => (
                    <li key={s.id} className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                      <Avatar color={s.child.avatarColor} name={s.child.displayName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {s.child.displayName} জমা দিয়েছে{' '}
                            <span className="text-primary">{s.occurrence.task.title}</span>
                          </p>
                          <span className="flex-shrink-0 text-xs text-muted-foreground">
                            {formatDistanceToNow(s.submittedAt, { addSuffix: true })}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className={TASK_STATUS_META[s.decision ?? (s.occurrence.status as string)]?.tone ?? ''}>
                            {TASK_STATUS_META[s.decision ?? (s.occurrence.status as string)]?.label ?? s.occurrence.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{s.occurrence.task.category}</span>
                          {s.pointsAwarded > 0 && (
                            <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> +{s.pointsAwarded}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Quick actions + recent points */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">দ্রুত কাজ</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <QuickAction icon={Plus} label="নতুন চ্যালেঞ্জ" href="/tasks" />
                <QuickAction icon={Gift} label="পুরস্কার যোগ" href="/rewards" />
                <QuickAction icon={TrendingUp} label="রিপোর্ট দেখুন" href="/reports" />
                <QuickAction icon={Users} label="সন্তান ম্যানেজ" href="/children" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">সাম্প্রতিক তারা</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentTxns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">এখনো কোনো তারা অর্জিত হয়নি।</p>
                ) : (
                  <ul className="space-y-2">
                    {data.recentTxns.map((t) => (
                      <li key={t.id} className="flex items-center gap-2 text-sm">
                        <Avatar color={t.child.avatarColor} name={t.child.displayName} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">{t.description}</span>
                        <span className={t.amount >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                          {t.amount >= 0 ? '+' : ''}{t.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
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
                {child.ageRange ? `${child.ageRange} years` : 'Age not set'}
                {pendingSubmissions > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    {pendingSubmissions} pending
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Today</span>
              <span className="font-semibold text-foreground">{todayApproved}/{todayTotal} tasks · {todayCompletion}%</span>
            </div>
            <Progress value={todayCompletion} className="mt-1.5 h-1.5" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-lg font-bold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {balance}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">This week</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-lg font-bold text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                +{weekPoints}
              </p>
            </div>
          </div>

          {nextReward && (
            <div className="mt-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Next: {nextReward.title}</span>
                <span className="text-muted-foreground">{rewardRemaining} to go</span>
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
