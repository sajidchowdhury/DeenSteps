'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, BookOpen, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/deensteps/app-shell'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { saveWeeklyReflection } from '@/server/actions/reflection-actions'
import { format } from 'date-fns'

type Reflection = {
  id: string
  weekStart: Date
  whatWentWell: string | null
  whatWasHard: string | null
  whatEasier: string | null
  nextWeekPlan: string | null
  child: { id: string; displayName: string; avatarColor: string } | null
}

type ChildOption = { id: string; displayName: string }

export function WeeklyReflectionSection({
  childrenList,
  recentReflections,
}: {
  childrenList: ChildOption[]
  recentReflections: Reflection[]
}) {
  const [selectedChild, setSelectedChild] = React.useState<string>('__family__')
  const [whatWentWell, setWhatWentWell] = React.useState('')
  const [whatWasHard, setWhatWasHard] = React.useState('')
  const [whatEasier, setWhatEasier] = React.useState('')
  const [nextWeekPlan, setNextWeekPlan] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [showHistory, setShowHistory] = React.useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    try {
      const childId = selectedChild === '__family__' ? null : selectedChild
      const res = await saveWeeklyReflection(
        childId,
        whatWentWell || undefined,
        whatWasHard || undefined,
        whatEasier || undefined,
        nextWeekPlan || undefined,
      )
      if (res.ok) {
        toast.success('সাপ্তাহিক প্রতিফলন সংরক্ষণ হয়েছে।')
        setWhatWentWell('')
        setWhatWasHard('')
        setWhatEasier('')
        setNextWeekPlan('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'সংরক্ষণ করা যায়নি।')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          সাপ্তাহিক প্রতিফলন
        </CardTitle>
        <CardDescription>
          সপ্তাহের শেষে একসাথে ভাবুন — কী ভালো হলো, কী কঠিন ছিল, পরের সপ্তাহে কী চেষ্টা করবেন।
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Child selector */}
        <div className="space-y-1.5">
          <Label>কার জন্য প্রতিফলন?</Label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__family__">পরিবার (সবার জন্য)</SelectItem>
              {childrenList.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reflection fields */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="went-well">কী ভালো হলো?</Label>
            <Textarea
              id="went-well"
              placeholder="এই সপ্তাহে যা ভালো হয়েছে..."
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="was-hard">কী কঠিন ছিল?</Label>
            <Textarea
              id="was-hard"
              placeholder="যা কঠিন মনে হয়েছে..."
              value={whatWasHard}
              onChange={(e) => setWhatWasHard(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="easier">কোন অভ্যাস সহজ হচ্ছে?</Label>
            <Textarea
              id="easier"
              placeholder="যে অভ্যাসটা আগের চেয়ে সহজ মনে হচ্ছে..."
              value={whatEasier}
              onChange={(e) => setWhatEasier(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next-week">পরের সপ্তাহে কী চেষ্টা করবেন?</Label>
            <Textarea
              id="next-week"
              placeholder="পরের সপ্তাহের লক্ষ্য..."
              value={nextWeekPlan}
              onChange={(e) => setNextWeekPlan(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
          সংরক্ষণ করুন
        </Button>

        {/* History */}
        {recentReflections.length > 0 && (
          <div className="border-t border-border pt-3">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              পূর্বের প্রতিফলন ({recentReflections.length})
            </button>
            {showHistory && (
              <ul className="mt-3 space-y-2">
                {recentReflections.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      {r.child ? (
                        <>
                          <Avatar color={r.child.avatarColor} name={r.child.displayName} size="sm" />
                          <span className="text-xs font-medium text-foreground">{r.child.displayName}</span>
                        </>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">পরিবার</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(r.weekStart), 'd MMM')}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-1.5 text-xs">
                      {r.whatWentWell && (
                        <p><span className="font-medium text-emerald-700 dark:text-emerald-300">ভালো: </span><span className="text-muted-foreground">{r.whatWentWell}</span></p>
                      )}
                      {r.whatWasHard && (
                        <p><span className="font-medium text-amber-700 dark:text-amber-300">কঠিন: </span><span className="text-muted-foreground">{r.whatWasHard}</span></p>
                      )}
                      {r.whatEasier && (
                        <p><span className="font-medium text-sky-700 dark:text-sky-300">সহজ হচ্ছে: </span><span className="text-muted-foreground">{r.whatEasier}</span></p>
                      )}
                      {r.nextWeekPlan && (
                        <p><span className="font-medium text-violet-700 dark:text-violet-300">পরের সপ্তাহ: </span><span className="text-muted-foreground">{r.nextWeekPlan}</span></p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          💡 অগ্রগতির উপর ফোকাস করুন, দোষের উপর নয়। সন্তানের চেষ্টা উদযাপন করুন।
        </p>
      </CardContent>
    </Card>
  )
}
