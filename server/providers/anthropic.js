import { config } from '../config.js'
import { fetchJsonWithTimeout, TimeoutError } from './http.js'
import { errorResponse, successResponse } from './schema.js'

function extractClaudeText(json) {
  return json?.content
    ?.filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n')
    .trim()
}

async function callClaude({ prompt, system, model, timeoutMs, maxTokens = 1600 }) {
  return fetchJsonWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.anthropic.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  }, timeoutMs)
}

export function createAnthropicProvider() {
  const provider = 'Anthropic Claude'
  const model = config.anthropic.model

  return {
    provider,
    model,
    async complete(prompt, timeoutMs = config.limits.providerTimeoutMs) {
      const startedAt = Date.now()
      if (!config.anthropic.apiKey) {
        return errorResponse(provider, model, 'Missing ANTHROPIC_API_KEY', startedAt)
      }

      try {
        const json = await callClaude({
          prompt,
          system: 'You are a careful, concise expert assistant. Answer the user directly and note uncertainty when relevant.',
          model,
          timeoutMs,
        })

        return successResponse(provider, model, extractClaudeText(json), startedAt)
      } catch (error) {
        return errorResponse(provider, model, error, startedAt, error instanceof TimeoutError ? 'timeout' : 'error')
      }
    },
  }
}

export async function synthesizeWithClaude({ prompt, responses, timeoutMs = config.limits.synthesisTimeoutMs }) {
  const startedAt = Date.now()
  const provider = 'Anthropic Claude'
  const model = config.anthropic.synthesisModel

  if (!config.anthropic.apiKey) {
    return errorResponse(provider, model, 'Missing ANTHROPIC_API_KEY for synthesis', startedAt)
  }

  const councilResponses = responses.map(response => {
    const content = response.content || `[${response.status.toUpperCase()}] ${response.error || 'No content returned.'}`
    return `Provider: ${response.provider}\nModel: ${response.model}\nStatus: ${response.status}\nLatency: ${response.latency_ms}ms\nResponse:\n${content}`
  }).join('\n\n---\n\n')

  const synthesisPrompt = `Original user prompt:\n${prompt}\n\nCouncil model responses:\n${councilResponses}\n\nCreate the final AI Council synthesis.`
  const system = `You synthesize answers from multiple AI models. Do not blindly average them.\n\nYour response must:\n- Identify what the models agree on.\n- Identify meaningful disagreements.\n- Note missing context, ambiguity, or uncertainty.\n- Produce the strongest clear final answer.\n- Explicitly mention any provider response that timed out or failed.\n- Prefer correctness and useful caveats over consensus when a response appears weak.`

  try {
    const json = await callClaude({
      prompt: synthesisPrompt,
      system,
      model,
      timeoutMs,
      maxTokens: 2200,
    })

    return successResponse(provider, model, extractClaudeText(json), startedAt)
  } catch (error) {
    return errorResponse(provider, model, error, startedAt, error instanceof TimeoutError ? 'timeout' : 'error')
  }
}
