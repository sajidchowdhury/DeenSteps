'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// Phase B (B1): Nūr — the DeenSteps mascot
//
// Nūr (Arabic for "light") is a friendly lantern-star hybrid.
// - Body: a rounded 8-pointed star (echoes the DeenSteps brand mark)
// - A small flame glows on top (the "light")
// - Face: two eyes + a mouth, with 5 emotional states
//
// States:
//   happy       — gentle smile, eyes open, flame steady (default)
//   proud       — eyes closed in joy (^_^), big smile, flame bright + sparkles
//   thinking    — one eye squinting, small "o" mouth, slight tilt
//   encouraging — warm smile, eyes open, flame bright
//   concerned   — soft frown, worried eyes, flame dimmed
//
// Sizes:
//   sm  (48px)  — inline, e.g. in headers
//   md  (80px)  — card-level, e.g. next to a message
//   lg  (140px) — section-level, e.g. today's mission hero
//   xl  (220px) — celebration screens
//
// Colors come from the warm palette in globals.css:
//   body  → warm gold (sunshine)
//   flame → emerald
//   face → deep slate
// ────────────────────────────────────────────────────────────────────────────

export type NurMood = 'happy' | 'proud' | 'thinking' | 'encouraging' | 'concerned'

const SIZE_MAP: Record<string, { px: string; viewBox: string }> = {
  sm: { px: 'w-12 h-12', viewBox: '0 0 100 100' },
  md: { px: 'w-20 h-20', viewBox: '0 0 100 100' },
  lg: { px: 'w-36 h-36', viewBox: '0 0 100 100' },
  xl: { px: 'w-56 h-56', viewBox: '0 0 100 100' },
}

export function Nur({ state = 'happy', size = 'md', className }: { state?: NurMood; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const { px, viewBox } = SIZE_MAP[size] ?? SIZE_MAP.md

  return (
    <svg
      viewBox={viewBox}
      className={cn(px, 'inline-block select-none', className)}
      role="img"
      aria-label={`Nūr — ${state}`}
    >
      <defs>
        <radialGradient id="nur-body-gradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="60%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <radialGradient id="nur-flame-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
        <radialGradient id="nur-flame-dim" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </radialGradient>
      </defs>

      {/* Flame on top — state-dependent */}
      {state === 'concerned' ? (
        <path
          d="M 50,8 C 47,14 48,18 50,20 C 52,18 53,14 50,8 Z"
          fill="url(#nur-flame-dim)"
          className="opacity-60"
        />
      ) : state === 'proud' ? (
        <>
          <path
            d="M 50,3 C 44,12 46,20 50,24 C 54,20 56,12 50,3 Z"
            fill="url(#nur-flame-gradient)"
            className="animate-pulse"
          />
          {/* Sparkles for proud state */}
          <g className="opacity-80">
            <circle cx="30" cy="15" r="1.5" fill="#FBBF24" />
            <circle cx="70" cy="15" r="1.5" fill="#FBBF24" />
            <circle cx="22" cy="30" r="1" fill="#FBBF24" />
            <circle cx="78" cy="30" r="1" fill="#FBBF24" />
          </g>
        </>
      ) : state === 'thinking' ? (
        <path
          d="M 50,10 C 46,16 47,20 50,22 C 53,20 54,16 50,10 Z"
          fill="url(#nur-flame-gradient)"
          className="opacity-80"
        />
      ) : (
        <path
          d="M 50,6 C 45,14 46,19 50,22 C 54,19 55,14 50,6 Z"
          fill="url(#nur-flame-gradient)"
        />
      )}

      {/* Star body — 8-pointed rounded star */}
      <path
        d="M 50,22
           L 56,34 L 66,30 L 64,42 L 76,44
           L 66,52 L 72,62 L 60,58 L 50,68
           L 40,58 L 28,62 L 34,52 L 24,44
           L 36,42 L 34,30 L 44,34 Z"
        fill="url(#nur-body-gradient)"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className={state === 'thinking' ? 'origin-center' : ''}
        style={state === 'thinking' ? { transform: 'rotate(-5deg)', transformOrigin: '50px 45px' } : undefined}
      />

      {/* Cheeks — subtle blush for happy/proud/encouraging */}
      {(state === 'happy' || state === 'proud' || state === 'encouraging') && (
        <>
          <circle cx="38" cy="48" r="3" fill="#FB7185" opacity="0.4" />
          <circle cx="62" cy="48" r="3" fill="#FB7185" opacity="0.4" />
        </>
      )}

      {/* Eyes — state-dependent */}
      {state === 'proud' ? (
        // Closed happy eyes (^_^)
        <>
          <path d="M 35,43 Q 39,40 43,43" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 57,43 Q 61,40 65,43" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : state === 'thinking' ? (
        // One eye squinting, one normal
        <>
          <path d="M 35,43 Q 39,41 43,43" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="61" cy="43" r="2.5" fill="#1e293b" />
        </>
      ) : state === 'concerned' ? (
        // Worried eyes (slightly angled inward)
        <>
          <ellipse cx="39" cy="44" rx="2.5" ry="2" fill="#1e293b" transform="rotate(-15 39 44)" />
          <ellipse cx="61" cy="44" rx="2.5" ry="2" fill="#1e293b" transform="rotate(15 61 44)" />
          {/* Worried eyebrows */}
          <path d="M 34,39 L 44,40" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 56,40 L 66,39" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        // Normal open eyes (happy + encouraging)
        <>
          <circle cx="39" cy="43" r="2.8" fill="#1e293b" />
          <circle cx="61" cy="43" r="2.8" fill="#1e293b" />
          {/* Eye sparkle */}
          <circle cx="40" cy="42" r="0.8" fill="white" />
          <circle cx="62" cy="42" r="0.8" fill="white" />
        </>
      )}

      {/* Mouth — state-dependent */}
      {state === 'happy' && (
        <path d="M 40,53 Q 50,59 60,53" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {state === 'proud' && (
        <>
          <path d="M 38,52 Q 50,64 62,52" stroke="#1e293b" strokeWidth="2.5" fill="#FB7185" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {state === 'thinking' && (
        <ellipse cx="50" cy="55" rx="2.5" ry="3" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      )}
      {state === 'encouraging' && (
        <path d="M 40,52 Q 50,60 60,52" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {state === 'concerned' && (
        <path d="M 40,57 Q 50,52 60,57" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* Arms — for encouraging state (waving) */}
      {state === 'encouraging' && (
        <>
          <path d="M 28,50 Q 20,48 18,42" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="17" cy="41" r="2.5" fill="url(#nur-body-gradient)" stroke="#F59E0B" strokeWidth="1" />
        </>
      )}
    </svg>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Speech bubble — for when Nūr says something
// ────────────────────────────────────────────────────────────────────────────

export function NurSpeechBubble({
  children,
  size = 'md',
  className,
}: {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const text = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-foreground shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40',
        text,
        className,
      )}
    >
      {/* Tail */}
      <svg
        className="absolute -left-2 top-1/2 -translate-y-1/2"
        width="10"
        height="14"
        viewBox="0 0 10 14"
        fill="none"
      >
        <path d="M 10,0 L 10,14 L 0,7 Z" fill="#FEF3C7" className="dark:fill-amber-950/40" />
        <path d="M 10,0 L 10,14 L 0,7 Z" stroke="#FBBF24" strokeWidth="1" className="dark:stroke-amber-900/50" fill="none" />
      </svg>
      <p className="font-medium leading-relaxed">{children}</p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Combined Nūr + speech bubble layout
// ────────────────────────────────────────────────────────────────────────────

export function NurWithMessage({
  state = 'happy',
  size = 'md',
  message,
  className,
}: {
  state?: NurMood
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Nur state={state} size={size} className="flex-shrink-0" />
      <NurSpeechBubble size={size === 'lg' || size === 'xl' ? 'lg' : 'md'}>{message}</NurSpeechBubble>
    </div>
  )
}
