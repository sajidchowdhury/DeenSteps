'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Archive, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { archiveChild, restoreChild } from '@/server/actions/child-actions'

export function ArchiveChildButton({ childId, childName }: { childId: string; childName: string }) {
  const [pending, setPending] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const onConfirm = async () => {
    setPending(true)
    try {
      const res = await archiveChild(childId)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not archive child.')
        return
      }
      toast.success(`${childName} archived.`)
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <Archive className="mr-2 h-4 w-4" /> Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {childName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Archived children are hidden from the dashboard and no longer receive new tasks.
            Their history is preserved and you can restore them at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending ? 'Archiving…' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function RestoreChildButton({ childId, childName }: { childId: string; childName: string }) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const onRestore = async () => {
    setPending(true)
    try {
      const res = await restoreChild(childId)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not restore child.')
        return
      }
      toast.success(`${childName} restored.`)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button onClick={onRestore} disabled={pending} variant="outline" size="sm">
      <RotateCcw className="mr-2 h-3.5 w-3.5" />
      {pending ? 'Restoring…' : 'Restore'}
    </Button>
  )
}
