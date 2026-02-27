let audioCtx = null

function getAudioContext() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function makeBreathSound(ctx, durationSec, freqStart, freqEnd, gainPeak) {
  const bufferSize = Math.ceil(ctx.sampleRate * durationSec)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(freqStart, ctx.currentTime)
  filter.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + durationSec)

  const gain = ctx.createGain()
  const fadeTime = Math.min(0.15, durationSec * 0.1)
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + fadeTime)
  gain.gain.setValueAtTime(gainPeak, ctx.currentTime + durationSec - fadeTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
  source.stop(ctx.currentTime + durationSec)
  return source
}

export function playInhaleSound(durationMs) {
  try {
    const ctx = getAudioContext()
    makeBreathSound(ctx, durationMs / 1000, 180, 700, 0.18)
  } catch (e) {
    // Audio not available — silently ignore
  }
}

export function playExhaleSound(durationMs) {
  try {
    const ctx = getAudioContext()
    makeBreathSound(ctx, durationMs / 1000, 650, 180, 0.14)
  } catch (e) {
    // Audio not available — silently ignore
  }
}

export function speakCue(text, onEnd) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) setTimeout(onEnd, 2500)
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.78
  utterance.pitch = 0.95
  utterance.volume = 1
  if (onEnd) utterance.onend = onEnd
  window.speechSynthesis.speak(utterance)
}
