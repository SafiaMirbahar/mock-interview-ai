import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const DID_API_KEY = process.env.DID_API_KEY
    const authHeader = `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`

    const res = await fetch('https://api.d-id.com/presenters', {
      headers: {
        'Authorization': authHeader,
        'accept': 'application/json'
      }
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message })
  }
}