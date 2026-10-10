'use server'

import * as React from 'react'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { TASK_LIBRARY, TASK_CATEGORIES } from '@/lib/constants'

// ────────────────────────────────────────────────────────────────────────────
// Task templates
// ────────────────────────────────────────────────────────────────────────────

const TaskSchema = z.object({
  title: z.string().min(1, 'Please enter a title.').max(120),
  description: z.string().max(500).optional(),
  instructions: z.string().max(800).optional(),
  category: z.string().min(1, 'Pick a category.'),
  subcategory: z.string().optional(),
  iconKey: z.string().default('check'),
  pointsValue: z.number().int().min(0).max(50).default(1),
  approvalPolicy: z.enum(['MANUAL', 'AUTO']).default('MANUAL'),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKDAYS', 'WEEKLY', 'CUSTOM']).default('DAILY'),
  scheduledDays: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dueTime: z.string().optional(),
  parentNotes: z.string().max(500).optional(),
  assignedChildIds: z.array(z.string()).default([]),
})

export type TaskResult = { ok: true; taskId: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function createTask(input: z.infer<typeof TaskSchema>): Promise<TaskResult> {
  const { family } = await requireFamily()
  const parsed = TaskSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString()
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const d = parsed.data

  // Verify all assigned children belong to this family
  if (d.assignedChildIds.length > 0) {
    const valid = await db.childProfile.count({
      where: { id: { in: d.assignedChildIds }, familyId: family.id, status: 'ACTIVE' },
    })
    if (valid !== d.assignedChildIds.length) {
      return { ok: false, error: 'One or more selected children are invalid.' }
    }
  }

  const task = await db.taskTemplate.create({
    data: {
      familyId: family.id,
      title: d.title,
      description: d.description,
      instructions: d.instructions,
      category: d.category,
      subcategory: d.subcategory,
      iconKey: d.iconKey,
      pointsValue: d.pointsValue,
      approvalPolicy: d.approvalPolicy,
      frequency: d.frequency,
      scheduledDays: d.scheduledDays && d.scheduledDays.length > 0 ? JSON.stringify(d.scheduledDays) : null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
      dueTime: d.dueTime || null,
      parentNotes: d.parentNotes,
      status: 'ACTIVE',
      assignments: d.assignedChildIds.length > 0 ? { create: d.assignedChildIds.map((childId) => ({ childId })) } : undefined,
    },
  })

  // Generate today's occurrence if the task is active and assigned
  if (d.assignedChildIds.length > 0) {
    await generateOccurrencesForTask(task.id)
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { ok: true, taskId: task.id }
}

export async function updateTask(taskId: string, input: Partial<z.infer<typeof TaskSchema>>): Promise<TaskResult> {
  const { family } = await requireFamily()
  const task = await db.taskTemplate.findFirst({ where: { id: taskId, familyId: family.id } })
  if (!task) return { ok: false, error: 'Task not found.' }

  const parsed = TaskSchema.partial().safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input.' }
  }
  const d = parsed.data

  await db.taskTemplate.update({
    where: { id: taskId },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.instructions !== undefined && { instructions: d.instructions }),
      ...(d.category !== undefined && { category: d.category }),
      ...(d.subcategory !== undefined && { subcategory: d.subcategory }),
      ...(d.iconKey !== undefined && { iconKey: d.iconKey }),
      ...(d.pointsValue !== undefined && { pointsValue: d.pointsValue }),
      ...(d.approvalPolicy !== undefined && { approvalPolicy: d.approvalPolicy }),
      ...(d.frequency !== undefined && { frequency: d.frequency }),
      ...(d.scheduledDays !== undefined && { scheduledDays: d.scheduledDays.length > 0 ? JSON.stringify(d.scheduledDays) : null }),
      ...(d.startDate !== undefined && { startDate: d.startDate ? new Date(d.startDate) : null }),
      ...(d.endDate !== undefined && { endDate: d.endDate ? new Date(d.endDate) : null }),
      ...(d.dueTime !== undefined && { dueTime: d.dueTime || null }),
      ...(d.parentNotes !== undefined && { parentNotes: d.parentNotes }),
    },
  })

  if (d.assignedChildIds !== undefined) {
    // Replace assignments
    await db.taskAssignment.deleteMany({ where: { taskId } })
    if (d.assignedChildIds.length > 0) {
      await db.taskAssignment.createMany({
        data: d.assignedChildIds.map((childId) => ({ taskId, childId })),
      })
    }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { ok: true, taskId }
}

export async function toggleTaskStatus(taskId: string, status: 'ACTIVE' | 'PAUSED'): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const task = await db.taskTemplate.findFirst({ where: { id: taskId, familyId: family.id } })
  if (!task) return { ok: false, error: 'Task not found.' }
  await db.taskTemplate.update({ where: { id: taskId }, data: { status } })
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function archiveTask(taskId: string): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()
  const task = await db.taskTemplate.findFirst({ where: { id: taskId, familyId: family.id } })
  if (!task) return { ok: false, error: 'Task not found.' }
  await db.taskTemplate.update({ where: { id: taskId }, data: { status: 'ARCHIVED' } })
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Occurrence generation — idempotent
// ────────────────────────────────────────────────────────────────────────────

const WEEKDAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/**
 * Generate task occurrences for a given task for today (and the next 6 days).
 * Idempotent — uses unique [taskId, scheduledDate] constraint.
 */
export async function generateOccurrencesForTask(taskId: string, daysAhead = 7) {
  const task = await db.taskTemplate.findUnique({ where: { id: taskId } })
  if (!task || task.status !== 'ACTIVE') return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const weekdayKey = WEEKDAY_KEYS[date.getDay()]
    const isWeekday = ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(weekdayKey)

    // Determine if this task should occur on this date
    let shouldOccur = false
    switch (task.frequency) {
      case 'ONCE':
        shouldOccur = i === 0 && (!task.startDate || date >= new Date(task.startDate))
        break
      case 'DAILY':
        shouldOccur = true
        break
      case 'WEEKDAYS':
        shouldOccur = isWeekday
        break
      case 'WEEKLY':
      case 'CUSTOM':
        if (task.scheduledDays) {
          const days = JSON.parse(task.scheduledDays) as string[]
          shouldOccur = days.includes(weekdayKey)
        } else {
          shouldOccur = true
        }
        break
    }

    // Skip if outside start/end date range
    if (task.startDate && date < new Date(task.startDate)) shouldOccur = false
    if (task.endDate && date > new Date(task.endDate)) shouldOccur = false

    if (!shouldOccur) continue

    try {
      await db.taskOccurrence.create({
        data: {
          taskId,
          scheduledDate: date,
          dueTime: task.dueTime,
          status: 'ASSIGNED',
        },
      })
    } catch {
      // Unique constraint violation — occurrence already exists, skip
    }
  }
}

/**
 * Generate occurrences for all active tasks in the family. Called from dashboard.
 */
export async function generateAllOccurrences() {
  const { family } = await requireFamily()
  const tasks = await db.taskTemplate.findMany({
    where: { familyId: family.id, status: 'ACTIVE' },
    select: { id: true },
  })
  for (const t of tasks) {
    await generateOccurrencesForTask(t.id)
  }
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  return { ok: true, count: tasks.length }
}

// ────────────────────────────────────────────────────────────────────────────
// Library import
// ────────────────────────────────────────────────────────────────────────────

export async function importLibraryTask(libraryIndex: number, assignedChildIds: string[]) {
  const { family } = await requireFamily()
  const lib = TASK_LIBRARY[libraryIndex]
  if (!lib) return { ok: false, error: 'Library task not found.' }

  // যদি কোনো সন্তান নির্বাচন করা না থাকে, সব সক্রিয় সন্তান অটো-নির্বাচন করো
  let childIds = assignedChildIds
  if (childIds.length === 0) {
    const allChildren = await db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true },
    })
    childIds = allChildren.map((c) => c.id)
  }

  // চেক করো একই নামের টাস্ক আগে থেকে আছে কিনা
  const existing = await db.taskTemplate.findFirst({
    where: { familyId: family.id, title: lib.title, category: lib.category, status: 'ACTIVE' },
  })
  if (existing) {
    // শুধু অ্যাসাইনমেন্ট যোগ করো
    for (const childId of childIds) {
      await db.taskAssignment.upsert({
        where: { taskId_childId: { taskId: existing.id, childId } },
        update: {},
        create: { taskId: existing.id, childId },
      })
    }
    await generateOccurrencesForTask(existing.id)
    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { ok: true, taskId: existing.id }
  }

  const result = await createTask({
    title: lib.title,
    description: lib.description,
    category: lib.category,
    subcategory: lib.subcategory,
    iconKey: lib.iconKey,
    pointsValue: lib.pointsValue,
    frequency: lib.frequency as 'DAILY' | 'WEEKDAYS',
    dueTime: 'dueTime' in lib ? lib.dueTime : undefined,
    approvalPolicy: 'MANUAL',
    assignedChildIds: childIds,
  })

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return result
}
