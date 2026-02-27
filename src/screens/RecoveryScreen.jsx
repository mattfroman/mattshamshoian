import { useState, useEffect } from 'react'

const HOLD_SECONDS = 15
const CIRCUMFERENCE = 2 * Math.PI * 54 // r=54

export default function RecoveryScreen({ round, totalRounds, onDone }) {
  const [timeLeft, setTimeLeft] = useState(HOLD_SECONDS)

  useEffect(() => {
    if (timeLeft <= 0) {
      onDone()
      return
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, onDone])

  const progress = timeLeft / HOLD_SECONDS
  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="screen screen-center flex-col gap-md">
      <div className="flex-col text-center" style={{ gap: '0.25rem' }}>
        <div className="round-badge">Round {round} of {totalRounds}</div>
        <h2>Recovery Breath</h2>
      </div>

      <div className="countdown-wrap">
        <svg width="160" height="160" viewBox="0 0 120 120">
          <circle className="countdown-track" cx="60" cy="60" r="54" />
          <circle
            className="countdown-bar"
            cx="60"
            cy="60"
            r="54"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="countdown-text">{timeLeft}</div>
      </div>

      <div className="flex-col text-center gap-sm" style={{ maxWidth: 280 }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
          Take a deep breath in and hold.
        </p>
        <p className="muted small">
          Fill your lungs completely and hold for {HOLD_SECONDS} seconds.
          This resets your CO₂ levels.
        </p>
      </div>

      <div className="mt-auto w-full flex-col" style={{ maxWidth: 360 }}>
        <button className="btn btn-ghost" onClick={onDone}>
          Skip
        </button>
      </div>
    </div>
  )
}
