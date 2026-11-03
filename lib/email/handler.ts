import type { EmailProvider } from "./provider";
import type { RateLimiter } from "./rateLimit";
import { ResultTokenError, buildResultEmail, resultFromToken } from "./resultEmail";
import { emailRequestSchema, type EmailResponse } from "./validate";

/**
 * The email endpoint's logic, kept free of Next so every path is unit-tested.
 * Order: rate limit → validate → honeypot → provider → one action. The three actions
 * never share a code path (Section 13.1). Nothing here logs or echoes the address.
 */

export interface HandlerResult {
  status: number;
  body: EmailResponse;
}

const fail = (status: number, error: Extract<EmailResponse, { ok: false }>["error"]) => ({
  status,
  body: { ok: false as const, error },
});

export async function handleEmailRequest(
  input: unknown,
  ip: string,
  deps: { provider: EmailProvider | null; limiter: RateLimiter },
): Promise<HandlerResult> {
  if (!deps.limiter.hit(ip)) return fail(429, "rate_limited");

  const parsed = emailRequestSchema.safeParse(input);
  if (!parsed.success) {
    const emailIssue = parsed.error.issues.some((i) => i.path[0] === "email");
    return fail(400, emailIssue ? "invalid_email" : "invalid_request");
  }
  const req = parsed.data;

  // A filled honeypot is a bot. Answer like a success so it learns nothing; do nothing.
  if (req.website) return { status: 200, body: { ok: true } };

  const { provider } = deps;
  if (!provider) return fail(503, "not_configured");

  try {
    switch (req.action) {
      case "send_result": {
        let email;
        try {
          email = buildResultEmail(
            resultFromToken(req.token),
            req.perceived === undefined ? undefined : resultFromToken(req.perceived),
          );
        } catch (err) {
          if (err instanceof ResultTokenError) return fail(400, "invalid_request");
          throw err;
        }
        // (a) The transactional send. It never subscribes him.
        await provider.send({ to: req.email, ...email, tag: "result-email" });
        if (!req.alsoJoinList) return { status: 200, body: { ok: true } };
        // (b) Only because he ticked the separate list box.
        try {
          await provider.joinList(req.email, "result");
          return { status: 200, body: { ok: true, listJoined: true } };
        } catch {
          return { status: 200, body: { ok: true, listJoined: false } };
        }
      }
      case "join_list":
        await provider.joinList(req.email, req.placement);
        return { status: 200, body: { ok: true } };
      case "reminders_on":
        // (c) Reminders: their own consent, independent of the list.
        await provider.enableReminders(req.email, req.reminders);
        return { status: 200, body: { ok: true } };
    }
  } catch {
    return fail(502, "provider_error");
  }
}
