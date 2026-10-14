import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Avatar } from '@/components/deensteps/app-shell'
import { Logo } from '@/components/deensteps/brand'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Nur } from '@/components/deensteps/mascot'
import { AchievementGrid, AchievementCelebrationOverlay } from '@/components/deensteps/achievement-celebration'
import { getChildAchievementStatus, getEarnedChildAchievements } from '@/server/actions/achievement-actions'
import { format, parseISO } from 'date-fns'

export default async function ChildAchievementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: childId } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) redirect('/dashboard')

  const achievements = await getChildAchievementStatus(child.id)
  const earnedAchievements = await getEarnedChildAchievements(child.id)
  const earnedCount = achievements.filter((a) => a.awarded).length
  const totalCount = achievements.length
  const percent = Math.round((earnedCount / totalCount) * 100)

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/child/${child.id}`}><ArrowLeft className="mr-1 h-4 w-4" /> পরিবারে ফিরুন</Link>
          </Button>
          <Logo />
          <div className="flex items-center gap-2">
            <Avatar color={child.avatarColor} name={child.displayName} size="sm" />
            <span className="hidden text-sm font-medium text-foreground sm:inline">{child.displayName}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Hero */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-cream to-emerald-50/50 p-6 dark:border-amber-900/40 dark:from-amber-950/30 dark:via-secondary dark:to-emerald-950/20">
          <div className="flex flex-col items-center gap-4 text-center">
            <Nur state={earnedCount > 0 ? 'proud' : 'happy'} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                {child.displayName}-এর অর্জন 🏆
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {earnedCount > 0
                  ? `${earnedCount} টি ব্যাজ অর্জন করেছ! আল্লাহ তোমার চেষ্টা কবুল করুন।`
                  : 'কাজ সম্পন্ন করে ব্যাজ আনলক করো!'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{earnedCount} / {totalCount} অর্জন</span>
                <span className="font-bold text-primary">{percent}%</span>
              </div>
              <Progress value={percent} className="mt-1.5 h-2.5" />
            </div>
          </div>
        </div>

        {/* Achievement grid — full size */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {achievements.map((a) => (
                <div
                  key={a.key}
                  className="flex flex-col items-center rounded-xl border border-border bg-card/50 p-3 text-center"
                >
                  <span
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${
                      a.awarded
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {a.awarded ? (
                      <DynamicIconLocal iconKey={a.iconKey} className="h-7 w-7" />
                    ) : (
                      <Trophy className="h-6 w-6 opacity-30" />
                    )}
                  </span>
                  <p className={`mt-2 text-xs font-bold ${a.awarded ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {a.name}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {a.description}
                  </p>
                  {a.awarded && a.awardedAt && (
                    <p className="mt-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      {format(parseISO(a.awardedAt), 'd MMM')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer encouragement */}
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/30 p-4 text-center dark:border-violet-900/40 dark:bg-violet-950/10">
          <p className="text-sm text-muted-foreground">
            💜 প্রতিটি ব্যাজ তোমার চেষ্টার স্মৃতি। নিখুঁত হওয়ার চেষ্টা নয় — ধারাবাহিক হওয়ার চেষ্টা করো।
          </p>
        </div>
      </main>

      {/* Celebration overlay */}
      <AchievementCelebrationOverlay childId={child.id} earnedAchievements={earnedAchievements} />
    </div>
  )
}

// Inline import to avoid circular dependency issues
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
function DynamicIconLocal({ iconKey, className }: { iconKey: string; className?: string }) {
  return <DynamicIcon iconKey={iconKey} className={className} />
}
