import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * DeenSteps brand mark — an 8-pointed Islamic-inspired star formed by two
 * overlapping squares, with a step motif at the center to echo "steps".
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-9 w-9', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="deensteps-emerald" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.55 0.13 160)" />
          <stop offset="1" stopColor="oklch(0.38 0.1 162)" />
        </linearGradient>
      </defs>
      {/* outer 8-point star (two overlapping squares) */}
      <rect x="9.5" y="9.5" width="29" height="29" rx="4" transform="rotate(0 24 24)" fill="url(#deensteps-emerald)" opacity="0.18" />
      <rect x="9.5" y="9.5" width="29" height="29" rx="4" transform="rotate(45 24 24)" fill="url(#deensteps-emerald)" opacity="0.28" />
      {/* inner steps */}
      <g fill="url(#deensteps-emerald)">
        <rect x="17" y="27" width="4" height="4" rx="1" />
        <rect x="22" y="23" width="4" height="4" rx="1" />
        <rect x="27" y="19" width="4" height="4" rx="1" />
      </g>
      <circle cx="24" cy="14" r="2.2" fill="oklch(0.75 0.14 85)" />
    </svg>
  )
}

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <BrandMark className="h-8 w-8" />
      {showText && (
        <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
          Deen<span className="text-primary">Steps</span>
        </span>
      )}
    </span>
  )
}
