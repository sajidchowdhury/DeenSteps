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
        toast.success(`অনুমোদিত! +${pointsValue} তারা যোগ হয়েছে।`)
        router.refresh()
      } else {
        toast.error(res.error ?? 'অনুমোদন দেওয়া যায়নি।')
      }
    })
  }

  const handleRevision = () => {
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, 'NEEDS_REVISION', note)
      if (res.ok) {
        toast.success('সংশোধন চাওয়া হয়েছে। কাজটি সন্তানের কাছে ফেরত গেছে আবার চেষ্টার জন্য।')
        setRevisionOpen(false)
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'সংশোধন চাওয়া যায়নি।')
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, 'REJECTED', note)
      if (res.ok) {
        toast.success('সাবমিশন প্রত্যাখ্যাত। কাজটি সন্তান আবার চেষ্টা করতে পারবে।')
        setRejectOpen(false)
        setNote('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'প্রত্যাখ্যান করা যায়নি।')
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
        অনুমোদন
      </Button>

      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> সংশোধন
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>সংশোধন চান</DialogTitle>
            <DialogDescription>
              &ldquo;{taskTitle}&rdquo;-এর জন্য সন্তানের কাছে একটি গঠনমূলক, কোমল বার্তা পাঠান।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rev-note">সন্তানের জন্য বার্তা</Label>
            <Textarea
              id="rev-note"
              placeholder="দারুণ চেষ্টা! আবার চেষ্টা করো — এবার..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionOpen(false)}>বাতিল</Button>
            <Button onClick={handleRevision} disabled={pending}>
              {pending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              সংশোধনের জন্য ফেরত পাঠান
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            <XCircle className="mr-1 h-3.5 w-3.5" /> প্রত্যাখ্যান
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>সাবমিশন প্রত্যাখ্যান</DialogTitle>
            <DialogDescription>
              কাজটি &ldquo;শুরু হয়নি&rdquo;-এ ফিরে যাবে যাতে সন্তান আবার চেষ্টা করতে পারে। একটি গঠনমূলক মন্তব্য যোগ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rej-note">মন্তব্য (অপশনাল)</Label>
            <Textarea
              id="rej-note"
              placeholder="এটা এখনো শেষ হয়নি — আগামীকাল আবার চেষ্টা করো।"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>বাতিল</Button>
            <Button variant="destructive" onClick={handleReject} disabled={pending}>
              {pending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              সাবমিশন প্রত্যাখ্যান
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
