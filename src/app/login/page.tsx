'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/deensteps/brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const Schema = z.object({
  email: z.string().email('একটি সঠিক ইমেইল লিখুন।'),
  password: z.string().min(1, 'আপনার পাসওয়ার্ড লিখুন।'),
})
type FormValues = z.infer<typeof Schema>

export default function LoginPage() {
  return (
    <React.Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </React.Suspense>
  )
}

function LoginFallback() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="pattern-geometric absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo className="text-2xl" />
        </div>
        <Card className="shadow-premium">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">স্বাগতম</CardTitle>
            <CardDescription>লোড হচ্ছে…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/dashboard'
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })
      if (res?.error) {
        toast.error('ভুল ইমেইল বা পাসওয়ার্ড। আবার চেষ্টা করুন।')
        return
      }
      toast.success('স্বাগতম!')
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      toast.error('কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="pattern-geometric absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" aria-label="দীনস্টেপস হোম">
            <Logo className="text-2xl" />
          </Link>
        </div>
        <Card className="shadow-premium">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">স্বাগতম</CardTitle>
            <CardDescription>আপনার পারিবারিক ওয়ার্কস্পেসে সাইন ইন করুন।</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  <Link href="/login?reset=1" className="text-xs text-muted-foreground hover:text-primary">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                সাইন ইন
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-card/50 p-3 text-center text-xs text-muted-foreground">
          <span className="font-medium text-foreground">ডেমো অ্যাকাউন্ট:</span>{' '}
          parent@deensteps.demo / Password123!
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          নতুন দীনস্টেপসে?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            আপনার পরিবার তৈরি করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
