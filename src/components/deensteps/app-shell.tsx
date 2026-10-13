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
  CalendarRange,
  ClipboardCheck,
  Trophy,
  Star,
  Book,
  Heart,
  Award,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Logo } from '@/components/deensteps/brand'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/review', label: 'কার্যকলাপ', icon: ClipboardCheck },
  { href: '/planner', label: 'প্ল্যানার', icon: CalendarRange },
  { href: '/children', label: 'সন্তান', icon: Users },
  { href: '/tasks', label: 'কাজ', icon: ListChecks },
  { href: '/challenges', label: 'সাপ্তাহিক চ্যালেঞ্জ', icon: Trophy },
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
          onSignOut={() => signOut({ callbackUrl: '/deensteps/' })}
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
              onSignOut={() => signOut({ callbackUrl: '/deensteps/' })}
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
              {/* Phase A (UI audit): bell previously linked to /dashboard which
                  was misleading — a bell should show actionable items. We now
                  link to /review (the pending-approvals queue) which is the
                  most common actionable item the badge count represents.
                  A real notification center popover is planned for Phase C.
                  See UI_UX_IMPROVEMENT_PLAN.md §4 Phase C. */}
              <Link href="/review">
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

// Phase E+ (user request): Map for Islamic icon avatars (no faces/eyes/mouth)
// Each child gets a deterministic icon based on their name hash.
// Icons are kid-friendly + Islamic: Star (8-point Islamic star), Moon (crescent),
// Book (Quran), Heart (kindness), Mosque, Kaaba, Lantern, Tree (growth).
const ICON_MAP: Record<string, typeof Star> = {
  star: Star,
  moon: Moon,
  book: Book,
  heart: Heart,
  award: Award,
}

// Extended icon set — 8 Islamic/kid-friendly symbols (deterministic per child)
const ISLAMIC_ICONS = [
  'star',    // 8-point Islamic star (najmah)
  'moon',    // Crescent moon (hilal)
  'book',    // Quran / knowledge
  'heart',   // Kindness / love
  'award',   // Achievement / medal
  'sun',     // Sun (for morning prayers)
  'gift',    // Reward / sadaqah
  'trophy',  // Milestone / victory
]

export function Avatar({ color, name, size = 'md' }: { color: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  // Phase E+ (user request): Replace face/initial avatars with Islamic icons.
  // Pick an icon based on the name's first character hash — deterministic per child.
  // No faces, no eyes, no mouth — purely symbolic Islamic icons.
  // Use a better hash (sum of char codes) for more distribution.
  const hashCode = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const iconKey = ISLAMIC_ICONS[hashCode % ISLAMIC_ICONS.length]

  // Map extended icon keys to Lucide components
  const ExtendedIconMap: Record<string, typeof Star> = {
    ...ICON_MAP,
    sun: Sun,
    gift: Gift,
    trophy: Trophy,
  }

  const sizeClass = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  const Icon = ExtendedIconMap[iconKey] ?? Star

  return (
    <span className={cn('inline-flex items-center justify-center rounded-full', AVATAR_COLOR_CLASS[color] || AVATAR_COLOR_CLASS.emerald, sizeClass)}>
      <Icon className={cn(iconSize, 'text-white')} />
    </span>
  )
}
