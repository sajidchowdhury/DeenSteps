import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const family = await getUserFamily(user.id)
  if (!family) return NextResponse.json({ ok: false, error: 'No family' }, { status: 404 })

  const { pin } = await req.json()
  if (!pin || typeof pin !== 'string') {
    return NextResponse.json({ ok: false, error: 'PIN required' }, { status: 400 })
  }

  const settings = await db.familySettings.findUnique({
    where: { familyId: family.id },
    select: { parentPin: true },
  })

  if (!settings?.parentPin) {
    return NextResponse.json({ ok: false, error: 'No PIN set' }, { status: 400 })
  }

  if (settings.parentPin === pin) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false, error: 'Wrong PIN' }, { status: 403 })
}
