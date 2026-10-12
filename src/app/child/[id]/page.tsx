import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Sparkles, Flame, Award, Gift, TrendingUp, CheckCircle2, Clock, AlertCircle, History } from 'lucide-react'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Avatar } from '@/components/deensteps/app-shell'
import { Logo } from '@/components/deensteps/brand'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { ChildTaskList } from '@/components/deensteps/child-task-list'
import { RewardRequestButton } from '@/components/deensteps/reward-request-button'
import { IncidentReportButton } from '@/components/deensteps/incident-report-button'
import { SadaqahButton } from '@/components/deensteps/sadaqah-button'
import { TASK_STATUS_META } from '@/lib/constants'
import { format, startOfWeek, endOfWeek, subDays, differenceInCalendarDays } from 'date-fns'

export default async function ChildDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: childId } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) redirect('/dashboard')
  if (child.status === 'ARCHIVED') redirect('/children')

  // Today's occurrences for this child
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const todayOccurrences = await db.taskOccurrence.findMany({
    where: {
      task: { assignments: { some: { childId: child.id } }, status: 'ACTIVE' },
      scheduledDate: { gte: todayStart, lte: todayEnd },
    },
    include: {
      task: true,
      submission: true,
    },
    orderBy: { dueTime: 'asc' },
  })

  // Stats
  const balance = await db.pointsTransaction.aggregate({
    where: { childId: child.id },
    _sum: { amount: true },
  })
  const currentBalance = balance._sum.amount ?? 0

  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
  const weekPoints = await db.pointsTransaction.aggregate({
    where: { childId: child.id, type: 'EARNED', createdAt: { gte: weekStart, lte: weekEnd } },
    _sum: { amount: true },
  })

  // Lifetime points
  const lifetime = await db.pointsTransaction.aggregate({
    where: { childId: child.id, type: 'EARNED' },
    _sum: { amount: true },
  })

  // Today's completion
  const todayTotal = todayOccurrences.length
  const todayApproved = todayOccurrences.filter((o) => o.status === 'APPROVED').length
  const todaySubmitted = todayOccurrences.filter((o) => o.status === 'SUBMITTED').length
  const todayCompletion = todayTotal > 0 ? Math.round((todayApproved / todayTotal) * 100) : 0

  // Streak: count consecutive days (ending today or yesterday) with at least one approved task
  const recentApprovedDates = await db.taskOccurrence.findMany({
    where: {
      task: { assignments: { some: { childId: child.id } } },
      status: 'APPROVED',
      scheduledDate: { gte: subDays(new Date(), 30) },
    },
    select: { scheduledDate: true },
    distinct: ['scheduledDate'],
    orderBy: { scheduledDate: 'desc' },
  })
  let streak = 0
  if (recentApprovedDates.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const first = new Date(recentApprovedDates[0].scheduledDate)
    first.setHours(0, 0, 0, 0)
    if (differenceInCalendarDays(today, first) <= 1) {
      streak = 1
      for (let i = 1; i < recentApprovedDates.length; i++) {
        const prev = new Date(recentApprovedDates[i - 1].scheduledDate)
        prev.setHours(0, 0, 0, 0)
        const curr = new Date(recentApprovedDates[i].scheduledDate)
        curr.setHours(0, 0, 0, 0)
        if (differenceInCalendarDays(prev, curr) === 1) {
          streak++
        } else {
          break
        }
      }
    }
  }

  // Rewards (sorted by required points)
  const rewards = await db.reward.findMany({
    where: { familyId: family.id, status: 'ACTIVE', rewardType: 'POINTS' },
    orderBy: { requiredPoints: 'asc' },
  })

  // Recent achievements
  const achievements = await db.childAchievement.findMany({
    where: { childId: child.id },
    include: { achievement: true },
    orderBy: { awardedAt: 'desc' },
    take: 6,
  })

  // Recent point transactions
  const recentTxns = await db.pointsTransaction.findMany({
    where: { childId: child.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Recent redemptions
  const recentRedemptions = await db.rewardRedemption.findMany({
    where: { childId: child.id },
    orderBy: { requestedAt: 'desc' },
    take: 3,
    include: { reward: true },
  })

  // Pending parent approvals (submitted tasks awaiting review)
  const pendingApprovals = todayOccurrences.filter((o) => o.status === 'SUBMITTED').length

  // Phase 1 (S1.3): Recent missed tasks (last 3 days, not excused)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  threeDaysAgo.setHours(0, 0, 0, 0)

  const missedTasks = await db.taskOccurrence.findMany({
    where: {
      task: { assignments: { some: { childId: child.id } }, status: 'ACTIVE' },
      status: 'MISSED',
      scheduledDate: { gte: threeDaysAgo, lt: todayStart },
    },
    orderBy: { scheduledDate: 'desc' },
    take: 3,
    include: { task: { select: { title: true, iconKey: true } } },
  })

  // Phase 4 (S4.2): Sadaqah causes for child
  const sadaqahCauses = await db.sadaqahCause.findMany({
    where: { familyId: family.id, active: true },
    select: { id: true, title: true, description: true, iconKey: true },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Child dashboard header — separate from parent app shell */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> পরিবারে ফিরুন</Link>
            </Button>
          </div>
          <Logo />
          <div className="flex items-center gap-2">
            <Avatar color={child.avatarColor} name={child.displayName} size="sm" />
            <span className="hidden text-sm font-medium text-foreground sm:inline">{child.displayName}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Greeting */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {format(new Date(), 'EEEE, MMMM d')}
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            আসসালামু আলাইকুম, {child.displayName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            আজকের কাজগুলো এখানে। একেক পদক্ষেপে এগিয়ে যাও — প্রতিটি ভালো কাজ গণ্য হয়।
          </p>
        </div>

        {/* Phase 1 (S1.3): Encouraging message for missed tasks */}
        {missedTasks.length > 0 && (
          <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-foreground">
                  কোনো সমস্যা নেই — আজ আবার নতুন করে শুরু করি! 🌱
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  গত কয়েকদিনে কিছু কাজ মিস হয়েছে। তারা কাটা হয়নি — শুধু আজ থেকে আবার চেষ্টা করো।
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {missedTasks.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs text-muted-foreground">
                      <DynamicIcon iconKey={m.task.iconKey} className="h-3 w-3" />
                      {m.task.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3 (S3.1): Incident report button */}
        {/* Phase 4 (S4.2): Sadaqah button */}
        <div className="mb-4 flex flex-wrap gap-2">
          <IncidentReportButton childId={child.id} />
          <SadaqahButton childId={child.id} causes={sadaqahCauses} currentBalance={currentBalance} />
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Star} label="আমার তারা" value={currentBalance} accent="amber" />
          <StatCard icon={TrendingUp} label="এই সপ্তাহ" value={`+${weekPoints._sum.amount ?? 0}`} accent="emerald" />
          <StatCard icon={Flame} label="ধারাবাহিক দিন" value={streak} accent="orange" />
          <StatCard icon={CheckCircle2} label="আজ সম্পন্ন" value={`${todayApproved}/${todayTotal}`} accent="sage" />
        </div>

        {/* Phase 1 (S1.4): Ledger access button */}
        <div className="mb-6">
          <Button asChild variant="outline" className="w-full justify-center gap-2">
            <Link href={`/child/${child.id}/ledger`}>
              <History className="h-4 w-4" />
              আমার তারার হিসাব
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">আজকের কাজ</CardTitle>
                    <CardDescription>
                      {todayTotal === 0
                        ? 'আজ কোনো কাজ নির্ধারিত নেই। দিনটি উপভোগ করো!'
                        : `${todayApproved} / ${todayTotal} সম্পন্ন · ${todayCompletion}%`}
                    </CardDescription>
                  </div>
                  {pendingApprovals > 0 && (
                    <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      <Clock className="h-3 w-3" /> {pendingApprovals} অপেক্ষমান
                    </Badge>
                  )}
                </div>
                {todayTotal > 0 && (
                  <Progress value={todayCompletion} className="mt-2 h-2" />
                )}
              </CardHeader>
              <CardContent>
                <ChildTaskList occurrences={todayOccurrences.map((o) => ({
                  id: o.id,
                  status: o.status,
                  dueTime: o.dueTime,
                  taskTitle: o.task.title,
                  taskDescription: o.task.description,
                  taskInstructions: o.task.instructions,
                  category: o.task.category,
                  iconKey: o.task.iconKey,
                  pointsValue: o.task.pointsValue,
                  approvalPolicy: o.task.approvalPolicy,
                  submissionNote: o.submission?.note ?? null,
                  reviewerNote: o.submission?.reviewerNote ?? null,
                  childId: child.id,
                }))} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: rewards + challenge + achievements */}
          <div className="space-y-6">
            {/* Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Gift className="h-5 w-5 text-amber-500" /> পুরস্কার
                </CardTitle>
                <CardDescription>তারা জমিয়ে এগুলো আনলক করো।</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rewards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">এখনো কোনো পুরস্কার নেই — বাবা-মাকে যোগ করতে বলো!</p>
                ) : (
                  rewards.slice(0, 4).map((r) => {
                    const progress = r.requiredPoints > 0 ? Math.min(100, Math.round((currentBalance / r.requiredPoints) * 100)) : 100
                    const remaining = Math.max(0, r.requiredPoints - currentBalance)
                    const eligible = currentBalance >= r.requiredPoints
                    const catLabel = r.category === 'EXPERIENCE' ? 'অভিজ্ঞতা' : r.category === 'LEARNING' ? 'শেখা' : r.category === 'PRIVILEGE' ? 'সুবিধা' : 'খাবার'
                    return (
                      <div key={r.id} className="rounded-xl border border-border bg-card p-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <DynamicIcon iconKey={r.iconKey} className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-semibold text-foreground">{r.title}</p>
                              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{catLabel}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{r.requiredPoints} তারা</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {eligible ? 'প্রস্তুত!' : `${remaining} তারা বাকি`}
                          </span>
                          <span className="font-medium text-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="mt-1 h-1.5" />
                        <RewardRequestButton
                          rewardId={r.id}
                          childId={child.id}
                          eligible={eligible}
                          requiredPoints={r.requiredPoints}
                          currentBalance={currentBalance}
                        />
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" /> অর্জন
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">প্রথম ব্যাজ অর্জন করতে কাজ সম্পন্ন করো!</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {achievements.map((a) => (
                      <div key={a.id} className="flex flex-col items-center rounded-lg border border-border bg-card p-2 text-center">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                          <DynamicIcon iconKey={a.achievement.iconKey} className="h-4 w-4" />
                        </span>
                        <p className="mt-1 text-[10px] font-medium text-foreground">{a.achievement.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">সাম্প্রতিক তারা</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTxns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">এখনো কোনো তারা অর্জিত হয়নি।</p>
                ) : (
                  <ul className="space-y-2">
                    {recentTxns.map((t) => (
                      <li key={t.id} className="flex items-center justify-between text-sm">
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">{t.description}</span>
                        <span className={t.amount >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                          {t.amount >= 0 ? '+' : ''}{t.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {recentRedemptions.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">সাম্প্রতিক রিডিম্পশন</p>
                    <ul className="space-y-1.5">
                      {recentRedemptions.map((r) => (
                        <li key={r.id} className="flex items-center justify-between text-xs">
                          <span className="truncate text-foreground">{r.reward.title}</span>
                          <Badge variant="outline" className="ml-2 text-[10px]">{r.status.toLowerCase()}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  accent: 'emerald' | 'amber' | 'sage' | 'orange'
}) {
  const accentClass: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    sage: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accentClass[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="mt-2 text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
