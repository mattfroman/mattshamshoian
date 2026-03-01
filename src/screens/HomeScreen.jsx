import { useState, useRef } from 'react'

const SPEEDS = [
  { label: 'Slow', inhale: 3500, exhale: 3500 },
  { label: 'Normal', inhale: 2000, exhale: 2000 },
  { label: 'Fast', inhale: 1250, exhale: 1250 },
]

const MUSIC_SOURCES = {
  upload: 'upload',
  spotify: 'spotify',
}

function toSpotifyEmbedUrl(input) {
  if (!input) return null
  const raw = input.trim()
  if (!raw) return null

  const trackMatch = raw.match(/spotify\.com\/track\/([A-Za-z0-9]+)/)
  const uriMatch = raw.match(/^spotify:track:([A-Za-z0-9]+)$/)
  const id = trackMatch?.[1] || uriMatch?.[1]

  if (!id) return null
  return `https://open.spotify.com/embed/track/${id}?utm_source=generator`
}

export default function HomeScreen({ onStart, onHistory }) {
  const [rounds, setRounds] = useState(3)
  const [breathsPerRound, setBreathsPerRound] = useState(30)
  const [speedIndex, setSpeedIndex] = useState(1) // Normal by default
  const [musicSource, setMusicSource] = useState(MUSIC_SOURCES.upload)
  const [musicFile, setMusicFile] = useState(null)
  const [spotifyTrackInput, setSpotifyTrackInput] = useState('')
  const [spotifyError, setSpotifyError] = useState('')
  const fileInputRef = useRef(null)

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val))
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      setMusicFile(file)
    }
  }

  function handleRemoveMusic() {
    setMusicFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleMusicSourceChange(nextSource) {
    setMusicSource(nextSource)
    setSpotifyError('')
  }

  function handleStart() {
    const speed = SPEEDS[speedIndex]
    let musicConfig = null

    if (musicSource === MUSIC_SOURCES.upload && musicFile) {
      musicConfig = { type: MUSIC_SOURCES.upload, url: URL.createObjectURL(musicFile) }
    }

    if (musicSource === MUSIC_SOURCES.spotify && spotifyTrackInput.trim()) {
      const embedUrl = toSpotifyEmbedUrl(spotifyTrackInput)
      if (!embedUrl) {
        setSpotifyError('Enter a valid Spotify track URL or URI.')
        return
      }
      musicConfig = { type: MUSIC_SOURCES.spotify, embedUrl }
    }

    onStart({ rounds, breathsPerRound, inhaleDuration: speed.inhale, exhaleDuration: speed.exhale }, musicConfig)
  }

  return (
    <div className="screen screen-center flex-col gap-lg">
      <div className="flex-col text-center" style={{ gap: '0.5rem' }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>🌬️</div>
        <h1>Wim Hof<br />Breathing</h1>
        <p className="muted small" style={{ maxWidth: 260 }}>
          Guided breathwork for energy, focus, and calm.
        </p>
      </div>

      <div className="card flex-col gap-md w-full" style={{ maxWidth: 360 }}>
        <div className="settings-row">
          <label>Rounds</label>
          <div className="stepper">
            <button
              className="stepper-btn"
              onClick={() => setRounds(v => clamp(v - 1, 1, 10))}
            >−</button>
            <span className="stepper-value">{rounds}</span>
            <button
              className="stepper-btn"
              onClick={() => setRounds(v => clamp(v + 1, 1, 10))}
            >+</button>
          </div>
        </div>

        <div className="divider" />

        <div className="settings-row">
          <label>Breaths per round</label>
          <div className="stepper">
            <button
              className="stepper-btn"
              onClick={() => setBreathsPerRound(v => clamp(v - 5, 10, 60))}
            >−</button>
            <span className="stepper-value">{breathsPerRound}</span>
            <button
              className="stepper-btn"
              onClick={() => setBreathsPerRound(v => clamp(v + 5, 10, 60))}
            >+</button>
          </div>
        </div>

        <div className="divider" />

        <div className="settings-row">
          <label>Breath speed</label>
          <div className="speed-tabs">
            {SPEEDS.map((s, i) => (
              <button
                key={s.label}
                className={`speed-tab${speedIndex === i ? ' speed-tab-active' : ''}`}
                onClick={() => setSpeedIndex(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="music-settings">
          <div className="settings-row">
            <label>Background music</label>
            <div className="speed-tabs">
              <button
                className={`speed-tab${musicSource === MUSIC_SOURCES.upload ? ' speed-tab-active' : ''}`}
                onClick={() => handleMusicSourceChange(MUSIC_SOURCES.upload)}
              >
                Upload
              </button>
              <button
                className={`speed-tab${musicSource === MUSIC_SOURCES.spotify ? ' speed-tab-active' : ''}`}
                onClick={() => handleMusicSourceChange(MUSIC_SOURCES.spotify)}
              >
                Spotify
              </button>
            </div>
          </div>

          {musicSource === MUSIC_SOURCES.upload ? (
            <div className="music-row">
              {musicFile ? (
                <>
                  <span className="music-filename">{musicFile.name.length > 20 ? musicFile.name.slice(0, 18) + '…' : musicFile.name}</span>
                  <button className="stepper-btn" onClick={handleRemoveMusic} title="Remove">✕</button>
                </>
              ) : (
                <>
                  <button
                    className="stepper-btn upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload music"
                  >
                    ＋
                  </button>
                  <span className="small muted">Optional</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="spotify-input-wrap">
              <input
                className="spotify-input"
                type="text"
                placeholder="Paste Spotify track URL"
                value={spotifyTrackInput}
                onChange={(e) => {
                  setSpotifyTrackInput(e.target.value)
                  if (spotifyError) setSpotifyError('')
                }}
              />
              <p className="small muted">Use a track link like spotify.com/track/...</p>
              {spotifyError && <p className="small spotify-error">{spotifyError}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="flex-col gap-md mt-auto w-full" style={{ maxWidth: 360 }}>
        <button className="btn btn-primary" onClick={handleStart}>
          Start Session
        </button>
        <button className="btn btn-ghost" onClick={onHistory}>
          View History
        </button>
      </div>
    </div>
  )
}
