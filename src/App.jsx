import { useState, useRef, useEffect } from 'react'
import HomeScreen from './screens/HomeScreen'
import BreathingScreen from './screens/BreathingScreen'
import RetentionScreen from './screens/RetentionScreen'
import RecoveryScreen from './screens/RecoveryScreen'
import SummaryScreen from './screens/SummaryScreen'
import HistoryScreen from './screens/HistoryScreen'

// Screens: 'home' | 'breathing' | 'retention' | 'recovery' | 'summary' | 'history'
export default function App() {
  const [screen, setScreen] = useState('home')
  const [settings, setSettings] = useState({ rounds: 3, breathsPerRound: 30, inhaleDuration: 2000, exhaleDuration: 2000 })
  const [currentRound, setCurrentRound] = useState(1)
  const [holdTimes, setHoldTimes] = useState([])
  const bgMusicRef = useRef(null)
  const musicUrlRef = useRef(null)

  function startMusic(musicUrl) {
    stopMusic()
    if (!musicUrl) return
    musicUrlRef.current = musicUrl
    const audio = new Audio(musicUrl)
    audio.loop = true
    audio.volume = 0.3
    audio.play().catch(() => {})
    bgMusicRef.current = audio
  }

  function stopMusic() {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause()
      bgMusicRef.current = null
    }
    if (musicUrlRef.current) {
      URL.revokeObjectURL(musicUrlRef.current)
      musicUrlRef.current = null
    }
  }

  // Clean up music on unmount
  useEffect(() => () => stopMusic(), [])

  function startSession(newSettings, musicUrl) {
    setSettings(newSettings)
    setCurrentRound(1)
    setHoldTimes([])
    startMusic(musicUrl)
    setScreen('breathing')
  }

  function onBreathingDone() {
    setScreen('retention')
  }

  function onRetentionDone(seconds) {
    setHoldTimes(prev => [...prev, seconds])
    setScreen('recovery')
  }

  function onRecoveryDone() {
    if (currentRound < settings.rounds) {
      setCurrentRound(r => r + 1)
      setScreen('breathing')
    } else {
      setScreen('summary')
    }
  }

  function onSessionSaved() {
    stopMusic()
    setScreen('home')
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          onStart={startSession}
          onHistory={() => setScreen('history')}
        />
      )}
      {screen === 'breathing' && (
        <BreathingScreen
          round={currentRound}
          totalRounds={settings.rounds}
          breathsPerRound={settings.breathsPerRound}
          inhaleDuration={settings.inhaleDuration}
          exhaleDuration={settings.exhaleDuration}
          onDone={onBreathingDone}
        />
      )}
      {screen === 'retention' && (
        <RetentionScreen
          round={currentRound}
          totalRounds={settings.rounds}
          onDone={onRetentionDone}
        />
      )}
      {screen === 'recovery' && (
        <RecoveryScreen
          round={currentRound}
          totalRounds={settings.rounds}
          onDone={onRecoveryDone}
        />
      )}
      {screen === 'summary' && (
        <SummaryScreen
          holdTimes={holdTimes}
          onSave={onSessionSaved}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen onBack={() => setScreen('home')} />
      )}
    </div>
  )
}
