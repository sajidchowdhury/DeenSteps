'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { resolveIncident, type IncidentOutcomeType } from '@/server/actions/incident-actions'

const OUTCOMES: { value: IncidentOutcomeType; label: string }[] = [
  { value: 'NO_ACTION', label: 'আর কিছু করা লাগবে না' },
  { value: 'APOLOGY', label: 'ক্ষমা চাওয়া ও মীমাংসা' },
  { value: 'RETURN_ITEM', label: 'জিনিস ফেরত দেওয়া' },
  { value: 'REPAIR', label: 'ক্ষতি মেরামত করা' },
  { value: 'HELPFUL_ACTION', label: 'উপকারী কাজ করা' },
  { value: 'CONSEQUENCE', label: 'পরিণতি (শাস্তি নয়)' },
]

export function IncidentResolutionDialog({
  incidentId,
  open,
  onOpenChange,
  childrenList,
}: {
  incidentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  childrenList: { id: string; displayName: string }[]
}) {
  const [outcomeType, setOutcomeType] = React.useState<string>('')
  const [description, setDescription] = React.useState('')
  const [pointsAdjusted, setPointsAdjusted] = React.useState<string>('')
  const [reason, setReason] = React.useState('')
  const [affectedChildId, setAffectedChildId] = React.useState<string>('')
  const [pending, setPending] = React.useState(false)
  const router = useRouter()

  const handleResolve = async () => {
    if (!outcomeType) {
      toast.error('ফলাফল নির্বাচন করুন।')
      return
    }
    if (!description.trim()) {
      toast.error('বিবরণ লিখুন।')
      return
    }
    const pts = pointsAdjusted ? parseInt(pointsAdjusted, 10) : 0
    if (pts !== 0 && !reason.trim()) {
      toast.error('পয়েন্ট সমন্বয়ের জন্য কারণ লিখুন।')
      return
    }
    if (pts !== 0 && !affectedChildId) {
      toast.error('কার তারা সমন্বয় হবে তা নির্বাচন করুন।')
      return
    }

    setPending(true)
    try {
      const res = await resolveIncident(
        incidentId,
        outcomeType as IncidentOutcomeType,
        description.trim(),
        pts || undefined,
        reason.trim() || undefined,
        affectedChildId || undefined,
      )
      if (res.ok) {
        toast.success('ইনসিডেন্ট সমাধান হয়েছে।')
        setOutcomeType('')
        setDescription('')
        setPointsAdjusted('')
        setReason('')
        setAffectedChildId('')
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'সমাধান করা যায়নি।')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>সমস্যার সমাধান রেকর্ড করুন</DialogTitle>
          <DialogDescription>
            সন্তানের সাথে কথা বলুন। রেস্টোরেটিভ সমাধান বেছে নিন। পয়েন্ট সমন্বয় ঐচ্ছিক — শাস্তি নয়।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>ফলাফল</Label>
            <Select value={outcomeType} onValueChange={setOutcomeType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ফলাফল নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolution-desc">কী সমাধান হলো?</Label>
            <Textarea
              id="resolution-desc"
              placeholder="সন্তানের সাথে কথা হয়েছে। সে ক্ষমা চেয়েছে..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Optional point adjustment */}
          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              তারা সমন্বয় (ঐচ্ছিক — সাবধানতার সাথে ব্যবহার করুন)
            </p>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="points-adjust">তারা পরিবর্তন</Label>
                <Input
                  id="points-adjust"
                  type="number"
                  placeholder="0 (খালি রাখলে কোনো পরিবর্তন হবে না)"
                  value={pointsAdjusted}
                  onChange={(e) => setPointsAdjusted(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">ঋণাত্মক = কর্তন, ধনাত্মক = যোগ</p>
              </div>
              {pointsAdjusted && parseInt(pointsAdjusted, 10) !== 0 && (
                <>
                  <div className="space-y-1.5">
                    <Label>কার তারা সমন্বয় হবে?</Label>
                    <Select value={affectedChildId} onValueChange={setAffectedChildId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="সন্তান নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {childrenList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="adjust-reason">কারণ (আবশ্যক)</Label>
                    <Textarea
                      id="adjust-reason"
                      placeholder="কেন তারা সমন্বয় করা হচ্ছে..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            বাতিল
          </Button>
          <Button onClick={handleResolve} disabled={pending || !outcomeType || !description.trim()}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
            সমাধান করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
