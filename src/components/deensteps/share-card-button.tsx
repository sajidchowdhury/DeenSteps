'use client'

import * as React from 'react'
import { Share2, X, Download, Star, Flame, Trophy, Gift, Loader2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// Shareable View Card — generates a beautiful summary card as an image
// that the child can share to inspire others.
//
// Uses html-to-image library to convert a styled div to PNG.
// The card shows: child name, total points, streak, achievements count,
// and a custom message. Includes the DeenSteps branding + website link.
// ────────────────────────────────────────────────────────────────────────────

type AchievementBadge = {
  key: string
  name: string
  iconKey: string
  awarded: boolean
}

export function ShareCardButton({
  childName,
  childAvatarColor,
  totalPoints,
  streak,
  weekPoints,
  todayCompleted,
  todayTotal,
  achievements,
}: {
  childName: string
  childAvatarColor: string
  totalPoints: number
  streak: number
  weekPoints: number
  todayCompleted: number
  todayTotal: number
  achievements: AchievementBadge[]
}) {
  const [open, setOpen] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)

  const earnedAchievements = achievements.filter((a) => a.awarded)
  const avatarColorMap: Record<string, string> = {
    emerald: '#10b981',
    amber: '#f59e0b',
    sage: '#84cc16',
    sky: '#0ea5e9',
    rose: '#f43f5e',
    violet: '#8b5cf6',
  }
  const avatarColor = avatarColorMap[childAvatarColor] ?? '#10b981'

  const handleGenerate = async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      // Dynamically import html-to-image (avoids bundling if not used)
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#fef3c7',
      })
      setImageUrl(dataUrl)
    } catch (e) {
      console.error('Image generation failed:', e)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.download = `deensteps-${childName}-${Date.now()}.png`
    link.href = imageUrl
    link.click()
  }

  const handleShare = async () => {
    if (!imageUrl) return

    // Convert dataURL to blob for Web Share API
    const blob = await (await fetch(imageUrl)).blob()
    const file = new File([blob], `deensteps-${childName}.png`, { type: 'image/png' })

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${childName} এর DeenSteps অগ্রগতি`,
          text: `${childName} অর্জন করেছে ${totalPoints} পয়েন্ট! ছোট ছোট ভালো অভ্যাসে, সুন্দর মানুষ হয়ে ওঠা। আপনিও শুরু করুন: https://inventoryos.xyz/deensteps/`,
        })
      } catch {
        // User cancelled share — that's fine
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${childName} অর্জন করেছে ${totalPoints} পয়েন্ট! ছোট ছোট ভালো অভ্যাসে, সুন্দর মানুষ হয়ে ওঠা। আপনিও শুরু করুন: https://inventoryos.xyz/deensteps/`
        )
        alert('লিঙ্ক কপি হয়েছে! পরিচিতদের সাথে শেয়ার করুন।')
      } catch {
        handleDownload()
      }
    }
  }

  React.useEffect(() => {
    if (open && !imageUrl) {
      // Auto-generate on open
      setTimeout(handleGenerate, 300)
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300"
      >
        <Share2 className="h-3.5 w-3.5" />
        শেয়ার করো
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-violet-500" />
              আমার অগ্রগতি শেয়ার করো
            </DialogTitle>
          </DialogHeader>

          {/* The card (hidden but rendered for image generation) */}
          <div className="relative overflow-hidden" style={{ borderRadius: '16px' }}>
            {generating && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            )}

            {/* Visible card */}
            <div
              ref={cardRef}
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #d1fae5 50%, #e0e7ff 100%)',
                padding: '24px',
                borderRadius: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar circle */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Star style={{ width: '24px', height: '24px', color: 'white' }} fill="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                      {childName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      DeenSteps — ইসলামি অভ্যাস যাত্রা
                    </div>
                  </div>
                </div>
                {/* Logo star */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: 900 }}>D</span>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {/* Total points */}
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <Star style={{ width: '24px', height: '24px', color: '#f59e0b', margin: '0 auto 4px' }} fill='#fbbf24' />
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b' }}>{totalPoints}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>মোট পয়েন্ট</div>
                </div>

                {/* Streak */}
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <Flame style={{ width: '24px', height: '24px', color: '#f97316', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b' }}>{streak}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>দিন ধারাবাহিক</div>
                </div>

                {/* Week points */}
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <TrendingUp style={{ width: '24px', height: '24px', color: '#10b981', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b' }}>+{weekPoints}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>এই সপ্তাহে</div>
                </div>

                {/* Today */}
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <Gift style={{ width: '24px', height: '24px', color: '#8b5cf6', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b' }}>{todayCompleted}/{todayTotal}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>আজ সম্পন্ন</div>
                </div>
              </div>

              {/* Achievements */}
              {earnedAchievements.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                    🏆 অর্জন ({earnedAchievements.length} টি)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {earnedAchievements.slice(0, 6).map((a) => (
                      <div key={a.key} style={{
                        background: 'rgba(251, 191, 36, 0.2)',
                        border: '1px solid #fbbf24',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#92400e',
                      }}>
                        {a.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div style={{
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  ছোট ছোট ভালো অভ্যাসে, সুন্দর মানুষ হয়ে ওঠা।
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  আল্লাহ সবাইকে উত্তম তরবিয়ত দান করুন। 🤲
                </div>
              </div>

              {/* Footer with link */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(0,0,0,0.08)',
              }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>DeenSteps</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>—</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>inventoryos.xyz/deensteps</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {imageUrl && (
            <div className="mt-4 flex gap-2">
              <Button onClick={handleDownload} variant="outline" className="flex-1 gap-1.5">
                <Download className="h-4 w-4" />
                ডাউনলোড
              </Button>
              <Button onClick={handleShare} className="flex-1 gap-1.5">
                <Share2 className="h-4 w-4" />
                শেয়ার করো
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
