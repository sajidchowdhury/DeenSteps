import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  // Check if user already has a family
  const existingFamily = await getUserFamily(user.id)
  if (existingFamily) {
    return NextResponse.json({ ok: false, error: 'You already have a family.' }, { status: 400 })
  }

  const { familyName } = await req.json()
  if (!familyName || typeof familyName !== 'string') {
    return NextResponse.json({ ok: false, error: 'Family name required.' }, { status: 400 })
  }

  // Create a new family for this existing user
  const family = await db.family.create({
    data: {
      name: familyName,
      timezone: 'Asia/Dhaka',
      locale: 'bn',
      createdBy: user.id,
      memberships: { create: { userId: user.id, role: 'PARENT' } },
      settings: {
        create: {
          pointsName: 'পয়েন্ট',
        },
      },
    },
  })

  return NextResponse.json({ ok: true, familyId: family.id })
}
