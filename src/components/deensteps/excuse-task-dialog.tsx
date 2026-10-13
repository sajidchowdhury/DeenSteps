'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, AlertCircle, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { excuseTaskOccurrence } from '@/server/actions/task-actions'

const FOLLOW_UP_TYPES = [
  { value: 'practice_wudu', label: 'ওযু অনুশীলন করবে' },
  { value: 'learn_about_salah', label: 'নামাজ সম্পর্কে শিখবে' },
  { value: 'plan_routine', label: 'ভালো রুটিন পরিকল্পনা করবে' },
  { value: 'practice_kindness', label: 'দয়ার কাজ করবে' },
  { value: 'other', label: 'অন্যান্য' },
]

export function ExcuseTaskDialog({
  occurrenceId,
  taskTitle,
  children: _children,
  open,
  onOpenChange,
}: {
  occurrenceId: string
  taskTitle: string
  children?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = React.useState('')
  const [followUpType, setFollowUpType] = React.useState('')
  const [followUpNote, setFollowUpNote] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('কারণ লিখুন।')
      return
    }
    setPending(true)
    try {
      const res = await excuseTaskOccurrence(
        occurrenceId,
        reason.trim(),
        followUpType || undefined,
        followUpNote.trim() || undefined,
      )
      if (res.ok) {
        toast.success('কাজটি ছাড় করা হয়েছে। সন্তানকে ভালোবাসা দিন।')
        setReason('')
        setFollowUpType('')
        setFollowUpNote('')
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'ছাড় করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-600" />
            মিসড কাজ ছাড় করুন
          </DialogTitle>
          <DialogDescription>
            &ldquo;{taskTitle}&rdquo; — এই কাজটি সম্পন্ন হয়নি। সন্তানকে উৎসাহ দিন, শাস্তি নয়। কোনো পয়েন্ট কাটা হবে না।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="excuse-reason">কারণ</Label>
            <Textarea
              id="excuse-reason"
              placeholder="অসুস্থতা, ভ্রমণ, পারিবারিক কারণ..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>সন্তান কী করবে? (ঐচ্ছিক)</Label>
            <Select value={followUpType} onValueChange={setFollowUpType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ফলোআপ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_TYPES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excuse-note">ফলোআপ নোট (ঐচ্ছিক)</Label>
            <Textarea
              id="excuse-note"
              placeholder="সন্তানের সাথে কথা হয়েছে..."
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            বাতিল
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !reason.trim()}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Heart className="mr-1.5 h-3.5 w-3.5" />}
            ছাড় করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
