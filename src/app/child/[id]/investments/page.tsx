import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { redirect } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Avatar } from '@/components/deensteps/app-shell'
import { Logo } from '@/components/deensteps/brand'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InvestmentHistory } from '@/components/deensteps/investment-history'
import { getChildInvestments, getChildInvestmentSummary } from '@/server/actions/investment-actions'

export default async function ChildInvestmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: childId } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const child = await db.childProfile.findFirst({
    where: { id: childId, familyId: family.id },
  })
  if (!child) redirect('/dashboard')

  const investments = await getChildInvestments(child.id)
  const summary = await getChildInvestmentSummary(child.id)

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/child/${child.id}`}><ArrowLeft className="mr-1 h-4 w-4" /> পরিবারে ফিরুন</Link>
          </Button>
          <Logo />
          <div className="flex items-center gap-2">
            <Avatar color={child.avatarColor} name={child.displayName} size="sm" />
            <span className="hidden text-sm font-medium text-foreground sm:inline">{child.displayName}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-sky-500" />
            আমার বিনিয়োগ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {child.displayName}-এর বিনিয়োগ ইতিহাস — কত পয়েন্ট বিনিয়োগ করেছ, কত মুনাফা পেয়েছ।
          </p>
        </div>

        <InvestmentHistory investments={investments as any} summary={summary} />
      </main>
    </div>
  )
}
