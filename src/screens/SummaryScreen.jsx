import { saveSession, formatTime } from '../utils/storage'

export default function SummaryScreen({ holdTimes, onSave }) {
  const bestIdx = holdTimes.indexOf(Math.max(...holdTimes))

  function handleSave() {
    saveSession({
      date: new Date().toISOString(),
      holdTimes,
    })
    onSave()
  }

  const totalSeconds = holdTimes.reduce((a, b) => a + b, 0)
  const avg = holdTimes.length > 0 ? Math.round(totalSeconds / holdTimes.length) : 0

  return (
    <div className="screen flex-col gap-md" style={{ paddingTop: '3rem' }}>
      <div className="flex-col text-center" style={{ gap: '0.5rem' }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>✨</div>
        <h1>Session Complete</h1>
        <p className="muted small">
          {holdTimes.length} round{holdTimes.length !== 1 ? 's' : ''} · avg hold {formatTime(avg)}
        </p>
      </div>

      <ul className="hold-list w-full" style={{ maxWidth: 360 }}>
        {holdTimes.map((t, i) => (
          <li key={i} className={`hold-item ${i === bestIdx ? 'best' : ''}`}>
            <span className="label">
              Round {i + 1}
              {i === bestIdx && holdTimes.length > 1 && (
                <span style={{ marginLeft: '0.4rem', color: 'var(--gold)' }}>★ Best</span>
              )}
            </span>
            <span className="time">{formatTime(t)}</span>
          </li>
        ))}
      </ul>

      <div
        className="card w-full text-center flex-col gap-sm"
        style={{ maxWidth: 360 }}
      >
        <p className="small muted">Best hold time</p>
        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold)' }}>
          {formatTime(Math.max(...holdTimes))}
        </p>
      </div>

      <div className="mt-auto w-full flex-col" style={{ maxWidth: 360, gap: '0.75rem' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          Save & Finish
        </button>
      </div>
    </div>
  )
}
