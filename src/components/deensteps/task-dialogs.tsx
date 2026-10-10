'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, BookOpenCheck, Loader2, MoreVertical, Pencil, Archive } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { Avatar } from '@/components/deensteps/app-shell'
import {
  TASK_CATEGORIES,
  TASK_LIBRARY,
  APPROVAL_POLICIES,
  FREQUENCIES,
  ICON_KEY_TO_LUCIDE,
} from '@/lib/constants'
import {
  createTask,
  updateTask,
  toggleTaskStatus,
  archiveTask,
  importLibraryTask,
} from '@/server/actions/task-actions'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// Form schema (matches TaskSchema in task-actions.ts)
// ────────────────────────────────────────────────────────────────────────────

const Schema = z.object({
  title: z.string().min(1, 'Please enter a title.').max(120),
  description: z.string().max(500).optional(),
  category: z.string().min(1, 'Pick a category.'),
  iconKey: z.string().default('check'),
  pointsValue: z.coerce.number().int().min(0).max(50),
  approvalPolicy: z.enum(['MANUAL', 'AUTO']),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKDAYS', 'WEEKLY', 'CUSTOM']),
  dueTime: z.string().optional(),
  assignedChildIds: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof Schema>

type ChildOption = { id: string; displayName: string; avatarColor: string }

const ICON_KEYS = Object.keys(ICON_KEY_TO_LUCIDE)

// ────────────────────────────────────────────────────────────────────────────
// Create / Edit task dialog
// ────────────────────────────────────────────────────────────────────────────

export function TaskFormDialog({
  children,
  childrenList,
  initial,
  taskId,
  mode = 'create',
}: {
  children?: React.ReactNode
  childrenList: ChildOption[]
  initial?: Partial<FormValues>
  taskId?: string
  mode?: 'create' | 'edit'
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Personal Responsibility',
      iconKey: 'check',
      pointsValue: 1,
      approvalPolicy: 'MANUAL',
      frequency: 'DAILY',
      dueTime: '',
      assignedChildIds: [],
      ...initial,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        description: '',
        category: 'Personal Responsibility',
        iconKey: 'check',
        pointsValue: 1,
        approvalPolicy: 'MANUAL',
        frequency: 'DAILY',
        dueTime: '',
        assignedChildIds: [],
        ...initial,
      })
    }
  }, [open])

  const onSubmit = async (values: FormValues) => {
    setPending(true)
    try {
      if (mode === 'edit' && taskId) {
        const res = await updateTask(taskId, values)
        if (!res.ok) {
          toast.error(res.error)
          return
        }
        toast.success('Task updated.')
      } else {
        const res = await createTask(values)
        if (!res.ok) {
          toast.error(res.error)
          if (res.fieldErrors) {
            for (const [k, v] of Object.entries(res.fieldErrors)) {
              form.setError(k as keyof FormValues, { message: v })
            }
          }
          return
        }
        toast.success('Task created.')
      }
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const titleErr = form.formState.errors.title?.message
  const categoryErr = form.formState.errors.category?.message
  const iconKey = form.watch('iconKey')
  const assignedChildIds = form.watch('assignedChildIds')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus className="h-4 w-4" /> New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit task' : 'Create a task'}</DialogTitle>
          <DialogDescription>
            Configure a recurring or one-time task. You can assign it to one or more children.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Make my bed"
                {...form.register('title')}
                aria-invalid={!!titleErr}
              />
              {titleErr && <p className="text-xs text-destructive">{titleErr}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                placeholder="Short instructions shown to the child (optional)."
                {...form.register('description')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pick a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          <span className="inline-flex items-center gap-2">
                            <DynamicIcon iconKey={c.icon} size={14} />
                            {c.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {categoryErr && <p className="text-xs text-destructive">{categoryErr}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pointsValue">Points</Label>
              <Input
                id="pointsValue"
                type="number"
                min={0}
                max={50}
                {...form.register('pointsValue', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Controller
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueTime">Due time</Label>
              <Input
                id="dueTime"
                type="time"
                {...form.register('dueTime')}
              />
              <p className="text-xs text-muted-foreground">Optional — when the task should be done.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Approval policy</Label>
              <Controller
                control={form.control}
                name="approvalPolicy"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROVAL_POLICIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {ICON_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => form.setValue('iconKey', k, { shouldDirty: true })}
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
                      iconKey === k
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent/50',
                    )}
                    aria-label={k}
                  >
                    <DynamicIcon iconKey={k} size={16} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Assigned children</Label>
              {childrenList.length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-card/30 p-3 text-xs text-muted-foreground">
                  Add a child profile first to assign tasks.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {childrenList.map((c) => {
                    const checked = assignedChildIds.includes(c.id)
                    return (
                      <label
                        key={c.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-md border p-2.5 text-sm transition-colors',
                          checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/40',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const next = v
                              ? [...assignedChildIds, c.id]
                              : assignedChildIds.filter((id) => id !== c.id)
                            form.setValue('assignedChildIds', next, { shouldDirty: true })
                          }}
                        />
                        <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                        <span className="truncate text-foreground">{c.displayName}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Import from library dialog
// ────────────────────────────────────────────────────────────────────────────

export function ImportTasksDialog({
  children,
  childrenList,
}: {
  children?: React.ReactNode
  childrenList: ChildOption[]
}) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const [assignedChildIds, setAssignedChildIds] = React.useState<string[]>([])
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (open) {
      setSelected(new Set())
      setAssignedChildIds([])
    }
  }, [open])

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleAllInCategory = (indices: number[]) => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = indices.every((i) => next.has(i))
      if (allSelected) {
        indices.forEach((i) => next.delete(i))
      } else {
        indices.forEach((i) => next.add(i))
      }
      return next
    })
  }

  const onImport = async () => {
    if (selected.size === 0) {
      toast.error('Select at least one task to import.')
      return
    }
    setPending(true)
    try {
      let ok = 0
      let failed = 0
      for (const idx of selected) {
        const res = await importLibraryTask(idx, assignedChildIds)
        if (res.ok) ok++
        else failed++
      }
      if (failed > 0) {
        toast.error(`Imported ${ok}, ${failed} failed.`)
      } else {
        toast.success(`Imported ${ok} ${ok === 1 ? 'task' : 'tasks'}.`)
      }
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const grouped = TASK_CATEGORIES.map((cat) => ({
    cat,
    items: TASK_LIBRARY.map((t, i) => ({ t, i })).filter(({ t }) => t.category === cat.key),
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline">
            <BookOpenCheck className="h-4 w-4" /> Import from library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import from the habit library</DialogTitle>
          <DialogDescription>
            Optional Islamic-inspired suggestions. Pick the ones that fit your family — every task is fully editable after import.
          </DialogDescription>
        </DialogHeader>

        {/* Assign-to-children picker */}
        {childrenList.length > 0 && (
          <div className="space-y-1.5">
            <Label>Assign imported tasks to</Label>
            <div className="flex flex-wrap gap-2">
              {childrenList.map((c) => {
                const checked = assignedChildIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setAssignedChildIds((prev) =>
                        prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id],
                      )
                    }
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      checked ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent/40',
                    )}
                  >
                    <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                    {c.displayName}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">Optional — you can assign tasks later.</p>
          </div>
        )}

        <ScrollArea className="max-h-[50vh] pr-3">
          <div className="space-y-4">
            {grouped.map(({ cat, items }) => (
              <div key={cat.key}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <DynamicIcon iconKey={cat.icon} size={12} /> {cat.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleAllInCategory(items.map((i) => i.i))}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {items.every((i) => selected.has(i.i)) ? 'Clear' : 'Select all'}
                  </button>
                </div>
                <div className="grid gap-1.5">
                  {items.map(({ t, i }) => {
                    const checked = selected.has(i)
                    return (
                      <label
                        key={i}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-md border p-2.5 transition-colors',
                          checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/40',
                        )}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggle(i)} />
                        <DynamicIcon iconKey={t.iconKey} size={16} className="mt-0.5 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{t.title}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{t.description}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
                            <Plus className="h-3 w-3" />
                            {t.pointsValue}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {t.frequency}
                          </Badge>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={onImport} disabled={pending || selected.size === 0}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Importing…
              </>
            ) : (
              <>Import {selected.size > 0 ? `(${selected.size})` : ''}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Quick action buttons (pause/resume, archive)
// ────────────────────────────────────────────────────────────────────────────

export function TaskToggleStatusButton({
  taskId,
  status,
}: {
  taskId: string
  status: 'ACTIVE' | 'PAUSED'
}) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()
  const next = status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
  const label = status === 'ACTIVE' ? 'Pause' : 'Resume'

  const onToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    setPending(true)
    try {
      const res = await toggleTaskStatus(taskId, next)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not update task.')
        return
      }
      toast.success(`Task ${next === 'PAUSED' ? 'paused' : 'resumed'}.`)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  )
}

export function TaskArchiveButton({
  taskId,
  taskTitle,
  children,
}: {
  taskId: string
  taskTitle: string
  children?: React.ReactNode
}) {
  const [pending, setPending] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const onConfirm = async () => {
    setPending(true)
    try {
      const res = await archiveTask(taskId)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not archive task.')
        return
      }
      toast.success(`"${taskTitle}" archived.`)
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <button type="button" className="w-full px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent/50">Archive</button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archive this task?</DialogTitle>
          <DialogDescription>
            &ldquo;{taskTitle}&rdquo; will be hidden from your active list. Existing submissions and points are preserved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'Archiving…' : 'Archive task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Row actions — single client component that owns the DropdownMenu so we can
// safely pass onSelect handlers without crossing the server/client boundary.
// ────────────────────────────────────────────────────────────────────────────

type TaskRowActionTask = {
  id: string
  title: string
  description: string | null
  category: string
  iconKey: string
  pointsValue: number
  approvalPolicy: string
  frequency: string
  dueTime: string | null
  status: string
  isFromLibrary: boolean
  assignedChildIds: string[]
}

export function TaskRowActions({
  task,
  childOptions,
}: {
  task: TaskRowActionTask
  childOptions: ChildOption[]
}) {
  const isArchived = task.status === 'ARCHIVED'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Task actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <TaskFormDialog
          mode="edit"
          taskId={task.id}
          childrenList={childOptions}
          initial={{
            title: task.title,
            description: task.description ?? '',
            category: task.category,
            iconKey: task.iconKey,
            pointsValue: task.pointsValue,
            approvalPolicy: task.approvalPolicy as 'MANUAL' | 'AUTO',
            frequency: task.frequency as 'ONCE' | 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'CUSTOM',
            dueTime: task.dueTime ?? '',
            assignedChildIds: task.assignedChildIds,
          }}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        </TaskFormDialog>
        <DropdownMenuSeparator />
        {!isArchived && (
          <DropdownMenuItem asChild>
            <TaskToggleStatusButton taskId={task.id} status={task.status as 'ACTIVE' | 'PAUSED'} />
          </DropdownMenuItem>
        )}
        {!isArchived && (
          <TaskArchiveButton taskId={task.id} taskTitle={task.title}>
            <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </DropdownMenuItem>
          </TaskArchiveButton>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
