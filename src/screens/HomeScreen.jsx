import { useState, useRef } from 'react'

const SPEEDS = [
  { label: 'Slow', inhale: 3500, exhale: 3500 },
  { label: 'Normal', inhale: 2000, exhale: 2000 },
  { label: 'Fast', inhale: 1250, exhale: 1250 },
]

export default function HomeScreen({ onStart, onHistory }) {
  const [rounds, setRounds] = useState(3)
  const [breathsPerRound, setBreathsPerRound] = useState(30)
  const [speedIndex, setSpeedIndex] = useState(1) // Normal by default
  const [musicFile, setMusicFile] = useState(null)
  const fileInputRef = useRef(null)

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val))
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      setMusicFile(file)
    }
  }

  function handleRemoveMusic() {
    setMusicFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleStart() {
    const speed = SPEEDS[speedIndex]
    let musicUrl = null
    if (musicFile) {
      musicUrl = URL.createObjectURL(musicFile)
    }
    onStart({ rounds, breathsPerRound, inhaleDuration: speed.inhale, exhaleDuration: speed.exhale }, musicUrl)
  }

  return (
    <div className="screen screen-center flex-col gap-lg">
      <div className="flex-col text-center" style={{ gap: '0.5rem' }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>🌬️</div>
        <h1>Wim Hof<br />Breathing</h1>
        <p className="muted small" style={{ maxWidth: 260 }}>
          Guided breathwork for energy, focus, and calm.
        </p>
      </div>

      <div className="card flex-col gap-md w-full" style={{ maxWidth: 360 }}>
        <div className="settings-row">
          <label>Rounds</label>
          <div className="stepper">
            <button
              className="stepper-btn"
              onClick={() => setRounds(v => clamp(v - 1, 1, 10))}
            >−</button>
            <span className="stepper-value">{rounds}</span>
            <button
              className="stepper-btn"
              onClick={() => setRounds(v => clamp(v + 1, 1, 10))}
            >+</button>
          </div>
        </div>

        <div className="divider" />

        <div className="settings-row">
          <label>Breaths per round</label>
          <div className="stepper">
            <button
              className="stepper-btn"
              onClick={() => setBreathsPerRound(v => clamp(v - 5, 10, 60))}
            >−</button>
            <span className="stepper-value">{breathsPerRound}</span>
            <button
              className="stepper-btn"
              onClick={() => setBreathsPerRound(v => clamp(v + 5, 10, 60))}
            >+</button>
          </div>
        </div>

        <div className="divider" />

        <div className="settings-row">
          <label>Breath speed</label>
          <div className="speed-tabs">
            {SPEEDS.map((s, i) => (
              <button
                key={s.label}
                className={`speed-tab${speedIndex === i ? ' speed-tab-active' : ''}`}
                onClick={() => setSpeedIndex(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="settings-row">
          <label>Background music</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {musicFile ? (
              <>
                <span className="music-filename">{musicFile.name.length > 14 ? musicFile.name.slice(0, 12) + '…' : musicFile.name}</span>
                <button className="stepper-btn" onClick={handleRemoveMusic} title="Remove">✕</button>
              </>
            ) : (
              <button
                className="stepper-btn upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload music"
              >
                ＋
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      <div className="flex-col gap-md mt-auto w-full" style={{ maxWidth: 360 }}>
        <button className="btn btn-primary" onClick={handleStart}>
          Start Session
        </button>
        <button className="btn btn-ghost" onClick={onHistory}>
          View History
        </button>
      </div>
    </div>
  )
}
