import { collectRequestSchema } from "@/lib/analyticsSchema";
import { forwardToGa4, ga4ConfigFromEnv } from "@/lib/analyticsServer";
import { createRateLimiter, rateLimitFromEnv } from "@/lib/email/rateLimit";

/**
 * POST /api/collect/ — first-party analytics (Sections 7.1, 16.1). Re-validates every
 * event against the strict allow-list in lib/analyticsSchema.ts, refuses anything carrying an
 * "@" (a stray email address), then forwards to GA4. Answers 204 with no body either
 * way, and never logs or stores the payload.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8192;
const ga4 = ga4ConfigFromEnv(process.env);
// ANALYTICS_RATE_LIMIT: events per IP per hour (default 600).
const limiter = createRateLimiter({
  limit: process.env.ANALYTICS_RATE_LIMIT
    ? rateLimitFromEnv(process.env.ANALYTICS_RATE_LIMIT)
    : 600,
});

const empty = (status: number) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES || raw.includes("@")) return empty(400);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.hit(ip)) return empty(429);
  let parsed;
  try {
    parsed = collectRequestSchema.safeParse(JSON.parse(raw));
  } catch {
    return empty(400);
  }
  if (!parsed.success) return empty(400);
  if (ga4) {
    try {
      await forwardToGa4(parsed.data, ga4);
    } catch {
      // Analytics must never break the page; a lost event is acceptable.
    }
  }
  return empty(204);
}
