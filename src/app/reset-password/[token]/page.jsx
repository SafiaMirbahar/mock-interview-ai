'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { Lock, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { token } = useParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-ink">
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-brass/40 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-brass" strokeWidth={1.5} />
          </div>

          <span className="file-tab">Reset Credentials</span>

          <h1 className="font-display text-4xl font-semibold text-white mt-4">
            Set new password
          </h1>

          <p className="text-ash mt-2 text-sm">
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div className="bg-clay/10 border border-clay/40 rounded-xl p-3 mb-6 text-clay text-sm text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-signal/10 border border-signal/40 rounded-xl p-4 text-signal text-sm text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            Password reset successful. Redirecting to sign in…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-panelLight border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ash/70 focus:outline-none focus:border-brass transition"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-panelLight border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ash/70 focus:outline-none focus:border-brass transition"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="gradient-btn w-full text-ink font-semibold py-3 rounded-xl mt-2 disabled:opacity-50"
            >
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}