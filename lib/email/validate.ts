import { z } from "zod";
import { PRONOUN_IDS } from "@/config/copy";
import { endingQuestions } from "@/lib/quiz/questions";
import { GOAL_OPTIONS, isoDateSchema } from "@/lib/tools/tracker";
import { EMAIL_ERROR, EMAIL_MAX, PLACEMENTS } from "./rules";

/**
 * Email request validation — Section 13.1. The API route's Zod schema, built on the same
 * address rule the forms use (lib/email/rules.ts). Three actions, never conflated:
 *
 * - send_result:  (a) a one-off transactional email of his own result. Never subscribes.
 *                 Carries the share token only (two scores + version, Section 9.6).
 * - join_list:    (b) the email list, with marketing consent.
 * - reminders_on: (c) functional streak reminders, their own consent flag.
 *
 * The only personal data item is the email address (Section 14.4). `website` is the
 * honeypot field: a real person never sees it, so any value marks a bot.
 */

export { EMAIL_MAX, PLACEMENTS, checkEmail, type Placement } from "./rules";

export const emailSchema = z
  .string()
  .trim()
  .max(EMAIL_MAX)
  .pipe(z.email({ error: EMAIL_ERROR }));

const honeypot = z.string().max(200).optional();

/** The option ids of one "how it ended" question, for an enum. */
const optionsOf = (id: "b1" | "b2" | "b5") => {
  const [first, ...rest] = endingQuestions.find((q) => q.id === id)!.options.map((o) => o.value);
  return [first!, ...rest] as [string, ...string[]];
};

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
    /**
     * The partner read, in the same token shape (her two perceived scores + version).
     * Founder decision (2026-11-02): the result email carries her read and the dynamic.
     */
    perceived: z.string().min(1).max(200).optional(),
    /**
     * The visitor's two pronoun answers (amendment brief, 2.5): two enum values, used
     * only to render this one email and never stored. Absent means the default path.
     */
    pronouns: z.object({ taker: z.enum(PRONOUN_IDS), partner: z.enum(PRONOUN_IDS) }).optional(),
    /**
     * The "how it ended" answers the email needs (v3 amendment brief, 6): who ended it
     * (b1), how it arrived (b2) and what came just before (b5), as option ids. Used only
     * to choose the email's arrival read and fit line, never stored.
     */
    ending: z
      .object({
        b1: z.enum(optionsOf("b1")),
        b2: z.enum(optionsOf("b2")),
        b5: z.enum(optionsOf("b5")),
      })
      .optional(),
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
