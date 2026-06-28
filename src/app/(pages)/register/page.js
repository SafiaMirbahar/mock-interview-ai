'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import axios from 'axios'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/auth/register', form)
      login(res.data.user, res.data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-ink">
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-brass/40 flex items-center justify-center mx-auto mb-5">
            <UserPlus className="w-5 h-5 text-brass" strokeWidth={1.5} />
          </div>

          <span className="file-tab">New Candidate</span>

          <h1 className="font-display text-4xl font-semibold text-white mt-4">
            Create your account
          </h1>

          <p className="text-ash mt-2 text-sm">
            Start practicing today.
          </p>
        </div>

        {error && (
          <div className="bg-clay/10 border border-clay/40 rounded-xl p-3 mb-6 text-clay text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'name', placeholder: 'Full name', type: 'text' },
            { name: 'email', placeholder: 'Email address', type: 'email' },
            { name: 'password', placeholder: 'Password', type: 'password' },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              className="w-full bg-panelLight border border-white/10 rounded-xl px-4 py-3 text-white placeholder-ash/70 focus:outline-none focus:border-brass transition"
              required
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn w-full text-ink font-semibold py-3 rounded-xl mt-2 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-ash mt-6 text-sm">
          Already have an account?{' '}
          <span onClick={() => router.push('/login')} className="text-brass cursor-pointer hover:text-brassLight transition">
            Sign in
          </span>
        </p>
      </div>
    </main>
  )
}