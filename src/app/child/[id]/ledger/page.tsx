import { redirect } from 'next/navigation'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { getChildLedger } from '@/server/actions/ledger-actions'
import { LedgerClient } from '@/components/deensteps/ledger-client'

export default async function ChildLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: childId } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const data = await getChildLedger(childId)

  return <LedgerClient data={data} />
}
