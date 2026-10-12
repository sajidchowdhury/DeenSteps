// ────────────────────────────────────────────────────────────────────────────
// Phase E (E2): Sound system
//
// Generates sounds programmatically using the Web Audio API — no audio
// files needed. Each sound is a short sequence of oscillator tones with
// gain envelopes for a pleasant, non-robotic feel.
//
// Sounds are ON by default (per Sajid's answer #2). A parent can toggle
// them off via localStorage: `deensteps_sounds_enabled = 'false'`.
//
// All sounds respect the browser's audio context suspension policy
// (browsers block audio until the user interacts with the page).
// ────────────────────────────────────────────────────────────────────────────

type SoundType =
  | 'task-approved'
  | 'task-submitted'
  | 'achievement-unlocked'
  | 'sadaqah-confirmed'
  | 'reward-unlocked'
  | 'error'

let audioContext: AudioContext | null = null

/**
 * Get or create the shared AudioContext.
 * Browsers suspend audio until the user interacts — we resume on first use.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      if (!AC) return null
      audioContext = new AC()
    } catch {
      return null
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }
  return audioContext
}

/**
 * Check if sounds are enabled. Default: true.
 * Toggled via localStorage 'deensteps_sounds_enabled'.
 */
export function soundsEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const stored = localStorage.getItem('deensteps_sounds_enabled')
    return stored === null ? true : stored !== 'false'
  } catch {
    return true
  }
}

/**
 * Toggle sounds on/off. Returns the new state.
 */
export function toggleSounds(): boolean {
  const newState = !soundsEnabled()
  try {
    localStorage.setItem('deensteps_sounds_enabled', String(newState))
  } catch {}
  return newState
}

/**
 * Play a single tone with a gain envelope.
 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain: number = 0.15
) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = type
  osc.frequency.value = frequency

  // Envelope: quick attack, gentle decay
  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01) // 10ms attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration) // decay

  osc.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.05) // small buffer after decay
}

/**
 * Play a sound by type. No-op if sounds are disabled or audio is unavailable.
 */
export function playSound(type: SoundType): void {
  if (!soundsEnabled()) return

  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  switch (type) {
    case 'task-approved': {
      // Happy two-note ascending chime (C5 → E5)
      playTone(ctx, 523.25, now, 0.15, 'sine', 0.12)       // C5
      playTone(ctx, 659.25, now + 0.08, 0.2, 'sine', 0.12)  // E5
      break
    }

    case 'task-submitted': {
      // Gentle single soft tone (A4)
      playTone(ctx, 440, now, 0.2, 'sine', 0.1)
      break
    }

    case 'achievement-unlocked': {
      // Celebratory three-note ascending (C5 → E5 → G5)
      playTone(ctx, 523.25, now, 0.15, 'sine', 0.12)        // C5
      playTone(ctx, 659.25, now + 0.1, 0.15, 'sine', 0.12)  // E5
      playTone(ctx, 783.99, now + 0.2, 0.3, 'sine', 0.15)   // G5
      // Add a sparkle on top
      playTone(ctx, 1046.5, now + 0.3, 0.2, 'triangle', 0.08) // C6
      break
    }

    case 'sadaqah-confirmed': {
      // Soft bell-like ping (E5 + B5 harmonic)
      playTone(ctx, 659.25, now, 0.3, 'sine', 0.1)          // E5
      playTone(ctx, 987.77, now + 0.05, 0.4, 'sine', 0.06)  // B5 (harmonic)
      break
    }

    case 'reward-unlocked': {
      // Sparkle: three quick high notes
      playTone(ctx, 880, now, 0.1, 'triangle', 0.08)        // A5
      playTone(ctx, 1046.5, now + 0.06, 0.1, 'triangle', 0.08) // C6
      playTone(ctx, 1318.5, now + 0.12, 0.15, 'triangle', 0.08) // E6
      break
    }

    case 'error': {
      // Low thud (A3, short)
      playTone(ctx, 220, now, 0.15, 'sawtooth', 0.08)
      break
    }
  }
}
