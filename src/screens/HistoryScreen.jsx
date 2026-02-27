import { useState } from 'react'
import { loadSessions, clearSessions, formatTime, formatDate } from '../utils/storage'

export default function HistoryScreen({ onBack }) {
  const [sessions, setSessions] = useState(() => loadSessions())
  const [expanded, setExpanded] = useState(null)

  function handleClear() {
    if (window.confirm('Clear all session history?')) {
      clearSessions()
      setSessions([])
    }
  }

  return (
    <div className="screen flex-col gap-md" style={{ paddingTop: '2rem' }}>
      <div className="flex-col w-full" style={{ maxWidth: 400, gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button className="btn-ghost btn" style={{ width: 'auto', padding: '0.5rem 0' }} onClick={onBack}>
            ← Back
          </button>
          <h2>History</h2>
          <button
            className="btn-ghost btn"
            style={{ width: 'auto', padding: '0.5rem 0', color: 'var(--danger)', fontSize: '0.8rem' }}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="empty-state">No sessions yet.<br />Complete your first session to see it here.</p>
        ) : (
          <ul className="history-list">
            {sessions.map((s, i) => {
              const best = Math.max(...s.holdTimes)
              const isOpen = expanded === i
              return (
                <li
                  key={i}
                  className="history-item"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div className="history-item-header">
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                        {s.holdTimes.length} round{s.holdTimes.length !== 1 ? 's' : ''}
                      </div>
                      <div className="history-item-date">{formatDate(s.date)}</div>
                    </div>
                    <div>
                      <div className="history-item-best">★ {formatTime(best)}</div>
                      <div className="history-item-date" style={{ textAlign: 'right' }}>best hold</div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="history-rounds">
                      <div className="divider" style={{ marginTop: '0.75rem' }} />
                      {s.holdTimes.map((t, ri) => (
                        <div key={ri} className="history-round-row">
                          <span>Round {ri + 1}</span>
                          <span style={{ color: t === best ? 'var(--gold)' : 'var(--muted)' }}>
                            {formatTime(t)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
