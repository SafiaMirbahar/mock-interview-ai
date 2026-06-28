import { NextResponse } from 'next/server'

const AVATAR_IMAGE = process.env.DID_AVATAR_URL || 'https://i.ibb.co/tMyj8XCn/sarah-jpg.png'

export async function POST(request) {
  try {
    const { text, isIntro } = await request.json()
    const DID_API_KEY = process.env.DID_API_KEY

    // Only use D-ID for intro — saves credits
    if (!isIntro || !DID_API_KEY || DID_API_KEY === 'your_did_api_key_here') {
      return NextResponse.json({ fallback: true, text })
    }

    const authHeader = `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`

    const createResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        source_url: AVATAR_IMAGE,
        script: {
          type: 'text',
          subtitles: false,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural'
          },
          input: text
        },
        config: { fluent: true, pad_audio: 0 }
      })
    })

    const createData = await createResponse.json()
    console.log('D-ID create:', createData)

    if (!createData.id) {
      return NextResponse.json({ fallback: true, text })
    }

    // Poll until ready
    let videoUrl = null
    let attempts = 0

    while (attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const statusRes = await fetch(`https://api.d-id.com/talks/${createData.id}`, {
        headers: { 'Authorization': authHeader, 'accept': 'application/json' }
      })
      const statusData = await statusRes.json()
      console.log(`D-ID poll ${attempts + 1}:`, statusData.status)

      if (statusData.status === 'done' && statusData.result_url) {
        videoUrl = statusData.result_url
        break
      }
      if (statusData.status === 'error' || statusData.status === 'rejected') break
      attempts++
    }

    if (videoUrl) return NextResponse.json({ videoUrl })
    return NextResponse.json({ fallback: true, text })

  } catch (error) {
    console.error('Avatar error:', error.message)
    return NextResponse.json({ fallback: true, text: '' })
  }
}