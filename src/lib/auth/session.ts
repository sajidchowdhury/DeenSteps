import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session.user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function getUserFamily(userId: string) {
  const membership = await db.familyMembership.findFirst({
    where: { userId },
    include: { family: true },
    orderBy: { createdAt: 'asc' },
  })
  return membership?.family ?? null
}

export async function requireFamily() {
  const user = await requireUser()
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')
  return { user, family }
}

/**
 * Verify the authenticated user has access to the given family.
 * Prevents cross-family IDOR attacks.
 */
export async function assertFamilyAccess(familyId: string, userId: string) {
  const membership = await db.familyMembership.findFirst({
    where: { familyId, userId },
    select: { id: true, role: true },
  })
  if (!membership) {
    throw new Error('FORBIDDEN: You do not have access to this family')
  }
  return membership
}

/**
 * Verify a child profile belongs to a family the user can access.
 */
export async function assertChildAccess(childId: string, userId: string) {
  const child = await db.childProfile.findUnique({
    where: { id: childId },
    select: { id: true, familyId: true, displayName: true, status: true },
  })
  if (!child) throw new Error('NOT_FOUND: Child profile not found')
  await assertFamilyAccess(child.familyId, userId)
  return child
}
