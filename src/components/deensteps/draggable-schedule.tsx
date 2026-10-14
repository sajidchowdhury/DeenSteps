'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GripVertical, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { TASK_STATUS_META } from '@/lib/constants'
import { updateTaskOrder } from '@/server/actions/task-order-actions'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// ────────────────────────────────────────────────────────────────────────────
// Drag-and-drop schedule for the planner page.
// Parent drags tasks to reorder them. The new order is saved to the
// server and reflected on the child dashboard.
//
// Uses native HTML5 drag-and-drop (no extra library needed).
// ────────────────────────────────────────────────────────────────────────────

export type ScheduleItem = {
  occurrenceId: string
  taskId: string
  title: string
  iconKey: string
  category: string
  dueTime: string | null
  status: string
  pointsValue: number
  sortOrder: number
  assignedChildren: { id: string; displayName: string; avatarColor: string }[]
}

export function DraggableSchedule({ items }: { items: ScheduleItem[] }) {
  const router = useRouter()
  const [orderedItems, setOrderedItems] = React.useState(items)
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Update local state when props change (e.g., after router.refresh)
  React.useEffect(() => {
    setOrderedItems(items)
  }, [items])

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder the array
    const newItems = [...orderedItems]
    const [moved] = newItems.splice(dragIndex, 1)
    newItems.splice(dropIndex, 0, moved)
    setOrderedItems(newItems)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    try {
      const orderData = orderedItems.map((item, index) => ({
        taskId: item.taskId,
        sortOrder: index,
      }))
      const res = await updateTaskOrder(orderData)
      if (res.ok) {
        toast.success('ক্রম সংরক্ষিত হয়েছে! সন্তান এই ক্রমে দেখবে।')
        router.refresh()
      } else {
        toast.error(res.error ?? 'সংরক্ষণ করা যায়নি।')
      }
    } finally {
      setSaving(false)
    }
  }

  // Check if order changed from original
  const orderChanged = orderedItems.some(
    (item, i) => item.taskId !== items[i]?.taskId
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              📋 আজকের সিডিউল
            </CardTitle>
            <CardDescription>
              কাজ টেনে ক্রম পরিবর্তন করুন। সংরক্ষণ করলে সন্তান এই ক্রমে দেখবে।
            </CardDescription>
          </div>
          {orderChanged && (
            <Button size="sm" onClick={handleSaveOrder} disabled={saving}>
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              ক্রম সংরক্ষণ করুন
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {orderedItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            আজ কোনো কাজ নির্ধারিত নেই।
          </p>
        ) : (
          <ul className="space-y-2">
            {orderedItems.map((item, index) => {
              const meta = TASK_STATUS_META[item.status] ?? TASK_STATUS_META.ASSIGNED
              return (
                <li
                  key={item.occurrenceId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border bg-card p-3 transition-all cursor-grab active:cursor-grabbing',
                    dragIndex === index && 'opacity-50',
                    dragOverIndex === index && dragIndex !== index && 'border-primary border-2 bg-primary/5'
                  )}
                >
                  {/* Drag handle */}
                  <GripVertical className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />

                  {/* Task icon */}
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <DynamicIcon iconKey={item.iconKey} className="h-4 w-4" />
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <Badge variant="outline" className={cn('text-[10px]', meta.tone)}>{meta.label}</Badge>
                      {item.dueTime && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Clock className="h-2.5 w-2.5" /> {item.dueTime}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {item.assignedChildren.length > 0 ? (
                        item.assignedChildren.map((c) => (
                          <span key={c.id} className="inline-flex items-center gap-1">
                            <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                            <span className="text-xs text-muted-foreground">{c.displayName}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">কাউকে নির্ধারণ করা হয়নি</span>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <Badge variant="secondary" className="text-[10px]">+{item.pointsValue}</Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
