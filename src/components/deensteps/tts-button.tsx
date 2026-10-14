'use client'

import * as React from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// TTS (Text-to-Speech) button — reads text aloud in Bengali.
// Uses the browser's Web Speech API (speechSynthesis).
// Falls back gracefully if Bengali voice is not available.
// ────────────────────────────────────────────────────────────────────────────

export function TtsButton({
  text,
  label,
  className,
}: {
  text: string
  label?: string
  className?: string
}) {
  const [speaking, setSpeaking] = React.useState(false)
  const [supported, setSupported] = React.useState(true)

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false)
    }
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!supported || !text) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'bn-BD'
    utterance.rate = 0.9  // Slightly slower for kids
    utterance.pitch = 1.1 // Slightly higher pitch (friendlier)

    // Try to find a Bengali voice
    const voices = window.speechSynthesis.getVoices()
    const bnVoice = voices.find((v) => v.lang.startsWith('bn'))
    if (bnVoice) {
      utterance.voice = bnVoice
    } else {
      // If no Bengali voice, try any Indic voice
      const indicVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.startsWith('ur'))
      if (indicVoice) utterance.voice = indicVoice
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  if (!supported) return null

  return (
    <button
      onClick={handleSpeak}
      className={cn(
        'inline-flex items-center gap-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary',
        speaking && 'bg-primary/10 text-primary animate-pulse',
        className
      )}
      title="শুনুন"
      aria-label="শুনুন"
    >
      {speaking ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  )
}
