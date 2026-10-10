import { redirect } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { Gift, Check, X, Inbox, History, PackageCheck, Sparkles, Star } from 'lucide-react'

import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import {
  RewardFormDialog,
  ImportRewardsDialog,
  RewardRowActions,
  ApproveRedemptionButton,
  DeclineRedemptionButton,
  FulfillRedemptionButton,
} from '@/components/deensteps/reward-dialogs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

type Reward = {
  id: string
  title: string
  description: string | null
  iconKey: string
  requiredPoints: number
  rewardType: string
  requiresApproval: boolean
  status: string
  createdAt: Date
}

type Redemption = {
  id: string
  status: string
  pointsCost: number
  note: string | null
  requestedAt: Date
  reviewedAt: Date | null
  fulfilledAt: Date | null
  reward: { id: string; title: string; iconKey: string }
  child: { id: string; displayName: string; avatarColor: string }
  reviewedBy: { id: string; name: string | null } | null
}

export default async function RewardsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const [rewards, redemptions, childrenList, pendingCount] = await Promise.all([
    db.reward.findMany({
      where: { familyId: family.id },
      orderBy: [{ status: 'asc' }, { requiredPoints: 'asc' }],
      include: {
        _count: { select: { redemptions: true } },
      },
    }),
    db.rewardRedemption.findMany({
      where: { child: { familyId: family.id } },
      orderBy: { requestedAt: 'desc' },
      include: {
        reward: { select: { id: true, title: true, iconKey: true } },
        child: { select: { id: true, displayName: true, avatarColor: true } },
        reviewedBy: { select: { id: true, name: true } },
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

  const activeRewards = rewards.filter((r) => r.status === 'ACTIVE')
  const archivedRewards = rewards.filter((r) => r.status === 'ARCHIVED')

  const pendingRedemptions = redemptions.filter((r) => r.status === 'REQUESTED') as Redemption[]
  const historyRedemptions = redemptions
    .filter((r) => r.status !== 'REQUESTED')
    .slice(0, 50) as Redemption[]

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Rewards
            </h1>
            <p className="text-sm text-muted-foreground">
              Curate meaningful rewards and manage redemption requests from your children.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ImportRewardsDialog>
              <Button variant="outline">Import from library</Button>
            </ImportRewardsDialog>
            <RewardFormDialog>
              <Button>
                <Gift className="h-4 w-4" /> New reward
              </Button>
            </RewardFormDialog>
          </div>
        </div>

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="catalog" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Catalog
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-bold">
                {activeRewards.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              <Inbox className="h-3.5 w-3.5" /> Pending
              {pendingRedemptions.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {pendingRedemptions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {/* Catalog tab */}
          <TabsContent value="catalog" className="mt-4 space-y-4">
            {activeRewards.length === 0 ? (
              <EmptyCatalog />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} redemptionCount={reward._count.redemptions} />
                ))}
              </div>
            )}

            {archivedRewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Archived rewards</CardTitle>
                  <CardDescription>Hidden from the catalog. History is preserved.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedRewards.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} archived redemptionCount={reward._count.redemptions} />
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending tab */}
          <TabsContent value="pending" className="mt-4">
            {pendingRedemptions.length === 0 ? (
              <EmptyRedemptions
                title="No pending redemptions"
                description="When your children redeem a reward that needs approval, it will appear here."
                icon={Inbox}
              />
            ) : (
              <div className="grid gap-3">
                {pendingRedemptions.map((r) => (
                  <PendingRedemptionRow key={r.id} redemption={r} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* History tab */}
          <TabsContent value="history" className="mt-4">
            {historyRedemptions.length === 0 ? (
              <EmptyRedemptions
                title="No redemption history yet"
                description="Approved, declined, and fulfilled redemptions will show up here."
                icon={History}
              />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {historyRedemptions.map((r) => (
                      <HistoryRedemptionRow key={r.id} redemption={r} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

function RewardCard({
  reward,
  archived = false,
  redemptionCount = 0,
}: {
  reward: Reward & { _count: { redemptions: number } }
  archived?: boolean
  redemptionCount?: number
}) {
  return (
    <Card className={archived ? 'opacity-70' : 'transition-shadow hover:shadow-premium'}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <DynamicIcon iconKey={reward.iconKey} size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-foreground">{reward.title}</p>
            {reward.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{reward.description}</p>
            )}
          </div>
          <RewardRowActions
            reward={{
              id: reward.id,
              title: reward.title,
              description: reward.description,
              iconKey: reward.iconKey,
              requiredPoints: reward.requiredPoints,
              rewardType: reward.rewardType,
              requiresApproval: reward.requiresApproval,
              status: reward.status,
            }}
            archived={archived}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {reward.requiredPoints} pts
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {reward.rewardType === 'POINTS' ? 'Points-based' : 'Achievement'}
          </Badge>
          {reward.requiresApproval ? (
            <Badge variant="outline" className="text-[10px]">Needs approval</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-300">Auto-approve</Badge>
          )}
          {redemptionCount > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {redemptionCount} redemption{redemptionCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PendingRedemptionRow({ redemption }: { redemption: Redemption }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar color={redemption.child.avatarColor} name={redemption.child.displayName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              <span className="text-foreground">{redemption.child.displayName}</span>{' '}
              <span className="text-muted-foreground">requested</span>{' '}
              <span className="text-foreground">{redemption.reward.title}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {format(redemption.requestedAt, 'MMM d, h:mm a')} ·{' '}
              {formatDistanceToNow(redemption.requestedAt, { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {redemption.pointsCost}
          </Badge>
          <ApproveRedemptionButton redemptionId={redemption.id} />
          <DeclineRedemptionButton
            redemptionId={redemption.id}
            childName={redemption.child.displayName}
            rewardTitle={redemption.reward.title}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryRedemptionRow({ redemption }: { redemption: Redemption }) {
  const statusMeta: Record<string, { label: string; tone: string; icon: typeof Check }> = {
    APPROVED: { label: 'Approved', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', icon: Check },
    DECLINED: { label: 'Declined', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200', icon: X },
    FULFILLED: { label: 'Fulfilled', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', icon: PackageCheck },
    CANCELLED: { label: 'Cancelled', tone: 'bg-muted text-muted-foreground', icon: X },
  }
  const meta = statusMeta[redemption.status] ?? statusMeta.APPROVED
  const StatusIcon = meta.icon

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar color={redemption.child.avatarColor} name={redemption.child.displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">
            <span className="font-medium">{redemption.child.displayName}</span>{' '}
            <span className="text-muted-foreground">—</span>{' '}
            <DynamicIcon iconKey={redemption.reward.iconKey} size={12} className="inline text-primary" />{' '}
            {redemption.reward.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Requested {format(redemption.requestedAt, 'MMM d')}
            {redemption.fulfilledAt && ` · Fulfilled ${format(redemption.fulfilledAt, 'MMM d')}`}
            {redemption.note && ` · "${redemption.note}"`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {redemption.pointsCost}
        </Badge>
        <Badge variant="outline" className={`gap-1 ${meta.tone}`}>
          <StatusIcon className="h-3 w-3" />
          {meta.label}
        </Badge>
        {redemption.status === 'APPROVED' && <FulfillRedemptionButton redemptionId={redemption.id} />}
      </div>
    </div>
  )
}

function EmptyCatalog() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Gift className="h-7 w-7" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">No rewards yet</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Add a few rewards your child can work toward — experiences, books, or special family time. Keep them meaningful, not material.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ImportRewardsDialog>
            <Button variant="outline">Import from library</Button>
          </ImportRewardsDialog>
          <RewardFormDialog>
            <Button>Add a reward</Button>
          </RewardFormDialog>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyRedemptions({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: typeof Inbox
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <p className="mt-3 font-display font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
