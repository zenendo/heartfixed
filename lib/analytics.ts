import type { AnalyticsEvent, AnalyticsEventName, CollectRequest } from "@/lib/analyticsSchema";
import { storageKeys } from "@/lib/storage";

export type { AnalyticsEvent, AnalyticsEventName, CollectRequest };

/**
 * Analytics, browser side — Section 16.1. The browser posts events to our own
 * /api/collect/, which checks them against the strict allow-list in
 * lib/analyticsSchema.ts and forwards them to GA4 with the Measurement Protocol. No
 * third-party script loads: gtag.js alone (~157 kB gzipped) would break the Section
 * 16.3 tool-page JS budget.
 *
 * This module is zod-free so zod stays out of the bundle every page shares. Before
 * sending, it runs a coarse check of its own: a known event name, known parameter keys,
 * and only booleans, small integers or short lowercase codes as values. So free text (a
 * note, a draft, an address) never leaves the browser even if a call site gets it wrong.
 */

export const COLLECT_ENDPOINT = "/api/collect/";

/** Kept in step with lib/analyticsSchema.ts by tests/unit/analytics.test.ts. */
export const EVENT_NAMES: readonly AnalyticsEventName[] = [
  "page_view",
  "quiz_view",
  "quiz_started",
  "quiz_completed",
  "quiz_result_shared",
  "tracker_created",
  "tracker_checkin",
  "tracker_slip_recorded",
  "decision_started",
  "decision_completed",
  "urge_timer_completed",
  "email_result_submit",
  "email_result_success",
  "email_result_error",
  "newsletter_signup",
  "reminder_optin",
  "affiliate_slot_view",
  "affiliate_click",
  "guide_tool_click",
  "crisis_link_click",
];

/** Every parameter key any event may carry. Kept in step with the schemas by test. */
export const PARAM_KEYS: readonly string[] = [
  "page_path",
  "not_found",
  "source",
  "profile",
  "anxiety_band",
  "avoidance_band",
  "goal_days",
  "day_band",
  "slip_type",
  "outcome",
  "draft_check_used",
  "from",
  "error",
  "placement",
  "slot_id",
  "guide",
  "tool",
];

/** A code or a site path: no spaces, capitals, "@", query strings or fragments. */
const CODE = /^[a-z0-9_/+-]{1,120}$/;

/** The coarse browser-side check. /api/collect/ applies the exact allow-list. */
export function looksSafe(event: { name: unknown; params: unknown }): boolean {
  if (!EVENT_NAMES.includes(event.name as AnalyticsEventName)) return false;
  if (typeof event.params !== "object" || event.params === null) return false;
  return Object.entries(event.params).every(
    ([key, value]) =>
      PARAM_KEYS.includes(key) &&
      (typeof value === "boolean" ||
        (Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 1000) ||
        (typeof value === "string" && CODE.test(value))),
  );
}

/** Section 16.1: tracker_checkin reports a band, never the day number. */
export function dayBand(day: number): "1-7" | "8-30" | "31+" {
  if (day <= 7) return "1-7";
  if (day <= 30) return "8-30";
  return "31+";
}

const ID_KEY = storageKeys.analytics;
const SESSION_GAP_MS = 30 * 60 * 1000;

interface Identity {
  clientId: string;
  sessionId: number;
  lastSeen: number;
}

/** Off when no measurement id is built in, or when the browser sends Global Privacy Control. */
export function analyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return false;
  return !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
}

/**
 * A random analytics id (not tied to any person or tool data) plus a session that ends
 * after 30 minutes of inactivity. Kept in localStorage; if storage is unavailable, a
 * fresh id per page view is fine.
 */
function identity(now: number): Identity {
  let stored: Identity | null = null;
  try {
    const raw = localStorage.getItem(ID_KEY);
    if (raw) stored = JSON.parse(raw) as Identity;
  } catch {
    stored = null;
  }
  const valid = stored && /^[0-9a-f-]{36}$/.test(stored.clientId);
  const next: Identity = {
    clientId: valid ? stored!.clientId : crypto.randomUUID(),
    sessionId:
      valid && now - stored!.lastSeen < SESSION_GAP_MS ? stored!.sessionId : Math.floor(now / 1000),
    lastSeen: now,
  };
  try {
    localStorage.setItem(ID_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: carry on with an in-memory id.
  }
  return next;
}

/**
 * Sends one event. Checks it first, so a coding mistake that would leak free text throws
 * in development and is dropped in production.
 */
export function track(event: AnalyticsEvent): void {
  if (!looksSafe(event)) {
    if (process.env.NODE_ENV !== "production") throw new Error(`Invalid analytics event`);
    return;
  }
  if (!analyticsEnabled()) return;
  const { clientId, sessionId } = identity(Date.now());
  const body: CollectRequest = {
    client_id: clientId,
    session_id: sessionId,
    events: [event],
  };
  // keepalive lets the request finish if the page is unloading (like sendBeacon).
  void fetch(COLLECT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}
