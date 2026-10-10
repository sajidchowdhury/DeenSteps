'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { cn } from '@/lib/utils'

type Category = { key: string; label: string; icon: string }

export function TaskFilterBar({
  categories,
  activeCategory,
  categoryCounts,
  query,
  activeStatus,
}: {
  categories: Category[]
  activeCategory: string
  categoryCounts: Record<string, number>
  query: string
  activeStatus: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = React.useState(query)

  // Sync local search state if the URL `q` changes externally
  React.useEffect(() => {
    setSearch(query)
  }, [query])

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === '') params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  // Debounce search
  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (search !== query) {
        updateParams({ q: search || undefined })
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [search])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status toggle */}
        <div className="inline-flex h-9 w-fit items-center rounded-lg border border-border bg-card p-1 text-sm">
          {['ACTIVE', 'ARCHIVED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateParams({ status: s === 'ACTIVE' ? undefined : s })}
              className={cn(
                'rounded-md px-3 py-1 font-medium transition-colors',
                activeStatus === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent/50',
              )}
            >
              {s === 'ACTIVE' ? 'Active' : 'Archived'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="pl-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:bg-accent"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        <CategoryChip
          active={activeCategory === 'ALL'}
          label="All"
          count={categoryCounts.ALL ?? 0}
          onClick={() => updateParams({ category: undefined })}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.key}
            active={activeCategory === c.key}
            label={c.label}
            icon={c.icon}
            count={categoryCounts[c.key] ?? 0}
            onClick={() => updateParams({ category: activeCategory === c.key ? undefined : c.key })}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryChip({
  active,
  label,
  count,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  icon?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent/50',
      )}
    >
      {icon && <DynamicIcon iconKey={icon} size={12} />}
      {label}
      <span
        className={cn(
          'ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
          active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  )
}
