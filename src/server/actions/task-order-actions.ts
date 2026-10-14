'use server'

import { db } from '@/lib/db'
import { requireFamily } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

// ────────────────────────────────────────────────────────────────────────────
// Update task sort order — called when parent drags and drops tasks in
// the planner. Takes an array of { taskId, sortOrder } pairs and updates
// each task's sortOrder field.
// ────────────────────────────────────────────────────────────────────────────

export async function updateTaskOrder(
  items: { taskId: string; sortOrder: number }[]
): Promise<{ ok: boolean; error?: string }> {
  const { family } = await requireFamily()

  try {
    // Update each task's sortOrder — all must belong to this family
    for (const item of items) {
      await db.taskTemplate.updateMany({
        where: {
          id: item.taskId,
          familyId: family.id, // Authorization: only update tasks in this family
        },
        data: {
          sortOrder: item.sortOrder,
        },
      })
    }
  } catch (e) {
    return { ok: false, error: 'ক্রম আপডেট করা যায়নি।' }
  }

  revalidatePath('/planner')
  revalidatePath('/child')
  return { ok: true }
}
