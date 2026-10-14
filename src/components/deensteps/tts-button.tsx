'use client'

import * as React from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────────────────────
// TTS (Text-to-Speech) button — uses server-side Google Translate TTS API
// for clean Bengali voice. Falls back to browser Web Speech API if the
// server API fails.
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
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!text) return

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Stop browser speech synthesis if running
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    setSpeaking(true)

    try {
      // Try server-side Google Translate TTS first (best Bengali quality)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onended = () => {
          setSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          setSpeaking(false)
          URL.revokeObjectURL(audioUrl)
          // Fallback to browser TTS
          browserTTSFallback(text)
        }

        await audio.play()
      } else {
        // Fallback to browser TTS
        browserTTSFallback(text)
      }
    } catch {
      setSpeaking(false)
      // Fallback to browser TTS
      browserTTSFallback(text)
    }
  }

  // Fallback: use browser's built-in Web Speech API
  const browserTTSFallback = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'bn-BD'
    utterance.rate = 0.85

    // Try to find a Bengali voice
    const voices = window.speechSynthesis.getVoices()
    const bnVoice = voices.find((v) => v.lang.toLowerCase().startsWith('bn'))
    if (bnVoice) {
      utterance.voice = bnVoice
    } else {
      const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'))
      if (hiVoice) utterance.voice = hiVoice
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
