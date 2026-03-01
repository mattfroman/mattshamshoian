import { useState, useEffect, useRef } from 'react'
import { playInhaleSound, playExhaleSound, speakCue } from '../utils/sounds'

export default function BreathingScreen({ round, totalRounds, breathsPerRound, inhaleDuration, exhaleDuration, onDone }) {
  const INHALE = inhaleDuration || 2000
  const EXHALE = exhaleDuration || 2000

  const [breathCount, setBreathCount] = useState(0)
  const [phase, setPhase] = useState('inhale')
  const timerRef = useRef(null)
  const doneTimerRef = useRef(null)
  const doneRef = useRef(false)
  const spokenRef = useRef({ ten: false, last: false })

  // Keep onDone in a ref so we never need it in a dependency array
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  // Cleanup both timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(doneTimerRef.current)
    }
  }, [])

  // Play sound on phase change
  useEffect(() => {
    if (phase === 'inhale') playInhaleSound(INHALE)
    else if (phase === 'exhale') playExhaleSound(EXHALE)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Breathing state machine — no onDone in deps (use ref instead)
  useEffect(() => {
    if (phase === 'done') return

    if (phase === 'inhale') {
      timerRef.current = setTimeout(() => setPhase('exhale'), INHALE)
      return () => clearTimeout(timerRef.current)
    }

    // phase === 'exhale'
    timerRef.current = setTimeout(() => {
      const completed = breathCount + 1

      if (completed >= breathsPerRound) {
        // Stop the loop immediately
        setPhase('done')
        // Speak the cue — fire and forget, do NOT rely on onend (broken on mobile)
        speakCue('Breathe in... and hold.')
        // Always transition after a fixed delay, regardless of speech
        doneTimerRef.current = setTimeout(() => {
          if (!doneRef.current) {
            doneRef.current = true
            onDoneRef.current()
          }
        }, 2200)
        return
      }

      // Voice cues before the next inhale
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

    return () => clearTimeout(timerRef.current)
  }, [phase, breathCount, breathsPerRound, INHALE, EXHALE]) // eslint-disable-line react-hooks/exhaustive-deps

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
