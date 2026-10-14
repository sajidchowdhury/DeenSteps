'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { ClipboardCheck, AlertCircle, Heart, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// Game-like tab bar — big colorful buttons instead of thin tabs
// ────────────────────────────────────────────────────────────────────────────

export type TabKey = 'review' | 'incidents' | 'sadaqah' | 'investment' | 'deductions'

const TAB_CONFIG: Record<TabKey, { label: string; icon: typeof ClipboardCheck; color: string; activeColor: string }> = {
  review: { label: 'রিভিউ', icon: ClipboardCheck, color: 'amber', activeColor: 'bg-amber-500 text-white border-amber-600' },
  incidents: { label: 'ইনসিডেন্ট', icon: AlertCircle, color: 'rose', activeColor: 'bg-rose-500 text-white border-rose-600' },
  sadaqah: { label: 'সাদাকাহ', icon: Heart, color: 'emerald', activeColor: 'bg-emerald-500 text-white border-emerald-600' },
  investment: { label: 'বিনিয়োগ', icon: TrendingUp, color: 'sky', activeColor: 'bg-sky-500 text-white border-sky-600' },
  deductions: { label: 'কর্তন', icon: Minus, color: 'violet', activeColor: 'bg-violet-500 text-white border-violet-600' },
}

export function GameTabs({
  activeTab,
  onTabChange,
  badges,
}: {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  badges: Partial<Record<TabKey, number>>
}) {
  const tabs = Object.keys(TAB_CONFIG) as TabKey[]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((key) => {
        const config = TAB_CONFIG[key]
        const Icon = config.icon
        const isActive = activeTab === key
        const badge = badges[key]
        const badgeColor = isActive ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'

        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all',
              isActive
                ? cn(config.activeColor, 'shadow-md -translate-y-0.5')
                : 'border-border bg-card text-muted-foreground hover:bg-accent/40 hover:-translate-y-0.5'
            )}
          >
            <Icon className="h-4 w-4" />
            {config.label}
            {badge !== undefined && badge > 0 && (
              <span className={cn(
                'ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                badgeColor
              )}>
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Hook to read tab from URL
export function useTabFromUrl(): [TabKey, (tab: TabKey) => void] {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabKey | null
  const [activeTab, setActiveTab] = React.useState<TabKey>(tabParam ?? 'review')

  React.useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return [activeTab, setActiveTab]
}
