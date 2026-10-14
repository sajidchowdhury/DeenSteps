'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Lock, ShieldCheck, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateFamilySettings } from '@/server/actions/settings-actions'

export function PinSettingsForm({ hasPin }: { hasPin: boolean }) {
  const router = useRouter()
  const [pin, setPin] = React.useState('')
  const [confirmPin, setConfirmPin] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [removePending, setRemovePending] = React.useState(false)

  const handleSave = async () => {
    if (pin.length !== 4) {
      toast.error('পিন অবশ্যই ৪ ডিজিট হতে হবে।')
      return
    }
    if (pin !== confirmPin) {
      toast.error('পিন দুটি মিলছে না।')
      return
    }

    setPending(true)
    try {
      const res = await updateFamilySettings({
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
        theme: 'light',
        sadaqahPledgeEnabled: false,
        sadaqahStarsPerUnit: 100,
        sadaqahCurrency: 'BDT',
        sadaqahAmountPerUnit: 100,
        parentPin: pin,
      })
      if (res.ok) {
        toast.success('পিন সেট করা হয়েছে!')
        setPin('')
        setConfirmPin('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'সংরক্ষণ করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  const handleRemove = async () => {
    setRemovePending(true)
    try {
      const res = await updateFamilySettings({
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
        theme: 'light',
        sadaqahPledgeEnabled: false,
        sadaqahStarsPerUnit: 100,
        sadaqahCurrency: 'BDT',
        sadaqahAmountPerUnit: 100,
        parentPin: '',
      })
      if (res.ok) {
        toast.success('পিন মুছে ফেলা হয়েছে।')
        // Also clear the lock state
        try {
          localStorage.setItem('deensteps_parent_locked', 'false')
        } catch {}
        router.refresh()
      } else {
        toast.error(res.error ?? 'মুছতে সমস্যা হয়েছে।')
      }
    } finally {
      setRemovePending(false)
    }
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900/40">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Lock className="h-5 w-5 text-amber-500" />
          প্যারেন্ট লক পিন
        </CardTitle>
        <CardDescription>
          ৪ ডিজিট পিন সেট করুন। লক করলে সন্তানরা প্যারেন্ট এরিয়া অ্যাক্সেস করতে পারবে না।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3">
        {hasPin && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200">
            <ShieldCheck className="mr-1.5 inline h-4 w-4" />
            পিন সেট আছে। হেডারে লক আইকন থেকে লক/আনলক করুন।
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="pin-set">নতুন পিন (৪ ডিজিট)</Label>
          <Input
            id="pin-set"
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="text-center text-xl tracking-widest"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pin-confirm">পিন নিশ্চিত করুন</Label>
          <Input
            id="pin-confirm"
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            className="text-center text-xl tracking-widest"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={pending || pin.length !== 4 || pin !== confirmPin}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Lock className="mr-1.5 h-3.5 w-3.5" />}
            {hasPin ? 'পিন পরিবর্তন করুন' : 'পিন সেট করুন'}
          </Button>
          {hasPin && (
            <Button variant="outline" onClick={handleRemove} disabled={removePending}>
              {removePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
              পিন মুছুন
            </Button>
          )}
        </div>
        </form>
      </CardContent>
    </Card>
  )
}
