'use client'
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowPrompt(true), 3000)
    })
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-fadeIn">
      <div className="glass rounded-2xl p-4 flex items-center gap-4 max-w-sm mx-auto border border-purple-500/30">
        <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center text-2xl flex-shrink-0">
          🎤
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Install MockAI</p>
          <p className="text-gray-400 text-xs">Add to home screen for quick access</p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={handleInstall}
            className="gradient-btn text-white text-xs font-semibold py-2 px-4 rounded-lg">
            Install
          </button>
          <button onClick={() => setShowPrompt(false)}
            className="text-gray-500 text-xs text-center hover:text-gray-300">
            Later
          </button>
        </div>
      </div>
    </div>
  )
}