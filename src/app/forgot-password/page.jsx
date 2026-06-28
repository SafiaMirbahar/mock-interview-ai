'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { KeyRound, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-ink">
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-brass/40 flex items-center justify-center mx-auto mb-5">
            <KeyRound className="w-5 h-5 text-brass" strokeWidth={1.5} />
          </div>

          <span className="file-tab">Password Recovery</span>

          <h1 className="font-display text-4xl font-semibold text-white mt-4">
            Reset password
          </h1>

          <p className="text-ash mt-2 text-sm">
            {sent
              ? 'Check your inbox for a reset link.'
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {error && (
          <div className="bg-clay/10 border border-clay/40 rounded-xl p-3 mb-6 text-clay text-sm text-center">
            {error}
          </div>
        )}

        {sent ? (
          <div className="bg-signal/10 border border-signal/40 rounded-xl p-4 text-signal text-sm text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            If an account exists for <span className="font-semibold text-white">{email}</span>, a reset link has been sent. It expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-panelLight border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ash/70 focus:outline-none focus:border-brass transition"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="gradient-btn w-full text-ink font-semibold py-3 rounded-xl mt-2 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-ash mt-6 text-sm">
          Remembered your password?{' '}
          <span onClick={() => router.push('/login')} className="text-brass cursor-pointer hover:text-brassLight transition">
            Back to sign in
          </span>
        </p>
      </div>
    </main>
  )
}