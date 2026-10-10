'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/deensteps/brand'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#features', label: 'ফিচার' },
  { href: '#how-it-works', label: 'যেভাবে কাজ করে' },
  { href: '#rewards', label: 'পুরস্কার' },
  { href: '#islamic-values', label: 'ইসলামি মূল্যবোধ' },
  { href: '#pricing', label: 'প্রাইসিং' },
  { href: '#faq', label: 'প্রশ্নোত্তর' },
]

export function MarketingHeader() {
  const { data: session } = useSession()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-colors',
        scrolled
          ? 'border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70'
          : 'border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="দীনস্টেপস হোম">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="প্রাথমিক">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session?.user ? (
            <Button asChild>
              <Link href="/dashboard">ড্যাশবোর্ড খুলুন</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">সাইন ইন</Link>
              </Button>
              <Button asChild>
                <Link href="/register">ফ্রি শুরু করুন</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          aria-label="মেনু খুলুন"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6" aria-label="মোবাইল">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              {session?.user ? (
                <Button asChild>
                  <Link href="/dashboard">ড্যাশবোর্ড খুলুন</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">সাইন ইন</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">ফ্রি শুরু করুন</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
