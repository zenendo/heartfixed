import { z } from "zod";
import { PLACEMENTS } from "@/lib/email/rules";
import { SLIP_TYPES } from "@/lib/tools/tracker";

/**
 * The analytics allow-list — Section 16.1. Typed events with only tool names, counts,
 * bands, categories and outcome codes: never answers, notes, draft text, slip details or
 * an email address, and never a user property. Every schema is strict, so an unknown
 * parameter is rejected rather than passed on.
 *
 * Server-side: /api/collect/ checks every event against these schemas before anything is
 * forwarded to GA4. The browser sender (lib/analytics.ts) stays zod-free to keep zod out
 * of every page's shared bundle (Section 16.3), and runs a coarser check of its own.
 */

const PROFILE = z.enum(["secure", "anxious", "avoidant", "fearful-avoidant"]);
const BAND = z.enum(["low", "moderate", "high"]);
const GOAL = z.union([z.literal(30), z.literal(60), z.literal(90)]);
const TOOL = z.enum(["quiz", "tracker", "decision"]);
const SLUG = z.string().regex(/^[a-z0-9-]{1,80}$/);
const NO_PARAMS = z.strictObject({});

/** A site path only: no query string, no fragment — so no token or text rides along. */
const PAGE_PATH = z
  .string()
  .regex(/^\/([a-z0-9-]+\/)*$/)
  .max(120);

export const analyticsEventSchema = z.discriminatedUnion("name", [
  z.strictObject({
    name: z.literal("page_view"),
    params: z.strictObject({ page_path: PAGE_PATH, not_found: z.boolean().optional() }),
  }),
  z.strictObject({
    name: z.literal("quiz_view"),
    params: z.strictObject({ source: z.enum(["organic", "internal", "share", "email"]) }),
  }),
  z.strictObject({ name: z.literal("quiz_started"), params: NO_PARAMS }),
  z.strictObject({
    name: z.literal("quiz_completed"),
    params: z.strictObject({ profile: PROFILE, anxiety_band: BAND, avoidance_band: BAND }),
  }),
  z.strictObject({
    name: z.literal("quiz_result_shared"),
    params: z.strictObject({ profile: PROFILE }),
  }),
  z.strictObject({
    name: z.literal("tracker_created"),
    params: z.strictObject({ goal_days: GOAL }),
  }),
  z.strictObject({
    name: z.literal("tracker_checkin"),
    params: z.strictObject({ day_band: z.enum(["1-7", "8-30", "31+"]) }),
  }),
  z.strictObject({
    name: z.literal("tracker_slip_recorded"),
    params: z.strictObject({ slip_type: z.enum(SLIP_TYPES) }),
  }),
  z.strictObject({ name: z.literal("decision_started"), params: NO_PARAMS }),
  z.strictObject({
    name: z.literal("decision_completed"),
    params: z.strictObject({
      outcome: z.enum(["dont_send", "wait_24h", "logistics_ok"]),
      draft_check_used: z.boolean(),
    }),
  }),
  z.strictObject({
    name: z.literal("urge_timer_completed"),
    params: z.strictObject({ from: z.enum(["tracker", "decision", "direct"]) }),
  }),
  z.strictObject({ name: z.literal("email_result_submit"), params: NO_PARAMS }),
  z.strictObject({ name: z.literal("email_result_success"), params: NO_PARAMS }),
  z.strictObject({
    name: z.literal("email_result_error"),
    params: z.strictObject({
      error: z.enum([
        "invalid_email",
        "invalid_request",
        "rate_limited",
        "provider_error",
        "not_configured",
      ]),
    }),
  }),
  z.strictObject({
    name: z.literal("newsletter_signup"),
    params: z.strictObject({ placement: z.enum(PLACEMENTS) }),
  }),
  z.strictObject({
    name: z.literal("reminder_optin"),
    params: z.strictObject({ goal_days: GOAL }),
  }),
  z.strictObject({
    name: z.literal("affiliate_slot_view"),
    params: z.strictObject({ slot_id: SLUG }),
  }),
  z.strictObject({
    name: z.literal("affiliate_click"),
    params: z.strictObject({ slot_id: SLUG }),
  }),
  z.strictObject({
    name: z.literal("guide_tool_click"),
    params: z.strictObject({ guide: SLUG, tool: TOOL }),
  }),
  z.strictObject({
    name: z.literal("crisis_link_click"),
    params: z.strictObject({ placement: z.enum(["footer", "result", "decision", "tracker"]) }),
  }),
]);

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type AnalyticsEventName = AnalyticsEvent["name"];

/** What the browser posts to /api/collect/. */
export const collectRequestSchema = z.strictObject({
  client_id: z.string().regex(/^[0-9a-f-]{36}$/),
  session_id: z.number().int().positive(),
  events: z.array(analyticsEventSchema).min(1).max(10),
});
export type CollectRequest = z.infer<typeof collectRequestSchema>;
