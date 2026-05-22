import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { runCouncil } from './council.js'
import { checkRateLimit } from './rateLimit.js'
import { listCouncilRuns } from './store.js'

const rootDir = join(fileURLToPath(new URL('..', import.meta.url)))
const distDir = join(rootDir, 'dist')

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

function clientIp(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown'
}

async function readJsonBody(request) {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
    if (Buffer.concat(chunks).length > 128 * 1024) {
      throw new Error('Request body is too large')
    }
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

async function serveStatic(request, response) {
  const requestUrl = new URL(request.url, 'http://localhost')
  const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname
  const safePath = normalize(pathname).replace(/^([/\\])+/, '')
  const filePath = join(distDir, safePath)

  if (!filePath.startsWith(distDir)) {
    sendJson(response, 403, { error: 'Forbidden' })
    return
  }

  try {
    const data = await readFile(filePath)
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' })
    response.end(data)
  } catch {
    const index = await readFile(join(distDir, 'index.html'))
    response.writeHead(200, { 'Content-Type': contentTypes['.html'] })
    response.end(index)
  }
}

async function handleApi(request, response) {
  const requestUrl = new URL(request.url, 'http://localhost')

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { ok: true })
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/runs') {
    sendJson(response, 200, { runs: await listCouncilRuns() })
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/council') {
    const rateLimit = checkRateLimit(clientIp(request))
    if (!rateLimit.allowed) {
      sendJson(response, 429, {
        error: 'Rate limit exceeded. Please wait before asking the council again.',
        retry_after_ms: rateLimit.retryAfterMs,
      })
      return
    }

    const body = await readJsonBody(request)
    const prompt = String(body.prompt || '').trim()

    if (!prompt) {
      sendJson(response, 400, { error: 'Prompt is required.' })
      return
    }

    if (prompt.length > config.limits.promptMaxChars) {
      sendJson(response, 400, { error: `Prompt must be ${config.limits.promptMaxChars} characters or fewer.` })
      return
    }

    const result = await runCouncil(prompt)
    sendJson(response, 200, result)
    return
  }

  sendJson(response, 404, { error: 'Not found' })
}

const server = createServer(async (request, response) => {
  const timeoutId = setTimeout(() => {
    if (!response.writableEnded) {
      sendJson(response, 504, { error: 'AI Council request timed out.' })
    }
  }, config.limits.requestTimeoutMs)

  try {
    if (request.url?.startsWith('/api/')) {
      await handleApi(request, response)
    } else {
      await serveStatic(request, response)
    }
  } catch (error) {
    if (!response.writableEnded) {
      sendJson(response, 500, { error: error.message || 'Unexpected server error' })
    }
  } finally {
    clearTimeout(timeoutId)
  }
})

server.listen(config.port, () => {
  console.log(`AI Council server listening on http://localhost:${config.port}`)
})
