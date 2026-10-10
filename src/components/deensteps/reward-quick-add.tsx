'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, Loader2, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { REWARD_LIBRARY } from '@/lib/constants'
import { importLibraryReward } from '@/server/actions/reward-actions'
import { cn } from '@/lib/utils'

export function RewardQuickAdd() {
  const [open, setOpen] = useState(false)
  const [pendingIndex, startTransition] = useTransition()
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set())
  const [addingIndex, setAddingIndex] = useState<number | null>(null)
  const router = useRouter()

  const handleAdd = (index: number) => {
    setAddingIndex(index)
    startTransition(async () => {
      const res = await importLibraryReward(index)
      if (res.ok) {
        setAddedIndices((prev) => new Set(prev).add(index))
        toast.success(`"${REWARD_LIBRARY[index].title}" যোগ হয়েছে!`)
        router.refresh()
      } else {
        toast.error(res.error ?? 'যোগ করা যায়নি।')
      }
      setAddingIndex(null)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-1.5 h-4 w-4" /> সাজেশন থেকে বাছাই
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>পুরস্কার সাজেশন</DialogTitle>
          <DialogDescription>
            বাবা-মায়ের জন্য সহজ পুরস্কার। যেটি পছন্দ করুন, এক ক্লিকে যোগ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto scroll-area-custom pr-1">
          <div className="grid gap-2 sm:grid-cols-2">
            {REWARD_LIBRARY.map((reward, index) => {
              const isAdded = addedIndices.has(index)
              const isAdding = addingIndex === index
              return (
                <button
                  key={reward.title}
                  onClick={() => !isAdded && handleAdd(index)}
                  disabled={isAdded || isAdding}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                    isAdded
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                      : 'border-border bg-card hover:border-primary/40 hover:shadow-soft',
                    !isAdded && !isAdding && 'cursor-pointer'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{reward.title}</p>
                    <p className="text-xs text-muted-foreground">{reward.requiredPoints} তারা</p>
                  </div>
                  {isAdded ? (
                    <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  ) : isAdding ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
