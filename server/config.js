import { existsSync, readFileSync } from 'node:fs'

function loadDotEnv() {
  if (!existsSync('.env')) return

  const lines = readFileSync('.env', 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue

    const key = trimmed.slice(0, equalsIndex).trim()
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

export const config = {
  port: Number(process.env.PORT || 8787),
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
    synthesisModel: process.env.ANTHROPIC_SYNTHESIS_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
  },
  limits: {
    promptMaxChars: Number(process.env.PROMPT_MAX_CHARS || 6000),
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 90000),
    providerTimeoutMs: Number(process.env.PROVIDER_TIMEOUT_MS || 60000),
    synthesisTimeoutMs: Number(process.env.SYNTHESIS_TIMEOUT_MS || 25000),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 5),
  },
  persistence: {
    file: process.env.COUNCIL_STORE_FILE || new URL('./data/council-runs.json', import.meta.url).pathname,
  },
}
