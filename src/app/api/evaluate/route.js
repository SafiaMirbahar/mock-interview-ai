import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request) {
  try {
    const { question, answer, idealAnswer, company, role } = await request.json()

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer required' }, { status: 400 })
    }

    if (answer.trim().length < 10) {
      return NextResponse.json({
        clarityScore: 2, relevanceScore: 2, confidenceScore: 2, overallScore: 20,
        feedback: 'Your answer was too short. Please provide a detailed response.',
        strengths: 'You attempted to answer.',
        improvements: 'Give a much more detailed answer with specific examples.'
      })
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
You are a strict but fair interviewer at ${company} evaluating a ${role} candidate.

Question: "${question}"
Expected answer: "${idealAnswer || 'Not provided'}"
Candidate answer: "${answer}"

Score HONESTLY and STRICTLY:
- Wrong or very incomplete answer: 20-40
- Partial answer missing key points: 40-60
- Good answer covering main points: 60-80
- Excellent answer with examples and depth: 80-100

Respond ONLY with this exact JSON, no other text:
{
  "clarityScore": <number 1-10>,
  "relevanceScore": <number 1-10>,
  "confidenceScore": <number 1-10>,
  "overallScore": <number 1-100>,
  "feedback": "<2-3 sentences of specific feedback mentioning what they actually said>",
  "strengths": "<specific thing they did well, or 'Answer lacked depth' if poor>",
  "improvements": "<specific improvement needed with example of better answer>"
}`
    })

    const text = response.text
    console.log('Gemini eval response:', text)
    const cleanJson = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
    const evaluation = JSON.parse(cleanJson)
    return NextResponse.json(evaluation)

  } catch (error) {
    console.error('Evaluate error:', error.message)
    return NextResponse.json({
      clarityScore: 5, relevanceScore: 5, confidenceScore: 5, overallScore: 50,
      feedback: `Evaluation error: ${error.message}`,
      strengths: 'Could not evaluate.',
      improvements: 'Please try again.'
    })
  }
}