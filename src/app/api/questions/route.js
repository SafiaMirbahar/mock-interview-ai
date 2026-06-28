// import { NextResponse } from 'next/server'
// import connectDB from '@/lib/mongodb'
// import Question from '@/models/Question'

// const SEED_QUESTIONS = [
//   { company: 'Google', role: 'Software Engineer', round: 'Technical', question: 'Explain the difference between a stack and a queue. When would you use each?', idealAnswer: 'Stack is LIFO, queue is FIFO. Use stack for undo operations, recursion. Use queue for task scheduling, BFS.', difficulty: 'Easy' },
//   { company: 'Google', role: 'Software Engineer', round: 'Technical', question: 'How would you design a URL shortener like bit.ly?', idealAnswer: 'Hash function to generate short codes, database to store mappings, handle collisions, cache frequent URLs, consider scalability.', difficulty: 'Hard' },
//   { company: 'Google', role: 'Software Engineer', round: 'Behavioural', question: 'Tell me about a time you had a conflict with a teammate. How did you resolve it?', idealAnswer: 'Use STAR method: Situation, Task, Action, Result. Show communication and empathy.', difficulty: 'Medium' },
//   { company: 'Google', role: 'Software Engineer', round: 'HR', question: 'Why do you want to work at Google?', idealAnswer: 'Mention specific products, culture of innovation, learning opportunities, impact at scale.', difficulty: 'Easy' },
//   { company: 'Amazon', role: 'Software Engineer', round: 'Technical', question: 'What is the difference between SQL and NoSQL databases?', idealAnswer: 'SQL is structured, relational, ACID compliant. NoSQL is flexible, scalable, better for unstructured data.', difficulty: 'Medium' },
//   { company: 'Amazon', role: 'Software Engineer', round: 'Behavioural', question: 'Describe a situation where you had to meet a tight deadline.', idealAnswer: 'Show prioritization, communication, focus under pressure using STAR method.', difficulty: 'Medium' },
//   { company: 'Amazon', role: 'Software Engineer', round: 'HR', question: 'Where do you see yourself in 5 years?', idealAnswer: 'Show ambition, alignment with company growth, leadership aspirations, continuous learning.', difficulty: 'Easy' },
//   { company: 'Microsoft', role: 'Software Engineer', round: 'Technical', question: 'Explain REST vs GraphQL. When would you choose one over the other?', idealAnswer: 'REST uses fixed endpoints, GraphQL uses single endpoint with flexible queries. GraphQL better for complex data fetching.', difficulty: 'Medium' },
//   { company: 'Microsoft', role: 'Software Engineer', round: 'Technical', question: 'What is a closure in JavaScript?', idealAnswer: 'A closure is a function that remembers the variables from its outer scope even after the outer function has returned.', difficulty: 'Medium' },
//   { company: 'Microsoft', role: 'Software Engineer', round: 'HR', question: 'What is your greatest weakness?', idealAnswer: 'Be honest, show self-awareness, explain what you are doing to improve it.', difficulty: 'Easy' },
//   { company: 'Meta', role: 'Frontend Developer', round: 'Technical', question: 'Explain the virtual DOM in React and why it matters.', idealAnswer: 'Virtual DOM is a lightweight copy of real DOM. React diffs virtual DOM to minimize actual DOM updates, improving performance.', difficulty: 'Medium' },
//   { company: 'Meta', role: 'Frontend Developer', round: 'Technical', question: 'What are React hooks and why were they introduced?', idealAnswer: 'Hooks allow functional components to use state and lifecycle features. Introduced to avoid class component complexity.', difficulty: 'Easy' },
//   { company: 'Meta', role: 'Frontend Developer', round: 'Behavioural', question: 'Tell me about your most challenging project.', idealAnswer: 'Describe technical challenge, your role, decisions made, outcome. Show problem-solving and ownership.', difficulty: 'Medium' },
//   { company: 'Netflix', role: 'Backend Developer', round: 'Technical', question: 'How would you design a notification system that handles millions of users?', idealAnswer: 'Message queues, pub/sub pattern, push vs pull, delivery guarantees, retry logic, user preferences.', difficulty: 'Hard' },
//   { company: 'Netflix', role: 'Backend Developer', round: 'HR', question: 'Why do you want to leave your current position?', idealAnswer: 'Focus on growth opportunities, new challenges, alignment with company values. Avoid negativity about current employer.', difficulty: 'Easy' },
// ]

// export async function GET(request) {
//   try {
//     await connectDB()
//     const { searchParams } = new URL(request.url)
//     const company = searchParams.get('company')
//     const role = searchParams.get('role')
//     const round = searchParams.get('round')

//     let questions = await Question.find()
//     if (questions.length === 0) {
//       await Question.insertMany(SEED_QUESTIONS)
//       questions = await Question.find()
//     }

//     let filtered = questions
//     if (company) filtered = filtered.filter(q => q.company === company)
//     if (role) filtered = filtered.filter(q => q.role === role)
//     if (round) filtered = filtered.filter(q => q.round === round)

//     if (filtered.length === 0) filtered = questions.slice(0, 5)

//     const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 6)
//     return NextResponse.json({ questions: shuffled })
//   } catch (error) {
//     return NextResponse.json({ error: 'Server error' }, { status: 500 })
//   }
// }




import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import REAL_QUESTIONS from '@/lib/seedQuestions'
import { generateQuestionsWithGemini } from '@/lib/geminiQuestions'

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company') || 'General'
    const role = searchParams.get('role') || 'Software Engineer'
    const round = searchParams.get('round') || 'Technical'

    // Seed if empty
    const totalCount = await Question.countDocuments()
    if (totalCount === 0) {
      await Question.insertMany(REAL_QUESTIONS)
    }

    // Get questions from DB first
    let dbQuestions = await Question.find({
      $or: [{ company }, { company: 'General' }],
      round
    })

    // Only call Gemini if we have less than 4 questions — saves quota!
    if (dbQuestions.length < 4) {
      const geminiQuestions = await generateQuestionsWithGemini(company, role, round, 4)
      if (geminiQuestions.length > 0) {
        await Question.insertMany(geminiQuestions).catch(() => {})
        dbQuestions = [...dbQuestions, ...geminiQuestions]
      }
    }

    // Shuffle and return 6
    const shuffled = dbQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)

    return NextResponse.json({ questions: shuffled })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}