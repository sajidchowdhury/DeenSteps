'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, MoreVertical, Pencil } from 'lucide-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AGE_RANGES, AVATAR_COLORS } from '@/lib/constants'
import { createChildProfile, updateChildProfile } from '@/server/actions/child-actions'
import { ArchiveChildButton } from '@/components/deensteps/child-actions'
import { cn } from '@/lib/utils'

const Schema = z.object({
  displayName: z.string().min(1, 'Please enter a name.').max(60),
  ageRange: z.enum(['3-5', '6-8', '9-12', '13+']).optional(),
  avatarColor: z.enum(['emerald', 'amber', 'sage', 'rose', 'violet', 'sky']),
})

type FormValues = z.infer<typeof Schema>

export function CreateChildDialog({
  children,
  initial,
  childId,
  mode = 'create',
}: {
  children?: React.ReactNode
  initial?: Partial<FormValues>
  childId?: string
  mode?: 'create' | 'edit'
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      displayName: initial?.displayName ?? '',
      ageRange: initial?.ageRange,
      avatarColor: initial?.avatarColor ?? 'emerald',
    },
  })

  // Reset form when the dialog opens so external initial values refresh
  React.useEffect(() => {
    if (open) {
      form.reset({
        displayName: initial?.displayName ?? '',
        ageRange: initial?.ageRange,
        avatarColor: initial?.avatarColor ?? 'emerald',
      })
    }
  }, [open])

  const onSubmit = async (values: FormValues) => {
    setPending(true)
    try {
      if (mode === 'edit' && childId) {
        const res = await updateChildProfile(childId, values)
        if (!res.ok) {
          toast.error(res.error)
          if (res.fieldErrors) {
            for (const [k, v] of Object.entries(res.fieldErrors)) {
              form.setError(k as keyof FormValues, { message: v })
            }
          }
          return
        }
        toast.success('Profile updated.')
      } else {
        const res = await createChildProfile(values)
        if (!res.ok) {
          toast.error(res.error)
          if (res.fieldErrors) {
            for (const [k, v] of Object.entries(res.fieldErrors)) {
              form.setError(k as keyof FormValues, { message: v })
            }
          }
          return
        }
        toast.success('Child added.')
      }
      setOpen(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const displayNameErr = form.formState.errors.displayName?.message
  const ageRange = form.watch('ageRange')
  const avatarColor = form.watch('avatarColor')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus className="h-4 w-4" /> Add child
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit child profile' : 'Add a child'}</DialogTitle>
          <DialogDescription>
            Each child has their own tasks, points, and rewards. You can change these later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              placeholder="e.g. Aisha"
              autoComplete="off"
              {...form.register('displayName')}
              aria-invalid={!!displayNameErr}
            />
            {displayNameErr && <p className="text-xs text-destructive">{displayNameErr}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Age range</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AGE_RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => form.setValue('ageRange', r.value, { shouldDirty: true })}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    ageRange === r.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent/50',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Optional — used to suggest age-appropriate tasks.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Avatar color</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => form.setValue('avatarColor', c.value, { shouldDirty: true })}
                  aria-label={c.label}
                  className={cn(
                    'h-9 w-9 rounded-full ring-offset-2 ring-offset-background transition-all',
                    c.class,
                    avatarColor === c.value ? 'ring-2 ring-ring' : 'hover:scale-105',
                  )}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add child'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Row actions — single client component that owns the DropdownMenu so we can
// safely pass onSelect handlers without crossing the server/client boundary.
// ────────────────────────────────────────────────────────────────────────────

export function ChildRowActions({
  child,
}: {
  child: {
    id: string
    displayName: string
    avatarColor: string
    ageRange: string | null
  }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Child actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <CreateChildDialog
          mode="edit"
          childId={child.id}
          initial={{
            displayName: child.displayName,
            ageRange: (child.ageRange as '3-5' | '6-8' | '9-12' | '13+') ?? undefined,
            avatarColor: child.avatarColor as 'emerald' | 'amber' | 'sage' | 'rose' | 'violet' | 'sky',
          }}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        </CreateChildDialog>
        <div className="px-1 py-1">
          <ArchiveChildButton childId={child.id} childName={child.displayName} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
