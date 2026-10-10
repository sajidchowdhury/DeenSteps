import Link from 'next/link'
import { Logo } from '@/components/deensteps/brand'

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <Logo />
          <p className="text-xs text-muted-foreground">ছোট ছোট ভালো অভ্যাস, সুন্দর মানুষ হয়ে ওঠা।</p>
        </div>
        <nav className="flex items-center gap-5 text-sm" aria-label="ফুটার">
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            প্রাইভেসি পলিসি
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            যোগাযোগ
          </Link>
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} দীনস্টেপস। পরিবারের জন্য ভালোবাসায় তৈরি।
        </p>
      </div>
    </footer>
  )
}
