import { config } from './config.js'

const buckets = new Map()

export function checkRateLimit(ipAddress) {
  const now = Date.now()
  const windowMs = config.limits.rateLimitWindowMs
  const maxRequests = config.limits.rateLimitMax
  const bucket = buckets.get(ipAddress) || []
  const recentRequests = bucket.filter(timestamp => now - timestamp < windowMs)

  if (recentRequests.length >= maxRequests) {
    buckets.set(ipAddress, recentRequests)
    const retryAfterMs = windowMs - (now - recentRequests[0])
    return {
      allowed: false,
      retryAfterMs,
    }
  }

  recentRequests.push(now)
  buckets.set(ipAddress, recentRequests)
  return {
    allowed: true,
    retryAfterMs: 0,
  }
}
