'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Gift, Check, X, Loader2, BookOpenCheck, MoreVertical, Pencil } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { Avatar } from '@/components/deensteps/app-shell'
import { ICON_KEY_TO_LUCIDE, REWARD_LIBRARY } from '@/lib/constants'
import {
  createReward,
  updateReward,
  archiveReward,
  importLibraryReward,
  approveRedemption,
  declineRedemption,
  fulfillRedemption,
} from '@/server/actions/reward-actions'
import { cn } from '@/lib/utils'

const ICON_KEYS = Object.keys(ICON_KEY_TO_LUCIDE)

const Schema = z.object({
  title: z.string().min(1, 'Please enter a title.').max(120),
  description: z.string().max(500).optional(),
  iconKey: z.string().default('gift'),
  requiredPoints: z.coerce.number().int().min(0).max(10000),
  rewardType: z.enum(['POINTS', 'ACHIEVEMENT']),
  requiresApproval: z.boolean(),
})

type FormValues = z.infer<typeof Schema>

// ────────────────────────────────────────────────────────────────────────────
// Create / Edit reward dialog
// ────────────────────────────────────────────────────────────────────────────

export function RewardFormDialog({
  children,
  initial,
  rewardId,
  mode = 'create',
}: {
  children?: React.ReactNode
  initial?: Partial<FormValues>
  rewardId?: string
  mode?: 'create' | 'edit'
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      title: '',
      description: '',
      iconKey: 'gift',
      requiredPoints: 50,
      rewardType: 'POINTS',
      requiresApproval: true,
      ...initial,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        description: '',
        iconKey: 'gift',
        requiredPoints: 50,
        rewardType: 'POINTS',
        requiresApproval: true,
        ...initial,
      })
    }
  }, [open])

  const onSubmit = async (values: FormValues) => {
    setPending(true)
    try {
      if (mode === 'edit' && rewardId) {
        const res = await updateReward(rewardId, values)
        if (!res.ok) {
          toast.error(res.error)
          return
        }
        toast.success('Reward updated.')
      } else {
        const res = await createReward(values)
        if (!res.ok) {
          toast.error(res.error)
          if (res.fieldErrors) {
            for (const [k, v] of Object.entries(res.fieldErrors)) {
              form.setError(k as keyof FormValues, { message: v })
            }
          }
          return
        }
        toast.success('Reward created.')
      }
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const titleErr = form.formState.errors.title?.message
  const iconKey = form.watch('iconKey')
  const rewardType = form.watch('rewardType')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus className="h-4 w-4" /> New reward
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit reward' : 'Create a reward'}</DialogTitle>
          <DialogDescription>
            Rewards are a way to celebrate consistency. Children redeem them with points they have earned.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Choose a family restaurant"
              {...form.register('title')}
              aria-invalid={!!titleErr}
            />
            {titleErr && <p className="text-xs text-destructive">{titleErr}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="A short note shown to your child."
              {...form.register('description')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="requiredPoints">Required points</Label>
              <Input
                id="requiredPoints"
                type="number"
                min={0}
                max={10000}
                {...form.register('requiredPoints', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Controller
                control={form.control}
                name="rewardType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POINTS">Points-based</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => form.setValue('iconKey', k, { shouldDirty: true })}
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
                    iconKey === k
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent/50',
                  )}
                  aria-label={k}
                >
                  <DynamicIcon iconKey={k} size={16} />
                </button>
              ))}
            </div>
          </div>

          {rewardType === 'POINTS' && (
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Requires parent approval</p>
                <p className="text-xs text-muted-foreground">
                  When off, redemptions are auto-approved and points are spent immediately.
                </p>
              </div>
              <Controller
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Requires approval" />
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create reward'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Import from library
// ────────────────────────────────────────────────────────────────────────────

export function ImportRewardsDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [pendingIdx, setPendingIdx] = React.useState<number | null>(null)
  const router = useRouter()

  const onImport = async (idx: number) => {
    setPendingIdx(idx)
    try {
      const res = await importLibraryReward(idx)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not import reward.')
        return
      }
      toast.success(`"${REWARD_LIBRARY[idx].title}" added.`)
      router.refresh()
    } finally {
      setPendingIdx(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline">
            <BookOpenCheck className="h-4 w-4" /> Import from library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import from the reward library</DialogTitle>
          <DialogDescription>
            A small set of meaningful, family-focused reward ideas. Each one is fully editable after import.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-3">
          <div className="grid gap-2">
            {REWARD_LIBRARY.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <DynamicIcon iconKey={r.iconKey} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
                </div>
                <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-300">
                  <Plus className="h-3 w-3" />
                  {r.requiredPoints}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onImport(i)}
                  disabled={pendingIdx !== null}
                >
                  {pendingIdx === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Import'}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Archive reward
// ────────────────────────────────────────────────────────────────────────────

export function RewardArchiveButton({
  rewardId,
  rewardTitle,
  children,
}: {
  rewardId: string
  rewardTitle: string
  children?: React.ReactNode
}) {
  const [pending, setPending] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const onConfirm = async () => {
    setPending(true)
    try {
      const res = await archiveReward(rewardId)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not archive reward.')
        return
      }
      toast.success(`"${rewardTitle}" archived.`)
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children ?? (
          <button type="button" className="w-full px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent/50">
            Archive
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive this reward?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{rewardTitle}&rdquo; will be hidden from the catalog. Existing redemptions are preserved.
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

// ────────────────────────────────────────────────────────────────────────────
// Redemption workflow buttons
// ────────────────────────────────────────────────────────────────────────────

export function ApproveRedemptionButton({ redemptionId }: { redemptionId: string }) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const onApprove = async () => {
    setPending(true)
    try {
      const res = await approveRedemption(redemptionId)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not approve.')
        return
      }
      toast.success('Redemption approved.')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button onClick={onApprove} disabled={pending} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      Approve
    </Button>
  )
}

export function FulfillRedemptionButton({ redemptionId }: { redemptionId: string }) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const onFulfill = async () => {
    setPending(true)
    try {
      const res = await fulfillRedemption(redemptionId)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not fulfill.')
        return
      }
      toast.success('Redemption fulfilled.')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button onClick={onFulfill} disabled={pending} size="sm" variant="outline">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gift className="h-3.5 w-3.5" />}
      Mark fulfilled
    </Button>
  )
}

export function DeclineRedemptionButton({
  redemptionId,
  childName,
  rewardTitle,
}: {
  redemptionId: string
  childName: string
  rewardTitle: string
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [note, setNote] = React.useState('')
  const router = useRouter()

  const onDecline = async () => {
    setPending(true)
    try {
      const res = await declineRedemption(redemptionId, note.trim() || undefined)
      if (!res.ok) {
        toast.error(res.error ?? 'Could not decline.')
        return
      }
      toast.success('Redemption declined. Points refunded.')
      setOpen(false)
      setNote('')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/40">
          <X className="h-3.5 w-3.5" /> Decline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decline redemption?</DialogTitle>
          <DialogDescription>
            {childName} will be refunded the points for &ldquo;{rewardTitle}&rdquo;. Add a short note (optional) to help them understand.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note for {childName}</Label>
          <Textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Let's pick a different reward together this week."
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onDecline} disabled={pending}>
            {pending ? 'Declining…' : 'Decline & refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper to render relative time consistently
export function RelativeTime({ date }: { date: Date }) {
  return <>{formatDistanceToNow(date, { addSuffix: true })}</>
}

// ────────────────────────────────────────────────────────────────────────────
// Row actions — single client component that owns the DropdownMenu so we can
// safely pass onSelect handlers without crossing the server/client boundary.
// ────────────────────────────────────────────────────────────────────────────

type RewardRowActionReward = {
  id: string
  title: string
  description: string | null
  iconKey: string
  requiredPoints: number
  rewardType: string
  requiresApproval: boolean
  status: string
}

export function RewardRowActions({
  reward,
  archived = false,
}: {
  reward: RewardRowActionReward
  archived?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Reward actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <RewardFormDialog
          mode="edit"
          rewardId={reward.id}
          initial={{
            title: reward.title,
            description: reward.description ?? '',
            iconKey: reward.iconKey,
            requiredPoints: reward.requiredPoints,
            rewardType: reward.rewardType as 'POINTS' | 'ACHIEVEMENT',
            requiresApproval: reward.requiresApproval,
          }}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        </RewardFormDialog>
        {!archived && (
          <RewardArchiveButton rewardId={reward.id} rewardTitle={reward.title}>
            <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
              Archive
            </DropdownMenuItem>
          </RewardArchiveButton>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { Gift as GiftIcon }
