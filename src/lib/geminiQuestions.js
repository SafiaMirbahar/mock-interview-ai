import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function generateQuestionsWithGemini(company, role, round, count = 4) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
You are an expert technical recruiter. Generate ${count} real interview questions asked at ${company} for a ${role} position during the ${round} round.

Requirements:
- Specific to ${company} culture and tech stack
- For Technical: coding, system design, or concept questions
- For HR: culture fit and career questions
- For Behavioural: STAR-method situational questions
- Based on real Glassdoor reports 2023-2024

Respond ONLY with a valid JSON array, no markdown, no extra text:
[
  {
    "question": "full question text",
    "idealAnswer": "key points of strong answer in 2-3 sentences",
    "difficulty": "Easy or Medium or Hard",
    "tip": "one specific tip for answering at ${company}"
  }
]`
    })

    const text = response.text
    const cleanJson = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
    const generated = JSON.parse(cleanJson)

    return generated.map(q => ({
      company,
      role,
      round,
      question: q.question,
      idealAnswer: q.idealAnswer,
      difficulty: q.difficulty || 'Medium',
      tip: q.tip || '',
      source: 'Gemini AI Generated'
    }))
  } catch (error) {
    console.error('Gemini generation error:', error.message)
    return []
  }
}