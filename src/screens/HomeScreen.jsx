import { useState } from 'react'

export default function HomeScreen({ onStart, onHistory }) {
  const [rounds, setRounds] = useState(3)
  const [breathsPerRound, setBreathsPerRound] = useState(30)

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val))
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
      </div>

      <div className="flex-col gap-md mt-auto w-full" style={{ maxWidth: 360 }}>
        <button
          className="btn btn-primary"
          onClick={() => onStart({ rounds, breathsPerRound })}
        >
          Start Session
        </button>
        <button className="btn btn-ghost" onClick={onHistory}>
          View History
        </button>
      </div>
    </div>
  )
}
