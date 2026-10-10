'use client'

import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import { ICON_KEY_TO_LUCIDE } from '@/lib/constants'
import { cn } from '@/lib/utils'

type IconProps = React.SVGProps<SVGSVGElement> & {
  iconKey?: string
  name?: string
  size?: number
  className?: string
}

/**
 * Resolve a stable icon key (from DB/library/seed) to a Lucide icon component.
 * Falls back to a default check icon for unknown keys.
 */
export function DynamicIcon({ iconKey, name, size = 18, className, ...rest }: IconProps) {
  const lucideName = name ?? (iconKey ? ICON_KEY_TO_LUCIDE[iconKey] : undefined) ?? 'CheckCheck'
  const Comp = (LucideIcons as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>>)[lucideName] ?? LucideIcons.CheckCheck
  return <Comp size={size} className={cn(className)} {...rest} />
}
