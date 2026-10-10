'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar } from '@/components/deensteps/app-shell'
import { createChallenge } from '@/server/actions/challenge-actions'
import { cn } from '@/lib/utils'

const Schema = z.object({
  name: z.string().min(1, 'Please enter a name.').max(120),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, 'Pick a start date.'),
  endDate: z.string().min(1, 'Pick an end date.'),
  targetPercent: z.coerce.number().int().min(1).max(100),
  eligibleChildIds: z.array(z.string()).default([]),
  rewardTitle: z.string().max(120).optional(),
})

type FormValues = z.infer<typeof Schema>

type ChildOption = { id: string; displayName: string; avatarColor: string }

export function ChallengeFormDialog({
  children,
  childrenList,
}: {
  children?: React.ReactNode
  childrenList: ChildOption[]
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  // Default to this week's start (Sunday) and end (Saturday)
  const today = new Date()
  const startDefault = new Date(today)
  startDefault.setDate(today.getDate() - today.getDay())
  const endDefault = new Date(startDefault)
  endDefault.setDate(startDefault.getDate() + 6)

  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: '',
      description: '',
      startDate: fmt(startDefault),
      endDate: fmt(endDefault),
      targetPercent: 80,
      eligibleChildIds: [],
      rewardTitle: '',
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        description: '',
        startDate: fmt(startDefault),
        endDate: fmt(endDefault),
        targetPercent: 80,
        eligibleChildIds: [],
        rewardTitle: '',
      })
    }
  }, [open])

  const onSubmit = async (values: FormValues) => {
    setPending(true)
    try {
      const res = await createChallenge(values)
      if (!res.ok) {
        toast.error(res.error)
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            form.setError(k as keyof FormValues, { message: v })
          }
        }
        return
      }
      toast.success('Challenge created.')
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const nameErr = form.formState.errors.name?.message
  const startErr = form.formState.errors.startDate?.message
  const endErr = form.formState.errors.endDate?.message
  const eligibleChildIds = form.watch('eligibleChildIds')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus className="h-4 w-4" /> New challenge
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a weekly challenge</DialogTitle>
          <DialogDescription>
            A friendly goal for the week. Children aim to complete a target percentage of their tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Challenge name</Label>
            <Input
              id="name"
              placeholder="e.g. Consistent Week"
              {...form.register('name')}
              aria-invalid={!!nameErr}
            />
            {nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="Optional — a short encouragement shown to the family."
              {...form.register('description')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register('startDate')}
                aria-invalid={!!startErr}
              />
              {startErr && <p className="text-xs text-destructive">{startErr}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register('endDate')}
                aria-invalid={!!endErr}
              />
              {endErr && <p className="text-xs text-destructive">{endErr}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetPercent">Target completion: {form.watch('targetPercent')}%</Label>
            <Input
              id="targetPercent"
              type="range"
              min={1}
              max={100}
              {...form.register('targetPercent', { valueAsNumber: true })}
              className="h-2 cursor-pointer p-0 accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rewardTitle">Reward title (optional)</Label>
            <Input
              id="rewardTitle"
              placeholder="e.g. Choose a family movie night"
              {...form.register('rewardTitle')}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Eligible children</Label>
            {childrenList.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-card/30 p-3 text-xs text-muted-foreground">
                Add a child profile first to include them in a challenge.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {childrenList.map((c) => {
                  const checked = eligibleChildIds.includes(c.id)
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-md border p-2.5 text-sm transition-colors',
                        checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/40',
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next = v
                            ? [...eligibleChildIds, c.id]
                            : eligibleChildIds.filter((id) => id !== c.id)
                          form.setValue('eligibleChildIds', next, { shouldDirty: true })
                        }}
                      />
                      <Avatar color={c.avatarColor} name={c.displayName} size="sm" />
                      <span className="truncate text-foreground">{c.displayName}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create challenge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
