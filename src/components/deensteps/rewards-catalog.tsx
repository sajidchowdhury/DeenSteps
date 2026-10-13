'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { RewardRowActions } from '@/components/deensteps/reward-dialogs'
import { REWARD_CATEGORIES } from '@/lib/constants'

type Reward = {
  id: string
  title: string
  description: string | null
  iconKey: string
  requiredPoints: number
  rewardType: string
  requiresApproval: boolean
  status: string
  category: string
  maxPerWeek: number | null
  maxPerMonth: number | null
  cooldownDays: number
  estimatedCost: number | null
  createdAt: Date
  _count: { redemptions: number }
}

const CATEGORY_COLORS: Record<string, string> = {
  EXPERIENCE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  LEARNING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  PRIVILEGE: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  FOOD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
}

const CATEGORY_LABELS: Record<string, string> = {
  EXPERIENCE: 'অভিজ্ঞতা',
  LEARNING: 'শেখা',
  PRIVILEGE: 'সুবিধা',
  FOOD: 'খাবার',
}

export function RewardsCatalog({ rewards }: { rewards: Reward[] }) {
  const [activeCategory, setActiveCategory] = React.useState<string>('ALL')

  const filtered = activeCategory === 'ALL'
    ? rewards
    : rewards.filter((r) => r.category === activeCategory)

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            activeCategory === 'ALL' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent/40',
          )}
        >
          সব ({rewards.length})
        </button>
        {REWARD_CATEGORIES.map((cat) => {
          const count = rewards.filter((r) => r.category === cat.key).length
          if (count === 0) return null
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                activeCategory === cat.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent/40',
              )}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Reward cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((reward) => (
          <RewardCardWithCategory key={reward.id} reward={reward} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          এই ক্যাটাগরিতে কোনো পুরস্কার নেই।
        </div>
      )}
    </div>
  )
}

function RewardCardWithCategory({ reward }: { reward: Reward }) {
  const isFree = !reward.estimatedCost || reward.estimatedCost === 0
  const catLabel = CATEGORY_LABELS[reward.category] || reward.category

  return (
    <Card className="transition-shadow hover:shadow-premium">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <DynamicIcon iconKey={reward.iconKey} size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-foreground">{reward.title}</p>
              {isFree && (
                <Badge className="bg-emerald-500 text-[9px] text-white hover:bg-emerald-600">ফ্রি</Badge>
              )}
            </div>
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
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {reward.requiredPoints} পয়েন্ট
          </Badge>
          <Badge variant="outline" className={cn('text-[10px]', CATEGORY_COLORS[reward.category])}>
            {catLabel}
          </Badge>
          {reward.requiresApproval ? (
            <Badge variant="outline" className="text-[10px]">অনুমোদন দরকার</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-300">অটো-অনুমোদন</Badge>
          )}
          {(reward.maxPerWeek || reward.maxPerMonth) && (
            <Badge variant="secondary" className="text-[9px]">
              {reward.maxPerWeek ? `সপ্তাহে ${reward.maxPerWeek}×` : ''}
              {reward.maxPerWeek && reward.maxPerMonth ? ' · ' : ''}
              {reward.maxPerMonth ? `মাসে ${reward.maxPerMonth}×` : ''}
            </Badge>
          )}
          {reward._count.redemptions > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {reward._count.redemptions} বার রিডিম হয়েছে
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
