/**
 * Best-effort per-process rate limiter for deployments without a shared store.
 * In serverless/multi-instance production, replace with a shared Redis/Upstash limiter.
 */
type Entry = { count: number; resetAt: number };
const globalForRateLimit = globalThis as typeof globalThis & {
  __hazemRateLimit?: Map<string, Entry>;
};
const buckets = globalForRateLimit.__hazemRateLimit ?? new Map<string, Entry>();
globalForRateLimit.__hazemRateLimit = buckets;

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Bound memory use if a large number of unique keys are observed.
    if (buckets.size > 10_000) {
      for (const [entryKey, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(entryKey);
      }
      if (buckets.size > 10_000) buckets.clear();
    }
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }
  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

export function getRequestClientKey(request: Request) {
  // Prefer the platform-provided client IP header; hosting configuration must
  // ensure forwarded headers cannot be supplied unchecked by the public client.
  const headers = new Headers(request.headers);
  const ip = headers.get("x-real-ip")?.trim()
    || headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown-client";
  return ip.slice(0, 100);
}
