import { redirect } from 'next/navigation'
import { getPinAndFirstChild } from "@/server/actions/pin-actions"
import { format, formatDistanceToNow } from 'date-fns'
import { Gift, Check, X, Inbox, History, PackageCheck, Sparkles, Star } from 'lucide-react'

import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import {
  RewardFormDialog,
  RewardRowActions,
  ApproveRedemptionButton,
  DeclineRedemptionButton,
  FulfillRedemptionButton,
} from '@/components/deensteps/reward-dialogs'
import { RewardQuickAdd } from '@/components/deensteps/reward-quick-add'
import { RewardsCatalog } from '@/components/deensteps/rewards-catalog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

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
  const { pinSettings, firstChildId } = await getPinAndFirstChild()

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
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList} hasPin={!!pinSettings?.parentPin} firstChildId={firstChildId}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              পুরস্কার
            </h1>
            <p className="text-sm text-muted-foreground">
              সন্তানের জন্য পুরস্কার তৈরি করুন আর রিডিম্পশন অনুরোধ ম্যানেজ করুন।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RewardQuickAdd />
            <RewardFormDialog>
              <Button>
                <Gift className="h-4 w-4" /> নতুন পুরস্কার
              </Button>
            </RewardFormDialog>
          </div>
        </div>

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="catalog" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> ক্যাটালগ
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-bold">
                {activeRewards.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              <Inbox className="h-3.5 w-3.5" /> অপেক্ষমান
              {pendingRedemptions.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {pendingRedemptions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> ইতিহাস
            </TabsTrigger>
          </TabsList>

          {/* Catalog tab */}
          <TabsContent value="catalog" className="mt-4 space-y-4">
            {activeRewards.length === 0 ? (
              <EmptyCatalog />
            ) : (
              <RewardsCatalog rewards={activeRewards.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description,
                iconKey: r.iconKey,
                requiredPoints: r.requiredPoints,
                rewardType: r.rewardType,
                requiresApproval: r.requiresApproval,
                status: r.status,
                category: r.category,
                maxPerWeek: r.maxPerWeek,
                maxPerMonth: r.maxPerMonth,
                cooldownDays: r.cooldownDays,
                estimatedCost: r.estimatedCost,
                createdAt: r.createdAt,
                _count: { redemptions: r._count.redemptions },
              }))} />
            )}

            {archivedRewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">আর্কাইভ করা পুরস্কার</CardTitle>
                  <CardDescription>ক্যাটালগ থেকে লুকানো আছে। ইতিহাস সংরক্ষিত।</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedRewards.map((reward) => (
                    <Card key={reward.id} className="opacity-70">
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
                        </div>
                        <div className="mt-4">
                          <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {reward.requiredPoints} পয়েন্ট
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending tab */}
          <TabsContent value="pending" className="mt-4">
            {pendingRedemptions.length === 0 ? (
              <EmptyRedemptions
                title="কোনো অপেক্ষমান রিডিম্পশন নেই"
                description="সন্তান যখন অনুমোদনের প্রয়োজনীয় পুরস্কার চাইবে, এখানে দেখা যাবে।"
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
                title="এখনো কোনো রিডিম্পশন ইতিহাস নেই"
                description="অনুমোদিত, প্রত্যাখ্যাত ও পূরণকৃত রিডিম্পশন এখানে দেখা যাবে।"
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

function PendingRedemptionRow({ redemption }: { redemption: Redemption }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar color={redemption.child.avatarColor} name={redemption.child.displayName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              <span className="text-foreground">{redemption.child.displayName}</span>{' '}
              <span className="text-muted-foreground">অনুরোধ করেছে</span>{' '}
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
    APPROVED: { label: 'অনুমোদিত', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', icon: Check },
    DECLINED: { label: 'প্রত্যাখ্যাত', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200', icon: X },
    FULFILLED: { label: 'পূরণ হয়েছে', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', icon: PackageCheck },
    CANCELLED: { label: 'বাতিল', tone: 'bg-muted text-muted-foreground', icon: X },
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
            অনুরোধ করেছে {format(redemption.requestedAt, 'MMM d')}
            {redemption.fulfilledAt && ` · পূরণ হয়েছে ${format(redemption.fulfilledAt, 'MMM d')}`}
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
        <p className="mt-4 font-display text-lg font-semibold text-foreground">এখনো কোনো পুরস্কার নেই</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          সন্তানের জন্য কিছু পুরস্কার যোগ করুন — সাজেশন থেকে বাছাই করুন বা নিজে তৈরি করুন।
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <RewardQuickAdd />
          <RewardFormDialog>
            <Button>নতুন পুরস্কার</Button>
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
