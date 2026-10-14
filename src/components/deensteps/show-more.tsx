'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ────────────────────────────────────────────────────────────────────────────
// ShowMore wrapper — renders all children but only shows N at a time.
// The rest are hidden with CSS, revealed on "load more" click.
// Works with server-rendered children (no need to pass data to client).
// ────────────────────────────────────────────────────────────────────────────

export function ShowMore({ children, initialCount = 10 }: { children: React.ReactNode[]; initialCount?: number }) {
  const [visibleCount, setVisibleCount] = React.useState(initialCount)
  const total = children.length

  return (
    <div>
      {children.slice(0, visibleCount)}
      {visibleCount < total && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((c) => c + initialCount)}
            className="gap-1.5"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            আরো দেখুন ({total - visibleCount})
          </Button>
        </div>
      )}
    </div>
  )
}
