'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Logo } from '@/components/deensteps/brand'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/children', label: 'সন্তান', icon: Users },
  { href: '/tasks', label: 'চ্যালেঞ্জ', icon: ListChecks },
  { href: '/rewards', label: 'পুরস্কার', icon: Gift },
  { href: '/reports', label: 'রিপোর্ট', icon: BarChart3 },
  { href: '/settings', label: 'সেটিংস', icon: Settings },
]

export function AppShell({
  children,
  familyName,
  pendingCount = 0,
  childrenList = [],
}: {
  children: React.ReactNode
  familyName: string
  pendingCount?: number
  childrenList?: { id: string; displayName: string; avatarColor: string }[]
}) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <SidebarContent
          familyName={familyName}
          isActive={isActive}
          pendingCount={pendingCount}
          childrenList={childrenList}
          theme={mounted ? theme : undefined}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onSignOut={() => signOut({ callbackUrl: '/' })}
        />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-border bg-sidebar shadow-premium">
            <SidebarContent
              familyName={familyName}
              isActive={isActive}
              pendingCount={pendingCount}
              childrenList={childrenList}
              theme={mounted ? theme : undefined}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              onSignOut={() => signOut({ callbackUrl: '/' })}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
            aria-label="মেনু খুলুন"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-muted-foreground">
              {familyName}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="থিম পরিবর্তন"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="নোটিফিকেশন" asChild>
              <Link href="/dashboard">
                <Bell className="h-4 w-4" />
                {pendingCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  familyName,
  isActive,
  pendingCount,
  childrenList,
  theme,
  onToggleTheme,
  onSignOut,
  onNavigate,
}: {
  familyName: string
  isActive: (href: string) => boolean
  pendingCount: number
  childrenList: { id: string; displayName: string; avatarColor: string }[]
  theme?: string
  onToggleTheme: () => void
  onSignOut: () => void
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link href="/dashboard" onClick={onNavigate} aria-label="Dashboard">
          <Logo />
        </Link>
        {onNavigate && (
          <button onClick={onNavigate} className="rounded-md p-1 text-muted-foreground lg:hidden" aria-label="মেনু বন্ধ করুন">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 scroll-area-custom">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {familyName}
        </p>
        <nav className="space-y-1" aria-label="Primary">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {childrenList.length > 0 && (
          <div className="mt-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              সন্তান
            </p>
            <div className="space-y-1">
              {childrenList.map((c) => (
                <Link
                  key={c.id}
                  href={`/child/${c.id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                  <span className="flex-1 truncate">{c.displayName}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          সাইন আউট
        </button>
      </div>
    </>
  )
}

const AVATAR_COLOR_CLASS: Record<string, string> = {
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  sage: 'bg-teal-500 text-white',
  rose: 'bg-rose-500 text-white',
  violet: 'bg-violet-500 text-white',
  sky: 'bg-sky-500 text-white',
}

export function Avatar({ color, name, size = 'md' }: { color: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.trim().slice(0, 2).toUpperCase()
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm'
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full font-bold', AVATAR_COLOR_CLASS[color] || AVATAR_COLOR_CLASS.emerald, sizeClass)}>
      {initials}
    </span>
  )
}
