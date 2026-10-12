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
              রিপোর্ট
            </h1>
            <p className="text-sm text-muted-foreground">
              আপনার পরিবার কাজ ও পুরস্কারে কীভাবে অংশ নিচ্ছে তার সারসংক্ষেপ।
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
              এই রিপোর্টগুলো শুধু <span className="font-semibold">কাজে অংশগ্রহণের ধরন</span> বর্ণনা করে — কী সম্পন্ন হয়েছে ও কখন।
              এগুলো চরিত্র, ধর্মপরায়ণতা, বা সন্তানের মূল্যর পরিমাপ নয়। ভাই-বোনের তুলনা না করে কথোপকথন শুরু করতে এগুলো ব্যবহার করুন।
            </p>
          </CardContent>
        </Card>

        {!hasAnyData ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BarChart3 className="h-7 w-7" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-foreground">এখনো কোনো ডেটা নেই</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                সন্তানরা কাজ জমা দিয়ে তারা অর্জন করা শুরু করলে এখানে দৈনিক, সাপ্তাহিক ও মাসিক সারসংক্ষেপ দেখা যাবে।
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="daily" className="w-full">
            <TabsList>
              <TabsTrigger value="daily" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> দৈনিক
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> সাপ্তাহিক
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> মাসিক
              </TabsTrigger>
            </TabsList>

            {/* Daily */}
            <TabsContent value="daily" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">আজকের সম্পন্ন — সন্তান অনুযায়ী</CardTitle>
                  <CardDescription>
                    আজ নির্ধারিত কাজের মধ্যে কতটি অনুমোদিত হয়েছে, {format(now, 'EEEE, MMM d')}।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyData.every((d) => d.total === 0) ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      আজকে এখনো কোনো কাজ নির্ধারিত নেই।
                    </p>
                  ) : (
                    <DailyCompletionChart data={dailyChartData} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">সন্তান অনুযায়ী বিবরণ</CardTitle>
                  <CardDescription>আজকের অনুমোদিত, জমা দেওয়া ও বাকি কাজ।</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">সন্তান</TableHead>
                        <TableHead className="text-center">অনুমোদিত</TableHead>
                        <TableHead className="text-center">জমা হয়েছে</TableHead>
                        <TableHead className="text-center">বাকি</TableHead>
                        <TableHead className="pr-6 text-right">সম্পন্ন</TableHead>
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
                    আজকে এখনো কোনো কাজ নির্ধারিত হয়নি। কাজ পৃষ্ঠা থেকে সন্তানদের জন্য কাজ যোগ করুন।
                  </>
                ) : (
                  <>
                    আজ, <span className="font-semibold">{dailyData.filter((d) => d.completion > 0).length}</span> /{' '}
                    <span className="font-semibold">{dailyData.length}</span> জন সন্তান অন্তত একটি কাজ সম্পন্ন করেছে।
                    {dailyData.filter((d) => d.completion === 100).length > 0 && (
                      <> {dailyData.filter((d) => d.completion === 100).map((d) => d.child.displayName).join(' ও ')} সব কাজ শেষ করেছে — দারুণ!</>
                    )}{' '}
                    মনে রাখুন, সম্পন্নের হার শুধু নির্ধারিত কাজ প্রতিফলিত করে — চেষ্টা বা চরিত্রের মাপক নয়।
                  </>
                )}
              </SummaryCard>
            </TabsContent>

            {/* Weekly */}
            <TabsContent value="weekly" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">অর্জিত তারা — গত ৭ দিন</CardTitle>
                  <CardDescription>
                    পরিবারে প্রতিদিন প্রদত্ত তারা। এই সপ্তাহে মোট: <span className="font-semibold text-foreground">{weeklyTotal} তারা</span>।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weeklyTotal === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      এই সপ্তাহে এখনো কোনো তারা অর্জিত হয়নি।
                    </p>
                  ) : (
                    <WeeklyPointsChart data={weeklyChartData} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">সন্তান অনুযায়ী সাপ্তাহিক তারা</CardTitle>
                  <CardDescription>এই সপ্তাহে অর্জিত তারা ও বর্তমান ব্যালেন্স।</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">সন্তান</TableHead>
                        <TableHead className="text-right">এই সপ্তাহ</TableHead>
                        <TableHead className="text-right">মোট ব্যালেন্স</TableHead>
                        <TableHead className="pr-6 text-right">সপ্তাহের অংশ</TableHead>
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
                  <>এই সপ্তাহে এখনো কোনো তারা প্রদান করা হয়নি। সন্তানরা কাজ সম্পন্ন করে ও আপনি অনুমোদন দিলে এই ট্রেন্ড আপডেট হবে।</>
                ) : (
                  <>
                    আপনার পরিবার গত ৭ দিনে <span className="font-semibold">{weeklyTotal}</span> তারা অর্জন করেছে।
                    {' '}
                    {weeklyChartData.filter((d) => d.points > 0).length === 7
                      ? 'প্রতিদিন নিয়মিত তারা এসেছে — দারুণ ছন্দ!'
                      : weeklyChartData.filter((d) => d.points > 0).length >= 4
                        ? 'বেশিরভাগ দিনেই কাজ হয়েছে, কয়েকদিন একটু কম ছিল।'
                        : 'কাজ কয়েকদিনে কেন্দ্রীভূত হয়েছে — ছন্দ একটু সমান করা যেতে পারে।'}
                    {' '}
                    এটি বর্ণনামূলক, বিচার নয় — প্রতিটি পরিবারের গতি আলাদা।
                  </>
                )}
              </SummaryCard>
            </TabsContent>

            {/* Monthly */}
            <TabsContent value="monthly" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">ক্যাটাগরি অনুযায়ী তারা — {format(now, 'MMMM')}</CardTitle>
                  <CardDescription>
                    এই মাসে তারা কোন ক্যাটাগরি থেকে এসেছে। কোন ক্ষেত্রগুলো সক্রিয় তা বুঝতে সাহায্য করে।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyByCategory.every((c) => c.points === 0) ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      এই মাসে এখনো কোনো তারা অর্জিত হয়নি।
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
                  <CardTitle className="font-display text-lg">মাসিক মাইলস্টোন</CardTitle>
                  <CardDescription>
                    ধারাবাহিকতা উদযাপিত হয়। কোয়ালিফাইং সপ্তাহ হলো সেই সপ্তাহ যেখানে সন্তান নিয়মিত ছিল।
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monthlyPerChild.length === 0 ? (
                    <p className="text-sm text-muted-foreground">কোনো সক্রিয় সন্তান নেই।</p>
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
                                  <Award className="h-3 w-3" /> মাইলস্টোন অর্জিত
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {d.qualifyingWeeks}/{d.requiredWeeks} কোয়ালিফাইং সপ্তাহ · {d.monthPoints} তারা
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
                  <>এই মাসে এখনো কোনো তারা প্রদান করা হয়নি। অনুমোদন আসলে কোন ক্যাটাগরিগুলো সবচেয়ে সক্রিয় তা দেখা যাবে।</>
                ) : (
                  <>
                    এই মাসে, তারা মূলত এসেছে{' '}
                    <span className="font-semibold">
                      {monthlyByCategory.slice().sort((a, b) => b.points - a.points)[0].categoryFull}
                    </span>
                    থেকে।
                    {' '}
                    {monthlyPerChild.filter((c) => c.qualifyingWeeks >= c.requiredWeeks).length > 0
                      ? `${monthlyPerChild.filter((c) => c.qualifyingWeeks >= c.requiredWeeks).map((c) => c.child.displayName).join(' ও ')} মাসিক মাইলস্টোন অর্জন করেছে।`
                      : 'এখনো কেউ মাসিক মাইলস্টোন অর্জন করেনি — সময় এখনো আছে।'}
                    {' '}
                    ক্যাটাগরি শুধু কোথায় কাজ হয়েছে তা বর্ণনা করে — গুরুত্বের কোনো তালিকা নয়।
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
