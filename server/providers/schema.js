export function successResponse(provider, model, content, startedAt) {
  return {
    provider,
    model,
    status: 'success',
    content: content || '',
    latency_ms: Date.now() - startedAt,
    error: null,
  }
}

export function errorResponse(provider, model, error, startedAt, status = 'error') {
  return {
    provider,
    model,
    status,
    content: null,
    latency_ms: Date.now() - startedAt,
    error: error instanceof Error ? error.message : String(error),
  }
}
