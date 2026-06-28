import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { text } = await request.json()
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EaBs7G1VibMrNAuz2Na7'

    console.log('ElevenLabs key exists:', !!ELEVENLABS_API_KEY)
    console.log('ElevenLabs key starts with:', ELEVENLABS_API_KEY?.substring(0, 8))
    console.log('Voice ID:', VOICE_ID)
    console.log('Text length:', text?.length)

    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_key_here') {
      console.log('ElevenLabs key missing or placeholder!')
      return NextResponse.json({ fallback: true })
    }

    console.log('Calling ElevenLabs API...')

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      }
    )

    console.log('ElevenLabs response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs error response:', error)
      return NextResponse.json({ fallback: true, error })
    }

    const audioBuffer = await response.arrayBuffer()
    console.log('Audio buffer size:', audioBuffer.byteLength)

    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    return NextResponse.json({
      audio: base64Audio,
      contentType: 'audio/mpeg'
    })

  } catch (error) {
    console.error('Speak route error:', error.message)
    return NextResponse.json({ fallback: true, error: error.message })
  }
}