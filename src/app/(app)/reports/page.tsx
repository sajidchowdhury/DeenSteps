import { redirect } from 'next/navigation'
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns'
import { BarChart3, CalendarDays, TrendingUp, Award, Sparkles, CheckCircle2, Clock, Star } from 'lucide-react'

import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DailyCompletionChart,
  WeeklyPointsChart,
  MonthlyCategoryChart,
  CHART_COLORS,
} from '@/components/deensteps/reports-charts'
import { TASK_CATEGORIES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const CATEGORY_COLORS: Record<string, string> = {
  'Islamic Practices': CHART_COLORS.emerald,
  'Character & Manners': CHART_COLORS.amber,
  'Personal Responsibility': CHART_COLORS.sage,
  'Learning & Development': CHART_COLORS.gold,
}

export default async function ReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const now = new Date()

  // ──────────────────────────────────────────────────────────────────────────
  // Common: children, sidebar
  // ──────────────────────────────────────────────────────────────────────────
  const [children, childrenList, pendingCount] = await Promise.all([
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    }),
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
    }),
    db.taskSubmission.count({
      where: { child: { familyId: family.id }, decision: null },
    }),
  ])

  // ──────────────────────────────────────────────────────────────────────────
  // Daily: per-child today completion %
  // ──────────────────────────────────────────────────────────────────────────
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const dailyData = await Promise.all(
    children.map(async (c) => {
      const occurrences = await db.taskOccurrence.findMany({
        where: {
          task: { assignments: { some: { childId: c.id } }, status: 'ACTIVE' },
          scheduledDate: { gte: todayStart, lte: todayEnd },
        },
        include: { task: true },
      })
      const total = occurrences.length
      const approved = occurrences.filter((o) => o.status === 'APPROVED').length
      const submitted = occurrences.filter((o) => o.status === 'SUBMITTED').length
      const completion = total > 0 ? Math.round((approved / total) * 100) : 0
      return {
        child: c,
        total,
        approved,
        submitted,
        pending: total - approved - submitted,
        completion,
      }
    }),
  )
  const dailyChartData = dailyData.map((d) => ({
    name: d.child.displayName,
    completion: d.completion,
    approved: d.approved,
    total: d.total,
  }))

  // ──────────────────────────────────────────────────────────────────────────
  // Weekly: points earned per day over the last 7 days (family-wide)
  // ──────────────────────────────────────────────────────────────────────────
  const weekStart = startOfWeek(now, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: subDays(now, 6), end: now })

  const weekTxns = await db.pointsTransaction.findMany({
    where: {
      familyId: family.id,
      type: 'EARNED',
      createdAt: { gte: subDays(now, 6) },
    },
    select: { amount: true, createdAt: true, childId: true },
  })

  const weeklyChartData = weekDays.map((d) => {
    const dayPoints = weekTxns
      .filter((t) => isSameDay(t.createdAt, d))
      .reduce((sum, t) => sum + t.amount, 0)
    return { day: format(d, 'EEE'), points: dayPoints }
  })

  const weeklyPerChild = await Promise.all(
    children.map(async (c) => {
      const agg = await db.pointsTransaction.aggregate({
        where: {
          childId: c.id,
          type: 'EARNED',
          createdAt: { gte: subDays(now, 6) },
        },
        _sum: { amount: true },
      })
      const balanceAgg = await db.pointsTransaction.aggregate({
        where: { childId: c.id },
        _sum: { amount: true },
      })
      return {
        child: c,
        weekPoints: agg._sum.amount ?? 0,
        balance: balanceAgg._sum.amount ?? 0,
      }
    }),
  )
  const weeklyTotal = weeklyPerChild.reduce((s, x) => s + x.weekPoints, 0)

  // ──────────────────────────────────────────────────────────────────────────
  // Monthly: points per category this month
  // ──────────────────────────────────────────────────────────────────────────
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const monthTxns = await db.pointsTransaction.findMany({
    where: {
      familyId: family.id,
      type: 'EARNED',
      createdAt: { gte: monthStart, lte: monthEnd },
    },
    include: {
      submission: { include: { occurrence: { include: { task: true } } } },
      child: true,
    },
  })

  const monthlyByCategory = TASK_CATEGORIES.map((c) => {
    const points = monthTxns
      .filter((t) => t.submission?.occurrence.task.category === c.key)
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      category: c.key.replace(/\s+.*/, '').slice(0, 12),
      categoryFull: c.label,
      points,
      color: CATEGORY_COLORS[c.key] ?? CHART_COLORS.plum,
    }
  })

  // Per-child monthly progress + milestone info
  const monthlyPerChild = await Promise.all(
    children.map(async (c) => {
      const monthEarned = await db.pointsTransaction.aggregate({
        where: {
          childId: c.id,
          type: 'EARNED',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      })
      // Count weeks qualified this month (proxy: weeks where weekly aggregate >= some threshold)
      // We use a simple count of distinct weeks where points were earned
      const weeklyTxns = await db.pointsTransaction.findMany({
        where: {
          childId: c.id,
          type: 'EARNED',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        select: { createdAt: true, amount: true },
      })
      const weeksSet = new Set<string>()
      for (const t of weeklyTxns) {
        const ws = startOfWeek(t.createdAt, { weekStartsOn: 0 })
        weeksSet.add(format(ws, 'yyyy-MM-dd'))
      }
      const qualifyingWeeks = weeksSet.size
      const milestone = await db.monthlyMilestone.findFirst({
        where: { familyId: family.id, childId: c.id, periodStart: monthStart },
      })
      return {
        child: c,
        monthPoints: monthEarned._sum.amount ?? 0,
        qualifyingWeeks,
        requiredWeeks: milestone?.requiredWeeks ?? 3,
        qualified: milestone?.qualified ?? false,
      }
    }),
  )

  const hasAnyData =
    dailyData.some((d) => d.total > 0) ||
    weeklyTotal > 0 ||
    monthlyByCategory.some((c) => c.points > 0)

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Reports
            </h1>
            <p className="text-sm text-muted-foreground">
              An overview of how your family is engaging with tasks and rewards.
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(now, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Note on interpretation */}
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-900 dark:text-amber-100">
              These reports describe patterns in <span className="font-semibold">task engagement</span> — what was completed and when.
              They are not a measure of character, religiosity, or a child&apos;s worth. Use them to start conversations, not to compare siblings.
            </p>
          </CardContent>
        </Card>

        {!hasAnyData ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BarChart3 className="h-7 w-7" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-foreground">No data yet</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Once your children start submitting tasks and earning points, you&apos;ll see daily, weekly, and monthly summaries here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="daily" className="w-full">
            <TabsList>
              <TabsTrigger value="daily" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> Monthly
              </TabsTrigger>
            </TabsList>

            {/* Daily */}
            <TabsContent value="daily" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Today&apos;s completion by child</CardTitle>
                  <CardDescription>
                    Percentage of assigned tasks approved today, {format(now, 'EEEE, MMM d')}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyData.every((d) => d.total === 0) ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No tasks scheduled for today yet.
                    </p>
                  ) : (
                    <DailyCompletionChart data={dailyChartData} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Per-child breakdown</CardTitle>
                  <CardDescription>Approved, submitted, and pending tasks for today.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Child</TableHead>
                        <TableHead className="text-center">Approved</TableHead>
                        <TableHead className="text-center">Submitted</TableHead>
                        <TableHead className="text-center">Pending</TableHead>
                        <TableHead className="pr-6 text-right">Completion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyData.map((d) => (
                        <TableRow key={d.child.id}>
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-2">
                              <Avatar color={d.child.avatarColor} name={d.child.displayName} size="sm" />
                              <span className="font-medium">{d.child.displayName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" /> {d.approved}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                              <Clock className="h-3.5 w-3.5" /> {d.submitted}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">{d.pending}</TableCell>
                          <TableCell className="pr-6 text-right font-semibold">{d.completion}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <SummaryCard>
                {dailyData.every((d) => d.total === 0) ? (
                  <>
                    No tasks have been scheduled for today yet. Try assigning tasks to your children, or generate occurrences from the Tasks page.
                  </>
                ) : (
                  <>
                    Today, <span className="font-semibold">{dailyData.filter((d) => d.completion > 0).length}</span> of{' '}
                    <span className="font-semibold">{dailyData.length}</span> children completed at least one task.
                    {dailyData.filter((d) => d.completion === 100).length > 0 && (
                      <> A special shout-out to {dailyData.filter((d) => d.completion === 100).map((d) => d.child.displayName).join(' and ')} for finishing everything.</>
                    )}{' '}
                    Remember that completion rates reflect what was scheduled — they don&apos;t measure effort or character.
                  </>
                )}
              </SummaryCard>
            </TabsContent>

            {/* Weekly */}
            <TabsContent value="weekly" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Points earned — last 7 days</CardTitle>
                  <CardDescription>
                    Family-wide points awarded per day. Total this week: <span className="font-semibold text-foreground">{weeklyTotal} pts</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weeklyTotal === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No points earned yet this week.
                    </p>
                  ) : (
                    <WeeklyPointsChart data={weeklyChartData} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Per-child weekly points</CardTitle>
                  <CardDescription>Points earned this week and current balance.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Child</TableHead>
                        <TableHead className="text-right">This week</TableHead>
                        <TableHead className="text-right">Total balance</TableHead>
                        <TableHead className="pr-6 text-right">Share of week</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyPerChild.map((d) => {
                        const share = weeklyTotal > 0 ? Math.round((d.weekPoints / weeklyTotal) * 100) : 0
                        return (
                          <TableRow key={d.child.id}>
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-2">
                                <Avatar color={d.child.avatarColor} name={d.child.displayName} size="sm" />
                                <span className="font-medium">{d.child.displayName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                {d.weekPoints}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{d.balance}</TableCell>
                            <TableCell className="pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={share} className="h-1.5 w-16" />
                                <span className="w-9 text-right text-xs text-muted-foreground">{share}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <SummaryCard>
                {weeklyTotal === 0 ? (
                  <>No points were awarded yet this week. As your children complete and you approve tasks, you&apos;ll see the trend update here.</>
                ) : (
                  <>
                    Your family earned <span className="font-semibold">{weeklyTotal}</span> points across the last 7 days.
                    {' '}
                    {weeklyChartData.filter((d) => d.points > 0).length === 7
                      ? 'Points came in steadily every day — a nice rhythm.'
                      : weeklyChartData.filter((d) => d.points > 0).length >= 4
                        ? 'Activity was spread across most days, with a few quieter days.'
                        : 'Activity clustered on a few days — there may be room to smooth out the rhythm.'}
                    {' '}
                    This is descriptive, not a judgment — every family&apos;s pace is different.
                  </>
                )}
              </SummaryCard>
            </TabsContent>

            {/* Monthly */}
            <TabsContent value="monthly" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Points by category — {format(now, 'MMMM')}</CardTitle>
                  <CardDescription>
                    Where points are coming from this month. Helpful for noticing which areas are active.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyByCategory.every((c) => c.points === 0) ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No points earned yet this month.
                    </p>
                  ) : (
                    <MonthlyCategoryChart data={monthlyByCategory} />
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    {monthlyByCategory.map((c) => (
                      <div key={c.categoryFull} className="inline-flex items-center gap-1.5 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                        <span className="text-muted-foreground">{c.categoryFull}</span>
                        <span className="font-semibold text-foreground">{c.points}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Monthly milestones</CardTitle>
                  <CardDescription>
                    Consistency is celebrated. Qualifying weeks are weeks where the child stayed engaged.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monthlyPerChild.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active children.</p>
                  ) : (
                    monthlyPerChild.map((d) => {
                      const pct = Math.min(100, Math.round((d.qualifyingWeeks / d.requiredWeeks) * 100))
                      return (
                        <div key={d.child.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar color={d.child.avatarColor} name={d.child.displayName} size="sm" />
                              <p className="text-sm font-medium text-foreground">{d.child.displayName}</p>
                              {d.qualified && (
                                <Badge variant="outline" className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                  <Award className="h-3 w-3" /> Milestone reached
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {d.qualifyingWeeks}/{d.requiredWeeks} qualifying weeks · {d.monthPoints} pts
                            </p>
                          </div>
                          <Progress value={pct} className="mt-2 h-1.5" />
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              <SummaryCard>
                {monthlyByCategory.every((c) => c.points === 0) ? (
                  <>No points have been awarded yet this month. As approvals come in, you&apos;ll see which task categories are most active.</>
                ) : (
                  <>
                    This month, points came mostly from{' '}
                    <span className="font-semibold">
                      {monthlyByCategory.slice().sort((a, b) => b.points - a.points)[0].categoryFull}
                    </span>
                    .
                    {' '}
                    {monthlyPerChild.filter((c) => c.qualifyingWeeks >= c.requiredWeeks).length > 0
                      ? `${monthlyPerChild.filter((c) => c.qualifyingWeeks >= c.requiredWeeks).map((c) => c.child.displayName).join(' and ')} ${monthlyPerChild.filter((c) => c.qualifyingWeeks >= c.requiredWeeks).length === 1 ? 'has' : 'have'} reached the monthly milestone.`
                      : 'No monthly milestone reached yet — there is still time.'}
                    {' '}
                    Categories simply describe where activity happened — they are not a ranking of importance.
                  </>
                )}
              </SummaryCard>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  )
}

function SummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="p-4">
        <p className="text-sm text-foreground">{children}</p>
      </CardContent>
    </Card>
  )
}
