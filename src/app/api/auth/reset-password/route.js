import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    await connectDB()
    const { token, newPassword } = await req.json()

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return Response.json({ message: 'Invalid or expired reset link.' }, { status: 400 })
    }

    user.password = await bcrypt.hash(newPassword, 12) // 12 to match your register route
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return Response.json({ message: 'Password reset successful.' })
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err)
    return Response.json({ message: 'Something went wrong.' }, { status: 500 })
  }
}