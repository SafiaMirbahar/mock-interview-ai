'use client'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { user } = useApp()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="animate-fadeIn max-w-3xl">

        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">🎤</span>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Mock Interview
        </h1>
        <p className="text-xl text-gray-400 mb-4">
          Practice with a real AI interviewer. Get instant feedback.
        </p>
        <p className="text-gray-500 mb-10">
          Real questions from Google, Amazon, Microsoft, Meta & more.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '🤖', title: 'AI Avatar HR', desc: 'Talking interviewer that feels real' },
            { icon: '🏢', title: 'MNC Questions', desc: 'Real past interview questions' },
            { icon: '📊', title: 'Smart Scoring', desc: 'Clarity, relevance & confidence' },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/register')}
            className="gradient-btn text-white font-semibold py-4 px-10 rounded-2xl text-lg"
          >
            Get Started Free
          </button>
          <button
            onClick={() => router.push('/login')}
            className="glass text-white font-semibold py-4 px-10 rounded-2xl text-lg hover:bg-white/10 transition"
          >
            Login
          </button>
        </div>
      </div>
    </main>
  )
}