'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Info,
  BookOpenCheck,
  Star,
  PartyPopper,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { submitTaskOccurrence } from '@/server/actions/review-actions'
import { TASK_STATUS_META } from '@/lib/constants'
import { playSound } from '@/lib/sounds'
import { TtsButton } from '@/components/deensteps/tts-button'
import { ShowMore } from '@/components/deensteps/show-more'
import { cn } from '@/lib/utils'

export type ChildTask = {
  id: string
  status: string
  dueTime: string | null
  taskTitle: string
  taskDescription: string | null
  taskInstructions: string | null
  category: string
  iconKey: string
  pointsValue: number
  approvalPolicy: string
  submissionNote: string | null
  reviewerNote: string | null
  childId: string
  // Phase 5 (S5.2): optional Islamic learning prompt — the "why" behind the task
  learningPrompt: string | null
}

export function ChildTaskList({ occurrences }: { occurrences: ChildTask[] }) {
  if (occurrences.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <p className="mt-3 font-display text-lg font-semibold text-foreground">আজ কোনো কাজ নেই</p>
        <p className="mt-1 text-sm text-muted-foreground">দিনটি উপভোগ করো — আগামীকাল নতুন কাজের জন্য দেখো!</p>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // Phase B (B4): Split tasks into "active" and "done" piles.
  //   active = ASSIGNED, SUBMITTED, NEEDS_ATTENTION (things the child still needs to work on)
  //   done   = APPROVED (things the child has completed and the parent has approved)
  //
  // Done tasks move to a collapsible "✅ সম্পন্ন (N)" section below the active
  // list. This gives the child a visual sense of progress — the active list
  // shrinks as they complete tasks, and the done pile grows.
  // ════════════════════════════════════════════════════════════════════════
  const activeTasks = occurrences.filter(
    (t) => t.status === 'ASSIGNED' || t.status === 'SUBMITTED' || t.status === 'NEEDS_ATTENTION'
  )
  const doneTasks = occurrences.filter((t) => t.status === 'APPROVED')

  return (
    <div className="space-y-4">
      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <div>
          {doneTasks.length > 0 && (
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              বাকি আছে ({activeTasks.length})
            </p>
          )}
          <ShowMore initialCount={10}>
            {activeTasks.map((o) => (
              <ChildTaskItem key={o.id} task={o} />
            ))}
          </ShowMore>
        </div>
      )}

      {/* Done pile — collapsible */}
      {doneTasks.length > 0 && (
        <DonePile tasks={doneTasks} />
      )}

      {/* If everything is done, show a celebration */}
      {activeTasks.length === 0 && doneTasks.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <PartyPopper className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-2 font-display text-lg font-bold text-foreground">সব কাজ শেষ! দারুণ! 🎉</p>
          <p className="mt-1 text-sm text-muted-foreground">আজকের সব কাজ সম্পন্ন করেছ। আল্লাহ তোমার চেষ্টা কবুল করুন।</p>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Phase B (B4): Done pile — collapsible section for APPROVED tasks
// ────────────────────────────────────────────────────────────────────────────

function DonePile({ tasks }: { tasks: ChildTask[] }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 text-left transition-colors hover:bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="font-display font-semibold text-foreground">
            সম্পন্ন ({tasks.length})
          </span>
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <ul className="mt-2 space-y-2">
          {tasks.map((t) => (
            <DoneTaskItem key={t.id} task={t} />
          ))}
        </ul>
      )}
    </div>
  )
}

function DoneTaskItem({ task }: { task: ChildTask }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/10">
      <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
        <DynamicIcon iconKey={task.iconKey} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground line-through opacity-70">{task.taskTitle}</p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
        +{task.pointsValue}
      </span>
    </li>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Phase B (B3): Redesigned task card
//   - Bigger icon tile (40×40, was 28×28)
//   - Bigger title (text-base, was text-sm)
//   - Star icon next to points value
//   - Learning prompt auto-revealed (not collapsed behind a toggle)
//   - Bigger primary button (size="default", was size="sm")
//   - Whole card is a tap target for the submit dialog
// ────────────────────────────────────────────────────────────────────────────

function ChildTaskItem({ task }: { task: ChildTask }) {
  const [pending, startTransition] = useTransition()
  const [submitOpen, setSubmitOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const router = useRouter()

  const meta = TASK_STATUS_META[task.status] ?? TASK_STATUS_META.ASSIGNED
  const isAssigned = task.status === 'ASSIGNED'
  const isSubmitted = task.status === 'SUBMITTED'
  const isNeedsAttention = task.status === 'NEEDS_ATTENTION'

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await submitTaskOccurrence(task.id, task.childId, note.trim() || undefined)
      if (res.ok) {
        toast.success('জমা হয়েছে! বাবা-মা শীঘ্রই রিভিউ করবেন।')
        // Phase E (E4): Play submission sound.
        playSound('task-submitted')
        setSubmitOpen(false)
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'কাজ জমা দেওয়া যায়নি।')
        playSound('error')
      }
    })
  }

  const hasExtraInfo = task.taskInstructions || task.reviewerNote

  return (
    <li
      className={cn(
        'p-4 transition-all',
        isNeedsAttention && 'bg-orange-50/40 dark:bg-orange-950/20'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Task icon tile — bigger now (40×40) */}
        <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DynamicIcon iconKey={task.iconKey} className="h-5 w-5" />
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <p className="text-base font-bold text-foreground">{task.taskTitle}</p>
              {/* TTS button beside task name — reads the entire task */}
              <TtsButton
                text={`${task.taskTitle}. ${task.taskDescription ?? ''} ${task.learningPrompt ?? ''}`}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {task.dueTime && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Clock className="h-2.5 w-2.5" /> {task.dueTime}
                </Badge>
              )}
              <Badge variant="outline" className={cn('text-xs', meta.tone)}>{meta.label}</Badge>
            </div>
          </div>

          {/* Description */}
          {task.taskDescription && (
            <p className="mt-1 text-sm text-muted-foreground">{task.taskDescription}</p>
          )}

          {/* Hadith (was "শেখার প্রশ্ন") — auto-revealed with TTS button */}
          {task.learningPrompt && (
            <div className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <BookOpenCheck className="h-3.5 w-3.5" />
                  Hadith
                </p>
                {/* TTS button — reads only the hadith */}
                <TtsButton text={task.learningPrompt} />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-foreground">{task.learningPrompt}</p>
            </div>
          )}

          {/* Submission note (child's own note from when they submitted) */}
          {task.submissionNote && (
            <div className="mt-2 rounded-lg bg-secondary/60 p-2 text-xs text-foreground">
              <span className="font-medium">তোমার নোট: </span>{task.submissionNote}
            </div>
          )}

          {/* Reviewer note (parent's message) */}
          {task.reviewerNote && (
            <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-900 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-100">
              <MessageSquare className="mr-1 inline h-3 w-3" />
              <span className="font-medium">বাবা-মা থেকে: </span>{task.reviewerNote}
            </div>
          )}

          {/* Expandable instructions */}
          {hasExtraInfo && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'বিস্তারিত লুকান' : 'বিস্তারিত দেখুন'}
            </button>
          )}
          {expanded && task.taskInstructions && (
            <div className="mt-2 rounded-lg bg-secondary/40 p-2.5 text-xs text-foreground">
              <p className="font-medium">নির্দেশনা</p>
              <p className="mt-0.5 text-muted-foreground">{task.taskInstructions}</p>
            </div>
          )}

          {/* Actions — bigger buttons (size="default" not size="sm") */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isAssigned && (
              <Button onClick={() => setSubmitOpen(true)} disabled={pending} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> সম্পন্ন করেছি
              </Button>
            )}
            {isSubmitted && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
                <Clock className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  বাবা-মার রিভিউর অপেক্ষায়। {task.approvalPolicy === 'AUTO' ? 'পয়েন্ট স্বয়ংক্রিয়ভাবে যোগ হবে।' : 'অনুমোদনের পর পয়েন্ট যোগ হবে।'}
                </p>
              </div>
            )}
            {isNeedsAttention && (
              <Button onClick={() => setSubmitOpen(true)} disabled={pending} className="gap-1.5">
                <AlertCircle className="h-4 w-4" /> আবার চেষ্টা করো
              </Button>
            )}
          </div>
        </div>

        {/* Points badge — with star icon, prominent on the right */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            +{task.pointsValue}
          </span>
        </div>
      </div>

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>&ldquo;{task.taskTitle}&rdquo; সম্পন্ন করেছ?</DialogTitle>
            <DialogDescription>
              {task.approvalPolicy === 'AUTO'
                ? 'পয়েন্ট সাথে সাথে তোমার ব্যালেন্সে যোগ হবে!'
                : 'বাবা-মা রিভিউ করার পর পয়েন্ট যোগ হবে।'}
              {' '}
              চাইলে একটি নোট যোগ করতে পারো।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="child-note">বাবা-মার জন্য নোট (অপশনাল)</Label>
            <Textarea
              id="child-note"
              placeholder="আজ কুরআনের ২ পৃষ্ঠা পড়েছি!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>বাতিল</Button>
            <Button onClick={handleSubmit} disabled={pending}>
              {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
              জমা দিন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}
