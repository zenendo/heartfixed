import { expect, test, type Page, type Request } from "@playwright/test";
import { quizConfig } from "../../config/quiz";
import { routes } from "../../config/site";
import { formCopy } from "../../content/emails/forms";
import { encodeShareToken } from "../../lib/quiz";

/**
 * Session 9 — email flows end to end, against the real /api/email route running the
 * memory provider (playwright.config.ts). Sending to a real inbox is the founder's
 * Section 16.4 QA step on a preview with Resend configured.
 */

const API = "/api/email/";
const EMAIL = "reader@example.com";

function captureEmailRequests(page: Page) {
  const bodies: Record<string, unknown>[] = [];
  page.on("request", (req: Request) => {
    if (req.url().endsWith(API) && req.method() === "POST") {
      bodies.push(JSON.parse(req.postData() ?? "{}") as Record<string, unknown>);
    }
  });
  return bodies;
}

test.describe("footer signup — Section 13.3", () => {
  test("is on every page type, labelled as a subscription", async ({ page }) => {
    for (const route of [routes.home, routes.tracker, routes.guideDay14, routes.privacy]) {
      await page.goto(route);
      const form = page.getByRole("contentinfo").getByTestId("email-signup-footer");
      await expect(form).toBeVisible();
      await expect(form).toContainText(formCopy.list.microcopy);
    }
  });

  test("validates inline, then joins the list with an inline success and no redirect", async ({
    page,
  }) => {
    const bodies = captureEmailRequests(page);
    await page.goto(routes.guideDay14);
    const form = page.getByRole("contentinfo").getByTestId("email-signup-footer");
    await form.getByLabel(formCopy.emailLabel).fill("not-an-email");
    await form.getByRole("button", { name: formCopy.list.submit }).click();
    await expect(form.getByText(formCopy.errors.invalid_email)).toBeVisible();
    expect(bodies).toEqual([]);

    await form.getByLabel(formCopy.emailLabel).fill(EMAIL);
    await form.getByRole("button", { name: formCopy.list.submit }).click();
    await expect(form.getByRole("status")).toHaveText(formCopy.list.success);
    expect(page.url()).toMatch(/\/guides\/no-contact-day-14\/$/);
    // Action (b) only, with nothing but the address and the placement.
    expect(bodies).toEqual([
      { action: "join_list", email: EMAIL, placement: "footer", website: "" },
    ]);
  });
});

test.describe("tracker — reminders (c) and list (b), Sections 11.1, 13.1", () => {
  test.use({ timezoneId: "America/New_York" });
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-10-31T14:00:00-04:00"));
  });

  test("no tracker form appears before a streak exists", async ({ page }) => {
    await page.goto(routes.tracker);
    await expect(page.getByRole("button", { name: "Start my streak" })).toBeVisible();
    await expect(page.getByTestId("reminder-optin")).toHaveCount(0);
    await expect(page.getByTestId("email-signup-tracker")).toHaveCount(0);
  });

  test("reminders send only what a reminder needs, then stay on after reload", async ({ page }) => {
    const bodies = captureEmailRequests(page);
    await page.goto(routes.tracker);
    await page.getByRole("button", { name: "Start my streak" }).click();
    const optIn = page.getByTestId("reminder-optin");
    await expect(optIn).toBeVisible();
    await optIn.getByLabel(formCopy.emailLabel).fill(EMAIL);
    await optIn.getByLabel(formCopy.reminders.hourLabel).selectOption("21");
    await optIn.getByRole("button", { name: formCopy.reminders.submit }).click();
    await expect(page.getByTestId("reminders-on")).toHaveText(formCopy.reminders.on);

    expect(bodies).toEqual([
      {
        action: "reminders_on",
        email: EMAIL,
        website: "",
        // Last contact today (Oct 31) → Day 1 is Nov 1.
        reminders: {
          startDate: "2026-11-01",
          goalDays: 30,
          hour: 21,
          timeZone: "America/New_York",
        },
      },
    ]);

    await page.reload();
    await expect(page.getByTestId("reminders-on")).toBeVisible();
    // The address itself is never kept in the browser.
    const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }));
    expect(stored).not.toContain(EMAIL);
  });

  test("the tracker list join is its own action, placement tracker", async ({ page }) => {
    const bodies = captureEmailRequests(page);
    await page.goto(routes.tracker);
    await page.getByRole("button", { name: "Start my streak" }).click();
    const form = page.getByTestId("email-signup-tracker");
    await form.getByLabel(formCopy.emailLabel).fill(EMAIL);
    await form.getByRole("button", { name: formCopy.list.submit }).click();
    await expect(form.getByRole("status")).toHaveText(formCopy.list.success);
    expect(bodies).toEqual([
      { action: "join_list", email: EMAIL, placement: "tracker", website: "" },
    ]);
    // Joining the list didn't turn reminders on.
    await expect(page.getByTestId("reminder-optin")).toBeVisible();
  });
});

test.describe("POST /api/email", () => {
  const token = encodeShareToken({
    version: quizConfig.questionSetVersion,
    anxietyNorm: 72,
    avoidanceNorm: 18,
  });

  test("a result send works and answers with a code-only body", async ({ request }) => {
    const res = await request.post(API, {
      data: { action: "send_result", email: EMAIL, token, alsoJoinList: false },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("bad input gets a code, never an echo", async ({ request }) => {
    const res = await request.post(API, {
      data: { action: "join_list", email: "nope", placement: "footer" },
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "invalid_email" });
    const tampered = await request.post(API, {
      data: { action: "send_result", email: EMAIL, token: "v=x&a=999", alsoJoinList: false },
    });
    expect(await tampered.json()).toEqual({ ok: false, error: "invalid_request" });
  });

  test("rejects non-JSON and oversized bodies, and other methods", async ({ request }) => {
    expect(
      (
        await request.post(API, { data: "not json", headers: { "content-type": "text/plain" } })
      ).status(),
    ).toBe(400);
    expect((await request.post(API, { data: { pad: "x".repeat(5000) } })).status()).toBe(413);
    expect((await request.get(API)).status()).toBe(405);
  });

  test("is disallowed in robots.txt and absent from the sitemap", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /api/");
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/api/");
  });
});
