import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'

/**
 * Get parent PIN status + first child ID for the AppShell lock button.
 * Used by all parent pages to pass hasPin + firstChildId to AppShell.
 */
export async function getPinAndFirstChild() {
  const { family } = await requireFamily()

  const [settings, firstChild] = await Promise.all([
    db.familySettings.findUnique({
      where: { familyId: family.id },
      select: { parentPin: true },
    }),
    db.childProfile.findFirst({
      where: { familyId: family.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    }),
  ])

  return {
    pinSettings: settings,
    firstChildId: firstChild?.id ?? null,
  }
}
