import mongoose from 'mongoose'

const QuestionSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  round: { type: String, enum: ['HR', 'Technical', 'Behavioural'], required: true },
  question: { type: String, required: true },
  idealAnswer: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  source: { type: String, default: 'Glassdoor' }
})

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema)