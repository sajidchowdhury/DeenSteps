'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RotateCcw, Loader2 } from 'lucide-react'
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
import { restoreDefaultLibrary } from '@/server/actions/task-actions'

export function RestoreDefaultsButton() {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const handleRestore = async () => {
    setPending(true)
    try {
      const res = await restoreDefaultLibrary()
      if (res.ok) {
        if (res.imported > 0) {
          toast.success(`${res.imported}টি নতুন চ্যালেঞ্জ যোগ হয়েছে! ${res.skipped > 0 ? `(${res.skipped}টি আগে থেকে ছিল)` : ''}`)
        } else {
          toast.success('সব চ্যালেঞ্জ আগে থেকেই আছে। কিছু যোগ করা হয়নি।')
        }
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'রিস্টোর করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="mr-1.5 h-4 w-4" /> ডিফল্ট রিস্টোর
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ডিফল্ট লাইব্রেরি রিস্টোর করুন</DialogTitle>
          <DialogDescription>
            সব সাজেশন চ্যালেঞ্জ পুনরায় যোগ করা হবে (যেগুলো আগে থেকে নেই)।
            আপনার বর্তমান চ্যালেঞ্জগুলো মুছে যাবে না — শুধু নতুনগুলো যোগ হবে।
            সব সক্রিয় সন্তানের জন্য নির্ধারিত হবে।
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            বাতিল
          </Button>
          <Button onClick={handleRestore} disabled={pending}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />}
            রিস্টোর করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
