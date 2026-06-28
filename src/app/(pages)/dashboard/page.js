'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Target, BarChart3, Building2, Trophy, FileText, LogOut, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Apple', 'General']
const ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Product Manager']
const ROUNDS = ['HR', 'Technical', 'Behavioural']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-brass/30">
        <p className="text-ash text-xs font-mono">{label}</p>
        <p className="text-white font-display font-semibold text-lg">{payload[0].value}%</p>
        <p className="text-brass text-xs font-mono">{payload[0].payload.company}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user, token, logout } = useApp()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [showSetup, setShowSetup] = useState(false)
  const [setup, setSetup] = useState({ company: 'Google', role: 'Software Engineer', round: 'Technical' })

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchDashboard()
  }, [user])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch {}
  }

  const startInterview = () => {
    localStorage.setItem('interviewSetup', JSON.stringify(setup))
    router.push('/interview')
  }

  const chartData = stats?.scoreHistory?.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.score,
    company: s.company,
    date: new Date(s.date).toLocaleDateString()
  })) || []

  if (!user) return null

  const trendUp = chartData.length >= 2 && chartData[chartData.length - 1]?.score > chartData[0]?.score

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto bg-ink">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="file-tab">Candidate Dashboard</span>
          <h1 className="font-display text-3xl font-semibold text-white mt-3">
            Welcome back, {user.name}
          </h1>
          <p className="text-ash mt-1">Ready for your next session?</p>
        </div>
        <button
          onClick={() => { logout(); router.push('/') }}
          className="glass px-4 py-2 rounded-xl text-ash hover:text-white transition text-sm flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: stats?.totalSessions || 0, Icon: Target },
          { label: 'Avg Score', value: `${stats?.avgScore || 0}%`, Icon: BarChart3 },
          { label: 'Companies', value: Object.keys(stats?.companiesMap || {}).length, Icon: Building2 },
          {
            label: 'Best Score',
            value: `${stats?.scoreHistory?.length > 0
              ? Math.max(...(stats?.scoreHistory?.map(s => s.score) || [0]))
              : 0}%`,
            Icon: Trophy
          },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-5 text-center">
            <s.Icon className="w-5 h-5 text-brass mx-auto mb-3" strokeWidth={1.5} />
            <div className="text-2xl font-display font-semibold text-white">{s.value}</div>
            <div className="text-ash text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── SCORE PROGRESS CHART ── */}
      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">Score progress</h2>
              <p className="text-ash text-sm mt-1">Your improvement over time</p>
            </div>
            {chartData.length >= 2 && (
              <div className={`glass px-3 py-1.5 rounded-lg text-sm font-mono font-medium flex items-center gap-1.5 border ${
                trendUp ? 'text-signal border-signal/30' : 'text-clay border-clay/30'
              }`}>
                {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {Math.abs(chartData[chartData.length - 1]?.score - chartData[0]?.score)}% since start
              </div>
            )}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={70}
                stroke="rgba(52,211,153,0.35)"
                strokeDasharray="5 5"
                label={{ value: 'Good', fill: 'rgba(52,211,153,0.7)', fontSize: 11 }}
              />
              <ReferenceLine
                y={50}
                stroke="rgba(61,127,255,0.3)"
                strokeDasharray="5 5"
                label={{ value: 'Average', fill: 'rgba(61,127,255,0.7)', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3D7FFF"
                strokeWidth={3}
                dot={{ fill: '#3D7FFF', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#FF4FA3' }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-signal opacity-70"></div>
              <span className="text-ash text-xs">Good (70%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brass opacity-70"></div>
              <span className="text-ash text-xs">Average (50%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#3D7FFF' }}></div>
              <span className="text-ash text-xs">Your score</span>
            </div>
          </div>
        </div>
      )}

      {/* ── RESUME INTERVIEW ── */}
      <div className="glass rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg border border-brass/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-brass" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-white font-display font-semibold text-lg">Resume-based interview</h3>
            <p className="text-ash text-sm mt-1">
              Upload your resume — get questions tailored to your experience
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/resume')}
          className="gradient-btn text-white font-semibold py-3 px-6 rounded-xl flex-shrink-0"
        >
          Try it →
        </button>
      </div>

      {/* ── START INTERVIEW ── */}
      {!showSetup ? (
        <div className="glass rounded-2xl p-8 mb-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">Start a new interview</h2>
          <p className="text-ash mb-6">
            Practice with real MNC questions and get AI feedback
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="gradient-btn text-white font-semibold py-4 px-12 rounded-2xl text-lg"
          >
            Start interview
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 mb-8 animate-fadeIn">
          <h2 className="font-display text-xl font-semibold text-white mb-6">Configure your interview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Company', key: 'company', options: COMPANIES },
              { label: 'Role', key: 'role', options: ROLES },
              { label: 'Round', key: 'round', options: ROUNDS },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-ash text-sm block mb-2">{field.label}</label>
                <div className="relative">
                  <select
                    value={setup[field.key]}
                    onChange={(e) => setSetup({ ...setup, [field.key]: e.target.value })}
                    className="w-full appearance-none bg-panelLight border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-brass cursor-pointer"
                  >
                    {field.options.map(opt => (
                      <option key={opt} value={opt} className="bg-panel text-white">{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-ash absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={startInterview}
              className="gradient-btn text-white font-semibold py-3 px-8 rounded-xl flex-1"
            >
              Begin interview
            </button>
            <button
              onClick={() => setShowSetup(false)}
              className="glass text-ash py-3 px-6 rounded-xl hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── RECENT SESSIONS ── */}
      {stats?.recentSessions?.length > 0 && (
        <div className="glass rounded-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-white mb-6">Recent sessions</h2>
          <div className="space-y-3">
            {stats.recentSessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-panelLight rounded-xl p-4">
                <div>
                  <span className="text-white font-medium">{s.company}</span>
                  <span className="text-ash text-sm ml-2">
                    · {s.role} · {s.round}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-semibold text-lg ${
                    s.overallScore >= 70 ? 'text-signal' :
                    s.overallScore >= 50 ? 'text-brass' : 'text-clay'
                  }`}>
                    {s.overallScore}%
                  </span>
                  <span className="text-ash text-xs font-mono">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </main>
  )
}