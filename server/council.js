import { randomUUID } from 'node:crypto'
import { config } from './config.js'
import { createAnthropicProvider, synthesizeWithClaude } from './providers/anthropic.js'
import { createGeminiProvider } from './providers/gemini.js'
import { createOpenAIProvider } from './providers/openai.js'
import { saveCouncilRun } from './store.js'

const providers = [
  createOpenAIProvider(),
  createGeminiProvider(),
  createAnthropicProvider(),
]

function timeoutResponse(provider, startedAt, timeoutMs) {
  return {
    provider: provider.provider,
    model: provider.model,
    status: 'timeout',
    content: null,
    latency_ms: Date.now() - startedAt,
    error: `Provider did not complete within ${timeoutMs}ms`,
  }
}

function withProviderTimeout(provider, prompt, timeoutMs) {
  const startedAt = Date.now()
  return Promise.race([
    provider.complete(prompt, timeoutMs),
    new Promise(resolve => {
      setTimeout(() => resolve(timeoutResponse(provider, startedAt, timeoutMs)), timeoutMs + 100)
    }),
  ])
}

export async function runCouncil(prompt) {
  const startedAt = new Date()
  const runId = randomUUID()

  const responses = await Promise.all(
    providers.map(provider => withProviderTimeout(provider, prompt, config.limits.providerTimeoutMs)),
  )

  const successfulResponses = responses.filter(response => response.status === 'success' && response.content)
  let synthesis = {
    provider: 'Anthropic Claude',
    model: config.anthropic.synthesisModel,
    status: 'error',
    content: null,
    latency_ms: 0,
    error: 'Synthesis unavailable.',
  }

  if (successfulResponses.length >= 2) {
    synthesis = await synthesizeWithClaude({
      prompt,
      responses,
      timeoutMs: config.limits.synthesisTimeoutMs,
    })
  } else if (successfulResponses.length === 1) {
    synthesis.error = 'Synthesis unavailable: at least two successful model responses are needed.'
  } else {
    synthesis.error = 'Synthesis unavailable: no model responses succeeded.'
  }

  const completedAt = new Date()
  const run = {
    id: runId,
    prompt,
    responses,
    synthesis: synthesis.status === 'success' ? synthesis.content : null,
    synthesis_response: synthesis,
    created_at: startedAt.toISOString(),
    completed_at: completedAt.toISOString(),
    duration_ms: completedAt.getTime() - startedAt.getTime(),
  }

  await saveCouncilRun(run)

  return run
}
