import { useState, useEffect, useRef } from 'react'
import { playInhaleSound, playExhaleSound, speakCue } from '../utils/sounds'

export default function BreathingScreen({ round, totalRounds, breathsPerRound, inhaleDuration, exhaleDuration, onDone }) {
  const INHALE_DURATION = inhaleDuration || 2000
  const EXHALE_DURATION = exhaleDuration || 2000

  const [breathCount, setBreathCount] = useState(0)
  const [phase, setPhase] = useState('inhale')
  const timerRef = useRef(null)
  const doneCalledRef = useRef(false)

  // Play sound whenever phase changes
  useEffect(() => {
    if (phase === 'inhale') {
      playInhaleSound(INHALE_DURATION)
    } else {
      playExhaleSound(EXHALE_DURATION)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

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
              return prev
            }
            return next
          })
          setPhase('inhale')
        }, EXHALE_DURATION)
      }
    }
    tick()
    return () => clearTimeout(timerRef.current)
  }, [phase, breathsPerRound, INHALE_DURATION, EXHALE_DURATION])

  // When breathCount reaches breathsPerRound, speak cue then advance
  useEffect(() => {
    if (breathCount >= breathsPerRound && !doneCalledRef.current) {
      doneCalledRef.current = true
      clearTimeout(timerRef.current)
      // Short pause, then speak voice cue, then transition
      const t = setTimeout(() => {
        speakCue('Breathe in... and hold.', () => {
          setTimeout(onDone, 400)
        })
      }, 600)
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
