import { z } from "zod";
import { GOAL_OPTIONS, isoDateSchema } from "@/lib/tools/tracker";

/**
 * Email request validation — Section 13.1. One Zod schema, shared by every form (client)
 * and the API route (server). Three actions, never conflated:
 *
 * - send_result:  (a) a one-off transactional email of his own result. Never subscribes.
 *                 Carries the share token only (two scores + version, Section 9.6).
 * - join_list:    (b) the email list, with marketing consent.
 * - reminders_on: (c) functional streak reminders, their own consent flag.
 *
 * The only personal data item is the email address (Section 14.4). `website` is the
 * honeypot field: a real person never sees it, so any value marks a bot.
 */

export const EMAIL_MAX = 254;

export const emailSchema = z
  .string()
  .trim()
  .max(EMAIL_MAX)
  .pipe(z.email({ error: "Enter a full email address, like name@example.com." }));

export const PLACEMENTS = ["footer", "result", "tracker"] as const;
export type Placement = (typeof PLACEMENTS)[number];

const honeypot = z.string().max(200).optional();

const timeZoneSchema = z
  .string()
  .max(64)
  .refine((tz) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Unknown time zone");

export const reminderSettingsSchema = z.object({
  /** Day 1 of the current streak (local ISO date). */
  startDate: isoDateSchema,
  goalDays: z.union(
    GOAL_OPTIONS.map((g) => z.literal(g)) as [z.ZodLiteral<30>, z.ZodLiteral<60>, z.ZodLiteral<90>],
  ),
  /** Local hour (0–23) after which a reminder may go out if he hasn't checked in. */
  hour: z.number().int().min(0).max(23),
  timeZone: timeZoneSchema,
});
export type ReminderSettings = z.infer<typeof reminderSettingsSchema>;

export const emailRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("send_result"),
    email: emailSchema,
    /** The Section 9.6 share token — scores and version only, never answers. */
    token: z.string().min(1).max(200),
    /** The separate, unchecked-by-default list checkbox (Section 13.1 b). */
    alsoJoinList: z.boolean(),
    website: honeypot,
  }),
  z.object({
    action: z.literal("join_list"),
    email: emailSchema,
    placement: z.enum(PLACEMENTS),
    website: honeypot,
  }),
  z.object({
    action: z.literal("reminders_on"),
    email: emailSchema,
    reminders: reminderSettingsSchema,
    website: honeypot,
  }),
]);
export type EmailRequest = z.infer<typeof emailRequestSchema>;

/** Error codes only — never echo the address or any content back (Section 16.1). */
export const ERROR_CODES = [
  "invalid_email",
  "invalid_request",
  "rate_limited",
  "provider_error",
  "not_configured",
] as const;
export type EmailErrorCode = (typeof ERROR_CODES)[number];

/**
 * `listJoined` is set only for send_result with the list box ticked: the result can be
 * sent even if the separate list join fails, and the form says so honestly.
 */
export type EmailResponse =
  { ok: true; listJoined?: boolean } | { ok: false; error: EmailErrorCode };

/** Client-side check of the address alone, with the same rule as the server. */
export function checkEmail(input: string): string | null {
  const parsed = emailSchema.safeParse(input);
  return parsed.success ? null : (parsed.error.issues[0]?.message ?? "Enter a full email address.");
}
