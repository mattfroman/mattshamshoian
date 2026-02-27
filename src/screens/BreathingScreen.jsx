import { useState, useEffect, useRef } from 'react'

const INHALE_DURATION = 2000  // ms
const EXHALE_DURATION = 2000  // ms

export default function BreathingScreen({ round, totalRounds, breathsPerRound, onDone }) {
  const [breathCount, setBreathCount] = useState(0)
  const [phase, setPhase] = useState('inhale') // 'inhale' | 'exhale'
  const timerRef = useRef(null)

  useEffect(() => {
    function tick() {
      if (phase === 'inhale') {
        timerRef.current = setTimeout(() => {
          setPhase('exhale')
        }, INHALE_DURATION)
      } else {
        timerRef.current = setTimeout(() => {
          setBreathCount(prev => {
            const next = prev + 1
            if (next >= breathsPerRound) {
              return prev // handled below
            }
            return next
          })
          setPhase('inhale')
        }, EXHALE_DURATION)
      }
    }
    tick()
    return () => clearTimeout(timerRef.current)
  }, [phase, breathsPerRound])

  // When breathCount reaches breathsPerRound, advance
  useEffect(() => {
    if (breathCount >= breathsPerRound) {
      clearTimeout(timerRef.current)
      // small delay so last exhale animation finishes
      const t = setTimeout(onDone, EXHALE_DURATION)
      return () => clearTimeout(t)
    }
  }, [breathCount, breathsPerRound, onDone])

  const progress = breathCount / breathsPerRound

  return (
    <div className="screen screen-center flex-col gap-md">
      <div className="flex-col w-full" style={{ maxWidth: 360, gap: '0.25rem' }}>
        <div className="round-badge">Round {round} of {totalRounds}</div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="small muted text-center">
          {breathCount} / {breathsPerRound} breaths
        </p>
      </div>

      <div className="breath-circle-wrap">
        <div
          className={`breath-circle ${phase === 'inhale' ? 'inhaling' : 'exhaling'}`}
          style={{
            '--inhale-dur': `${INHALE_DURATION}ms`,
            '--exhale-dur': `${EXHALE_DURATION}ms`,
          }}
        >
          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>
            {phase === 'inhale' ? 'Inhale' : 'Exhale'}
          </span>
        </div>
      </div>

      <p
        className="text-center"
        style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        {phase === 'inhale' ? 'Breathe in…' : 'Breathe out…'}
      </p>

      <p className="muted small text-center" style={{ maxWidth: 260 }}>
        Breathe deeply and rhythmically. Let your belly expand on each inhale.
      </p>
    </div>
  )
}
