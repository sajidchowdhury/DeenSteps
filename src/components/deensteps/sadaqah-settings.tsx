'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Heart, Loader2, Plus, Check, Trash2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DynamicIcon } from '@/components/deensteps/dynamic-icon'
import { SADAQAH_CAUSES, ICON_KEY_TO_LUCIDE } from '@/lib/constants'
import { updateFamilySettings, updateFamily } from '@/server/actions/settings-actions'
import {
  createSadaqahCause,
  importSadaqahCause,
  deactivateSadaqahCause,
} from '@/server/actions/sadaqah-actions'
import { cn } from '@/lib/utils'

type SadaqahCause = {
  id: string
  title: string
  description: string | null
  iconKey: string
  active: boolean
  _count: { donations: number }
}

export function SadaqahSettings({
  initial,
  causes,
  familyName,
}: {
  initial: {
    sadaqahPledgeEnabled: boolean
    sadaqahStarsPerUnit: number
    sadaqahCurrency: string
    sadaqahAmountPerUnit: number
    monthlyRewardBudget: number | null
  }
  causes: SadaqahCause[]
  familyName: string
}) {
  const [pledgeEnabled, setPledgeEnabled] = React.useState(initial.sadaqahPledgeEnabled)
  const [starsPerUnit, setStarsPerUnit] = React.useState(String(initial.sadaqahStarsPerUnit))
  const [currency, setCurrency] = React.useState(initial.sadaqahCurrency)
  const [amountPerUnit, setAmountPerUnit] = React.useState(String(initial.sadaqahAmountPerUnit))
  const [budget, setBudget] = React.useState(initial.monthlyRewardBudget ? String(initial.monthlyRewardBudget) : '')
  const [saving, setSaving] = React.useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateFamilySettings({
        pointsName: 'তারা',
        defaultApprovalPolicy: 'MANUAL',
        weeklyStartDay: 'SUNDAY',
        monthlyPlanType: 'FOUR_WEEK',
        monthlyQualifyingWeeks: 3,
        notifyOnSubmission: true,
        notifyOnRedemption: true,
        notifyOnChallengeEnd: true,
        notifyOnMilestone: true,
        emailNotifications: false,
        theme: 'light',
        monthlyRewardBudget: budget ? parseFloat(budget) : null,
        sadaqahPledgeEnabled: pledgeEnabled,
        sadaqahStarsPerUnit: parseInt(starsPerUnit, 10) || 100,
        sadaqahCurrency: currency,
        sadaqahAmountPerUnit: parseFloat(amountPerUnit) || 100,
      })
      if (res.ok) {
        toast.success('সাদাকাহ সেটিংস সংরক্ষণ হয়েছে।')
        router.refresh()
      } else {
        toast.error(res.error ?? 'সংরক্ষণ করা যায়নি।')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Pledge configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-600" />
            সাদাকাহ প্লেজ কনফিগারেশন
          </CardTitle>
          <CardDescription>
            সন্তানের তারা কীভাবে বাস্তব দানে পরিণত হবে তা নির্ধারণ করুন। এটি একটি পারিবারিক অঙ্গীকার — তারার কোনো স্বয়ংক্রিয় নগদ মূল্য নেই।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">সাদাকাহ প্লেজ সক্রিয়</p>
              <p className="text-xs text-muted-foreground">চালু করলে সন্তান তারা দান করতে পারবে।</p>
            </div>
            <Switch checked={pledgeEnabled} onCheckedChange={setPledgeEnabled} />
          </div>

          {pledgeEnabled && (
            <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">রূপান্তর হার (উদাহরণ: ১০০ তারা = ১০০ টাকা)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="stars-per-unit">তারা</Label>
                  <Input id="stars-per-unit" type="number" min={1} value={starsPerUnit} onChange={(e) => setStarsPerUnit(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount-per-unit">পরিমাণ</Label>
                  <Input id="amount-per-unit" type="number" min={0} value={amountPerUnit} onChange={(e) => setAmountPerUnit(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">মুদ্রা</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT (টাকা)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                💡 এটি একটি পারিবারিক অঙ্গীকার। বাবা-মা প্রকৃত দান করবেন — তারা সরাসরি নগদ নয়।
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reward-budget">মাসিক পুরস্কার বাজেট (ঐচ্ছিক)</Label>
            <Input id="reward-budget" type="number" min={0} placeholder="যেমন: ১০০০" value={budget} onChange={(e) => setBudget(e.target.value)} />
            <p className="text-xs text-muted-foreground">খালি রাখলে কোনো বাজেট সীমা থাকবে না।</p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            সংরক্ষণ করুন
          </Button>
        </CardContent>
      </Card>

      {/* Cause management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display">সাদাকাহ কারণ তালিকা</CardTitle>
              <CardDescription>সন্তান যেসব কারণে তারা দিতে পারবে সেগুলো ম্যানেজ করুন।</CardDescription>
            </div>
            <div className="flex gap-2">
              <ImportCausesDialog />
              <CreateCauseDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {causes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Heart className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">এখনো কোনো কারণ যোগ করা হয়নি।</p>
              <p className="text-xs text-muted-foreground">সাজেশন থেকে বাছাই করুন বা নিজে তৈরি করুন।</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {causes.map((c) => (
                <CauseRow key={c.id} cause={c} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CauseRow({ cause }: { cause: SadaqahCause }) {
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const handleDeactivate = async () => {
    setPending(true)
    try {
      const res = await deactivateSadaqahCause(cause.id)
      if (res.ok) {
        toast.success('কারণটি নিষ্ক্রিয় করা হয়েছে।')
        router.refresh()
      } else {
        toast.error(res.error ?? 'নিষ্ক্রিয় করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
        <DynamicIcon iconKey={cause.iconKey} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{cause.title}</p>
        {cause.description && <p className="truncate text-xs text-muted-foreground">{cause.description}</p>}
      </div>
      {cause._count.donations > 0 && (
        <Badge variant="secondary" className="text-[10px]">{cause._count.donations} দান</Badge>
      )}
      <Button size="sm" variant="ghost" onClick={handleDeactivate} disabled={pending}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </li>
  )
}

function ImportCausesDialog() {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [imported, setImported] = React.useState<Set<number>>(new Set())
  const router = useRouter()

  const handleImport = async (index: number) => {
    setPending(true)
    try {
      const res = await importSadaqahCause(index)
      if (res.ok) {
        setImported((prev) => new Set(prev).add(index))
        toast.success(`"${SADAQAH_CAUSES[index].title}" যোগ হয়েছে!`)
        router.refresh()
      } else {
        toast.error(res.error ?? 'যোগ করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> সাজেশন
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>সাদাকাহ কারণ সাজেশন</DialogTitle>
          <DialogDescription>এক ক্লিকে যোগ করুন।</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {SADAQAH_CAUSES.map((c, i) => {
            const isImported = imported.has(i)
            return (
              <button
                key={i}
                onClick={() => !isImported && handleImport(i)}
                disabled={isImported || pending}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-3 text-left transition-all',
                  isImported ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-border hover:border-primary/40',
                  !isImported && !pending && 'cursor-pointer',
                )}
              >
                <DynamicIcon iconKey={c.iconKey} className="h-4 w-4 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                </div>
                {isImported && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateCauseDialog() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [iconKey, setIconKey] = React.useState('heart')
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const availableIcons = Object.entries(ICON_KEY_TO_LUCIDE).slice(0, 12)

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('শিরোনাম লিখুন।')
      return
    }
    setPending(true)
    try {
      const res = await createSadaqahCause(title.trim(), description.trim() || undefined, iconKey)
      if (res.ok) {
        toast.success('কারণ যোগ হয়েছে!')
        setTitle('')
        setDescription('')
        setIconKey('heart')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'যোগ করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> নতুন কারণ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন সাদাকাহ কারণ</DialogTitle>
          <DialogDescription>আপনার পরিবারের জন্য একটি কারণ তৈরি করুন।</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cause-title">শিরোনাম</Label>
            <Input id="cause-title" placeholder="যেমন: এতিমখানা সাহায্য" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cause-desc">বিবরণ (ঐচ্ছিক)</Label>
            <Input id="cause-desc" placeholder="সংক্ষিপ্ত বিবরণ" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>আইকন</Label>
            <div className="flex flex-wrap gap-1.5">
              {availableIcons.map(([key]) => (
                <button
                  key={key}
                  onClick={() => setIconKey(key)}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                    iconKey === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent/40',
                  )}
                >
                  <DynamicIcon iconKey={key} className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
          <Button onClick={handleCreate} disabled={pending || !title.trim()}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
            যোগ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
