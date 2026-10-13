import { redirect } from 'next/navigation'
import { ListChecks } from 'lucide-react'

import { getCurrentUser, getUserFamily } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AppShell, Avatar } from '@/components/deensteps/app-shell'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import {
  TaskFormDialog,
  ImportTasksDialog,
  TaskRowActions,
} from '@/components/deensteps/task-dialogs'
import { RestoreDefaultsButton } from '@/components/deensteps/restore-defaults-button'
import { TierBadge } from '@/components/deensteps/tier-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TASK_CATEGORIES, FREQUENCIES } from '@/lib/constants'
import { TaskFilterBar } from '@/components/deensteps/task-filter-bar'

export const dynamic = 'force-dynamic'

type TaskWithAssignments = {
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
  tier: number
  learningPrompt: string | null
  assignments: { child: { id: string; displayName: string; avatarColor: string } }[]
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; status?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const family = await getUserFamily(user.id)
  if (!family) redirect('/onboarding')

  const params = await searchParams
  const activeCategory = params.category ?? 'ALL'
  const query = (params.q ?? '').trim().toLowerCase()
  const activeStatus = (params.status ?? 'ACTIVE').toUpperCase()

  const [tasks, childrenList, pendingCount] = await Promise.all([
    db.taskTemplate.findMany({
      where: { familyId: family.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        assignments: {
          include: {
            child: {
              select: { id: true, displayName: true, avatarColor: true },
            },
          },
        },
      },
    }),
    db.childProfile.findMany({
      where: { familyId: family.id, status: 'ACTIVE' },
      select: { id: true, displayName: true, avatarColor: true },
    }),
    db.taskSubmission.count({
      where: { child: { familyId: family.id }, decision: null },
    }),
  ])

  // Apply filters
  let filtered = tasks
  if (activeStatus === 'ACTIVE') {
    filtered = filtered.filter((t) => t.status === 'ACTIVE' || t.status === 'PAUSED')
  } else if (activeStatus === 'ARCHIVED') {
    filtered = filtered.filter((t) => t.status === 'ARCHIVED')
  }
  if (activeCategory !== 'ALL') {
    filtered = filtered.filter((t) => t.category === activeCategory)
  }
  if (query) {
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(query) || (t.description ?? '').toLowerCase().includes(query))
  }

  const childOptions = childrenList.map((c) => ({ id: c.id, displayName: c.displayName, avatarColor: c.avatarColor }))

  // Counts per category for tabs
  const categoryCounts: Record<string, number> = { ALL: tasks.filter((t) => t.status !== 'ARCHIVED').length }
  for (const c of TASK_CATEGORIES) {
    categoryCounts[c.key] = tasks.filter((t) => t.category === c.key && t.status !== 'ARCHIVED').length
  }

  return (
    <AppShell familyName={family.name} pendingCount={pendingCount} childrenList={childrenList}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              চ্যালেঞ্জ
            </h1>
            <p className="text-sm text-muted-foreground">
              সন্তানের জন্য দৈনিক ও সাপ্তাহিক কাজ নির্ধারণ করুন। প্রতিদিনের পয়েন্ট জমে পুরস্কার আনলক করবে।
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RestoreDefaultsButton />
            <ImportTasksDialog childrenList={childOptions}>
              <Button variant="outline">সাজেশন থেকে বাছাই</Button>
            </ImportTasksDialog>
            <TaskFormDialog childrenList={childOptions}>
              <Button>
                নতুন চ্যালেঞ্জ
              </Button>
            </TaskFormDialog>
          </div>
        </div>

        {/* Filter bar */}
        <TaskFilterBar
          categories={TASK_CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon }))}
          activeCategory={activeCategory}
          categoryCounts={categoryCounts}
          query={query}
          activeStatus={activeStatus}
        />

        {/* Task list — fixed height scrollable container */}
        {filtered.length === 0 ? (
          <EmptyTasks hasAnyTasks={tasks.length > 0} childrenList={childOptions} />
        ) : (
          <div className="max-h-[600px] overflow-y-auto pr-1">
            <div className="grid gap-3">
              {filtered.map((task) => (
                <TaskRow key={task.id} task={task as unknown as TaskWithAssignments} childOptions={childOptions} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function TaskRow({ task, childOptions }: { task: TaskWithAssignments; childOptions: { id: string; displayName: string; avatarColor: string }[] }) {
  const isPaused = task.status === 'PAUSED'
  const isArchived = task.status === 'ARCHIVED'
  const assigned = task.assignments.map((a) => a.child)
  const frequencyLabel = FREQUENCIES.find((f) => f.value === task.frequency)?.label ?? task.frequency

  return (
    <Card className={isArchived ? 'opacity-60' : ''}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DynamicIcon iconKey={task.iconKey} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display font-semibold text-foreground">{task.title}</p>
              <TierBadge tier={task.tier} />
              {task.isFromLibrary && (
                <Badge variant="outline" className="gap-1 text-emerald-700 dark:text-emerald-300">
                  লাইব্রেরি
                </Badge>
              )}
              {isPaused && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  বিরতি
                </Badge>
              )}
              {isArchived && <Badge variant="outline">আর্কাইভ</Badge>}
            </div>
            {task.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-[10px]">{task.category}</Badge>
              <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
                {task.pointsValue} পয়েন্ট
              </Badge>
              <span className="text-muted-foreground/80">{frequencyLabel}</span>
              {task.dueTime && <span className="text-muted-foreground/80">· {task.dueTime}</span>}
              <span className="text-muted-foreground/80">· {task.approvalPolicy === 'AUTO' ? 'অটো-অনুমোদন' : 'ম্যানুয়াল রিভিউ'}</span>
            </div>
          </div>
        </div>

        {/* Assigned children + actions */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {assigned.length === 0 ? (
            <span className="text-xs text-muted-foreground">কাউকে নির্ধারণ করা হয়নি</span>
          ) : (
            <div className="flex -space-x-2">
              {assigned.slice(0, 4).map((c) => (
                <span key={c.id} className="ring-2 ring-card rounded-full">
                  <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                </span>
              ))}
              {assigned.length > 4 && (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-2 ring-card">
                  +{assigned.length - 4}
                </span>
              )}
            </div>
          )}
          {assigned.length > 0 && (
            <span className="hidden text-xs text-muted-foreground sm:inline">নির্ধারিত</span>
          )}

          <TaskRowActions
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              category: task.category,
              iconKey: task.iconKey,
              pointsValue: task.pointsValue,
              approvalPolicy: task.approvalPolicy,
              frequency: task.frequency,
              dueTime: task.dueTime,
              status: task.status,
              isFromLibrary: task.isFromLibrary,
              assignedChildIds: assigned.map((c) => c.id),
              tier: task.tier,
              learningPrompt: task.learningPrompt,
            }}
            childOptions={childOptions}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyTasks({
  hasAnyTasks,
  childrenList,
}: {
  hasAnyTasks: boolean
  childrenList: { id: string; displayName: string; avatarColor: string }[]
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ListChecks className="h-7 w-7" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">
          {hasAnyTasks ? 'ফিল্টারে কোনো চ্যালেঞ্জ নেই' : 'এখনো কোনো চ্যালেঞ্জ নেই'}
        </p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {hasAnyTasks
            ? 'সার্চ বা ক্যাটাগরি ফিল্টার পরিবর্তন করুন, বা সব দেখতে ফিল্টার মুছুন।'
            : 'সাজেশন থেকে বাছাই করুন বা নিজে একটি চ্যালেঞ্জ তৈরি করে শুরু করুন।'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ImportTasksDialog childrenList={childrenList}>
            <Button variant="outline">সাজেশন থেকে বাছাই</Button>
          </ImportTasksDialog>
          <TaskFormDialog childrenList={childrenList}>
            <Button>নতুন চ্যালেঞ্জ</Button>
          </TaskFormDialog>
        </div>
      </CardContent>
    </Card>
  )
}
