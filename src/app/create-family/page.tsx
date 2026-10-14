'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/deensteps/brand'

const Schema = z.object({
  familyName: z.string().min(1, 'পরিবারের নাম লিখুন।').max(80),
})

export default function CreateFamilyPage() {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { familyName: '' },
  })

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    setPending(true)
    try {
      const res = await fetch('/api/create-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('পরিবার তৈরি হয়েছে!')
        router.push('/dashboard')
      } else {
        toast.error(data.error ?? 'পরিবার তৈরি করা যায়নি।')
      }
    } catch {
      toast.error('একটি সমস্যা হয়েছে।')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/20 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">নতুন পরিবার তৈরি করুন</CardTitle>
            <CardDescription>
              আপনার অ্যাকাউন্ট আছে কিন্তু পরিবার নেই। নতুন পরিবার তৈরি করতে নাম লিখুন।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="familyName">পরিবারের নাম</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="familyName"
                    className="pl-9"
                    placeholder="যেমন: চৌধুরী পরিবার"
                    {...form.register('familyName')}
                  />
                </div>
                {form.formState.errors.familyName && (
                  <p className="text-xs text-destructive">{form.formState.errors.familyName.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="mr-1.5 h-4 w-4" />}
                পরিবার তৈরি করুন
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-3 w-3" /> লগআউট করে আবার লগইন করুন
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
