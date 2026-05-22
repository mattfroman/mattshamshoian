export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

export async function fetchJsonWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    const text = await response.text()
    let json = null
    if (text) {
      json = JSON.parse(text)
    }

    if (!response.ok) {
      const message = json?.error?.message || json?.message || text || `HTTP ${response.status}`
      throw new Error(message)
    }

    return json
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TimeoutError(`Request exceeded ${timeoutMs}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
