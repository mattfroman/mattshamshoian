import { useState, useEffect, useRef } from 'react'
import { playInhaleSound, playExhaleSound, speakCue } from '../utils/sounds'

export default function BreathingScreen({ round, totalRounds, breathsPerRound, inhaleDuration, exhaleDuration, onDone }) {
  const INHALE = inhaleDuration || 2000
  const EXHALE = exhaleDuration || 2000

  // breathCount = number of completed breath cycles
  const [breathCount, setBreathCount] = useState(0)
  // phase: 'inhale' | 'exhale' | 'done'
  const [phase, setPhase] = useState('inhale')
  const timerRef = useRef(null)
  const spokenRef = useRef({ ten: false, last: false })

  function clear() { clearTimeout(timerRef.current) }

  // Play sound on each phase change
  useEffect(() => {
    if (phase === 'inhale') playInhaleSound(INHALE)
    else if (phase === 'exhale') playExhaleSound(EXHALE)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Breathing state machine
  useEffect(() => {
    if (phase === 'done') return

    if (phase === 'inhale') {
      timerRef.current = setTimeout(() => setPhase('exhale'), INHALE)
      return clear
    }

    // phase === 'exhale'
    timerRef.current = setTimeout(() => {
      const completed = breathCount + 1

      if (completed >= breathsPerRound) {
        // All breaths done — stop cycling, speak cue, transition
        setPhase('done')
        speakCue('Breathe in... and hold.', () => setTimeout(onDone, 500))
        return
      }

      // Fire voice cues right before the next inhale
      const remaining = breathsPerRound - completed
      if (remaining === 10 && !spokenRef.current.ten) {
        spokenRef.current.ten = true
        speakCue('Ten breaths left')
      } else if (remaining === 1 && !spokenRef.current.last) {
        spokenRef.current.last = true
        speakCue('Last breath')
      }

      setBreathCount(completed)
      setPhase('inhale')
    }, EXHALE)

    return clear
  }, [phase, breathCount, breathsPerRound, INHALE, EXHALE, onDone])

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
          className={`breath-circle ${phase === 'inhale' ? 'inhaling' : phase === 'exhale' ? 'exhaling' : ''}`}
          style={{
            '--inhale-dur': `${INHALE}ms`,
            '--exhale-dur': `${EXHALE}ms`,
          }}
        >
          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>
            {phase === 'inhale' ? 'Inhale' : phase === 'exhale' ? 'Exhale' : '...'}
          </span>
        </div>
      </div>

      <p className="text-center" style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
        {phase === 'inhale' ? 'Breathe in…' : phase === 'exhale' ? 'Breathe out…' : 'Hold…'}
      </p>

      <p className="muted small text-center" style={{ maxWidth: 260 }}>
        Breathe deeply and rhythmically. Let your belly expand on each inhale.
      </p>
    </div>
  )
}
