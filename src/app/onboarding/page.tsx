import { redirect } from 'next/navigation'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  // If user has no family (e.g. after family data deletion), send them
  // to the create-family page (NOT /register — that creates a new account).
  if (!family) redirect('/create-family')
  // Family exists — go to dashboard
  redirect('/dashboard')
}
