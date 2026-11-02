import { expect, test, type Page } from "@playwright/test";
import { routes } from "../../config/site";
import { collectRequestSchema, type CollectRequest } from "../../lib/analyticsSchema";

/**
 * Session 13 — the Section 16.4 analytics-privacy inspection, as an automated test.
 * A full tracker + decision + email journey with marked private text, capturing every
 * request the browser actually sends to /api/collect/. The production check in GA4
 * DebugView is recorded in QA.md as a launch step.
 */

const NOTE = "SECRET-NOTE-4417";
const DRAFT = "SECRET-DRAFT-9921 when can I get my boxes back";
const EMAIL = "secret.reader@example.com";

function capture(page: Page) {
  const bodies: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/collect/") && req.method() === "POST") {
      bodies.push(req.postData() ?? "");
    }
  });
  return bodies;
}

const events = (bodies: string[]) =>
  bodies.flatMap((b) => (JSON.parse(b) as CollectRequest).events);

test.use({ timezoneId: "America/New_York" });

test("a full journey sends only allow-listed events — no notes, drafts or email", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-01T14:00:00-05:00") });
  const bodies = capture(page);

  // Tracker: create, check in with a private note, opt into reminders, slip.
  await page.goto(routes.tracker);
  await page.getByLabel("When did you last have contact?").fill("2026-10-20");
  await page.getByRole("button", { name: "Start my streak" }).click();
  await page.getByLabel("Private note (optional)").fill(NOTE);
  await page.getByRole("button", { name: "Still no contact" }).click();
  const optIn = page.getByTestId("reminder-optin");
  await optIn.getByLabel("Email address").fill(EMAIL);
  await optIn.getByRole("button", { name: "Turn on reminders" }).click();
  await expect(page.getByTestId("reminders-on")).toBeVisible();
  await page.getByRole("button", { name: "I broke no contact" }).click();
  await page.getByRole("radio", { name: /reached out and I replied/ }).check();
  await page.getByRole("button", { name: "Restart the counter" }).click();
  await expect(page.locator("#slip-done-heading")).toBeFocused();

  // Decision tool: a full run with a marked draft, then the urge timer to zero.
  await page.goto(routes.decision);
  await page.getByRole("radio", { name: "More than 3 months" }).check();
  await page.getByRole("radio", { name: "More than a month ago" }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /^Logistics/ }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("group", { name: "Have you been drinking tonight?" })
    .getByRole("radio", { name: "No" })
    .check();
  await page
    .getByRole("group", { name: "Have you already drafted and deleted this more than once?" })
    .getByRole("radio", { name: "No" })
    .check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Your draft").fill(DRAFT);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("outcome")).toBeVisible();
  await page.getByRole("link", { name: "Crisis Resources" }).first().click();
  await page.goto(routes.decision);
  await page.getByRole("button", { name: "Just start the 30-minute urge timer" }).click();
  await page.clock.runFor(30 * 60_000 + 1000);
  await expect(page.getByRole("heading", { name: /You made it through/ })).toBeVisible();

  // Footer list join, and a guide tool block.
  await page.goto(routes.guideDay14);
  const footer = page.getByRole("contentinfo").getByTestId("email-signup-footer");
  await footer.getByLabel("Email address").fill(EMAIL);
  await footer.getByRole("button", { name: "Join the list" }).click();
  await expect(footer.getByRole("status")).toBeVisible();
  await page.getByTestId("tool-block").getByRole("link").click();
  await page.waitForURL(`**${routes.tracker}`);
  await page.waitForTimeout(500);

  // Every body is a valid, allow-listed collect request…
  expect(bodies.length).toBeGreaterThan(8);
  for (const body of bodies)
    expect(collectRequestSchema.safeParse(JSON.parse(body)).success).toBe(true);
  // …that carries none of the private text, and no email address at all.
  const all = bodies.join("\n");
  expect(all).not.toContain("SECRET-NOTE");
  expect(all).not.toContain("SECRET-DRAFT");
  expect(all).not.toContain("boxes");
  expect(all).not.toContain("@");

  const names = new Set(events(bodies).map((e) => e.name));
  for (const name of [
    "page_view",
    "tracker_created",
    "tracker_checkin",
    "reminder_optin",
    "tracker_slip_recorded",
    "decision_started",
    "decision_completed",
    "crisis_link_click",
    "urge_timer_completed",
    "newsletter_signup",
    "guide_tool_click",
  ]) {
    expect(names, name).toContain(name);
  }

  const ev = events(bodies);
  expect(ev.find((e) => e.name === "decision_completed")?.params).toEqual({
    outcome: "logistics_ok",
    draft_check_used: true,
  });
  expect(ev.find((e) => e.name === "tracker_slip_recorded")?.params).toEqual({
    slip_type: "they-reached-out-i-replied",
  });
  expect(ev.find((e) => e.name === "crisis_link_click")?.params).toEqual({ placement: "decision" });
  expect(ev.find((e) => e.name === "guide_tool_click")?.params).toEqual({
    guide: "no-contact-day-14",
    tool: "tracker",
  });
});

test("Global Privacy Control turns analytics off entirely", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "globalPrivacyControl", { get: () => true }),
  );
  const bodies = capture(page);
  await page.goto(routes.tracker);
  await page.getByRole("button", { name: "Start my streak" }).click();
  await page.goto(routes.guideDay14);
  await page.waitForTimeout(500);
  expect(bodies).toEqual([]);
});

test.describe("POST /api/collect/", () => {
  const valid = {
    client_id: "3f2a8c1e-0000-4000-8000-000000000000",
    session_id: 1_793_000_000,
    events: [{ name: "quiz_started", params: {} }],
  };

  test("accepts a valid request with an empty 204", async ({ request }) => {
    const res = await request.post("/api/collect/", { data: valid });
    expect(res.status()).toBe(204);
    expect(await res.text()).toBe("");
  });

  test("rejects anything off the list, and anything carrying an @", async ({ request }) => {
    const extra = { ...valid, events: [{ name: "quiz_started", params: { note: "x" } }] };
    expect((await request.post("/api/collect/", { data: extra })).status()).toBe(400);
    const email = {
      ...valid,
      events: [{ name: "newsletter_signup", params: { placement: "footer" } }],
      stray: "a@b.co",
    };
    expect((await request.post("/api/collect/", { data: email })).status()).toBe(400);
  });
});
