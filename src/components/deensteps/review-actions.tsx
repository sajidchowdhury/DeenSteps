'use client'

import { ShieldCheck, XCircle, RotateCcw, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { reviewSubmission, type ReviewDecision } from '@/server/actions/review-actions'

export function ReviewActions({
  submissionId,
  pointsValue,
  taskTitle,
}: {
  submissionId: string
  pointsValue: number
  taskTitle: string
}) {
  const [pending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [note, setNote] = useState('')
  const router = useRouter()

  const handleApprove = () => {
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, 'APPROVED')
      if (res.ok) {
        toast.success(`Approved! +${pointsValue} stars awarded.`)
        router.refresh()
      } else {
        toast.error(res.error ?? 'Could not approve.')
      }
    })
  }

  const handleRevision = () => {
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, 'NEEDS_REVISION', note)
      if (res.ok) {
        toast.success('Revision requested. The task was returned to your child for another try.')
        setRevisionOpen(false)
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'Could not request revision.')
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, 'REJECTED', note)
      if (res.ok) {
        toast.success('Submission rejected. The task is available for your child to retry.')
        setRejectOpen(false)
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'Could not reject.')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={pending}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {pending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="mr-1 h-3.5 w-3.5" />}
        Approve
      </Button>

      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Revision
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request revision</DialogTitle>
            <DialogDescription>
              Send a gentle, constructive message back to your child about &ldquo;{taskTitle}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rev-note">Message for your child</Label>
            <Textarea
              id="rev-note"
              placeholder="Great effort! Let's try again — this time remember to..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionOpen(false)}>Cancel</Button>
            <Button onClick={handleRevision} disabled={pending}>
              {pending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              Send back for revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject submission</DialogTitle>
            <DialogDescription>
              The task will be returned to &ldquo;Not started&rdquo; so your child can try again. Please add a constructive note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rej-note">Note (optional)</Label>
            <Textarea
              id="rej-note"
              placeholder="This wasn't quite finished yet — let's try again tomorrow."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={pending}>
              {pending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              Reject submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
