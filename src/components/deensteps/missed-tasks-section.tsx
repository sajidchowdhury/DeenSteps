'use client'

import * as React from 'react'
import { AlertCircle, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { ExcuseTaskDialog } from '@/components/deensteps/excuse-task-dialog'
import { format } from 'date-fns'

type MissedChild = {
  id: string
  displayName: string
  avatarColor: string
}

type MissedTask = {
  id: string
  scheduledDate: Date
  missedAt: Date | null
  taskTitle: string
  taskCategory: string
  taskIconKey: string
  taskPointsValue: number
  children: MissedChild[]
}

export function MissedTasksSection({ missedTasks }: { missedTasks: MissedTask[] }) {
  const [excuseOpen, setExcuseOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<{ id: string; title: string } | null>(null)

  if (missedTasks.length === 0) return null

  const handleExcuse = (task: MissedTask) => {
    setSelectedTask({ id: task.id, title: task.taskTitle })
    setExcuseOpen(true)
  }

  return (
    <Card className="border-orange-200 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-950/10">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          মিসড কাজ ({missedTasks.length})
        </CardTitle>
        <CardDescription>
          সন্তান যে কাজগুলো সম্পন্ন করতে পারেনি — কোনো তারা কাটা হয়নি। উৎসাহ দিন, ছাড় করুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {missedTasks.slice(0, 8).map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-600 dark:bg-orange-900/40">
                <DynamicIcon iconKey={m.taskIconKey} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{m.taskTitle}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(m.scheduledDate), 'EEE, MMM d')}
                  </span>
                  {m.children.map((c) => (
                    <Avatar key={c.id} color={c.avatarColor} name={c.displayName} size="sm" />
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleExcuse(m)}
                className="flex-shrink-0 inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <Heart className="h-3 w-3" /> ছাড় করুন
              </button>
            </li>
          ))}
        </ul>
        {missedTasks.length > 8 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            আরও {missedTasks.length - 8}টি মিসড কাজ আছে।
          </p>
        )}
      </CardContent>

      {selectedTask && (
        <ExcuseTaskDialog
          occurrenceId={selectedTask.id}
          taskTitle={selectedTask.title}
          open={excuseOpen}
          onOpenChange={setExcuseOpen}
        />
      )}
    </Card>
  )
}
