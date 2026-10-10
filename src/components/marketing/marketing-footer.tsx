import Link from 'next/link'
import { Logo } from '@/components/deensteps/brand'

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Rewards', href: '#rewards' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Family',
    links: [
      { label: 'Islamic Values', href: '#islamic-values' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Get Started', href: '/register' },
      { label: 'Sign in', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Child Safety & Family Privacy', href: '#' },
      { label: 'Islamic Values & Usage Guidelines', href: '#' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Small Good Habits. Meaningful Growth.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              A joyful family habit-building platform that helps parents nurture
              Islamic practices, good character, and daily responsibility.
            </p>
          </div>
          {FOOTER_SECTIONS.map((s) => (
            <div key={s.title}>
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DeenSteps. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with care for families. Made for parents, loved by children.
          </p>
        </div>
      </div>
    </footer>
  )
}
