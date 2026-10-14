import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

// ────────────────────────────────────────────────────────────────────────────
// Reset PIN — verifies email + password, then sets a new PIN.
// Used when parent forgets their PIN.
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { email, password, newPin } = await req.json()

    if (!email || !password || !newPin) {
      return NextResponse.json({ ok: false, error: 'সব তথ্য পূরণ করুন।' }, { status: 400 })
    }

    if (typeof newPin !== 'string' || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ ok: false, error: 'পিন অবশ্যই ৪ ডিজিট হতে হবে।' }, { status: 400 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: false, error: 'ভুল ইমেইল বা পাসওয়ার্ড।' }, { status: 403 })
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'ভুল ইমেইল বা পাসওয়ার্ড।' }, { status: 403 })
    }

    // Find the user's family
    const membership = await db.familyMembership.findFirst({
      where: { userId: user.id, role: 'PARENT' },
    })

    if (!membership) {
      return NextResponse.json({ ok: false, error: 'কোনো পরিবার পাওয়া যায়নি।' }, { status: 404 })
    }

    // Update the PIN
    await db.familySettings.upsert({
      where: { familyId: membership.familyId },
      update: { parentPin: newPin },
      create: {
        familyId: membership.familyId,
        parentPin: newPin,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset PIN error:', error)
    return NextResponse.json({ ok: false, error: 'রিসেট করা যায়নি।' }, { status: 500 })
  }
}
