import { NextRequest, NextResponse } from 'next/server'

// ────────────────────────────────────────────────────────────────────────────
// TTS API — uses Google Translate's TTS engine for clean Bengali voice.
// This is the same engine used by Google Translate's "Listen" button.
// It produces high-quality bn-BD Bengali speech for free.
//
// The client sends text → server fetches audio from Google → returns MP3.
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 })
    }

    // Truncate to 500 chars (Google TTS limit is ~200 chars, but we'll chunk)
    const truncated = text.slice(0, 500)

    // Use Google Translate TTS endpoint
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=bn&client=tw-ob`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'TTS service unavailable' }, { status: 502 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24h
      },
    })
  } catch (error) {
    console.error('TTS API Error:', error)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
