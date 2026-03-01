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
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState(null)
  const bgMusicRef = useRef(null)
  const musicUrlRef = useRef(null)

  function startMusic(musicConfig) {
    stopMusic()
    if (!musicConfig) return

    if (musicConfig.type === 'spotify') {
      setSpotifyEmbedUrl(musicConfig.embedUrl)
      return
    }

    musicUrlRef.current = musicConfig.url
    const audio = new Audio(musicConfig.url)
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
    setSpotifyEmbedUrl(null)
  }

  // Clean up music on unmount
  useEffect(() => () => stopMusic(), [])

  function startSession(newSettings, musicConfig) {
    setSettings(newSettings)
    setCurrentRound(1)
    setHoldTimes([])
    startMusic(musicConfig)
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
      {spotifyEmbedUrl && (
        <div className="spotify-player-shell">
          <p className="spotify-player-note">Spotify background audio (press play once)</p>
          <iframe
            src={spotifyEmbedUrl}
            title="Spotify player"
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
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
