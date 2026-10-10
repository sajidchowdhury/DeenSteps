import { redirect } from 'next/navigation'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/register')
  // অনবোর্ডিং আর নেই — সরাসরি ড্যাশবোর্ডে যান
  redirect('/dashboard')
}
