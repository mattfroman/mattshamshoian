import { useEffect, useMemo, useState } from 'react'

const initialProviders = [
  { provider: 'OpenAI', model: 'Configured server-side', status: 'idle', content: null, latency_ms: 0, error: null },
  { provider: 'Google Gemini', model: 'Configured server-side', status: 'idle', content: null, latency_ms: 0, error: null },
  { provider: 'Anthropic Claude', model: 'Configured server-side', status: 'idle', content: null, latency_ms: 0, error: null },
]

function statusLabel(status) {
  if (status === 'idle') return 'Waiting'
  if (status === 'pending') return 'Thinking'
  if (status === 'success') return 'Success'
  if (status === 'timeout') return 'Timed out'
  return 'Error'
}

function formatLatency(latencyMs) {
  if (!latencyMs) return '—'
  if (latencyMs < 1000) return `${latencyMs}ms`
  return `${(latencyMs / 1000).toFixed(1)}s`
}

function ModelCard({ response }) {
  return (
    <section className={`model-card model-card--${response.status}`}>
      <div className="model-card__header">
        <div>
          <h3>{response.provider}</h3>
          <p>{response.model}</p>
        </div>
        <span className="status-pill">{statusLabel(response.status)}</span>
      </div>
      <div className="model-meta">Latency: {formatLatency(response.latency_ms)}</div>
      {response.status === 'pending' && <p className="muted">Waiting for this model to respond…</p>}
      {response.content && <pre>{response.content}</pre>}
      {response.error && <p className="error-text">{response.error}</p>}
    </section>
  )
}

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [responses, setResponses] = useState(initialProviders)
  const [synthesis, setSynthesis] = useState(null)
  const [synthesisStatus, setSynthesisStatus] = useState('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stillWorking, setStillWorking] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const canSubmit = useMemo(() => prompt.trim().length > 0 && !isSubmitting, [prompt, isSubmitting])

  useEffect(() => {
    fetch('/api/runs')
      .then(response => response.ok ? response.json() : { runs: [] })
      .then(data => setHistory(data.runs || []))
      .catch(() => setHistory([]))
  }, [])

  async function askCouncil(event) {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setStillWorking(false)
    setError(null)
    setSynthesis(null)
    setSynthesisStatus('pending')
    setResponses(initialProviders.map(response => ({ ...response, status: 'pending' })))

    const workingTimer = setTimeout(() => setStillWorking(true), 25000)

    try {
      const response = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI Council request failed')
      }

      setResponses(data.responses || [])
      setSynthesis(data.synthesis || null)
      setSynthesisStatus(data.synthesis_response?.status || (data.synthesis ? 'success' : 'error'))
      setHistory(previous => [data, ...previous].slice(0, 10))
    } catch (requestError) {
      setError(requestError.message)
      setResponses(initialProviders)
      setSynthesisStatus('error')
    } finally {
      clearTimeout(workingTimer)
      setStillWorking(false)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">MVP</p>
        <h1>AI Council</h1>
        <p className="hero-copy">
          Submit one prompt. OpenAI, Gemini, and Claude answer in parallel. Claude then synthesizes the strongest final answer with agreements, disagreements, and uncertainty called out.
        </p>
      </section>

      <form className="prompt-panel" onSubmit={askCouncil}>
        <label htmlFor="prompt">Your prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={event => setPrompt(event.target.value)}
          placeholder="Ask a question that would benefit from multiple expert perspectives…"
          rows={7}
          maxLength={6000}
        />
        <div className="prompt-actions">
          <span>{prompt.length}/6000 characters</span>
          <button type="submit" disabled={!canSubmit}>{isSubmitting ? 'Asking council…' : 'Ask the council'}</button>
        </div>
        {stillWorking && <div className="working-banner">Still working… some providers can take up to about 90 seconds.</div>}
        {error && <div className="error-banner">{error}</div>}
      </form>

      <section className="response-grid" aria-live="polite">
        {responses.map(response => <ModelCard key={response.provider} response={response} />)}
      </section>

      <section className={`synthesis-panel synthesis-panel--${synthesisStatus}`}>
        <div className="synthesis-panel__header">
          <div>
            <p className="eyebrow">Claude synthesis</p>
            <h2>Final answer</h2>
          </div>
          <span className="status-pill">{statusLabel(synthesisStatus)}</span>
        </div>
        {synthesisStatus === 'pending' && <p className="muted">Claude will compare the returned model responses after they finish.</p>}
        {synthesis ? <pre>{synthesis}</pre> : synthesisStatus === 'error' && <p className="error-text">Synthesis unavailable. Raw model responses are shown above.</p>}
      </section>

      {history.length > 0 && (
        <section className="history-panel">
          <h2>Recent council runs</h2>
          <div className="history-list">
            {history.map(run => (
              <article key={run.id}>
                <p>{run.prompt}</p>
                <span>{new Date(run.created_at).toLocaleString()} · {run.responses?.filter(item => item.status === 'success').length || 0}/3 successful</span>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
