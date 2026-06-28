'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import axios from 'axios'
import { ArrowLeft, FileText, Loader2, CheckCircle2, Mic, Upload } from 'lucide-react'

export default function Resume() {
  const { user } = useApp()
  const router = useRouter()

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')

  const analyzeResume = async () => {
    if (!file) {
      setError('Please upload your resume.')
      return
    }

    setLoading(true)
    setError('')
    setQuestions([])

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await axios.post('/api/resume-analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setQuestions(res.data.questions)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startWithQuestions = () => {
    localStorage.setItem('resumeQuestions', JSON.stringify(questions))
    localStorage.setItem(
      'interviewSetup',
      JSON.stringify({
        company: 'Custom',
        role: 'Based on Resume',
        round: 'HR',
      })
    )

    router.push('/interview')
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto bg-ink">

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="glass px-4 py-2 rounded-xl text-ash hover:text-white transition text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Dashboard
        </button>

        <div>
          <span className="file-tab">Resume-Based Interview</span>
          <h1 className="font-display text-2xl font-semibold text-white mt-2">
            Upload your resume
          </h1>
          <p className="text-ash text-sm mt-1">
            Get personalized interview questions based on your experience.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-white font-display font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brass" strokeWidth={1.5} />
          Upload resume
        </h2>

        <input
          type="file"
          accept=".docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full bg-panelLight border border-white/10 rounded-xl p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brass/15 file:text-brass file:font-medium"
        />

        {file && (
          <p className="text-signal text-sm mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            Selected: {file.name}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-clay/10 border border-clay/30 rounded-xl p-4 mb-6 text-clay text-sm">
          {error}
        </div>
      )}

      {questions.length === 0 && (
        <button
          onClick={analyzeResume}
          disabled={loading || !file}
          className="gradient-btn w-full text-ink font-bold py-4 rounded-xl text-lg disabled:opacity-40 mb-6 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />}
          {loading ? 'Analyzing resume…' : 'Generate interview questions'}
        </button>
      )}

      {loading && (
        <div className="glass rounded-2xl p-8 text-center mb-6">
          <Loader2 className="w-8 h-8 text-brass animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-white text-lg font-display font-semibold">
            Analyzing resume…
          </p>
          <p className="text-ash text-sm mt-2 font-mono">
            Reading skills, projects and experience…
          </p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-display font-semibold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-signal" strokeWidth={1.5} />
            Personalized questions
          </h2>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-panelLight rounded-xl p-4 border border-white/10"
              >
                <p className="text-white font-medium">
                  <span className="text-brass font-mono mr-2">Q{i + 1}.</span>
                  {q.question}
                </p>

                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-brass/10 text-brass border border-brass/20 px-2 py-1 rounded-full font-mono uppercase tracking-wide">
                    {q.category}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-mono uppercase tracking-wide border ${
                      q.difficulty === 'Easy'
                        ? 'bg-signal/10 text-signal border-signal/20'
                        : q.difficulty === 'Medium'
                        ? 'bg-brass/10 text-brass border-brass/20'
                        : 'bg-clay/10 text-clay border-clay/20'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={startWithQuestions}
              className="gradient-btn flex-1 text-ink py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" strokeWidth={1.5} />
              Start interview
            </button>

            <button
              onClick={() => {
                setQuestions([])
                setFile(null)
              }}
              className="glass px-6 py-3 rounded-xl text-ash hover:text-white transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              Upload another
            </button>
          </div>
        </div>
      )}

    </main>
  )
}