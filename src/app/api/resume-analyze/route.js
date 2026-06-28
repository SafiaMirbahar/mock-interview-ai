import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import mammoth from 'mammoth'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume')

    if (!file) {
      return NextResponse.json(
        { error: 'No resume uploaded.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.toLowerCase()

    let resumeText = ''

    if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer })
      resumeText = result.value
    } else if (fileName.endsWith('.txt')) {
      resumeText = buffer.toString('utf-8')
    } else if (fileName.endsWith('.doc')) {
      return NextResponse.json(
        {
          error:
            "Old .doc format isn't supported. Please save it as .docx.",
        },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload .docx or .txt' },
        { status: 400 }
      )
    }

    resumeText = resumeText.trim()

    if (resumeText.length < 50) {
      return NextResponse.json(
        { error: 'Resume content is too short.' },
        { status: 400 }
      )
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
You are an expert technical interviewer.

Analyze the following resume and generate exactly 6 highly personalized interview questions.

Resume:
${resumeText}

Rules:
- Reference ONLY technologies, projects, internships and skills actually mentioned.
- Mix Technical, Behavioral and Project-Based questions.
- Difficulty should vary from Easy to Hard.
- Return ONLY valid JSON.

Format:

[
  {
    "question":"...",
    "idealAnswer":"...",
    "difficulty":"Easy",
    "category":"Technical"
  }
]
`,
    })

    const text = response.text

    const cleanJson = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let questions

    try {
      questions = JSON.parse(cleanJson)
    } catch (err) {
      console.error('Invalid Gemini JSON:', cleanJson)

      return NextResponse.json(
        { error: 'Gemini returned invalid JSON.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      questions,
      count: questions.length,
    })
  } catch (error) {
    console.error('Resume Analyze Error:', error)

    return NextResponse.json(
      { error: 'Failed to analyze resume.' },
      { status: 500 }
    )
  }
}