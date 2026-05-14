import { config } from '../config.js'
import { fetchJsonWithTimeout, TimeoutError } from './http.js'
import { errorResponse, successResponse } from './schema.js'

function extractGeminiText(json) {
  return json?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('\n')
    .trim()
}

export function createGeminiProvider() {
  const provider = 'Google Gemini'
  const model = config.gemini.model

  return {
    provider,
    model,
    async complete(prompt, timeoutMs = config.limits.providerTimeoutMs) {
      const startedAt = Date.now()
      if (!config.gemini.apiKey) {
        return errorResponse(provider, model, 'Missing GEMINI_API_KEY', startedAt)
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.gemini.apiKey)}`
        const json = await fetchJsonWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
            },
          }),
        }, timeoutMs)

        return successResponse(provider, model, extractGeminiText(json), startedAt)
      } catch (error) {
        return errorResponse(provider, model, error, startedAt, error instanceof TimeoutError ? 'timeout' : 'error')
      }
    },
  }
}
