import Link from 'next/link'
import { Logo } from '@/components/deensteps/brand'

const FOOTER_SECTIONS = [
  {
    title: 'প্রোডাক্ট',
    links: [
      { label: 'ফিচার', href: '#features' },
      { label: 'যেভাবে কাজ করে', href: '#how-it-works' },
      { label: 'পুরস্কার', href: '#rewards' },
      { label: 'প্রাইসিং', href: '#pricing' },
    ],
  },
  {
    title: 'পরিবার',
    links: [
      { label: 'ইসলামি মূল্যবোধ', href: '#islamic-values' },
      { label: 'প্রশ্নোত্তর', href: '#faq' },
      { label: 'শুরু করুন', href: '/register' },
      { label: 'সাইন ইন', href: '/login' },
    ],
  },
  {
    title: 'আইনি',
    links: [
      { label: 'প্রাইভেসি পলিসি', href: '#' },
      { label: 'টার্মস অফ সার্ভিস', href: '#' },
      { label: 'শিশু সুরক্ষা ও পরিবার প্রাইভেসি', href: '#' },
      { label: 'ইসলামি মূল্যবোধ ও ব্যবহার নির্দেশিকা', href: '#' },
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
              ছোট ভালো অভ্যাস, বড় পরিবর্তন।
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              একটি আনন্দময় পরিবার-কেন্দ্রিক অভ্যাস গড়ার প্ল্যাটফর্ম। বাবা-মা তাদের সন্তানদের শেখায় ইসলামি অভ্যাস, সুন্দর চরিত্র আর দৈনন্দিন দায়িত্ব।
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
            © {new Date().getFullYear()} দীনস্টেপস। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs text-muted-foreground">
            পরিবারের জন্য ভালোবাসায় তৈরি। বাবা-মায়ের ভালো লাগে, সন্তানের আনন্দ পায়।
          </p>
        </div>
      </div>
    </footer>
  )
}
