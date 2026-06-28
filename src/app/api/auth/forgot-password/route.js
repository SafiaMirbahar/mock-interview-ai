import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'
import { sendResetEmail } from '@/lib/sendEmail'

export async function POST(req) {
  try {
    await connectDB()
    const { email } = await req.json()

    const user = await User.findOne({ email })

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

      user.resetPasswordToken = hashedToken
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
      await user.save()

      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${rawToken}`
      await sendResetEmail(email, resetUrl)
    }

    return Response.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err)
    return Response.json({ message: 'Something went wrong.' }, { status: 500 })
  }
}