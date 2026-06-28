import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
    })
    const data = await res.json()
    return NextResponse.json({
      success: true,
      voices: data.voices?.map(v => ({ name: v.name, id: v.voice_id }))
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message })
  }
}