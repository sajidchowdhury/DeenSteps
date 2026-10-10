import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Original SVG illustrations for DeenSteps marketing.
 * Friendly, warm, family-themed. No external dependencies.
 */

// ── Hero: Parent + child reviewing a habit chart together ────────────────
export function HeroFamilyScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-auto w-full', className)} aria-hidden="true">
      <defs>
        <linearGradient id="hero-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.55 0.13 160)" />
          <stop offset="1" stopColor="oklch(0.4 0.1 162)" />
        </linearGradient>
        <linearGradient id="hero-amber" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.85 0.14 85)" />
          <stop offset="1" stopColor="oklch(0.75 0.14 75)" />
        </linearGradient>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.8 0.08 220)" />
          <stop offset="1" stopColor="oklch(0.7 0.08 220)" />
        </linearGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="240" cy="370" rx="170" ry="18" fill="oklch(0.42 0.11 160 / 0.08)" />

      {/* Habit chart board (held between them) */}
      <rect x="150" y="120" width="180" height="150" rx="14" fill="white" stroke="oklch(0.42 0.11 160 / 0.2)" strokeWidth="2" />
      <rect x="150" y="120" width="180" height="32" rx="14" fill="url(#hero-emerald)" />
      <rect x="150" y="138" width="180" height="14" fill="url(#hero-emerald)" />
      <text x="240" y="141" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="inherit">আজকের অভ্যাস</text>

      {/* Checklist items on board */}
      <g>
        {/* Item 1 — checked */}
        <circle cx="170" cy="175" r="7" fill="oklch(0.55 0.13 160)" />
        <path d="M167 175l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="184" y="171" width="120" height="8" rx="4" fill="oklch(0.9 0.02 140)" />
        {/* Item 2 — checked */}
        <circle cx="170" cy="200" r="7" fill="oklch(0.55 0.13 160)" />
        <path d="M167 200l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="184" y="196" width="100" height="8" rx="4" fill="oklch(0.9 0.02 140)" />
        {/* Item 3 — in progress */}
        <circle cx="170" cy="225" r="7" fill="none" stroke="oklch(0.75 0.14 85)" strokeWidth="2" />
        <rect x="184" y="221" width="130" height="8" rx="4" fill="oklch(0.92 0.06 95)" />
        {/* Item 4 — not started */}
        <circle cx="170" cy="250" r="7" fill="none" stroke="oklch(0.7 0.02 140)" strokeWidth="2" />
        <rect x="184" y="246" width="90" height="8" rx="4" fill="oklch(0.93 0.01 140)" />
      </g>

      {/* Parent figure (left, taller) — wearing hijab */}
      <g>
        {/* Body */}
        <path d="M120 200 Q120 175 140 175 L160 175 Q180 175 180 200 L180 360 L120 360 Z" fill="url(#hero-emerald)" />
        {/* Hijab drape */}
        <path d="M118 200 Q112 240 120 360 L130 360 L130 210 Z" fill="oklch(0.4 0.1 162)" />
        <path d="M182 200 Q188 240 180 360 L170 360 L170 210 Z" fill="oklch(0.4 0.1 162)" />
        {/* Head + hijab top */}
        <circle cx="150" cy="150" r="24" fill="oklch(0.88 0.04 60)" />
        <path d="M126 150 Q126 124 150 124 Q174 124 174 150 Q174 138 165 132 Q150 126 135 132 Q126 138 126 150 Z" fill="oklch(0.4 0.1 162)" />
        {/* Face features */}
        <circle cx="143" cy="150" r="1.8" fill="oklch(0.2 0.02 200)" />
        <circle cx="157" cy="150" r="1.8" fill="oklch(0.2 0.02 200)" />
        <path d="M145 160 Q150 163 155 160" stroke="oklch(0.2 0.02 200)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Smile toward child */}
        <circle cx="155" cy="158" r="3" fill="oklch(0.85 0.08 40 / 0.5)" />
      </g>

      {/* Child figure (right, smaller) — pointing at board */}
      <g>
        {/* Body */}
        <path d="M300 240 Q300 220 315 220 L335 220 Q350 220 350 240 L350 360 L300 360 Z" fill="url(#hero-sky)" />
        {/* Head */}
        <circle cx="325" cy="195" r="19" fill="oklch(0.9 0.04 60)" />
        {/* Hair */}
        <path d="M307 190 Q307 174 325 174 Q343 174 343 190 Q343 182 335 178 Q325 175 315 178 Q307 182 307 190 Z" fill="oklch(0.35 0.05 50)" />
        {/* Face */}
        <circle cx="319" cy="195" r="1.6" fill="oklch(0.2 0.02 200)" />
        <circle cx="331" cy="195" r="1.6" fill="oklch(0.2 0.02 200)" />
        <path d="M320 203 Q325 206 330 203" stroke="oklch(0.2 0.02 200)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        {/* Arm pointing at board */}
        <path d="M300 245 Q280 235 265 220" stroke="url(#hero-sky)" strokeWidth="12" strokeLinecap="round" fill="none" />
        <circle cx="263" cy="218" r="6" fill="oklch(0.9 0.04 60)" />
      </g>

      {/* Floating star (top right) */}
      <g className="animate-float-soft">
        <path d="M400 80 L405 92 L418 93 L408 102 L411 115 L400 108 L389 115 L392 102 L382 93 L395 92 Z" fill="url(#hero-amber)" />
      </g>
      {/* Floating check badge (top left) */}
      <g className="animate-float-soft-delay">
        <circle cx="70" cy="90" r="18" fill="oklch(0.55 0.13 160)" />
        <path d="M62 90l5 5 9-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Small plant growing (bottom left) */}
      <g>
        <path d="M40 360 Q40 340 50 335" stroke="oklch(0.5 0.12 150)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="45" cy="338" rx="7" ry="4" fill="oklch(0.55 0.13 160)" transform="rotate(-30 45 338)" />
        <ellipse cx="55" cy="332" rx="7" ry="4" fill="oklch(0.55 0.13 160)" transform="rotate(20 55 332)" />
      </g>
    </svg>
  )
}

// ── Growing plant (for CTA / values) ──────────────────────────────────────
export function GrowingPlantIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-auto w-full', className)} aria-hidden="true">
      <defs>
        <linearGradient id="plant-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.55 0.13 160)" />
          <stop offset="1" stopColor="oklch(0.4 0.1 162)" />
        </linearGradient>
      </defs>
      {/* Pot */}
      <path d="M70 140 L130 140 L122 180 Q120 188 112 188 L88 188 Q80 188 78 180 Z" fill="oklch(0.7 0.1 50)" />
      <rect x="68" y="135" width="64" height="10" rx="3" fill="oklch(0.65 0.1 45)" />
      {/* Soil */}
      <ellipse cx="100" cy="140" rx="28" ry="5" fill="oklch(0.35 0.03 40)" />
      {/* Stem */}
      <path d="M100 138 Q100 110 100 80" stroke="url(#plant-emerald)" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Leaves */}
      <ellipse cx="82" cy="115" rx="14" ry="8" fill="oklch(0.55 0.13 160)" transform="rotate(-35 82 115)" />
      <ellipse cx="118" cy="100" rx="14" ry="8" fill="oklch(0.55 0.13 160)" transform="rotate(35 118 100)" />
      <ellipse cx="78" cy="92" rx="12" ry="7" fill="oklch(0.5 0.12 155)" transform="rotate(-40 78 92)" />
      {/* Top sprout + star */}
      <circle cx="100" cy="75" r="6" fill="url(#plant-emerald)" />
      <path d="M100 55 L103 64 L112 64 L105 70 L108 79 L100 73 L92 79 L95 70 L88 64 L97 64 Z" fill="oklch(0.82 0.14 85)" />
    </svg>
  )
}

// ── Parent + child growing together (final CTA) ──────────────────────────
export function FamilyGrowingIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-auto w-full', className)} aria-hidden="true">
      <defs>
        <linearGradient id="fam-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.55 0.13 160)" />
          <stop offset="1" stopColor="oklch(0.4 0.1 162)" />
        </linearGradient>
        <linearGradient id="fam-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.8 0.08 220)" />
          <stop offset="1" stopColor="oklch(0.7 0.08 220)" />
        </linearGradient>
      </defs>

      {/* Ground */}
      <ellipse cx="180" cy="255" rx="150" ry="14" fill="oklch(0.55 0.13 160 / 0.08)" />

      {/* Path / stepping stones */}
      <g opacity="0.5">
        <ellipse cx="60" cy="245" rx="16" ry="5" fill="oklch(0.7 0.02 140)" />
        <ellipse cx="110" cy="250" rx="16" ry="5" fill="oklch(0.7 0.02 140)" />
        <ellipse cx="250" cy="250" rx="16" ry="5" fill="oklch(0.7 0.02 140)" />
        <ellipse cx="300" cy="245" rx="16" ry="5" fill="oklch(0.7 0.02 140)" />
      </g>

      {/* Parent (left) holding child's hand */}
      <g>
        {/* Parent body */}
        <path d="M130 150 Q130 130 145 130 L165 130 Q180 130 180 150 L180 250 L130 250 Z" fill="url(#fam-emerald)" />
        {/* Hijab drape */}
        <path d="M128 150 Q123 185 130 250 L138 250 L138 160 Z" fill="oklch(0.4 0.1 162)" />
        <path d="M182 150 Q187 185 180 250 L172 250 L172 160 Z" fill="oklch(0.4 0.1 162)" />
        {/* Head */}
        <circle cx="155" cy="110" r="20" fill="oklch(0.88 0.04 60)" />
        <path d="M135 110 Q135 88 155 88 Q175 88 175 110 Q175 100 167 95 Q155 90 143 95 Q135 100 135 110 Z" fill="oklch(0.4 0.1 162)" />
        {/* Face */}
        <circle cx="149" cy="110" r="1.5" fill="oklch(0.2 0.02 200)" />
        <circle cx="161" cy="110" r="1.5" fill="oklch(0.2 0.02 200)" />
        <path d="M150 118 Q155 121 160 118" stroke="oklch(0.2 0.02 200)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        {/* Arm reaching to child */}
        <path d="M178 165 Q200 170 215 180" stroke="url(#fam-emerald)" strokeWidth="11" strokeLinecap="round" fill="none" />
      </g>

      {/* Child (right) holding parent's hand */}
      <g>
        <path d="M210 185 Q210 170 220 170 L235 170 Q245 170 245 185 L245 250 L210 250 Z" fill="url(#fam-sky)" />
        <circle cx="227" cy="160" r="15" fill="oklch(0.9 0.04 60)" />
        <path d="M213 158 Q213 145 227 145 Q241 145 241 158 Q241 150 234 147 Q227 145 220 147 Q213 150 213 158 Z" fill="oklch(0.35 0.05 50)" />
        <circle cx="222" cy="160" r="1.3" fill="oklch(0.2 0.02 200)" />
        <circle cx="232" cy="160" r="1.3" fill="oklch(0.2 0.02 200)" />
        <path d="M223 167 Q227 169 231 167" stroke="oklch(0.2 0.02 200)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Arm to parent */}
        <path d="M215 188 Q210 184 215 180" stroke="url(#fam-sky)" strokeWidth="9" strokeLinecap="round" fill="none" />
      </g>

      {/* Hearts floating above */}
      <g className="animate-float-soft">
        <path d="M200 60 Q195 52 200 48 Q205 52 200 60 Z" fill="oklch(0.65 0.18 15)" />
        <path d="M200 60 Q195 52 200 48" stroke="oklch(0.65 0.18 15)" strokeWidth="3" fill="none" />
      </g>
      <g className="animate-float-soft-delay">
        <path d="M250 45 Q247 40 250 37 Q253 40 250 45 Z" fill="oklch(0.65 0.18 15)" opacity="0.7" />
      </g>

      {/* Sun top right */}
      <circle cx="300" cy="55" r="18" fill="oklch(0.88 0.12 85)" opacity="0.6" />
      <g opacity="0.5">
        <line x1="300" y1="25" x2="300" y2="32" stroke="oklch(0.88 0.12 85)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="300" y1="78" x2="300" y2="85" stroke="oklch(0.88 0.12 85)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="270" y1="55" x2="277" y2="55" stroke="oklch(0.88 0.12 85)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="323" y1="55" x2="330" y2="55" stroke="oklch(0.88 0.12 85)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ── Central child illustration for features infographic ───────────────────
export function CentralChildIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-auto w-full', className)} aria-hidden="true">
      <defs>
        <linearGradient id="cc-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.55 0.13 160)" />
          <stop offset="1" stopColor="oklch(0.4 0.1 162)" />
        </linearGradient>
        <linearGradient id="cc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="oklch(0.8 0.08 220)" />
          <stop offset="1" stopColor="oklch(0.7 0.08 220)" />
        </linearGradient>
      </defs>
      {/* Glow background */}
      <circle cx="100" cy="100" r="92" fill="oklch(0.55 0.13 160 / 0.06)" />
      <circle cx="100" cy="100" r="78" fill="oklch(0.55 0.13 160 / 0.04)" />

      {/* Body */}
      <path d="M70 120 Q70 105 85 105 L115 105 Q130 105 130 120 L130 180 L70 180 Z" fill="url(#cc-sky)" />
      {/* Head */}
      <circle cx="100" cy="85" r="26" fill="oklch(0.9 0.04 60)" />
      {/* Hair */}
      <path d="M75 85 Q75 62 100 62 Q125 62 125 85 Q125 72 115 67 Q100 63 85 67 Q75 72 75 85 Z" fill="oklch(0.35 0.05 50)" />
      {/* Face */}
      <circle cx="92" cy="85" r="2" fill="oklch(0.2 0.02 200)" />
      <circle cx="108" cy="85" r="2" fill="oklch(0.2 0.02 200)" />
      <path d="M93 95 Q100 99 107 95" stroke="oklch(0.2 0.02 200)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <circle cx="85" cy="92" r="3" fill="oklch(0.85 0.08 15 / 0.4)" />
      <circle cx="115" cy="92" r="3" fill="oklch(0.85 0.08 15 / 0.4)" />

      {/* Arms up celebrating */}
      <path d="M75 120 Q60 100 55 80" stroke="url(#cc-sky)" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M125 120 Q140 100 145 80" stroke="url(#cc-sky)" strokeWidth="12" strokeLinecap="round" fill="none" />

      {/* Stars in hands */}
      <path d="M55 75 L57 81 L63 81 L58 85 L60 91 L55 87 L50 91 L52 85 L47 81 L53 81 Z" fill="oklch(0.82 0.14 85)" />
      <path d="M145 75 L147 81 L153 81 L148 85 L150 91 L145 87 L140 91 L142 85 L137 81 L143 81 Z" fill="oklch(0.82 0.14 85)" />
    </svg>
  )
}
