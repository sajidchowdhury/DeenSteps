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

  return (
    <ul className="space-y-3">
      {occurrences.map((o) => (
        <ChildTaskItem key={o.id} task={o} />
      ))}
    </ul>
  )
}

function ChildTaskItem({ task }: { task: ChildTask }) {
  const [pending, startTransition] = useTransition()
  const [submitOpen, setSubmitOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [note, setNote] = useState('')
  const router = useRouter()

  const meta = TASK_STATUS_META[task.status] ?? TASK_STATUS_META.ASSIGNED
  const isAssigned = task.status === 'ASSIGNED'
  const isSubmitted = task.status === 'SUBMITTED'
  const isApproved = task.status === 'APPROVED'
  const isNeedsAttention = task.status === 'NEEDS_ATTENTION'

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await submitTaskOccurrence(task.id, task.childId, note.trim() || undefined)
      if (res.ok) {
        toast.success('জমা হয়েছে! বাবা-মা শীঘ্রই রিভিউ করবেন।')
        setSubmitOpen(false)
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'কাজ জমা দেওয়া যায়নি।')
      }
    })
  }

  const hasExtraInfo = task.taskInstructions || task.reviewerNote

  return (
    <li
      className={cn(
        'rounded-xl border bg-card p-4 transition-colors',
        isApproved && 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20',
        isNeedsAttention && 'border-orange-200 bg-orange-50/40 dark:border-orange-900 dark:bg-orange-950/20',
        !isApproved && !isNeedsAttention && 'border-border'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="mt-0.5 flex-shrink-0">
          {isApproved ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : isSubmitted ? (
            <Clock className="h-6 w-6 text-amber-500" />
          ) : isNeedsAttention ? (
            <AlertCircle className="h-6 w-6 text-orange-500" />
          ) : (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <DynamicIcon iconKey={task.iconKey} className="h-3.5 w-3.5" />
              </span>
              <p className={cn('font-semibold text-foreground', isApproved && 'line-through opacity-70')}>{task.taskTitle}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {task.dueTime && (
                <Badge variant="outline" className="text-xs">{task.dueTime}</Badge>
              )}
              <Badge variant="outline" className={cn('text-xs', meta.tone)}>{meta.label}</Badge>
              <Badge variant="secondary" className="text-xs gap-0.5">
                +{task.pointsValue}
              </Badge>
            </div>
          </div>

          {task.taskDescription && (
            <p className="mt-1 text-sm text-muted-foreground">{task.taskDescription}</p>
          )}

          {/* Phase 5 (S5.2): Optional learning prompt — the "why" behind the task */}
          {task.learningPrompt && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setPromptOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <BookOpenCheck className="h-3 w-3" />
                {promptOpen ? 'লুকান' : 'শেখার প্রশ্ন'}
                {promptOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {promptOpen && (
                <div className="mt-1.5 rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5 text-xs text-foreground dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <p className="leading-relaxed">{task.learningPrompt}</p>
                </div>
              )}
            </div>
          )}

          {task.submissionNote && (
            <div className="mt-2 rounded-lg bg-secondary/60 p-2 text-xs text-foreground">
              <span className="font-medium">তোমার নোট: </span>{task.submissionNote}
            </div>
          )}

          {task.reviewerNote && (
            <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-900 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-100">
              <MessageSquare className="mr-1 inline h-3 w-3" />
              <span className="font-medium">বাবা-মা থেকে: </span>{task.reviewerNote}
            </div>
          )}

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

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isAssigned && (
              <Button size="sm" onClick={() => setSubmitOpen(true)} disabled={pending}>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> সম্পন্ন করেছি
              </Button>
            )}
            {isSubmitted && (
              <p className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                <Info className="h-3.5 w-3.5" />
                বাবা-মার রিভিউর অপেক্ষায়। {task.approvalPolicy === 'AUTO' ? 'তারা স্বয়ংক্রিয়ভাবে যোগ হবে।' : 'অনুমোদনের পর তারা যোগ হবে।'}
              </p>
            )}
            {isNeedsAttention && (
              <Button size="sm" onClick={() => setSubmitOpen(true)} disabled={pending}>
                আবার চেষ্টা করো
              </Button>
            )}
            {isApproved && (
              <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> +{task.pointsValue} তারা অর্জিত!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>&ldquo;{task.taskTitle}&rdquo; সম্পন্ন করেছ?</DialogTitle>
            <DialogDescription>
              {task.approvalPolicy === 'AUTO'
                ? 'তারা সাথে সাথে তোমার ব্যালেন্সে যোগ হবে!'
                : 'বাবা-মা রিভিউ করার পর তারা যোগ হবে।'}
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
