import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalSessions: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)