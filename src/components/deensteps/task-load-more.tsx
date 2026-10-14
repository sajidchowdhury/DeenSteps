'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskRow } from '@/app/(app)/tasks/page'

export function TaskLoadMoreButton({ allTasks, childOptions }: { allTasks: any[]; childOptions: { id: string; displayName: string; avatarColor: string }[] }) {
  const [visible, setVisible] = React.useState(0)

  if (visible === 0) {
    return (
      <Button variant="outline" size="sm" onClick={() => setVisible(10)} className="gap-1.5">
        <ChevronDown className="h-3.5 w-3.5" />
        আরো দেখুন ({allTasks.length - 10})
      </Button>
    )
  }

  return (
    <>
      <div className="grid gap-3">
        {allTasks.slice(0, 10 + visible).map((task) => (
          <TaskRow key={task.id} task={task} childOptions={childOptions} />
        ))}
      </div>
      {10 + visible < allTasks.length && (
        <div className="mt-3 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + 10)} className="gap-1.5">
            <ChevronDown className="h-3.5 w-3.5" />
            আরো দেখুন ({allTasks.length - 10 - visible})
          </Button>
        </div>
      )}
    </>
  )
}
