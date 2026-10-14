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
    utterance.rate = 0.85  // Slower for kids
    utterance.pitch = 1.0

    // Try to find a Bengali voice — load voices if not yet loaded
    const voices = window.speechSynthesis.getVoices()

    // Priority 1: Bengali (bn-BD or bn-IN)
    const bnVoice = voices.find((v) => v.lang.toLowerCase().startsWith('bn'))
    if (bnVoice) {
      utterance.voice = bnVoice
      utterance.lang = bnVoice.lang
    } else {
      // Priority 2: Hindi (hi-IN) — many Hindi TTS engines can read Bengali script
      // because they share the Devanagari/Bengali script family
      const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'))
      if (hiVoice) {
        utterance.voice = hiVoice
        utterance.lang = 'hi-IN'
      } else {
        // Priority 3: Any voice with 'bn' or 'hi' or 'ur' in the name
        const indicVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith('ur') ||
          v.name.toLowerCase().includes('bengali') ||
          v.name.toLowerCase().includes('hindi')
        )
        if (indicVoice) {
          utterance.voice = indicVoice
        }
      }
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
