import { handleEmailRequest } from "@/lib/email/handler";
import { providerFromEnv } from "@/lib/email/provider";
import { createRateLimiter, rateLimitFromEnv } from "@/lib/email/rateLimit";

/**
 * POST /api/email — the site's only server route (Sections 6, 7.2). Validates with the
 * same Zod schema as the forms, then performs exactly one of the three Section 13.1
 * actions. Responses carry an error code only — never the address or any content.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;

const provider = providerFromEnv(process.env);
const limiter = createRateLimiter({ limit: rateLimitFromEnv(process.env.EMAIL_RATE_LIMIT) });

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "invalid_request" }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
  const result = await handleEmailRequest(body, clientIp(req), { provider, limiter });
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
