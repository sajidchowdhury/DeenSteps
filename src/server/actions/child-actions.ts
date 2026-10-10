'use server'

import * as React from 'react'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { TASK_LIBRARY } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

// ────────────────────────────────────────────────────────────────────────────
// Child profiles
// ────────────────────────────────────────────────────────────────────────────

const ChildSchema = z.object({
  displayName: z.string().min(1, 'Please enter a name.').max(60),
  ageRange: z.enum(['3-5', '6-8', '9-12', '13+']).optional(),
  avatarColor: z.enum(['emerald', 'amber', 'sage', 'rose', 'violet', 'sky']).default('emerald'),
  preferredLanguage: z.string().default('en'),
  birthDate: z.string().optional(),
})

export type ChildResult = { ok: true; childId: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function createChildProfile(input: z.infer<typeof ChildSchema>): Promise<ChildResult> {
  const { user, family } = await requireFamily()
  const parsed = ChildSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const d = parsed.data
  const child = await db.childProfile.create({
    data: {
      familyId: family.id,
      displayName: d.displayName,
      avatarColor: d.avatarColor,
      ageRange: d.ageRange ?? null,
      preferredLanguage: d.preferredLanguage,
      birthDate: d.birthDate ? new Date(d.birthDate) : null,
    },
  })
  revalidatePath('/children')
  revalidatePath('/dashboard')
  return { ok: true, childId: child.id }
}

export async function updateChildProfile(childId: string, input: Partial<z.infer<typeof ChildSchema>>): Promise<ChildResult> {
  const { user, family } = await requireFamily()
  await db.childProfile.findFirstOrThrow({ where: { id: childId, familyId: family.id } })
  const parsed = ChildSchema.partial().safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input.' }
  }
  const d = parsed.data
  await db.childProfile.update({
    where: { id: childId },
    data: {
      ...(d.displayName && { displayName: d.displayName }),
      ...(d.ageRange && { ageRange: d.ageRange }),
      ...(d.avatarColor && { avatarColor: d.avatarColor }),
      ...(d.preferredLanguage && { preferredLanguage: d.preferredLanguage }),
      ...(d.birthDate !== undefined && { birthDate: d.birthDate ? new Date(d.birthDate) : null }),
    },
  })
  revalidatePath('/children')
  revalidatePath('/dashboard')
  return { ok: true, childId }
}

export async function archiveChild(childId: string): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const child = await db.childProfile.findFirst({ where: { id: childId, familyId: family.id } })
  if (!child) return { ok: false, error: 'Child not found.' }
  await db.childProfile.update({ where: { id: childId }, data: { status: 'ARCHIVED' } })
  revalidatePath('/children')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function restoreChild(childId: string): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const child = await db.childProfile.findFirst({ where: { id: childId, familyId: family.id } })
  if (!child) return { ok: false, error: 'Child not found.' }
  await db.childProfile.update({ where: { id: childId }, data: { status: 'ACTIVE' } })
  revalidatePath('/children')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Onboarding helpers
// ────────────────────────────────────────────────────────────────────────────

export async function importLibraryTasksForChild(childId: string, categories: string[]) {
  const { family } = await requireFamily()
  const child = await db.childProfile.findFirstOrThrow({ where: { id: childId, familyId: family.id } })

  // For each library task in the chosen categories, upsert a TaskTemplate and assign.
  const eligible = TASK_LIBRARY.filter((t) => categories.includes(t.category))
  for (const lib of eligible) {
    const existing = await db.taskTemplate.findFirst({
      where: { familyId: family.id, title: lib.title, category: lib.category },
    })
    let taskId = existing?.id
    if (!existing) {
      const created = await db.taskTemplate.create({
        data: {
          familyId: family.id,
          title: lib.title,
          description: lib.description,
          category: lib.category,
          subcategory: lib.subcategory,
          iconKey: lib.iconKey,
          pointsValue: lib.pointsValue,
          frequency: lib.frequency,
          dueTime: ('dueTime' in lib ? lib.dueTime : null) ?? null,
          approvalPolicy: 'MANUAL',
          status: 'ACTIVE',
          isFromLibrary: true,
        },
      })
      taskId = created.id
    }
    await db.taskAssignment.upsert({
      where: { taskId_childId: { taskId: taskId!, childId: child.id } },
      update: {},
      create: { taskId: taskId!, childId: child.id },
    })
  }
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  revalidatePath(`/child/${childId}`)
}

export async function completeOnboarding() {
  const { user } = await requireFamily()
  // Onboarding is implicit (no progress table); just redirect.
  return { ok: true }
}
