'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import axios from 'axios'

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useApp()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const res = await axios.post('/api/auth/login', form)

      login(res.data.user, res.data.token)

      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-8 w-full max-w-md animate-fadeIn">

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎤</div>

          <h1 className="text-3xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="text-gray-400 mt-2">
            Continue your practice
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-6 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {[
            {
              name: 'email',
              placeholder: 'Email Address',
              type: 'email',
            },
            {
              name: 'password',
              placeholder: 'Password',
              type: 'password',
            },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field.name]: e.target.value,
                })
              }
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              required
            />
          ))}

          {/* Forgot Password */}

          <div className="text-right -mt-1">
            <span
              onClick={() => router.push('/forgot-password')}
              className="text-sm text-purple-400 cursor-pointer hover:underline"
            >
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn w-full text-white font-semibold py-3 rounded-xl mt-2 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Don't have an account?{' '}
          <span
            onClick={() => router.push('/register')}
            className="text-purple-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

      </div>
    </main>
  )
}