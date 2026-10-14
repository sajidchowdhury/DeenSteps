'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Lock, Unlock, Loader2, ShieldCheck, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// Parent Lock — 4-digit PIN system.
//
// When locked:
//   - Parent sidebar links redirect to the first child page
//   - Only /dashboard, /child/*, /login, /register are accessible
//   - The lock icon shows "locked" state
//
// When unlocked:
//   - Full access to all parent pages
//   - The lock icon shows "unlocked" state
//
// The PIN is stored in FamilySettings.parentPin (server-side).
// The lock state is stored in localStorage (client-side only).
// ────────────────────────────────────────────────────────────────────────────

const LOCK_STORAGE_KEY = 'deensteps_parent_locked'
const PIN_VERIFIED_KEY = 'deensteps_pin_verified'

// Parent-only routes (child routes are always accessible)
const PARENT_ROUTES = ['/dashboard', '/review', '/planner', '/tasks', '/rewards', '/reports', '/settings', '/children', '/challenges']

export function ParentLockButton({
  hasPin,
  firstChildId,
}: {
  hasPin: boolean
  firstChildId: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [locked, setLocked] = React.useState(false)
  const [unlockOpen, setUnlockOpen] = React.useState(false)
  const [pinInput, setPinInput] = React.useState('')
  const [error, setError] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  // Forgot PIN state
  const [forgotOpen, setForgotOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [newPin, setNewPin] = React.useState('')
  const [confirmNewPin, setConfirmNewPin] = React.useState('')
  const [resetting, setResetting] = React.useState(false)

  // Read lock state from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCK_STORAGE_KEY)
      if (stored === 'true') {
        setLocked(true)
      }
    } catch {}
  }, [])

  // If locked and on a parent route, redirect to first child
  React.useEffect(() => {
    if (locked && firstChildId) {
      const isParentRoute = PARENT_ROUTES.some((route) => pathname.startsWith(route))
      if (isParentRoute) {
        router.push(`/child/${firstChildId}`)
      }
    }
  }, [locked, pathname, firstChildId, router])

  const handleLock = () => {
    if (!hasPin) {
      // No PIN set — redirect to settings to set one
      router.push('/settings')
      return
    }
    try {
      localStorage.setItem(LOCK_STORAGE_KEY, 'true')
    } catch {}
    setLocked(true)
    if (firstChildId) {
      router.push(`/child/${firstChildId}`)
    }
  }

  const handleUnlock = () => {
    setUnlockOpen(true)
    setError('')
    setPinInput('')
  }

  const verifyPin = async () => {
    if (pinInput.length !== 4) {
      setError('৪ ডিজিট লিখুন।')
      return
    }

    setVerifying(true)
    try {
      // Verify PIN against server
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      })
      const data = await res.json()

      if (data.ok) {
        try {
          localStorage.setItem(LOCK_STORAGE_KEY, 'false')
        } catch {}
        setLocked(false)
        setUnlockOpen(false)
        router.push('/dashboard')
      } else {
        setError('ভুল পিন। আবার চেষ্টা করুন।')
      }
    } catch {
      setError('যাচাই করা যায়নি।')
    } finally {
      setVerifying(false)
    }
  }

  const handleResetPin = async () => {
    if (newPin.length !== 4) {
      setError('পিন অবশ্যই ৪ ডিজিট হতে হবে।')
      return
    }
    if (newPin !== confirmNewPin) {
      setError('নতুন পিন দুটি মিলছে না।')
      return
    }

    setResetting(true)
    try {
      const res = await fetch('/api/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, newPin }),
      })
      const data = await res.json()

      if (data.ok) {
        // Unlock + close modals
        try {
          localStorage.setItem(LOCK_STORAGE_KEY, 'false')
        } catch {}
        setLocked(false)
        setForgotOpen(false)
        setUnlockOpen(false)
        setEmail('')
        setPassword('')
        setNewPin('')
        setConfirmNewPin('')
        router.push('/dashboard')
      } else {
        setError(data.error ?? 'রিসেট করা যায়নি।')
      }
    } catch {
      setError('একটি সমস্যা হয়েছে।')
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={locked ? 'আনলক করুন' : 'লক করুন'}
        onClick={locked ? handleUnlock : handleLock}
        className={cn(locked && 'text-amber-500')}
      >
        {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </Button>

      {/* Unlock modal */}
      <Dialog open={unlockOpen} onOpenChange={setUnlockOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              প্যারেন্ট আনলক
            </DialogTitle>
            <DialogDescription>
              প্যারেন্ট এরিয়া আনলক করতে ৪ ডিজিট পিন লিখুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pin-input">পিন কোড</Label>
            <Input
              id="pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, ''))
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && verifyPin()}
              className="text-center text-2xl tracking-widest"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Forgot PIN link */}
          <button
            onClick={() => { setUnlockOpen(false); setForgotOpen(true); setError(''); setEmail(''); setPassword(''); setNewPin(''); setConfirmNewPin(''); }}
            className="text-xs text-primary hover:underline"
          >
            পিন ভুলে গেছেন?
          </button>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockOpen(false)}>বাতিল</Button>
            <Button onClick={verifyPin} disabled={verifying || pinInput.length !== 4}>
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="mr-1.5 h-4 w-4" />}
              আনলক
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forgot PIN modal — reset via email + password */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              পিন রিসেট করুন
            </DialogTitle>
            <DialogDescription>
              পিন ভুলে গেছেন? আপনার ইমেইল ও পাসওয়ার্ড দিয়ে নতুন পিন সেট করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">ইমেইল</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reset-password">পাসওয়ার্ড</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pin">নতুন পিন (৪ ডিজিট)</Label>
              <Input
                id="new-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={newPin}
                onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="text-center text-xl tracking-widest"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-pin">নতুন পিন নিশ্চিত করুন</Label>
              <Input
                id="confirm-new-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={confirmNewPin}
                onChange={(e) => { setConfirmNewPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="text-center text-xl tracking-widest"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>বাতিল</Button>
            <Button
              onClick={handleResetPin}
              disabled={resetting || !email || !password || newPin.length !== 4 || newPin !== confirmNewPin}
            >
              {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="mr-1.5 h-4 w-4" />}
              পিন রিসেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
