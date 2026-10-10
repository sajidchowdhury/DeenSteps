import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Users, Plus, ArrowRight, Sparkles, Star, TrendingUp } from 'lucide-react'

import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { CreateChildDialog, ChildRowActions } from '@/components/deensteps/child-dialogs'
import { RestoreChildButton } from '@/components/deensteps/child-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

export default async function ChildrenPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const children = await db.childProfile.findMany({
    where: { familyId: family.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    include: {
      assignments: { select: { id: true } },
    },
  })

  // Sidebar list + pending count
  const [childrenList, pendingCount] = await Promise.all([
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
    }),
    db.taskSubmission.count({
      where: { child: { familyId: family.id }, decision: null },
    }),
  ])

  // Today's window for completion stats
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  // Per-child today stats + balance + next reward
  const activeChildren = children.filter((c) => c.status === 'ACTIVE')
  const archivedChildren = children.filter((c) => c.status === 'ARCHIVED')

  const statsByChild = await Promise.all(
    activeChildren.map(async (c) => {
      const todayOccurrences = await db.taskOccurrence.findMany({
        where: {
          task: { assignments: { some: { childId: c.id } }, status: 'ACTIVE' },
          scheduledDate: { gte: todayStart, lte: todayEnd },
        },
      })
      const todayTotal = todayOccurrences.length
      const todayApproved = todayOccurrences.filter((o) => o.status === 'APPROVED').length
      const todayCompletion = todayTotal > 0 ? Math.round((todayApproved / todayTotal) * 100) : 0

      const balanceAgg = await db.pointsTransaction.aggregate({
        where: { childId: c.id },
        _sum: { amount: true },
      })
      const balance = balanceAgg._sum.amount ?? 0

      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekPointsAgg = await db.pointsTransaction.aggregate({
        where: { childId: c.id, type: 'EARNED', createdAt: { gte: weekStart } },
        _sum: { amount: true },
      })
      const weekPoints = weekPointsAgg._sum.amount ?? 0

      const nextReward = await db.reward.findFirst({
        where: {
          familyId: family.id,
          status: 'ACTIVE',
          rewardType: 'POINTS',
          requiredPoints: { gt: balance },
        },
        orderBy: { requiredPoints: 'asc' },
      })

      return {
        child: c,
        todayTotal,
        todayApproved,
        todayCompletion,
        balance,
        weekPoints,
        nextReward,
      }
    }),
  )

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Children
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage each child profile, track progress, and assign tasks.
            </p>
          </div>
          <CreateChildDialog>
            <Button>
              <Plus className="h-4 w-4" /> Add child
            </Button>
          </CreateChildDialog>
        </div>

        {/* Active children */}
        {activeChildren.length === 0 ? (
          <EmptyChildren />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statsByChild.map(({ child, todayTotal, todayApproved, todayCompletion, balance, weekPoints, nextReward }) => (
              <ChildProfileCard
                key={child.id}
                child={child}
                todayApproved={todayApproved}
                todayTotal={todayTotal}
                todayCompletion={todayCompletion}
                balance={balance}
                weekPoints={weekPoints}
                nextRewardTitle={nextReward?.title ?? null}
                nextRewardPoints={nextReward?.requiredPoints ?? null}
              />
            ))}
          </div>
        )}

        {/* Archived children */}
        {archivedChildren.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Archived</CardTitle>
              <CardDescription>
                Archived children are hidden from the dashboard but keep their history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {archivedChildren.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar color={c.avatarColor} name={c.displayName} size="md" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {format(c.createdAt, 'MMM d, yyyy')} · {c.assignments.length} task assignments
                      </p>
                    </div>
                  </div>
                  <RestoreChildButton childId={c.id} childName={c.displayName} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}

function ChildProfileCard({
  child,
  todayApproved,
  todayTotal,
  todayCompletion,
  balance,
  weekPoints,
  nextRewardTitle,
  nextRewardPoints,
}: {
  child: {
    id: string
    displayName: string
    avatarColor: string
    ageRange: string | null
    createdAt: Date
  }
  todayApproved: number
  todayTotal: number
  todayCompletion: number
  balance: number
  weekPoints: number
  nextRewardTitle: string | null
  nextRewardPoints: number | null
}) {
  const rewardRemaining = nextRewardPoints ? Math.max(0, nextRewardPoints - balance) : 0
  const rewardProgress = nextRewardPoints && nextRewardPoints > 0
    ? Math.min(100, Math.round((balance / nextRewardPoints) * 100))
    : 0

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-premium">
      <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Avatar color={child.avatarColor} name={child.displayName} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold text-foreground">{child.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {child.ageRange ? `${child.ageRange} years` : 'Age not set'}
              </p>
            </div>
            <ChildRowActions
              child={{
                id: child.id,
                displayName: child.displayName,
                avatarColor: child.avatarColor,
                ageRange: child.ageRange,
              }}
            />
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

        {nextRewardTitle && nextRewardPoints && (
          <div className="mt-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Sparkles className="h-3 w-3 text-amber-500" /> {nextRewardTitle}
              </span>
              <span className="text-muted-foreground">{rewardRemaining} to go</span>
            </div>
            <Progress value={rewardProgress} className="mt-1.5 h-1" />
          </div>
        )}

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href={`/child/${child.id}`}>
            View profile <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyChildren() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-7 w-7" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">No children yet</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Add your first child profile to start assigning age-appropriate tasks, track their
          progress, and reward consistency.
        </p>
        <div className="mt-4">
          <CreateChildDialog>
            <Button>
              <Plus className="h-4 w-4" /> Add your first child
            </Button>
          </CreateChildDialog>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline" className="gap-1">
            <DynamicIcon iconKey="sunrise" size={12} /> Daily tasks
          </Badge>
          <Badge variant="outline" className="gap-1">
            <DynamicIcon iconKey="gift" size={12} /> Meaningful rewards
          </Badge>
          <Badge variant="outline" className="gap-1">
            <DynamicIcon iconKey="target" size={12} /> Weekly challenges
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
