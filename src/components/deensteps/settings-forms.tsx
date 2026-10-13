'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useRouter as useNextRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { Loader2, Download, Trash2, Sun, Moon, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
  updateFamily,
  updateFamilySettings,
  updateParentProfile,
  exportFamilyData,
  deleteFamilyData,
} from '@/server/actions/settings-actions'
import { APPROVAL_POLICIES } from '@/lib/constants'

// ────────────────────────────────────────────────────────────────────────────
// Family section
// ────────────────────────────────────────────────────────────────────────────

const FamilySchema = z.object({
  name: z.string().min(1, 'Please enter a family name.').max(120),
  timezone: z.string().max(120),
  locale: z.string().max(20),
})

export function FamilySettingsForm({
  initial,
}: {
  initial: { name: string; timezone: string; locale: string }
}) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof FamilySchema>>({
    resolver: zodResolver(FamilySchema),
    defaultValues: initial,
  })

  const onSubmit = async (values: z.infer<typeof FamilySchema>) => {
    setPending(true)
    try {
      const res = await updateFamily(values)
      if (!res.ok) {
        toast.error(res.error)
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            form.setError(k as keyof z.infer<typeof FamilySchema>, { message: v })
          }
        }
        return
      }
      toast.success('Family details saved.')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="family-name">Family name</Label>
        <Input id="family-name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="family-tz">Timezone</Label>
          <Input id="family-tz" {...form.register('timezone')} placeholder="UTC" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="family-locale">Locale</Label>
          <Input id="family-locale" {...form.register('locale')} placeholder="en" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
      </Button>
    </form>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Parent profile
// ────────────────────────────────────────────────────────────────────────────

const ParentSchema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(120),
})

export function ParentProfileForm({
  initial,
  email,
}: {
  initial: { name: string }
  email: string
}) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof ParentSchema>>({
    resolver: zodResolver(ParentSchema),
    defaultValues: initial,
  })

  const onSubmit = async (values: z.infer<typeof ParentSchema>) => {
    setPending(true)
    try {
      const res = await updateParentProfile(values)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Your profile was updated.')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="parent-name">Display name</Label>
        <Input id="parent-name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="parent-email">Email</Label>
        <Input id="parent-email" value={email} readOnly disabled />
        <p className="text-xs text-muted-foreground">Email is set when you sign up and cannot be changed here.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
      </Button>
    </form>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Points & rewards settings
// ────────────────────────────────────────────────────────────────────────────

const PointsSchema = z.object({
  pointsName: z.string().min(1).max(40),
  defaultApprovalPolicy: z.enum(['MANUAL', 'AUTO']),
  weeklyStartDay: z.enum(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  monthlyPlanType: z.enum(['FOUR_WEEK', 'CALENDAR_MONTH']),
  monthlyQualifyingWeeks: z.coerce.number().int().min(1).max(8),
})

const WEEKDAYS_OPTIONS = [
  { value: 'SUNDAY', label: 'Sunday' },
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
] as const

export function PointsSettingsForm({
  initial,
}: {
  initial: z.infer<typeof PointsSchema>
}) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof PointsSchema>>({
    resolver: zodResolver(PointsSchema),
    defaultValues: initial,
  })

  const onSubmit = async (values: z.infer<typeof PointsSchema>) => {
    setPending(true)
    try {
      const res = await updateFamilySettings(values)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Points & rewards settings saved.')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="points-name">What you call your points</Label>
          <Input id="points-name" {...form.register('pointsName')} placeholder="Points, Stars, etc." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qualifying-weeks">Monthly qualifying weeks</Label>
          <Input
            id="qualifying-weeks"
            type="number"
            min={1}
            max={8}
            {...form.register('monthlyQualifyingWeeks', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Default approval policy</Label>
          <SelectValueTrigger
            value={form.watch('defaultApprovalPolicy')}
            onChange={(v) => form.setValue('defaultApprovalPolicy', v as 'MANUAL' | 'AUTO')}
            items={APPROVAL_POLICIES.map((p) => ({ value: p.value, label: p.label }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Weekly start day</Label>
          <SelectValueTrigger
            value={form.watch('weeklyStartDay')}
            onChange={(v) => form.setValue('weeklyStartDay', v as typeof initial.weeklyStartDay)}
            items={WEEKDAYS_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Monthly plan type</Label>
          <SelectValueTrigger
            value={form.watch('monthlyPlanType')}
            onChange={(v) => form.setValue('monthlyPlanType', v as typeof initial.monthlyPlanType)}
            items={[
              { value: 'FOUR_WEEK', label: '4-week cycle' },
              { value: 'CALENDAR_MONTH', label: 'Calendar month' },
            ]}
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings
      </Button>
    </form>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────────────────────────────────────

type NotifSettings = {
  notifyOnSubmission: boolean
  notifyOnRedemption: boolean
  notifyOnChallengeEnd: boolean
  notifyOnMilestone: boolean
  emailNotifications: boolean
}

export function NotificationsForm({ initial }: { initial: NotifSettings }) {
  const [state, setState] = React.useState<NotifSettings>(initial)
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const toggle = async (key: keyof NotifSettings, value: boolean) => {
    const next = { ...state, [key]: value }
    setState(next)
    setPending(true)
    try {
      const res = await updateFamilySettings(next)
      if (!res.ok) {
        toast.error(res.error)
        setState(state) // revert
        return
      }
      toast.success('Notification preferences saved.')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const items: { key: keyof NotifSettings; title: string; description: string }[] = [
    { key: 'notifyOnSubmission', title: 'Task submissions', description: 'Notify me when a child submits a task for review.' },
    { key: 'notifyOnRedemption', title: 'Reward redemptions', description: 'Notify me when a child requests a reward.' },
    { key: 'notifyOnChallengeEnd', title: 'Challenge endings', description: 'Notify me when a weekly challenge ends.' },
    { key: 'notifyOnMilestone', title: 'Milestones reached', description: 'Notify me when a child reaches a monthly milestone.' },
    { key: 'emailNotifications', title: 'Email notifications', description: 'Also send important notifications by email (if delivery is configured).' },
  ]

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={item.key}>
          {i > 0 && <Separator className="my-0" />}
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={state[item.key]}
              onCheckedChange={(v) => toggle(item.key, v)}
              disabled={pending}
              aria-label={item.title}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Theme picker
// ────────────────────────────────────────────────────────────────────────────

export function ThemePicker({ initial }: { initial: 'light' | 'dark' }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Persist theme choice into FamilySettings when it changes
  const router = useRouter()
  React.useEffect(() => {
    if (!mounted) return
    const current = theme === 'dark' ? 'dark' : 'light'
    if (current !== initial) {
      // fire-and-forget
      updateFamilySettings({
        pointsName: 'পয়েন্ট',
        defaultApprovalPolicy: 'MANUAL',
        weeklyStartDay: 'SUNDAY',
        monthlyPlanType: 'FOUR_WEEK',
        monthlyQualifyingWeeks: 3,
        notifyOnSubmission: true,
        notifyOnRedemption: true,
        notifyOnChallengeEnd: true,
        notifyOnMilestone: true,
        emailNotifications: false,
        theme: current,
      }).then((res) => {
        if (res.ok) router.refresh()
      })
    }
  }, [theme, mounted])

  const current = mounted ? (theme === 'dark' ? 'dark' : 'light') : initial

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-3 rounded-md border p-3 text-sm transition-colors ${
          current === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/40'
        }`}
      >
        <Sun className="h-5 w-5 text-amber-500" />
        <div className="text-left">
          <p className="font-medium text-foreground">Light</p>
          <p className="text-xs text-muted-foreground">Warm off-white with emerald accents.</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-3 rounded-md border p-3 text-sm transition-colors ${
          current === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/40'
        }`}
      >
        <Moon className="h-5 w-5 text-primary" />
        <div className="text-left">
          <p className="font-medium text-foreground">Dark</p>
          <p className="text-xs text-muted-foreground">Deep slate with emerald highlights.</p>
        </div>
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Privacy & data — export and delete
// ────────────────────────────────────────────────────────────────────────────

export function ExportDataButton() {
  const [pending, setPending] = React.useState(false)

  const onExport = async () => {
    setPending(true)
    try {
      const data = await exportFamilyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deensteps-family-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Family data exported.')
    } catch {
      toast.error('Could not export data.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Button onClick={onExport} disabled={pending} variant="outline">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export as JSON
    </Button>
  )
}

export function DeleteFamilyButton() {
  const [pending, setPending] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const router = useNextRouter()

  const onDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Type DELETE to confirm.')
      return
    }
    setPending(true)
    try {
      const res = await deleteFamilyData()
      if (!res.ok) {
        toast.error(res.error ?? 'Could not delete family data.')
        return
      }
      toast.success('Family data deleted.')
      setOpen(false)
      router.push('/')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" /> Delete family data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this family workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes all children, tasks, submissions, points, rewards, and history for this family.
            This action <span className="font-semibold text-destructive">cannot be undone</span>. Consider exporting your data first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Type DELETE to confirm</Label>
          <Input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            className="font-mono"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            disabled={pending || confirmText !== 'DELETE'}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? 'Deleting…' : 'Delete forever'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Small wrapper around Select to keep forms concise
// ────────────────────────────────────────────────────────────────────────────

function SelectValueTrigger({
  value,
  onChange,
  items,
}: {
  value: string
  onChange: (v: string) => void
  items: { value: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
