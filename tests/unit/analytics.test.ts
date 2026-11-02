import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT_NAMES, PARAM_KEYS, dayBand, looksSafe, track } from "@/lib/analytics";
import {
  analyticsEventSchema,
  collectRequestSchema,
  type AnalyticsEvent,
} from "@/lib/analyticsSchema";
import { forwardToGa4, ga4ConfigFromEnv, toMeasurementProtocol } from "@/lib/analyticsServer";

/** Session 13 — Section 16.1 analytics: the allow-list, the transport, the GA4 forward. */

const SECTION_16_1 = [
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

const ok = (e: unknown) => analyticsEventSchema.safeParse(e).success;

describe("the allow-list — Section 16.1", () => {
  it("defines every Section 16.1 event, plus page_view and nothing else", () => {
    const names = analyticsEventSchema.options.map((o) => o.shape.name.value).sort();
    expect(names).toEqual([...SECTION_16_1, "page_view"].sort());
  });

  it("accepts the tabled parameters", () => {
    const good: AnalyticsEvent[] = [
      { name: "quiz_view", params: { source: "share" } },
      {
        name: "quiz_completed",
        params: { profile: "anxious", anxiety_band: "high", avoidance_band: "low" },
      },
      { name: "tracker_created", params: { goal_days: 30 } },
      { name: "tracker_checkin", params: { day_band: "8-30" } },
      { name: "tracker_slip_recorded", params: { slip_type: "texted" } },
      { name: "decision_completed", params: { outcome: "dont_send", draft_check_used: true } },
      { name: "urge_timer_completed", params: { from: "tracker" } },
      { name: "email_result_error", params: { error: "rate_limited" } },
      { name: "newsletter_signup", params: { placement: "footer" } },
      { name: "affiliate_click", params: { slot_id: "resources-1" } },
      { name: "guide_tool_click", params: { guide: "no-contact-day-14", tool: "tracker" } },
      { name: "crisis_link_click", params: { placement: "decision" } },
      { name: "page_view", params: { page_path: "/guides/no-contact-day-14/" } },
    ];
    for (const e of good) expect(ok(e), e.name).toBe(true);
  });

  it("rejects any parameter off the list — answers, notes, drafts, emails, details", () => {
    const bad = [
      {
        name: "quiz_completed",
        params: {
          profile: "anxious",
          anxiety_band: "high",
          avoidance_band: "low",
          answers: [4, 3],
        },
      },
      {
        name: "quiz_completed",
        params: {
          profile: "anxious",
          anxiety_band: "high",
          avoidance_band: "low",
          anxiety_score: 72,
        },
      },
      { name: "tracker_checkin", params: { day_band: "1-7", note: "private" } },
      { name: "tracker_checkin", params: { day_band: "12" } },
      { name: "tracker_slip_recorded", params: { slip_type: "texted", details: "what happened" } },
      {
        name: "decision_completed",
        params: { outcome: "dont_send", draft_check_used: true, draft: "text" },
      },
      { name: "newsletter_signup", params: { placement: "footer", email: "a@b.co" } },
      { name: "email_result_error", params: { error: "a@b.co" } },
      { name: "quiz_started", params: { anything: 1 } },
      { name: "made_up_event", params: {} },
      { name: "page_view", params: { page_path: "/attachment-style-quiz/results/?a=72" } },
      { name: "page_view", params: { page_path: "/x/", page_title: "t" } },
      { name: "guide_tool_click", params: { guide: "Some Guide Title", tool: "tracker" } },
    ];
    for (const e of bad) expect(ok(e), JSON.stringify(e)).toBe(false);
  });

  it("a collect request is a random id, a session number and 1–10 events — nothing else", () => {
    const base = {
      client_id: "3f2a8c1e-0000-4000-8000-000000000000",
      session_id: 1_793_000_000,
      events: [{ name: "quiz_started", params: {} }],
    };
    expect(collectRequestSchema.safeParse(base).success).toBe(true);
    expect(collectRequestSchema.safeParse({ ...base, user_properties: { x: 1 } }).success).toBe(
      false,
    );
    expect(
      collectRequestSchema.safeParse({ ...base, client_id: "reader@example.com" }).success,
    ).toBe(false);
    expect(
      collectRequestSchema.safeParse({ ...base, events: Array(11).fill(base.events[0]) }).success,
    ).toBe(false);
  });

  it("tracker_checkin reports a band, never the day", () => {
    expect([1, 7, 8, 30, 31, 400].map(dayBand)).toEqual([
      "1-7",
      "1-7",
      "8-30",
      "8-30",
      "31+",
      "31+",
    ]);
  });

  it("track() refuses an event carrying free text outside production, and is a no-op on the server", () => {
    expect(() =>
      track({ name: "tracker_checkin", params: { day_band: "1-7", note: "private" } } as never),
    ).toThrow();
    expect(() => track({ name: "quiz_started", params: {} })).not.toThrow();
  });
});

describe("the zod-free browser check (lib/analytics.ts)", () => {
  const options = analyticsEventSchema.options;

  it("knows exactly the schema's event names and parameter keys", () => {
    expect([...EVENT_NAMES].sort()).toEqual(options.map((o) => o.shape.name.value).sort());
    const keys = new Set(options.flatMap((o) => Object.keys(o.shape.params.shape)));
    expect([...PARAM_KEYS].sort()).toEqual([...keys].sort());
  });

  it("passes every well-formed event", () => {
    for (const e of [
      { name: "page_view", params: { page_path: "/guides/no-contact-day-14/" } },
      { name: "tracker_checkin", params: { day_band: "31+" } },
      { name: "tracker_created", params: { goal_days: 90 } },
      { name: "decision_completed", params: { outcome: "wait_24h", draft_check_used: false } },
      {
        name: "quiz_completed",
        params: { profile: "fearful-avoidant", anxiety_band: "high", avoidance_band: "low" },
      },
    ]) {
      expect(looksSafe(e), e.name).toBe(true);
      expect(analyticsEventSchema.safeParse(e).success, e.name).toBe(true);
    }
  });

  it("stops free text, addresses, unknown keys and unknown names before any request", () => {
    for (const e of [
      { name: "tracker_checkin", params: { day_band: "1-7", note: "x" } },
      {
        name: "decision_completed",
        params: { outcome: "I miss you so much", draft_check_used: true },
      },
      { name: "guide_tool_click", params: { guide: "Some Guide Title", tool: "tracker" } },
      { name: "newsletter_signup", params: { placement: "reader@example.com" } },
      { name: "page_view", params: { page_path: "/x/?token=abc" } },
      { name: "tracker_created", params: { goal_days: 1.5 } },
      { name: "tracker_created", params: { goal_days: { text: "x" } } },
      { name: "quiz_answers", params: {} },
      { name: "quiz_started", params: null },
    ]) {
      expect(looksSafe(e), JSON.stringify(e)).toBe(false);
    }
  });
});

describe("GA4 Measurement Protocol forward", () => {
  const req = {
    client_id: "3f2a8c1e-0000-4000-8000-000000000000",
    session_id: 1_793_000_000,
    events: [
      { name: "decision_completed", params: { outcome: "dont_send", draft_check_used: false } },
      { name: "page_view", params: { page_path: "/should-i-text-my-ex/" } },
    ],
  } as const;

  it("adds session params, stringifies booleans, makes page_location absolute", () => {
    const mp = toMeasurementProtocol(req as never);
    expect(mp.client_id).toBe(req.client_id);
    expect(mp.events[0]).toEqual({
      name: "decision_completed",
      params: {
        session_id: req.session_id,
        engagement_time_msec: 1,
        outcome: "dont_send",
        draft_check_used: "false",
      },
    });
    expect(mp.events[1]!.params.page_location).toMatch(/^https?:\/\/[^/]+\/should-i-text-my-ex\/$/);
    expect(JSON.stringify(mp)).not.toContain("user_properties");
  });

  it("posts to /mp/collect with the measurement id and secret", async () => {
    const calls: { url: string; body: string }[] = [];
    const fakeFetch = (async (url: URL, init: RequestInit) => {
      calls.push({ url: String(url), body: String(init.body) });
      return new Response(null, { status: 204 });
    }) as unknown as typeof fetch;
    await forwardToGa4(req as never, {
      measurementId: "G-ABC",
      apiSecret: "s3cret",
      fetch: fakeFetch,
    });
    expect(calls[0]!.url).toBe(
      "https://www.google-analytics.com/mp/collect?measurement_id=G-ABC&api_secret=s3cret",
    );
  });

  it("forwards nothing without both the measurement id and the secret", () => {
    expect(ga4ConfigFromEnv({})).toBeNull();
    expect(ga4ConfigFromEnv({ NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC" })).toBeNull();
    expect(
      ga4ConfigFromEnv({ NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC", GA4_API_SECRET: "s" }),
    ).not.toBeNull();
  });
});

describe("no third-party analytics script (Section 16.3 budget)", () => {
  it("nothing loads gtag.js or Google Tag Manager", () => {
    const root = path.resolve(__dirname, "../..");
    const hits = ["app", "components", "lib"].flatMap((dir) =>
      readdirSync(path.join(root, dir), { recursive: true, encoding: "utf8" })
        .filter((f) => /\.tsx?$/.test(f))
        .filter((f) =>
          /googletagmanager|gtag\(|dataLayer/.test(readFileSync(path.join(root, dir, f), "utf8")),
        )
        .map((f) => `${dir}/${f}`),
    );
    expect(hits).toEqual([]);
  });
});
