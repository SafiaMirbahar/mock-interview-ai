import mongoose from 'mongoose'

const AnswerSchema = new mongoose.Schema({
  questionId: String,
  question: String,
  transcript: String,
  clarityScore: Number,
  relevanceScore: Number,
  confidenceScore: Number,
  aiFeedback: String,
  overallScore: Number
})

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  round: { type: String, required: true },
  answers: [AnswerSchema],
  overallScore: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Session || mongoose.model('Session', SessionSchema)