import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Calendar,
  ListChecks,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Trophy,
  Lock,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
} from 'lucide-react'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { getPlannerData, getFamilyAchievementStatus } from '@/server/actions/planner-actions'
import { TASK_STATUS_META } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default async function PlannerPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const [planner, achievementStatus, pendingCount, childrenList] = await Promise.all([
    getPlannerData(),
    getFamilyAchievementStatus(),
    db.taskSubmission.count({
      where: { child: { familyId: family.id }, decision: null },
    }),
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const earnedCount = achievementStatus.filter((a) => a.awarded).length
  const totalCount = achievementStatus.length

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              পরিবারিক প্ল্যানার
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')} · সব কিছু এক জায়গায় — কাজ, সিডিউল, রিভিউ, পুরস্কার।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/tasks"><ListChecks className="mr-1.5 h-4 w-4" /> কাজ পরিচালনা</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/rewards"><Gift className="mr-1.5 h-4 w-4" /> পুরস্কার</Link>
            </Button>
          </div>
        </div>

        {/* Start-small guidance */}
        <Card
          className={cn(
            'border',
            planner.guidance.severity === 'good' && 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20',
            planner.guidance.severity === 'warn' && 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20',
            planner.guidance.severity === 'info' && 'border-sky-200 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20',
          )}
        >
          <CardContent className="flex items-start gap-3 p-4">
            <span
              className={cn(
                'inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                planner.guidance.severity === 'good' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40',
                planner.guidance.severity === 'warn' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/40',
                planner.guidance.severity === 'info' && 'bg-sky-100 text-sky-600 dark:bg-sky-900/40',
              )}
            >
              {planner.guidance.severity === 'good' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold text-foreground">
                {planner.guidance.severity === 'good'
                  ? 'ভালো গতিতে এগোচ্ছেন!'
                  : planner.guidance.severity === 'warn'
                    ? 'অল্প কাজ দিয়ে শুরু করুন'
                    : 'একটু ছোট করুন'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{planner.guidance.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 নতুন পরিবারদের জন্য সুপারিশ: ৩-৫টি কাজ দিয়ে শুরু করুন। ধারাবাহিকতা সংখ্যার চেয়ে গুরুত্বপূর্ণ।
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickStat
            icon={ListChecks}
            label="সক্রিয় কাজ"
            value={planner.stats.activeTasks}
            href="/tasks"
            accent="bg-primary/10 text-primary"
          />
          <QuickStat
            icon={Clock}
            label="অপেক্ষমান রিভিউ"
            value={planner.stats.pendingSubmissions}
            href="/review"
            accent="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
          />
          <QuickStat
            icon={Gift}
            label="সক্রিয় পুরস্কার"
            value={planner.stats.activeRewards}
            href="/rewards"
            accent="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
          />
          <QuickStat
            icon={CheckCircle2}
            label="আজ সম্পন্ন"
            value={`${planner.stats.todayApproved}/${planner.stats.todayOccurrences}`}
            href="/dashboard"
            accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                আজকের সিডিউল
              </CardTitle>
              <CardDescription>সব সন্তানের আজকের কাজ এক জায়গায়।</CardDescription>
            </CardHeader>
            <CardContent>
              {planner.todaysSchedule.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-10 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">আজ কোনো কাজ নির্ধারিত নেই</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    কাজ পৃষ্ঠা থেকে নতুন চ্যালেঞ্জ যোগ করুন বা লাইব্রেরি থেকে ইম্পোর্ট করুন।
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href="/tasks"><ListChecks className="mr-1.5 h-4 w-4" /> কাজ যোগ করুন</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {planner.todaysSchedule.map((o) => {
                    const meta = TASK_STATUS_META[o.status] ?? TASK_STATUS_META.ASSIGNED
                    return (
                      <li
                        key={o.id}
                        className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3"
                      >
                        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <DynamicIcon iconKey={o.iconKey} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{o.title}</p>
                            <Badge variant="outline" className={cn('text-[10px]', meta.tone)}>{meta.label}</Badge>
                            {o.dueTime && (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <Clock className="h-2.5 w-2.5" /> {o.dueTime}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {o.assignedChildren.length > 0 ? (
                              o.assignedChildren.map((c) => (
                                <span key={c.id} className="inline-flex items-center gap-1">
                                  <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                                  <span className="text-xs text-muted-foreground">{c.displayName}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">কাউকে নির্ধারণ করা হয়নি</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">+{o.pointsValue}</Badge>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Right column: review queue + reflection status */}
          <div className="space-y-6">
            {/* Review queue */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  রিভিউ সারি
                </CardTitle>
                <CardDescription>সন্তানের জমা দেওয়া কাজ অনুমোদন করুন।</CardDescription>
              </CardHeader>
              <CardContent>
                {planner.reviewQueue.count === 0 ? (
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                    <p className="mt-2 text-sm text-muted-foreground">সব রিভিউ সম্পন্ন! ✨</p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {planner.reviewQueue.items.map((s) => (
                        <li key={s.id} className="flex items-start gap-2.5 rounded-lg border border-border bg-card/50 p-2.5">
                          <Avatar color={s.avatarColor} name={s.childName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground">{s.childName}</p>
                            <p className="truncate text-xs text-muted-foreground">{s.taskTitle}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(parseISO(s.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button asChild size="sm" className="mt-3 w-full" variant="outline">
                      <Link href="/review">
                        রিভিউ খুলুন <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reflection status */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-500" />
                  সাপ্তাহিক রিফ্লেকশন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2.5 text-sm">
                  <span className="text-muted-foreground">এই সপ্তাহ</span>
                  {planner.reflection.thisWeekCompleted ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> সম্পন্ন
                    </Badge>
                  ) : (
                    <Badge variant="outline">বাকি</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2.5 text-sm">
                  <span className="text-muted-foreground">গত সপ্তাহ</span>
                  {planner.reflection.lastWeekCompleted ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> সম্পন্ন
                    </Badge>
                  ) : (
                    <Badge variant="outline">বাকি</Badge>
                  )}
                </div>
                {planner.reflection.consecutiveWeeks > 0 && (
                  <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-2.5 text-xs text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-200">
                    🔥 টানা {planner.reflection.consecutiveWeeks} সপ্তাহ রিফ্লেকশন করেছেন!
                  </div>
                )}
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/dashboard#reflection">
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" /> রিফ্লেকশন খুলুন
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rewards + budget snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-rose-500" />
              পুরস্কার ও বাজেট
            </CardTitle>
            <CardDescription>এই মাসের খরচ এবং সক্রিয় পুরস্কার।</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">সক্রিয় পুরস্কার</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{planner.rewards.activeCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">এই মাসে খরচ</p>
                <p className="mt-1 text-2xl font-bold text-foreground">৳{planner.rewards.spentThisMonth}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">মাসিক বাজেট</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {planner.rewards.monthlyBudget ? `৳${planner.rewards.monthlyBudget}` : '—'}
                </p>
              </div>
            </div>
            {planner.rewards.monthlyBudget ? (
              <div className="mt-3">
                <Progress
                  value={Math.min(100, Math.round((planner.rewards.spentThisMonth / planner.rewards.monthlyBudget) * 100))}
                  className="h-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round((planner.rewards.spentThisMonth / planner.rewards.monthlyBudget) * 100)}% ব্যবহৃত
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                💡 মাসিক বাজেট সেট করতে সেটিংস পৃষ্ঠায় যান।
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/rewards"><Gift className="mr-1.5 h-3.5 w-3.5" /> পুরস্কার পরিচালনা</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/settings"><SettingsIcon className="mr-1.5 h-3.5 w-3.5" /> বাজেট সেট করুন</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Family celebration — private family achievements */}
        <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              পরিবারিক উদযাপন
            </CardTitle>
            <CardDescription>
              {earnedCount > 0
                ? `${earnedCount}/${totalCount} টি অর্জন আনলক হয়েছে — আপনাদের একসাথে গড়ে ওঠার স্মৃতি।`
                : 'পরিবার হিসেবে একসাথে আমল চর্চা করুন — মাইলফলক অর্জন এখানে উদযাপিত হবে।'}
              <span className="mt-0.5 block text-xs">🔒 এই অর্জনগুলো শুধু আপনাদের — কোনো লিডারবোর্ড নেই, কোনো তুলনা নেই।</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {achievementStatus.map((a) => (
                <div
                  key={a.key}
                  className={cn(
                    'flex flex-col items-center rounded-xl border p-3 text-center transition-colors',
                    a.awarded
                      ? 'border-amber-300 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-950/30'
                      : 'border-border bg-card/40 opacity-70',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-12 w-12 items-center justify-center rounded-full',
                      a.awarded
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {a.awarded ? (
                      <DynamicIcon iconKey={a.iconKey} className="h-6 w-6" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </span>
                  <p className={cn('mt-2 text-xs font-semibold', a.awarded ? 'text-foreground' : 'text-muted-foreground')}>
                    {a.name}
                  </p>
                  {a.awarded && a.awardedAt && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {format(parseISO(a.awardedAt), 'd MMM')}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {earnedCount === 0 && (
              <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50/30 p-3 text-center text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                <Sparkles className="mx-auto mb-1 h-4 w-4" />
                প্রথম অর্জন আনলক করতে একটি কাজ অনুমোদন করুন, একটি রিফ্লেকশন সংরক্ষণ করুন, অথবা একটি সাদাকাহ নিশ্চিত করুন।
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer guidance */}
        <Card className="border-violet-200 bg-violet-50/30 dark:border-violet-900/40 dark:bg-violet-950/10">
          <CardContent className="flex items-start gap-3 p-4">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">পরিবারিক লক্ষ্য — একসাথে গড়ে ওঠা</p>
              <p className="mt-1 text-sm text-muted-foreground">
                নিখুঁত হওয়ার চেষ্টা করবেন না — ধারাবাহিক হওয়ার চেষ্টা করুন। প্রতিদিন একটু একটু করে এগোনোই আসল জয়।
                সন্তান যখন ভুল করে, ক্ষমা করুন এবং পরের দিন আবার শুরু করুন।
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  href,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  href: string
  accent: string
}) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-primary/40 hover:bg-accent/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg', accent)}>
              <Icon className="h-4 w-4" />
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
