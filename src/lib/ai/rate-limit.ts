const requestLog = new Map<string, number[]>()

export function isRateLimited(key: string, maxRequests = 20, windowMs = 60_000) {
  const now = Date.now()
  const timestamps = requestLog.get(key) ?? []
  const recent = timestamps.filter((timestamp) => now - timestamp < windowMs)

  if (recent.length >= maxRequests) {
    requestLog.set(key, recent)
    return true
  }

  recent.push(now)
  requestLog.set(key, recent)
  return false
}
