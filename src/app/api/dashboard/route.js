import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sessions = await Session.find({ userId: decoded.userId }).sort({ createdAt: -1 })
    const totalSessions = sessions.length
    const avgScore = totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.overallScore, 0) / totalSessions)
      : 0

    const companiesMap = {}
    sessions.forEach(s => {
      companiesMap[s.company] = (companiesMap[s.company] || 0) + 1
    })

    const recentSessions = sessions.slice(0, 5).map(s => ({
      id: s._id,
      company: s.company,
      role: s.role,
      round: s.round,
      overallScore: s.overallScore,
      createdAt: s.createdAt
    }))

    return NextResponse.json({
      totalSessions,
      avgScore,
      companiesMap,
      recentSessions,
      scoreHistory: sessions.map(s => ({
        date: s.createdAt,
        score: s.overallScore,
        company: s.company
      })).reverse()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}