import { useState, useEffect, useRef } from 'react'

export default function RetentionScreen({ round, totalRounds, onDone }) {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  function handleRelease() {
    clearInterval(intervalRef.current)
    onDone(seconds)
  }

  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const display = `${m}:${String(s).padStart(2, '0')}`

  return (
    <div className="screen screen-center flex-col gap-md">
      <div className="flex-col text-center" style={{ gap: '0.25rem' }}>
        <div className="round-badge">Round {round} of {totalRounds}</div>
        <h2>Breath Hold</h2>
      </div>

      {/* Tappable center circle */}
      <button className="retention-circle" onClick={handleRelease} aria-label="Tap to release">
        <span className="retention-timer">{display}</span>
        <span className="retention-tap-hint">tap to release</span>
      </button>

      <div className="flex-col text-center gap-sm" style={{ maxWidth: 280 }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
          Hold your breath. Tap the circle when you need to breathe.
        </p>
        <p className="muted small">
          Relax your body. Hold as long as feels comfortable.
        </p>
      </div>
    </div>
  )
}
