import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Target, CalendarRange, Trophy, Award, Plus } from 'lucide-react'

import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { ChallengeFormDialog } from '@/components/deensteps/challenge-dialogs'
import { ChallengeQuickAdd } from '@/components/deensteps/challenge-quick-add'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

type Participant = {
  id: string
  targetPercent: number
  qualified: boolean
  completionPercent: number
  eligibleCount: number
  completedCount: number
  child: { id: string; displayName: string; avatarColor: string }
}

type Challenge = {
  id: string
  name: string
  description: string | null
  startDate: Date
  endDate: Date
  targetPercent: number
  rewardTitle: string | null
  status: string
  participants: Participant[]
}

export default async function ChallengesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const [challenges, childrenList, pendingCount] = await Promise.all([
    db.weeklyChallenge.findMany({
      where: { familyId: family.id },
      orderBy: [{ status: 'asc' }, { startDate: 'desc' }],
      include: {
        participants: {
          include: {
            child: { select: { id: true, displayName: true, avatarColor: true } },
          },
        },
      },
    }),
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
    }),
    db.taskSubmission.count({
      where: { child: { familyId: family.id }, decision: null },
    }),
  ])

  const now = new Date()
  const activeChallenges = challenges.filter(
    (c) => c.status === 'ACTIVE' && new Date(c.endDate) >= now,
  ) as Challenge[]
  const pastChallenges = challenges.filter(
    (c) => !(c.status === 'ACTIVE' && new Date(c.endDate) >= now),
  ) as Challenge[]

  const childOptions = childrenList.map((c) => ({ id: c.id, displayName: c.displayName, avatarColor: c.avatarColor }))

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              সাপ্তাহিক চ্যালেঞ্জ
            </h1>
            <p className="text-sm text-muted-foreground">
              সপ্তাহের জন্য একটি লক্ষ্য নির্ধারণ করুন। সন্তান তার কাজের একটি নির্দিষ্ট শতাংশ সম্পন্ন করে পুরস্কার অর্জন করে।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChallengeQuickAdd />
            <ChallengeFormDialog childrenList={childOptions}>
              <Button>
                <Plus className="h-4 w-4" /> নতুন চ্যালেঞ্জ
              </Button>
            </ChallengeFormDialog>
          </div>
        </div>

        {challenges.length === 0 ? (
          <EmptyChallenges childrenList={childOptions} />
        ) : (
          <>
            {/* Active challenges */}
            {activeChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <p className="mt-3 font-display font-semibold text-foreground">No active challenges right now</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Start a new weekly challenge to keep the momentum going.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="max-h-[600px] overflow-y-auto pr-1">
                <div className="grid gap-4 lg:grid-cols-2">
                  {activeChallenges.map((c) => (
                    <ChallengeCard key={c.id} challenge={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Past challenges */}
            {pastChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Past challenges</CardTitle>
                  <CardDescription>A history of finished and cancelled challenges.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {pastChallenges.map((c) => (
                        <PastChallengeRow key={c.id} challenge={c} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const totalParticipants = challenge.participants.length
  const qualified = challenge.participants.filter((p) => p.qualified).length
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg font-bold text-foreground">{challenge.name}</p>
              <Badge variant="outline" className="gap-1">
                <CalendarRange className="h-3 w-3" />
                {format(new Date(challenge.startDate), 'MMM d')} – {format(new Date(challenge.endDate), 'MMM d')}
              </Badge>
              {daysLeft > 0 ? (
                <Badge variant="outline" className="text-amber-700 dark:text-amber-300">{daysLeft}d left</Badge>
              ) : (
                <Badge variant="outline" className="text-emerald-700 dark:text-emerald-300">Ending today</Badge>
              )}
            </div>
            {challenge.description && (
              <p className="mt-1 text-sm text-muted-foreground">{challenge.description}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-primary" />
            Target: <span className="font-semibold text-foreground">{challenge.targetPercent}%</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            {qualified}/{totalParticipants} qualified
          </span>
          {challenge.rewardTitle && (
            <span className="inline-flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              Reward: <span className="font-medium text-foreground">{challenge.rewardTitle}</span>
            </span>
          )}
        </div>

        {/* Participants */}
        <div className="mt-4 space-y-3">
          {challenge.participants.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-card/30 p-3 text-xs text-muted-foreground">
              No participants yet.
            </p>
          ) : (
            challenge.participants.map((p) => {
              const progress = Math.min(100, Math.round((p.completionPercent / challenge.targetPercent) * 100))
              const qualifiedPct = p.completionPercent >= challenge.targetPercent
              return (
                <div key={p.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar color={p.child.avatarColor} name={p.child.displayName} size="sm" />
                      <p className="text-sm font-medium text-foreground">{p.child.displayName}</p>
                      {qualifiedPct && (
                        <Badge variant="outline" className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                          <Trophy className="h-3 w-3" /> Qualified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.completedCount}/{p.eligibleCount} tasks · {p.completionPercent}%
                    </p>
                  </div>
                  <Progress value={progress} className="mt-2 h-1.5" />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {p.completionPercent}% of {challenge.targetPercent}% target
                  </p>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PastChallengeRow({ challenge }: { challenge: Challenge }) {
  const qualified = challenge.participants.filter((p) => p.qualified).length
  const isCompleted = challenge.status === 'COMPLETED'
  const isCancelled = challenge.status === 'CANCELLED'

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/50 p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{challenge.name}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(challenge.startDate), 'MMM d')} – {format(new Date(challenge.endDate), 'MMM d, yyyy')} · {qualified}/{challenge.participants.length} qualified
        </p>
      </div>
      <Badge
        variant="outline"
        className={
          isCancelled
            ? 'bg-muted text-muted-foreground'
            : isCompleted
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
        }
      >
        {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : 'Ended'}
      </Badge>
    </div>
  )
}

function EmptyChallenges({
  childrenList,
}: {
  childrenList: { id: string; displayName: string; avatarColor: string }[]
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Target className="h-7 w-7" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">এখনো কোনো চ্যালেঞ্জ নেই</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          সাপ্তাহিক চ্যালেঞ্জ একটি বান্ধব লক্ষ্য — যেমন সপ্তাহের ৮০% কাজ সম্পন্ন করা। সাজেশন থেকে বাছাই করুন বা নিজে তৈরি করুন।
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ChallengeQuickAdd />
          <ChallengeFormDialog childrenList={childrenList}>
            <Button>
              <Plus className="h-4 w-4" /> নতুন চ্যালেঞ্জ
            </Button>
          </ChallengeFormDialog>
        </div>
      </CardContent>
    </Card>
  )
}
