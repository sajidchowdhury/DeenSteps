'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Check, ArrowRight, ArrowLeft, Users, BookOpen, Star, Sparkles, Rocket } from 'lucide-react'
import { Logo } from '@/components/deensteps/brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TASK_CATEGORIES, AGE_RANGES, AVATAR_COLORS } from '@/lib/constants'
import { createChildProfile, importLibraryTasksForChild } from '@/server/actions/child-actions'

const TOTAL_STEPS = 7

const ChildSchema = z.object({
  displayName: z.string().min(1, 'Please enter a name.'),
  ageRange: z.enum(['3-5', '6-8', '9-12', '13+']),
  avatarColor: z.enum(['emerald', 'amber', 'sage', 'rose', 'violet', 'sky']),
})

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [familyName, setFamilyName] = React.useState('')
  const [language, setLanguage] = React.useState('en')
  const [timezone, setTimezone] = React.useState('Asia/Dhaka')
  const [child, setChild] = React.useState<{ id?: string; displayName: string; ageRange: string; avatarColor: string }>({
    displayName: '',
    ageRange: '6-8',
    avatarColor: 'emerald',
  })
  const [chosenCategories, setChosenCategories] = React.useState<string[]>(['Islamic Practices', 'Personal Responsibility'])
  const [pointsName, setPointsName] = React.useState('Stars')

  const progress = (step / TOTAL_STEPS) * 100

  const goTo = (n: number) => setStep(Math.max(1, Math.min(TOTAL_STEPS, n)))

  const handleCreateChild = async () => {
    setLoading(true)
    const res = await createChildProfile({
      displayName: child.displayName,
      ageRange: child.ageRange as '3-5' | '6-8' | '9-12' | '13+',
      avatarColor: child.avatarColor as 'emerald' | 'amber' | 'sage' | 'rose' | 'violet' | 'sky',
      preferredLanguage: language,
    })
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return false
    }
    setChild((c) => ({ ...c, id: res.childId }))
    return true
  }

  const handleFinish = async () => {
    setLoading(true)
    if (child.id) {
      await importLibraryTasksForChild(child.id, chosenCategories)
    }
    setLoading(false)
    toast.success('আপনার পারিবারিক ওয়ার্কস্পেস প্রস্তুত!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen bg-secondary/30">
      <div className="pattern-geometric absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> ধাপ {step} / {TOTAL_STEPS}
          </Badge>
        </div>
        <Progress value={progress} className="mb-8 h-2" />

        {/* Steps */}
        {step === 1 && (
          <StepCard
            icon={Users}
            title="দীনস্টেপসে স্বাগতম"
            description="চলুন আপনার পারিবারিক ওয়ার্কস্পেস সেট আপ করি। মাত্র দুই মিনিট লাগে — অপশনাল ধাপগুলো স্কিপ করে পরে শেষ করতে পারেন।"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">পরিবারের নাম</Label>
                <Input
                  id="familyName"
                  placeholder="রহমান পরিবার"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">পরে সেটিংস থেকে পরিবর্তন করতে পারবেন।</p>
              </div>
              <Button className="w-full" onClick={() => goTo(2)} disabled={!familyName.trim()}>
                এগিয়ে যান <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
                এখনই স্কিপ করুন
              </Button>
            </div>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard
            icon={BookOpen}
            title="ভাষা ও টাইমজোন"
            description="আপনার পরিবারের জন্য কাজ সিডিউল আর তারিখ ফরম্যাট করতে এগুলো ব্যবহার করব।"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">পছন্দের ভাষা</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="bn">বাংলা</option>
                  <option value="en">English</option>
                  <option value="ar">العربية (আরবি) — শীঘ্রই</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">টাইমজোন</Label>
                <select
                  id="timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {['Asia/Dhaka', 'Asia/Karachi', 'Asia/Dubai', 'America/New_York', 'Europe/London', 'UTC'].map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goTo(1)}><ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান</Button>
                <Button className="flex-1" onClick={() => goTo(3)}>এগিয়ে যান <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard
            icon={Users}
            title="প্রথম সন্তান যোগ করুন"
            description="আপনার সন্তানের জন্য একটি প্রোফাইল তৈরি করুন। ইমেইল লাগে না — তারা আপনার পারিবারিক ওয়ার্কস্পেস থেকেই ড্যাশবোর্ড দেখবে।"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">সন্তানের নাম বা ডাকনাম</Label>
                <Input
                  id="childName"
                  placeholder="জাইদ"
                  value={child.displayName}
                  onChange={(e) => setChild((c) => ({ ...c, displayName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>বয়স</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {AGE_RANGES.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setChild((c) => ({ ...c, ageRange: a.value }))}
                      className={cn(
                        'rounded-lg border p-3 text-sm transition-colors',
                        child.ageRange === a.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent/40'
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>অ্যাভাটার রঙ</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setChild((ch) => ({ ...ch, avatarColor: c.value }))}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-transform',
                        c.class,
                        child.avatarColor === c.value && 'ring-2 ring-offset-2 ring-ring scale-110'
                      )}
                      aria-label={c.label}
                    >
                      <Check className={cn('h-4 w-4', child.avatarColor !== c.value && 'opacity-0')} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goTo(2)}><ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান</Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    const ok = await handleCreateChild()
                    if (ok) goTo(4)
                  }}
                  disabled={!child.displayName.trim() || loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  প্রোফাইল তৈরি করুন <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </StepCard>
        )}

        {step === 4 && (
          <StepCard
            icon={BookOpen}
            title="অভ্যাসের ক্যাটাগরি বেছে নিন"
            description="যে ক্যাটাগরিগুলো দিয়ে শুরু করতে চান বেছে নিন। আপনার সন্তানের জন্য ছোট একটি অপশনাল, কনফিগারযোগ্য টেমপ্লেট সেট ইমপোর্ট করব।"
          >
            <div className="space-y-3">
              {TASK_CATEGORIES.map((cat) => {
                const selected = chosenCategories.includes(cat.key)
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      setChosenCategories((arr) =>
                        selected ? arr.filter((c) => c !== cat.key) : [...arr, cat.key]
                      )
                    }
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                      selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/40'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border',
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                    )}>
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cat.label}</p>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => goTo(3)}><ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান</Button>
              <Button className="flex-1" onClick={() => goTo(5)} disabled={chosenCategories.length === 0}>
                এগিয়ে যান <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </StepCard>
        )}

        {step === 5 && (
          <StepCard
            icon={Star}
            title="পয়েন্ট ও পুরস্কার কনফিগার করুন"
            description="আপনার পয়েন্টকে কী বলতে চান? পুরস্কার ক্যাটালগ পরে পরিবর্তন করতে পা�রবেন।"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pointsName">পয়েন্টের নাম</Label>
                <Input
                  id="pointsName"
                  placeholder="তারা"
                  value={pointsName}
                  onChange={(e) => setPointsName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">সন্তান তাদের ড্যাশবোর্ডে এই নাম দেখবে।</p>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-card/50 p-4">
                <p className="text-sm font-medium text-foreground">শুরুর স্যাম্পল পুরস্কার</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>· ফ্যামিলি গেম নাইট — ৫০ {pointsName || 'পয়েন্ট'}</li>
                  <li>· নতুন একটি বই — ৮০ {pointsName || 'পয়েন্ট'}</li>
                  <li>· পরিবারের সাথে বেড়াতে যাওয়া — ১০০ {pointsName || 'পয়েন্ট'}</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">পুরস্কার পেইজ থেকে কাস্টমাইজ, যোগ বা মুছতে পারবেন।</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goTo(4)}><ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান</Button>
                <Button className="flex-1" onClick={() => goTo(6)}>এগিয়ে যান <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          </StepCard>
        )}

        {step === 6 && (
          <StepCard
            icon={BookOpen}
            title="স্যাম্পল সাপ্তাহিক প্ল্যান"
            description="আপনার সিলেকশন অনুযায়ী আপনার সন্তানের প্রথম সপ্তাহ কেমন হতে পারে তার একটি প্রিভিউ।"
          >
            <div className="space-y-3">
              {chosenCategories.flatMap((cat) =>
                TASK_CATEGORIES.filter((c) => c.key === cat).map((c) => (
                  <div key={c.key} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                ))
              )}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">সাপ্তাহিক চ্যালেঞ্জ সাজেশন</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  &ldquo;ধারাবাহিক সকালের রুটিন গড়ুন&rdquo; — এই সপ্তাহে সকালের কাজের ৮০% সম্পন্ন করলে একটি পারিবারিক পুরস্কার আনলক হবে।
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => goTo(5)}><ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান</Button>
              <Button className="flex-1" onClick={() => goTo(7)}>এগিয়ে যান <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </StepCard>
        )}

        {step === 7 && (
          <StepCard
            icon={Rocket}
            title="আপনি প্রস্তুত!"
            description="আপনার পারিবারিক ওয়ার্কস্পেস সেট আপ হয়ে গেছে। ড্যাশবোর্ড থেকে সব সমন্বয় করতে পারবেন — আরও সন্তান যোগ করুন, কাজ কাস্টমাইজ করুন, পুরস্কার ক্যাটালগ তৈরি করুন।"
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                <p className="font-medium text-emerald-900 dark:text-emerald-100">সেটআপ সারসংক্ষেপ</p>
                <ul className="mt-2 space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                  <li>· পরিবার: <strong>{familyName || 'আপনার পরিবার'}</strong></li>
                  <li>· প্রথম সন্তান: <strong>{child.displayName || '—'}</strong></li>
                  <li>· ক্যাটাগরি: <strong>{chosenCategories.join(', ')}</strong></li>
                  <li>· পয়েন্ট: <strong>{pointsName || 'পয়েন্ট'}</strong></li>
                </ul>
              </div>
              <Button className="w-full" size="lg" onClick={handleFinish} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                পারিবারিক ড্যাশবোর্ড খুলুন <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </StepCard>
        )}
      </div>
    </div>
  )
}

function StepCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="shadow-premium">
      <CardHeader>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="mt-3 font-display text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
