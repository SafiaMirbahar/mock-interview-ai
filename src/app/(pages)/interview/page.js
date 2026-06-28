'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import axios from 'axios'
import {
  Mic, Square, Lightbulb, EyeOff, Loader2, BarChart3,
  CheckCircle2, MessageSquare, ArrowRight, Award, RotateCcw,
  X, AlertTriangle, Check
} from 'lucide-react'

export default function Interview() {
  const { user, token } = useApp()
  const router = useRouter()
  const [setup, setSetup] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('loading')
  const [transcript, setTranscript] = useState('')
  const [answers, setAnswers] = useState([])
  const [currentEval, setCurrentEval] = useState(null)
  const [avatarVideo, setAvatarVideo] = useState(null)
  const [avatarText, setAvatarText] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isResumeInterview, setIsResumeInterview] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [startTime] = useState(Date.now())
  const recognitionRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    const savedSetup = JSON.parse(localStorage.getItem('interviewSetup') || '{}')
    setSetup(savedSetup)
    loadQuestions(savedSetup)
  }, [])

  const loadQuestions = async (s) => {
    try {
      const resumeQuestions = localStorage.getItem('resumeQuestions')

      if (resumeQuestions) {
        const parsed = JSON.parse(resumeQuestions)
        setQuestions(parsed)
        setIsResumeInterview(true)
        localStorage.removeItem('resumeQuestions')
        setPhase('intro')
        speakAvatar(
          `Hello! I'm Sarah. I've reviewed your resume carefully. I'll be asking you questions specifically based on your experience and skills. Let's begin when you're ready!`,
          true
        )
        return
      }

      const res = await axios.get(
        `/api/questions?company=${s.company}&role=${s.role}&round=${s.round}`
      )
      setQuestions(res.data.questions)
      setIsResumeInterview(false)
      setPhase('intro')
      speakAvatar(
        `Hello! I'm Sarah, Senior HR Manager at ${s.company}. Today we'll be conducting your ${s.round} round interview for the ${s.role} position. Take a deep breath, relax, and let's begin when you're ready!`,
        true
      )
    } catch {
      setPhase('intro')
    }
  }

  const useBrowserVoice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 0.9
      utter.pitch = 1.1
      utter.onend = () => setIsSpeaking(false)
      const voices = window.speechSynthesis.getVoices()
      const femaleVoice = voices.find(v =>
        v.name.includes('Female') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Jenny') ||
        v.name.includes('Zira')
      )
      if (femaleVoice) utter.voice = femaleVoice
      window.speechSynthesis.speak(utter)
    }
  }

  const speakAvatar = async (text, isIntro = false) => {
    setAvatarText(text)
    setIsSpeaking(true)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()

    let elevenLabsSuccess = false
    try {
      const res = await axios.post('/api/speak', { text })
      if (res.data.audio) {
        const audioData = `data:${res.data.contentType};base64,${res.data.audio}`
        const audio = new Audio(audioData)
        audioRef.current = audio
        audio.playbackRate = 1.0
        audio.onended = () => setIsSpeaking(false)
        audio.onerror = () => {
          setIsSpeaking(false)
          useBrowserVoice(text)
        }
        await audio.play()
        elevenLabsSuccess = true
      }
    } catch (err) {
      console.log('ElevenLabs fallback:', err.message)
    }

    if (!elevenLabsSuccess) {
      useBrowserVoice(text)
    }

    if (isIntro) {
      setAvatarLoading(true)
      setAvatarVideo(null)
      try {
        const res = await axios.post('/api/avatar', { text, isIntro: true })
        if (res.data.videoUrl) {
          setAvatarVideo(res.data.videoUrl)
        }
      } catch (err) {
        console.log('D-ID fallback:', err.message)
      } finally {
        setAvatarLoading(false)
      }
    }
  }

  const startInterview = () => {
    setPhase('asking')
    askQuestion(0)
  }

  const askQuestion = (index) => {
    if (index >= questions.length) {
      finishInterview()
      return
    }
    setPhase('asking')
    setTranscript('')
    setCurrentEval(null)
    setShowHint(false)
    setAvatarVideo(null)
    const q = questions[index]
    const intro = index === 0 ? '' : 'Good answer. Moving to the next question. '
    speakAvatar(`${intro}Question ${index + 1}: ${q.question}`, false)
    setTimeout(() => setPhase('listening'), 3000)
  }

  const nextQuestion = () => {
    const next = currentIndex + 1
    if (next >= questions.length) {
      finishInterview()
      return
    }
    setCurrentIndex(next)
    askQuestion(next)
  }

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please type your answer instead.')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
      }
      if (final) setTranscript(prev => prev + ' ' + final)
    }

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error)
      setIsRecording(false)
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsRecording(false)
  }

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      alert('Please record or type your answer first!')
      return
    }
    stopRecording()
    setPhase('evaluating')

    const q = questions[currentIndex]
    try {
      const res = await axios.post('/api/evaluate', {
        question: q.question,
        answer: transcript,
        idealAnswer: q.idealAnswer,
        company: isResumeInterview ? 'the company' : setup.company,
        role: isResumeInterview ? 'this role' : setup.role
      })
      setCurrentEval(res.data)
      setAnswers(prev => [...prev, {
        questionId: q._id || `q_${currentIndex}`,
        question: q.question,
        transcript: transcript.trim(),
        ...res.data
      }])
      setPhase('feedback')
      speakAvatar(res.data.feedback, false)
    } catch {
      setPhase('listening')
    }
  }

  const finishInterview = async () => {
    setPhase('complete')
    speakAvatar(
      'That concludes our interview. Well done for completing all the questions! Your detailed results are now ready. Good luck!',
      false
    )
    try {
      await axios.post('/api/sessions', {
        ...setup,
        company: isResumeInterview ? 'Resume Based' : setup.company,
        role: isResumeInterview ? 'Custom' : setup.role,
        answers,
        duration: Math.round((Date.now() - startTime) / 60000)
      }, { headers: { Authorization: `Bearer ${token}` } })
    } catch {}
  }

  const quitInterview = async () => {
    stopRecording()
    window.speechSynthesis?.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (answers.length > 0) {
      try {
        await axios.post('/api/sessions', {
          ...setup,
          company: isResumeInterview ? 'Resume Based' : setup.company,
          role: isResumeInterview ? 'Custom' : setup.role,
          answers,
          duration: Math.round((Date.now() - startTime) / 60000),
          completed: false,
        }, { headers: { Authorization: `Bearer ${token}` } })
      } catch {}
    }

    setShowQuitConfirm(false)
    router.push('/dashboard')
  }

  const ScoreRing = ({ score, size = 80 }) => {
    const r = size / 2 - 8
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    const color = score >= 70 ? '#4F9D69' : score >= 50 ? '#C9A227' : '#C1554B'
    return (
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
        <text x={size/2} y={size/2+5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" style={{ fontFamily: 'var(--font-mono)' }}>
          {score}
        </text>
      </svg>
    )
  }

  if (phase === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-brass animate-spin mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-white text-xl font-display font-semibold">Setting up your interview…</p>
        <p className="text-ash text-sm mt-2 font-mono">
          {isResumeInterview
            ? 'Loading your personalized questions…'
            : 'Loading AI questions · Preparing avatar'}
        </p>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto bg-ink">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6">
        <span className="file-tab">
          {isResumeInterview ? 'Resume-Based Interview' : `${setup?.company} · ${setup?.role} · ${setup?.round}`}
        </span>

        <div className="flex items-center gap-3">
          {questions.length > 0 && phase !== 'complete' && phase !== 'intro' && (
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                    i < currentIndex ? 'bg-signal' :
                    i === currentIndex ? 'bg-brass' :
                    'bg-white/15'
                  }`}></div>
                ))}
              </div>
              <span className="text-white text-sm font-mono ml-1">
                {Math.min(currentIndex + 1, questions.length)}/{questions.length}
              </span>
            </div>
          )}

          {phase !== 'loading' && phase !== 'complete' && (
            <button
              onClick={() => {
                if (phase === 'intro' || answers.length === 0) {
                  router.push('/dashboard')
                } else {
                  setShowQuitConfirm(true)
                }
              }}
              className="glass rounded-xl px-4 py-2 text-clay text-sm font-medium hover:bg-clay/10 transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
              Quit
            </button>
          )}
        </div>
      </div>

      {/* ── AVATAR ── */}
      {phase !== 'complete' && (
        <div className="glass rounded-2xl p-8 mb-6 text-center">
          <div className="relative w-44 h-44 mx-auto mb-4">

            {avatarVideo ? (
              <video
                ref={videoRef}
                src={avatarVideo}
                autoPlay
                playsInline
                onEnded={() => setAvatarVideo(null)}
                className="w-44 h-44 rounded-full object-cover border-2 border-brass/40 shadow-2xl"
              />
            ) : avatarLoading ? (
              <div className="w-44 h-44 rounded-full bg-panelLight flex flex-col items-center justify-center border-2 border-brass/40 shadow-2xl">
                <Loader2 className="w-8 h-8 text-brass animate-spin" strokeWidth={1.5} />
              </div>
            ) : (
              <div className={`w-44 h-44 rounded-full bg-panelLight flex items-center justify-center border-2 border-brass/40 shadow-2xl transition-all duration-300 ${
                isSpeaking ? 'scale-105' : 'scale-100'
              }`}>
                <span className="font-display text-5xl font-semibold text-brass">SM</span>
              </div>
            )}

            {(phase === 'asking' || avatarLoading || isSpeaking) && (
              <div className="absolute top-1 right-1 flex items-center gap-1.5 bg-ink/90 border border-brass/30 rounded-full px-2.5 py-1">
                <span className="status-dot text-brass"></span>
                <span className="text-brass text-[10px] font-mono tracking-wider">SPEAKING</span>
              </div>
            )}

            {phase === 'listening' && !isSpeaking && (
              <div className="absolute top-1 right-1 flex items-center gap-1.5 bg-ink/90 border border-signal/30 rounded-full px-2.5 py-1">
                <span className="status-dot text-signal"></span>
                <span className="text-signal text-[10px] font-mono tracking-wider">YOUR TURN</span>
              </div>
            )}
          </div>

          <p className="text-white font-display font-semibold text-lg">Sarah Mitchell</p>
          <p className="text-ash text-sm mb-1">
            {isResumeInterview ? 'Resume Interview Specialist' : `Senior HR Manager · ${setup?.company}`}
          </p>
          <p className="text-ash/60 text-xs mb-3 font-mono">Voice by ElevenLabs</p>

          {avatarText && (
            <div className="glass rounded-xl p-4 mt-2 text-left max-w-lg mx-auto border border-brass/15">
              <p className="text-white text-sm leading-relaxed">{avatarText}</p>
            </div>
          )}

          {avatarLoading && (
            <p className="text-brass text-xs mt-3 font-mono">Preparing intro video…</p>
          )}
        </div>
      )}

      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <div className="text-center animate-fadeIn">
          <div className="glass rounded-xl p-5 mb-6 max-w-sm mx-auto text-left">
            {isResumeInterview ? (
              <>
                <p className="text-brass text-sm font-semibold mb-2 font-mono uppercase tracking-wide">
                  Resume-Based Interview
                </p>
                <p className="text-ash text-sm">{questions.length} personalized questions ready</p>
                <p className="text-ash text-sm mt-1">Tailored to your experience</p>
              </>
            ) : (
              <>
                <p className="text-ash text-sm">{questions.length} questions loaded</p>
                <p className="text-ash text-sm mt-1">{setup?.company} · {setup?.round} round</p>
              </>
            )}
            <p className="text-ash text-sm mt-1">Hints available on each question</p>
            <p className="text-ash text-sm mt-1">Speak or type your answers</p>
          </div>
          <button
            onClick={startInterview}
            className="gradient-btn text-ink font-bold py-4 px-12 rounded-xl text-xl"
          >
            I'm ready — start interview
          </button>
        </div>
      )}

      {/* ── QUESTION + LISTENING ── */}
      {(phase === 'asking' || phase === 'listening') && questions[currentIndex] && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fadeIn">

          <div className="flex items-start gap-3 mb-4">
            <span className="font-mono text-brass font-semibold text-sm bg-brass/10 border border-brass/20 rounded-lg px-3 py-2 flex-shrink-0">
              Q{currentIndex + 1}
            </span>
            <p className="text-white text-lg leading-relaxed font-medium">
              {questions[currentIndex].question}
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <span className={`text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wide border ${
              questions[currentIndex].difficulty === 'Hard'
                ? 'bg-clay/10 text-clay border-clay/30'
                : questions[currentIndex].difficulty === 'Easy'
                ? 'bg-signal/10 text-signal border-signal/30'
                : 'bg-brass/10 text-brass border-brass/30'
            }`}>
              {questions[currentIndex].difficulty || 'Medium'}
            </span>
            {questions[currentIndex].category && (
              <span className="text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wide bg-white/5 text-ash border border-white/10">
                {questions[currentIndex].category}
              </span>
            )}
            <span className="text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wide bg-white/5 text-ash border border-white/10">
              {isResumeInterview ? 'Resume Based' : questions[currentIndex].source || 'Interview Question'}
            </span>
          </div>

          {phase === 'asking' && (
            <div className="text-center py-6">
              <p className="text-ash text-sm font-mono">Listen carefully to the question…</p>
            </div>
          )}

          {phase === 'listening' && (
            <>
              <div className="bg-panelLight rounded-xl p-4 mb-3 min-h-[100px] border border-white/10">
                {transcript ? (
                  <p className="text-white text-sm leading-relaxed">{transcript}</p>
                ) : (
                  <p className="text-ash/60 text-sm italic">
                    Your answer will appear here as you speak…
                  </p>
                )}
              </div>

              <textarea
                placeholder="Or type your answer here…"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full bg-panelLight border border-white/10 rounded-xl p-4 text-white text-sm placeholder-ash/50 focus:outline-none focus:border-brass mb-3 resize-none transition"
                rows={3}
              />

              <div className="mb-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="w-full bg-brass/5 border border-brass/25 text-brass text-sm py-2 px-4 rounded-xl hover:bg-brass/10 transition flex items-center justify-center gap-2"
                >
                  {showHint ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Lightbulb className="w-4 h-4" strokeWidth={1.5} />}
                  {showHint ? 'Hide hint' : 'Show hint — I need help'}
                </button>

                {showHint && (
                  <div className="mt-3 bg-brass/5 border border-brass/15 rounded-xl p-4 animate-fadeIn">
                    <p className="text-brass text-xs font-mono uppercase tracking-wide mb-2">
                      Key points to mention
                    </p>
                    <p className="text-ash text-sm leading-relaxed">
                      {questions[currentIndex].idealAnswer || 'Think about your specific experience and give concrete examples from your work or projects.'}
                    </p>
                    {questions[currentIndex]?.tip && (
                      <div className="mt-3 pt-3 border-t border-brass/15">
                        <p className="text-brass text-xs">
                          Insider tip: {questions[currentIndex].tip}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 bg-clay/10 border border-clay/40 text-clay font-semibold py-3 rounded-xl hover:bg-clay/20 transition flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" strokeWidth={1.5} />
                    Start recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 pulse-recording bg-clay text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Square className="w-4 h-4" strokeWidth={1.5} />
                    Stop recording
                  </button>
                )}
                <button
                  onClick={submitAnswer}
                  disabled={!transcript.trim()}
                  className="flex-1 gradient-btn text-ink font-semibold py-3 rounded-xl disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" strokeWidth={2} />
                  Submit answer
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── EVALUATING ── */}
      {phase === 'evaluating' && (
        <div className="glass rounded-2xl p-8 text-center animate-fadeIn">
          <Loader2 className="w-10 h-10 text-brass animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-white text-xl font-display font-semibold">Evaluating your answer…</p>
          <p className="text-ash text-sm mt-2 font-mono">
            Analyzing clarity, relevance and confidence
          </p>
        </div>
      )}

      {/* ── FEEDBACK ── */}
      {phase === 'feedback' && currentEval && (
        <div className="glass rounded-2xl p-6 animate-fadeIn">
          <h3 className="text-white font-display font-semibold text-xl mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brass" strokeWidth={1.5} />
            Answer evaluation
          </h3>

          <div className="grid grid-cols-4 gap-4 mb-6 text-center">
            <div>
              <ScoreRing score={currentEval.overallScore} size={80} />
              <p className="text-ash text-xs mt-2 font-mono uppercase">Overall</p>
            </div>
            <div>
              <ScoreRing score={currentEval.clarityScore * 10} size={80} />
              <p className="text-ash text-xs mt-2 font-mono uppercase">Clarity</p>
            </div>
            <div>
              <ScoreRing score={currentEval.relevanceScore * 10} size={80} />
              <p className="text-ash text-xs mt-2 font-mono uppercase">Relevance</p>
            </div>
            <div>
              <ScoreRing score={currentEval.confidenceScore * 10} size={80} />
              <p className="text-ash text-xs mt-2 font-mono uppercase">Confidence</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-signal/5 border border-signal/25 rounded-xl p-4">
              <p className="text-signal text-xs font-mono uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Strengths
              </p>
              <p className="text-white text-sm">{currentEval.strengths}</p>
            </div>
            <div className="bg-brass/5 border border-brass/25 rounded-xl p-4">
              <p className="text-brass text-xs font-mono uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.5} /> Improvements
              </p>
              <p className="text-white text-sm">{currentEval.improvements}</p>
            </div>
            <div className="bg-panelLight border border-white/10 rounded-xl p-4">
              <p className="text-ash text-xs font-mono uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} /> Detailed feedback
              </p>
              <p className="text-white text-sm">{currentEval.feedback}</p>
            </div>
          </div>

          <div className="bg-panelLight rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-ash text-xs font-mono uppercase tracking-wide mb-2">Your answer</p>
            <p className="text-ash text-sm italic">"{transcript}"</p>
          </div>

          <div className="flex gap-3">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="gradient-btn text-ink font-semibold py-3 px-8 rounded-xl flex-1 flex items-center justify-center gap-2"
              >
                Next question
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
                <span className="font-mono text-xs opacity-70">({currentIndex + 2}/{questions.length})</span>
              </button>
            ) : (
              <button
                onClick={finishInterview}
                className="gradient-btn text-ink font-semibold py-3 px-8 rounded-xl flex-1 flex items-center justify-center gap-2"
              >
                Finish interview
                <Award className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── COMPLETE ── */}
      {phase === 'complete' && (
        <div className="animate-fadeIn">
          <div className="glass rounded-2xl p-8 text-center mb-6">
            <Award className="w-12 h-12 text-brass mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="font-display text-3xl font-semibold text-white mb-2">Interview complete</h2>
            <p className="text-ash">
              You completed all {answers.length} questions
              {isResumeInterview ? ' · Resume-based interview' : ` · ${setup?.company} ${setup?.round} round`}
            </p>
          </div>

          {answers.length > 0 && (
            <>
              <div className="glass rounded-2xl p-6 mb-6 text-center">
                <p className="text-ash text-sm mb-2 font-mono uppercase tracking-wide">Your overall score</p>
                <div className="text-7xl font-display font-semibold mb-2" style={{
                  background: 'linear-gradient(135deg, #C9A227, #E0C158)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {Math.round(answers.reduce((s, a) => s + (a.overallScore || 0), 0) / answers.length)}%
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-signal/5 rounded-xl p-4 border border-signal/20">
                    <div className="text-2xl font-display font-semibold text-signal">
                      {answers.filter(a => a.overallScore >= 70).length}
                    </div>
                    <div className="text-ash text-xs mt-1 font-mono uppercase">Strong answers</div>
                  </div>
                  <div className="bg-brass/5 rounded-xl p-4 border border-brass/20">
                    <div className="text-2xl font-display font-semibold text-brass">
                      {answers.filter(a => a.overallScore >= 50 && a.overallScore < 70).length}
                    </div>
                    <div className="text-ash text-xs mt-1 font-mono uppercase">Average answers</div>
                  </div>
                  <div className="bg-clay/5 rounded-xl p-4 border border-clay/20">
                    <div className="text-2xl font-display font-semibold text-clay">
                      {answers.filter(a => a.overallScore < 50).length}
                    </div>
                    <div className="text-ash text-xs mt-1 font-mono uppercase">Needs work</div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 mb-6">
                <p className="text-white font-display font-semibold mb-4">Question breakdown</p>
                <div className="space-y-3">
                  {answers.map((a, i) => (
                    <div key={i} className="bg-panelLight rounded-xl p-4 border border-white/10">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-ash text-sm flex-1">
                          <span className="text-brass font-mono font-semibold mr-2">Q{i+1}:</span>
                          {a.question}
                        </p>
                        <span className={`font-mono font-semibold text-lg flex-shrink-0 ${
                          a.overallScore >= 70 ? 'text-signal' :
                          a.overallScore >= 50 ? 'text-brass' : 'text-clay'
                        }`}>
                          {a.overallScore}%
                        </span>
                      </div>
                      <p className="text-ash/70 text-xs italic">
                        "{a.transcript?.substring(0, 100)}{a.transcript?.length > 100 ? '...' : ''}"
                      </p>
                      {a.improvements && (
                        <p className="text-brass text-xs mt-2">
                          {a.improvements?.substring(0, 120)}{a.improvements?.length > 120 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="gradient-btn text-ink font-semibold py-3 px-8 rounded-xl"
            >
              Back to dashboard
            </button>
            <button
              onClick={() => {
                setPhase('loading')
                setCurrentIndex(0)
                setAnswers([])
                setShowHint(false)
                setAvatarVideo(null)
                setAvatarText('')
                setIsSpeaking(false)
                setIsResumeInterview(false)
                loadQuestions(setup)
              }}
              className="glass text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
              Practice again
            </button>
          </div>
        </div>
      )}

      {/* ── QUIT CONFIRM MODAL ── */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-ink/80 flex items-center justify-center z-50 px-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full text-center animate-fadeIn">
            <AlertTriangle className="w-10 h-10 text-clay mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-white font-display font-semibold text-lg mb-2">Quit interview?</h3>
            <p className="text-ash text-sm mb-6">
              You've answered {answers.length} of {questions.length} questions.
              Your progress will be saved as an incomplete session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 glass text-white py-3 rounded-xl font-medium hover:bg-white/10 transition"
              >
                Keep going
              </button>
              <button
                onClick={quitInterview}
                className="flex-1 bg-clay text-white py-3 rounded-xl font-medium hover:bg-clay/90 transition"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}