import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import User from '@/models/User'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { company, role, round, answers, duration } = await request.json()
    const totalScore = answers.reduce((sum, a) => sum + (a.overallScore || 0), 0)
    const overallScore = Math.round(totalScore / answers.length)

    const session = await Session.create({
      userId: decoded.userId,
      company, role, round, answers,
      overallScore, duration
    })

    await User.findByIdAndUpdate(decoded.userId, {
      $inc: { totalSessions: 1 },
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sessions = await Session.find({ userId: decoded.userId }).sort({ createdAt: -1 })
    return NextResponse.json({ sessions })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}