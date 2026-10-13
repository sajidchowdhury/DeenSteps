'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, HeartHandshake, X } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { submitIncident } from '@/server/actions/incident-actions'

export function IncidentReportButton({ childId }: { childId: string }) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [whatHappened, setWhatHappened] = React.useState('')
  const [whoInvolved, setWhoInvolved] = React.useState('')
  const [howFelt, setHowFelt] = React.useState('')
  const [helpNeeded, setHelpNeeded] = React.useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    if (!whatHappened.trim()) {
      toast.error('কী হয়েছে তা লিখুন।')
      return
    }
    setPending(true)
    try {
      const res = await submitIncident(
        childId,
        whatHappened.trim(),
        whoInvolved.trim() || undefined,
        howFelt.trim() || undefined,
        helpNeeded.trim() || undefined,
      )
      if (res.ok) {
        toast.success('বাবা-মাকে জানানো হয়েছে। পয়েন্ট শীঘ্রই তোমার সাথে কথা বলবেন। 💚')
        setWhatHappened('')
        setWhoInvolved('')
        setHowFelt('')
        setHelpNeeded('')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'পাঠানো যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <HeartHandshake className="h-3.5 w-3.5" />
          আমি একটি সমস্যায় সাহায্য চাই
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-rose-500" />
            আমি একটি সমস্যায় সাহায্য চাই
          </DialogTitle>
          <DialogDescription>
            এটি শুধু বাবা-মা দেখবেন। নির্ভয়ে বলতে পারো কী হয়েছে। তোমার কথা শোনা হবে।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="what-happened">কী হয়েছে?</Label>
            <Textarea
              id="what-happened"
              placeholder="ভাই/বোনের সাথে ঝগড়া হয়েছে..."
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="who-involved">কার সাথে হয়েছে? (ঐচ্ছিক)</Label>
            <Textarea
              id="who-involved"
              placeholder="ভাই/বোনের নাম..."
              value={whoInvolved}
              onChange={(e) => setWhoInvolved(e.target.value)}
              rows={1}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="how-felt">তুমি কেমন অনুভব করেছ? (ঐচ্ছিক)</Label>
            <Textarea
              id="how-felt"
              placeholder="খারাপ লেগেছে, রাগ হয়েছে..."
              value={howFelt}
              onChange={(e) => setHowFelt(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="help-needed">তোমার কী সাহায্য দরকার? (ঐচ্ছিক)</Label>
            <Textarea
              id="help-needed"
              placeholder="বাবা-মা যেন আমার কথা শোনেন..."
              value={helpNeeded}
              onChange={(e) => setHelpNeeded(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            বাতিল
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !whatHappened.trim()}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <HeartHandshake className="mr-1.5 h-3.5 w-3.5" />}
            পাঠান
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
