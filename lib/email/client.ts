import type { EmailRequest, EmailResponse } from "./validate";

/** Trailing slash included: `trailingSlash: true` would otherwise 308 the POST. */
export const EMAIL_ENDPOINT = "/api/email/";

/** Browser-side POST to /api/email. Network failures come back as an error code too. */
export async function postEmail(request: EmailRequest): Promise<EmailResponse> {
  try {
    const res = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return (await res.json()) as EmailResponse;
  } catch {
    return { ok: false, error: "provider_error" };
  }
}
