'use client'

import * as React from 'react'
import { Nur } from '@/components/deensteps/mascot'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ────────────────────────────────────────────────────────────────────────────
// Phase D (D4): Achievement badge component
// Renders a single achievement badge — earned or locked.
// ────────────────────────────────────────────────────────────────────────────

export type AchievementBadgeData = {
  key: string
  name: string
  description: string
  iconKey: string
  awarded: boolean
  awardedAt: string | null
}

export function AchievementBadge({ achievement, size = 'md' }: { achievement: AchievementBadgeData; size?: 'sm' | 'md' }) {
  const tileSize = size === 'sm' ? 'h-9 w-9' : 'h-12 w-12'
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  const labelSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <div className="flex flex-col items-center text-center">
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          tileSize,
          achievement.awarded
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {achievement.awarded ? (
          <DynamicIcon iconKey={achievement.iconKey} className={iconSize} />
        ) : (
          <Lock className={cn(iconSize, 'opacity-50')} />
        )}
      </span>
      <p className={cn('mt-1.5 font-medium', labelSize, achievement.awarded ? 'text-foreground' : 'text-muted-foreground')}>
        {achievement.name}
      </p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Phase D (D4): Achievement grid — shows all 12 badges in a grid
// ────────────────────────────────────────────────────────────────────────────

export function AchievementGrid({ achievements, size = 'md' }: { achievements: AchievementBadgeData[]; size?: 'sm' | 'md' }) {
  const earnedCount = achievements.filter((a) => a.awarded).length
  const cols = size === 'sm' ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          🏆 অর্জন
        </p>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
          {earnedCount} / {achievements.length}
        </span>
      </div>
      <div className={cn('grid gap-3', cols)}>
        {achievements.map((a) => (
          <AchievementBadge key={a.key} achievement={a} size={size} />
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Phase D (D5): Achievement unlock celebration overlay
//
// Detects newly-awarded achievements by comparing earned achievement IDs
// against a "seen" set stored in localStorage. If any unseen achievements
// exist, shows a full-screen celebration overlay with Nūr + confetti.
//
// The overlay auto-dismisses on tap and marks the achievement as seen.
// ────────────────────────────────────────────────────────────────────────────

export type EarnedAchievement = {
  id: string
  key: string
  name: string
  description: string
  iconKey: string
  awardedAt: string
}

export function AchievementCelebrationOverlay({
  childId,
  earnedAchievements,
}: {
  childId: string
  earnedAchievements: EarnedAchievement[]
}) {
  const [unseen, setUnseen] = React.useState<EarnedAchievement | null>(null)
  const [showConfetti, setShowConfetti] = React.useState(false)

  // Check for unseen achievements on mount + when earnedAchievements changes
  React.useEffect(() => {
    if (earnedAchievements.length === 0) return

    const storageKey = `deensteps_seen_achievements_${childId}`
    let seenIds: string[] = []
    try {
      const stored = localStorage.getItem(storageKey)
      seenIds = stored ? JSON.parse(stored) : []
    } catch {
      seenIds = []
    }

    // Find the first earned achievement that hasn't been seen
    const firstUnseen = earnedAchievements.find((a) => !seenIds.includes(a.id))

    if (firstUnseen) {
      setUnseen(firstUnseen)
      setShowConfetti(true)
    }
  }, [childId, earnedAchievements])

  const handleDismiss = () => {
    if (!unseen) return

    // Mark this achievement as seen
    const storageKey = `deensteps_seen_achievements_${childId}`
    try {
      const stored = localStorage.getItem(storageKey)
      const seenIds: string[] = stored ? JSON.parse(stored) : []
      seenIds.push(unseen.id)
      localStorage.setItem(storageKey, JSON.stringify(seenIds))
    } catch {
      // localStorage might not be available
    }

    setUnseen(null)
    setShowConfetti(false)
  }

  if (!unseen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm"
      onClick={handleDismiss}
    >
      {/* Confetti dots */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100
            const delay = Math.random() * 0.5
            const duration = 1.5 + Math.random()
            const colors = ['#FBBF24', '#34D399', '#60A5FA', '#F87171', '#A78BFA']
            const color = colors[i % colors.length]
            return (
              <div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  left: `${left}%`,
                  top: '-10px',
                  backgroundColor: color,
                  animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                }}
              />
            )
          })}
          <style>{`
            @keyframes confetti-fall {
              to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* Celebration card */}
      <div
        className="relative mx-4 max-w-sm rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-cream to-emerald-50 p-6 text-center shadow-xl dark:border-amber-900/40 dark:from-amber-950/40 dark:via-secondary dark:to-emerald-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nūr mascot — proud, xl size */}
        <div className="mb-2 flex justify-center">
          <Nur state="proud" size="xl" />
        </div>

        {/* Headline */}
        <p className="font-display text-lg font-extrabold text-foreground">
          নতুন অর্জন আনলক! 🎉
        </p>

        {/* Badge icon */}
        <div className="my-3 flex justify-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-md dark:bg-amber-900/40 dark:text-amber-300">
            <DynamicIcon iconKey={unseen.iconKey} className="h-8 w-8" />
          </span>
        </div>

        {/* Badge name */}
        <p className="font-display text-xl font-bold text-amber-700 dark:text-amber-300">
          {unseen.name}
        </p>

        {/* Badge description */}
        <p className="mt-1 text-sm text-muted-foreground">
          {unseen.description}
        </p>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-amber-600"
        >
          চমৎকার! ✨
        </button>
      </div>
    </div>
  )
}
