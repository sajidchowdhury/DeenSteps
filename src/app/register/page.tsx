'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowRight, CheckCheck } from 'lucide-react'
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
import { registerFamily } from '@/server/actions/auth-actions'

const Schema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(80),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  familyName: z.string().min(1, 'Please enter a family name.').max(80),
})
type FormValues = z.infer<typeof Schema>

const TIMEZONES = ['Asia/Dhaka', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'Asia/Karachi', 'UTC']

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: '', email: '', password: '', familyName: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
      const result = await registerFamily({
        ...values,
        timezone: TIMEZONES.includes(tz) ? tz : 'UTC',
        locale: 'en',
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      // Auto sign-in
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })
      if (res?.error) {
        toast.error('Account created. Please sign in.')
        router.push('/login')
        return
      }
      toast.success('Welcome to DeenSteps! Let\u2019s set up your family.')
      router.push('/onboarding')
      router.refresh()
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="pattern-geometric absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" aria-label="DeenSteps home">
            <Logo className="text-2xl" />
          </Link>
        </div>
        <Card className="shadow-premium">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Create your family</CardTitle>
            <CardDescription>
              Start your journey in under a minute. No credit card required.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" autoComplete="name" placeholder="Aisha Rahman" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyName">Family name</Label>
                <Input id="familyName" placeholder="The Rahman Family" {...register('familyName')} />
                {errors.familyName && <p className="text-xs text-destructive">{errors.familyName.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create family account
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                No credit card required · Free forever plan
              </p>
            </CardFooter>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
