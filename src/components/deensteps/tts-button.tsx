'use client'

import * as React from 'react'
import { Volume2, Loader2, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

// Helper: construct API URL with correct basePath.
function apiUrl(path: string): string {
  if (typeof window === 'undefined') return path
  const segments = window.location.pathname.split('/')
  const basePath = segments[1] === 'deensteps' ? '/deensteps' : ''
  return `${basePath}${path}`
}

// ────────────────────────────────────────────────────────────────────────────
// Shared audio manager — ensures only ONE TTS plays at a time.
// When a new TtsButton is clicked, any currently playing audio (both
// HTML5 Audio and Web Speech API) is stopped before starting the new one.
// ────────────────────────────────────────────────────────────────────────────

let currentAudio: HTMLAudioElement | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null
let currentButtonId: string | null = null

function stopAllAudio() {
  // Stop HTML5 Audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  // Stop Web Speech API
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
  currentButtonId = null
}

// ────────────────────────────────────────────────────────────────────────────

let buttonIdCounter = 0

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
  const [loading, setLoading] = React.useState(false)
  const buttonId = React.useRef(`tts-${++buttonIdCounter}`).current

  // Listen for when this button's audio stops (from external stop)
  React.useEffect(() => {
    const checkInterval = setInterval(() => {
      if (currentButtonId !== buttonId && speaking) {
        setSpeaking(false)
      }
    }, 200)
    return () => clearInterval(checkInterval)
  }, [buttonId, speaking])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (currentButtonId === buttonId) {
        stopAllAudio()
      }
    }
  }, [buttonId])

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!text) return

    // If THIS button is currently playing, stop it (toggle behavior)
    if (currentButtonId === buttonId && speaking) {
      stopAllAudio()
      setSpeaking(false)
      return
    }

    // Stop any other audio that's playing
    stopAllAudio()
    setSpeaking(false)

    // Claim this button as the active one
    currentButtonId = buttonId
    setLoading(true)

    try {
      // Try server-side Google Translate TTS first (best Bengali quality)
      const res = await fetch(apiUrl('/api/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500) }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        currentAudio = audio

        audio.onended = () => {
          setSpeaking(false)
          stopAllAudio()
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          setSpeaking(false)
          stopAllAudio()
          URL.revokeObjectURL(audioUrl)
          // Fallback to browser TTS
          browserTTSFallback(text, buttonId)
        }

        setLoading(false)
        setSpeaking(true)
        await audio.play()
      } else {
        setLoading(false)
        browserTTSFallback(text, buttonId)
      }
    } catch {
      setLoading(false)
      browserTTSFallback(text, buttonId)
    }
  }

  // Fallback: use browser's built-in Web Speech API
  const browserTTSFallback = (text: string, btnId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setLoading(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'bn-BD'
    utterance.rate = 0.85

    const voices = window.speechSynthesis.getVoices()
    const bnVoice = voices.find((v) => v.lang.toLowerCase().startsWith('bn'))
    if (bnVoice) {
      utterance.voice = bnVoice
    } else {
      const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'))
      if (hiVoice) utterance.voice = hiVoice
    }

    utterance.onstart = () => {
      setSpeaking(true)
      currentButtonId = btnId
    }
    utterance.onend = () => {
      setSpeaking(false)
      if (currentButtonId === btnId) {
        stopAllAudio()
      }
    }
    utterance.onerror = () => {
      setSpeaking(false)
      if (currentButtonId === btnId) {
        stopAllAudio()
      }
    }

    currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      onClick={handleSpeak}
      className={cn(
        'inline-flex items-center gap-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary',
        speaking && 'bg-primary/10 text-primary',
        className
      )}
      title={speaking ? 'থামান' : 'শুনুন'}
      aria-label={speaking ? 'থামান' : 'শুনুন'}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : speaking ? (
        <Square className="h-3 w-3 fill-current" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  )
}
