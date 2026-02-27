const KEY = 'wim_hof_sessions'

export function loadSessions() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSession(session) {
  // session: { date: ISO string, holdTimes: number[] }
  const sessions = loadSessions()
  sessions.unshift(session) // newest first
  localStorage.setItem(KEY, JSON.stringify(sessions))
}

export function clearSessions() {
  localStorage.removeItem(KEY)
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`
  return `${s}s`
}

export function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
