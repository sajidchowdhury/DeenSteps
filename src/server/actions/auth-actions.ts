'use server'

import * as React from 'react'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const RegisterSchema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(80),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  familyName: z.string().min(1, 'Please enter a family name.').max(80),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en'),
})

export type RegisterResult =
  | { ok: true; userId: string; familyId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function registerFamily(input: z.infer<typeof RegisterSchema>): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const { name, email, password, familyName, timezone, locale } = parsed.data

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return {
      ok: false,
      error: 'An account with that email already exists.',
      fieldErrors: { email: 'Try signing in instead.' },
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  })

  const family = await db.family.create({
    data: {
      name: familyName,
      timezone,
      locale,
      createdBy: user.id,
      memberships: { create: { userId: user.id, role: 'PARENT' } },
      settings: {
        create: {},
      },
    },
    include: { settings: true },
  })

  return { ok: true, userId: user.id, familyId: family.id }
}
