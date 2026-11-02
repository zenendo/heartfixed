/**
 * The email-address rule and form placements, zod-free — Section 13.1. The footer form is
 * on every page, so importing zod here would put it in every page's shared bundle
 * (Section 16.3). lib/email/validate.ts builds the server schema from these same values,
 * and tests/unit/email.test.tsx checks EMAIL_PATTERN against zod's own email regex.
 */

export const EMAIL_MAX = 254;

/** Zod's email regex (z.regexes.email), copied so the browser doesn't load zod. */
export const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

export const EMAIL_ERROR = "Enter a full email address, like name@example.com.";

export const PLACEMENTS = ["footer", "result", "tracker"] as const;
export type Placement = (typeof PLACEMENTS)[number];

/** Browser-side check of the address alone, with the same rule as the server. */
export function checkEmail(input: string): string | null {
  const email = input.trim();
  return email.length <= EMAIL_MAX && EMAIL_PATTERN.test(email) ? null : EMAIL_ERROR;
}
