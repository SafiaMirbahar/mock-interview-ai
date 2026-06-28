import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ userId: user._id, name: user.name, email: user.email })

    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.log('LOGIN ERROR:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}