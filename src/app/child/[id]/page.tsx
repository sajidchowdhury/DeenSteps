import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Sparkles, Flame, Gift, Clock, History, Trophy, Heart, HeartHandshake } from 'lucide-react'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Avatar } from '@/components/deensteps/app-shell'
import { Logo } from '@/components/deensteps/brand'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { Nur, NurSpeechBubble } from '@/components/deensteps/mascot'
import { ChildTaskList } from '@/components/deensteps/child-task-list'
import { RewardRequestButton } from '@/components/deensteps/reward-request-button'
import { IncidentReportButton } from '@/components/deensteps/incident-report-button'
import { SadaqahButton } from '@/components/deensteps/sadaqah-button'
import { getMilestoneProgressForChild } from '@/server/actions/milestone-actions'
import { getChildAchievementStatus, getEarnedChildAchievements } from '@/server/actions/achievement-actions'
import { AchievementGrid, AchievementCelebrationOverlay } from '@/components/deensteps/achievement-celebration'
import { TASK_STATUS_META } from '@/lib/constants'
import { format, startOfWeek, endOfWeek, subDays, differenceInCalendarDays } from 'date-fns'
import { cn } from '@/lib/utils'

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

  // Phase D (D4): Child achievement status — 12 badges with awarded state.
  // The engine (achievement-actions.ts) evaluates these after every APPROVED
  // task + sadaqah request + milestone qualification. This was hidden in
  // Phase A because the ChildAchievement table was never written to. Now
  // the engine is live, so we restore the অর্জন card with real data.
  const childAchievements = await getChildAchievementStatus(child.id)
  const earnedAchievements = await getEarnedChildAchievements(child.id)

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

  // Phase 4 (S4.3): Sadaqah pledge info for child
  const familySettings = await db.familySettings.findUnique({
    where: { familyId: family.id },
    select: { sadaqahPledgeEnabled: true, sadaqahStarsPerUnit: true, sadaqahCurrency: true, sadaqahAmountPerUnit: true },
  })

  // Phase 5 (S5.2): Monthly milestone progress for this child (gentle card)
  const milestoneProgress = await getMilestoneProgressForChild(child.id)

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
        {/* ════════════════════════════════════════════════════════════════
            Phase B (B2): "Today's Mission" hero
            Replaces: greeting block + 4-stat grid + ledger button + tiny pill buttons
            with a single cohesive hero featuring Nūr the mascot.
            ════════════════════════════════════════════════════════════════ */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-cream to-emerald-50/50 dark:border-amber-900/40 dark:from-amber-950/30 dark:via-secondary dark:to-emerald-950/20">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
            {/* Nūr mascot — mood + speech bubble depends on today's progress */}
            <div className="flex flex-shrink-0 flex-col items-center gap-2 self-center">
              <Nur
                state={todayApproved > 0 ? 'proud' : 'happy'}
                size="lg"
                className="drop-shadow-sm"
              />
              {/* Phase E (E5): Contextual speech bubble */}
              <NurSpeechBubble size="sm">
                {todayTotal === 0
                  ? 'আজ কোনো কাজ নেই! 🌿'
                  : todayApproved === todayTotal
                    ? 'আলহামদুলিল্লাহ! সব শেষ! 🎉'
                    : todayApproved > 0
                      ? `দারুণ এগিয়ে চলোছ! 💪`
                      : 'শুরু করা যাক! ✨'}
              </NurSpeechBubble>
            </div>

            {/* Mission content */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {format(new Date(), 'EEEE, MMMM d')}
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                আসসালামু আলাইকুম, {child.displayName}!
              </h1>

              {/* Today's progress */}
              {todayTotal > 0 ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      আজকের মিশন: {todayApproved} / {todayTotal} সম্পন্ন
                    </span>
                    <span className="font-bold text-primary">{todayCompletion}%</span>
                  </div>
                  <Progress value={todayCompletion} className="mt-1.5 h-2.5" />
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  আজ কোনো কাজ নির্ধারিত নেই — দিনটি উপভোগ করো! 🌿
                </p>
              )}

              {/* Star + streak chips */}
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  {currentBalance} তারা
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                  <Flame className={cn("h-4 w-4 text-orange-500", streak > 0 && "animate-flame-flicker")} />
                  {streak} দিন ধারাবাহিক
                </span>
                <Link
                  href={`/child/${child.id}/ledger`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/40"
                >
                  <History className="h-4 w-4" />
                  তারার হিসাব
                </Link>
              </div>
            </div>
          </div>
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

        {/* ════════════════════════════════════════════════════════════════
            Phase B (B2): Two big action cards
            Replaces: tiny text-xs pill buttons in a flex-wrap row
            with two prominent cards: Sadaqah (emerald) + I need help (rose).
            Both are always visible — the child always knows where to find them.
            ════════════════════════════════════════════════════════════════ */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Sadaqah card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Heart className="h-6 w-6 animate-heart-beat" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">সাদাকাহ</p>
                <p className="text-xs text-muted-foreground">তোমার তারা দিয়ে ভালো কাজ করো</p>
              </div>
            </div>
            <div className="mt-3">
              <SadaqahButton childId={child.id} causes={sadaqahCauses} currentBalance={currentBalance} />
            </div>
          </div>

          {/* I need help card */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
                <HeartHandshake className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">সাহায্য চাই</p>
                <p className="text-xs text-muted-foreground">বাবা-মাকে একটি সমস্যা জানাও</p>
              </div>
            </div>
            <div className="mt-3">
              <IncidentReportButton childId={child.id} />
            </div>
          </div>
        </div>

        {/* Phase 4 (S4.3): Sadaqah pledge info */}
        {familySettings?.sadaqahPledgeEnabled && sadaqahCauses.length > 0 && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-foreground">
                  তোমার তারা দিয়ে ভালো কাজ করো! 🤲
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {familySettings.sadaqahStarsPerUnit} তারা = {familySettings.sadaqahCurrency === 'BDT' ? '৳' : familySettings.sadaqahCurrency + ' '}{familySettings.sadaqahAmountPerUnit} সাদাকাহ।
                  বাবা-মা প্রকৃত দান করবেন — তারা সরাসরি টাকা নয়।
                </p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  আল্লাহ বলেছেন: &ldquo;যে আল্লাহকে ভালো ঋণ দেবে, তিনি তার জন্য বহুগুণ বৃদ্ধি করবেন।&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Phase 5 (S5.2): Monthly milestone progress — gentle card */}
        {milestoneProgress && (
          <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40">
                <Trophy className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-foreground">
                  {milestoneProgress.qualified
                    ? 'এই মাসের মাইলস্টোন অর্জিত! 🎉'
                    : 'এই মাসের অগ্রগতি'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {milestoneProgress.qualified
                    ? `তুমি ${milestoneProgress.qualifyingWeeks}/${milestoneProgress.requiredWeeks} সপ্তাহ কোয়ালিফাই করেছ! আল্লাহ তোমার চেষ্টা কবুল করুন।`
                    : milestoneProgress.requiredWeeks - milestoneProgress.qualifyingWeeks === 1
                      ? `আর মাত্র ১ সপ্তাহ! প্রতি সপ্তাহে অন্তত একটি কাজ সম্পন্ন করলে গণ্য হবে।`
                      : `তুমি ${milestoneProgress.qualifyingWeeks}/${milestoneProgress.requiredWeeks} সপ্তাহ কোয়ালিফাই করেছ। আর ${milestoneProgress.requiredWeeks - milestoneProgress.qualifyingWeeks} সপ্তাহ বাকি!`}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    value={Math.min(100, Math.round((milestoneProgress.qualifyingWeeks / milestoneProgress.requiredWeeks) * 100))}
                    className={cn(
                      'h-2 flex-1',
                      // Phase E (E6): Glow-pulse when ≥80% of milestone
                      milestoneProgress.qualifyingWeeks / milestoneProgress.requiredWeeks >= 0.8 && !milestoneProgress.qualified && 'animate-glow-pulse'
                    )}
                  />
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                    {milestoneProgress.qualifyingWeeks}/{milestoneProgress.requiredWeeks}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  💜 ধারাবাহিকতাই আসল জয় — নিখুঁত হওয়ার নয়।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Phase B (B2): Old stat cards + ledger button removed.
            The "Today's Mission" hero above now shows: star count, streak,
            today's progress, and a link to the ledger. No need for a
            redundant 4-stat grid + full-width outline button. */}

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
                  learningPrompt: o.task.learningPrompt,
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

            {/* Phase D (D4): অর্জন — restored with real data.
                The child achievement engine (achievement-actions.ts) now
                writes to ChildAchievement after every APPROVED task,
                sadaqah request, and milestone qualification. 12 badges total. */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" /> অর্জন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AchievementGrid achievements={childAchievements} size="sm" />
                <div className="mt-3 text-center">
                  <Link
                    href={`/child/${child.id}/achievements`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    সব অর্জন দেখুন →
                  </Link>
                </div>
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

      {/* Phase D (D5): Achievement unlock celebration overlay.
          Detects newly-awarded achievements (via localStorage "seen" set)
          and shows a full-screen celebration with Nūr + confetti. */}
      <AchievementCelebrationOverlay childId={child.id} earnedAchievements={earnedAchievements} />
    </div>
  )
}
