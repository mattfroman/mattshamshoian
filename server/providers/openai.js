import { config } from '../config.js'
import { fetchJsonWithTimeout, TimeoutError } from './http.js'
import { errorResponse, successResponse } from './schema.js'

export function createOpenAIProvider() {
  const provider = 'OpenAI'
  const model = config.openai.model

  return {
    provider,
    model,
    async complete(prompt, timeoutMs = config.limits.providerTimeoutMs) {
      const startedAt = Date.now()
      if (!config.openai.apiKey) {
        return errorResponse(provider, model, 'Missing OPENAI_API_KEY', startedAt)
      }

      try {
        const json = await fetchJsonWithTimeout('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are a careful, concise expert assistant. Answer the user directly and note uncertainty when relevant.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.2,
          }),
        }, timeoutMs)

        return successResponse(provider, model, json?.choices?.[0]?.message?.content?.trim(), startedAt)
      } catch (error) {
        return errorResponse(provider, model, error, startedAt, error instanceof TimeoutError ? 'timeout' : 'error')
      }
    },
  }
}
