'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, Loader2, Plus, Check, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CHALLENGE_SUGGESTIONS } from '@/lib/constants'
import { createChallengeFromSuggestion } from '@/server/actions/challenge-actions'
import { cn } from '@/lib/utils'

export function ChallengeQuickAdd() {
  const [open, setOpen] = useState(false)
  const [pendingIndex, startTransition] = useTransition()
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set())
  const [addingIndex, setAddingIndex] = useState<number | null>(null)
  const router = useRouter()

  const handleAdd = (index: number) => {
    setAddingIndex(index)
    startTransition(async () => {
      const res = await createChallengeFromSuggestion(index)
      if (res.ok) {
        setAddedIndices((prev) => new Set(prev).add(index))
        toast.success(`"${CHALLENGE_SUGGESTIONS[index].name}" চ্যালেঞ্জ তৈরি হয়েছে!`)
        router.refresh()
      } else {
        toast.error(res.error ?? 'তৈরি করা যায়নি।')
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
          <DialogTitle>চ্যালেঞ্জ সাজেশন</DialogTitle>
          <DialogDescription>
            এই সপ্তাহের জন্য একটি চ্যালেঞ্জ বেছে নিন। সব সক্রিয় সন্তান স্বয়ংক্রিয়ভাবে যোগ হবে।
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto scroll-area-custom pr-1">
          <div className="space-y-2">
            {CHALLENGE_SUGGESTIONS.map((challenge, index) => {
              const isAdded = addedIndices.has(index)
              const isAdding = addingIndex === index
              return (
                <button
                  key={challenge.name}
                  onClick={() => !isAdded && handleAdd(index)}
                  disabled={isAdded || isAdding}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                    isAdded
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                      : 'border-border bg-card hover:border-primary/40 hover:shadow-soft',
                    !isAdded && !isAdding && 'cursor-pointer'
                  )}
                >
                  <div className={cn(
                    'mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                    isAdded ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40' : 'bg-primary/10 text-primary'
                  )}>
                    {isAdded ? <Check className="h-4 w-4" /> : isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{challenge.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{challenge.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        লক্ষ্য: {challenge.targetPercent}%
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                        পুরস্কার: {challenge.rewardTitle}
                      </span>
                    </div>
                  </div>
                  {!isAdded && !isAdding && (
                    <Plus className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
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
