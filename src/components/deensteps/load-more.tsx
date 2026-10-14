'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ────────────────────────────────────────────────────────────────────────────
// LoadMore wrapper — shows 10 items at a time with a "load more" button.
// Replaces fixed-height scroll containers.
// ────────────────────────────────────────────────────────────────────────────

export function LoadMore<T>({
  items,
  pageSize = 10,
  renderItem,
}: {
  items: T[]
  pageSize?: number
  renderItem: (item: T, index: number) => React.ReactNode
}) {
  const [visibleCount, setVisibleCount] = React.useState(pageSize)
  const visible = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <div>
      {visible.map((item, i) => renderItem(item, i))}
      {hasMore && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((c) => c + pageSize)}
            className="gap-1.5"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            আরো দেখুন ({items.length - visibleCount})
          </Button>
        </div>
      )}
    </div>
  )
}
