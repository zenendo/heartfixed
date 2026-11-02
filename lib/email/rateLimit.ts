/**
 * Per-IP rate limit for the email endpoint — Section 13.1 (default 5 requests / IP /
 * hour, EMAIL_RATE_LIMIT). In memory, per server instance: there is no database in the
 * MVP (Section 7.1), so a burst spread across instances can exceed it. That's accepted
 * for launch; the honeypot is the other guard, and CAPTCHA is added only if abuse appears.
 */
export interface RateLimiter {
  /** Records a request; false when the IP is over its limit for the window. */
  hit(ip: string): boolean;
}

export function createRateLimiter(options: {
  limit: number;
  windowMs?: number;
  now?: () => number;
}): RateLimiter {
  const windowMs = options.windowMs ?? 3_600_000;
  const now = options.now ?? Date.now;
  const hits = new Map<string, number[]>();
  return {
    hit(ip) {
      const t = now();
      const recent = (hits.get(ip) ?? []).filter((at) => t - at < windowMs);
      if (recent.length >= options.limit) {
        hits.set(ip, recent);
        return false;
      }
      recent.push(t);
      hits.set(ip, recent);
      if (hits.size > 10_000) {
        for (const [key, times] of hits)
          if (times.every((at) => t - at >= windowMs)) hits.delete(key);
      }
      return true;
    },
  };
}

export function rateLimitFromEnv(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 5;
}
