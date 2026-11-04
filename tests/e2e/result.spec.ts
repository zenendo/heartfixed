import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { quizConfig } from "../../config/quiz";
import { routes, site } from "../../config/site";
import { blockA } from "../../content/compliance";
import { formCopy } from "../../content/emails/forms";
import { pronounTerms } from "../../config/copy";
import { plain, programmeLine, resultContentFor, resultCopy as t } from "../../content/quiz-result";
import { trackerCopy } from "../../content/tracker";
import { collectRequestSchema, type CollectRequest } from "../../lib/analyticsSchema";
import { createTracker, toLocalDate, addDays } from "../../lib/tools/tracker";
import { leanWatchOuts, profileCopy, profileCopyFor, pronounContext } from "../../lib/quiz";
import { fixture1, herFixtures } from "../../lib/quiz/__tests__/fixtures";
import { savedQuiz, seed } from "./support/savedQuiz";

/**
 * Session 5 — the result view (Section 10.3; quiz build brief, Part B), the shared-link
 * view and the result email request (Sections 9.6, 13.1). Each test seeds a result the
 * engine computed (completeAttempt); quiz.spec.ts drives the full runner into this view.
 * The seeded result carries the default pronoun answers (he/him, she/her); the
 * nine-combination render is in tests/unit/pronouns.test.tsx.
 */

const { caveat, herReads, decodes, decodeFallback, dynamics, bridges } =
  resultContentFor(pronounContext());
const she = pronounTerms.she;

const QUIZ = "heartfixed-quiz-v1";
const TRACKER = "heartfixed-tracker-v1";

/** The Fixture 1 (Persona A) + H1 result: anxious 71/13, her pattern avoidant 83/13. */
const persona = savedQuiz();

async function openResult(page: Page, saved = persona, extra: Record<string, unknown> = {}) {
  await seed(page, { [QUIZ]: saved, ...extra });
  await page.goto(routes.quizResults);
  await expect(page.getByTestId("result")).toBeVisible();
}

function captureCollect(page: Page) {
  const events: CollectRequest["events"] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/collect/") && req.method() === "POST") {
      const body = JSON.parse(req.postData() ?? "{}") as unknown;
      expect(collectRequestSchema.safeParse(body).success).toBe(true);
      events.push(...(body as CollectRequest).events);
    }
  });
  return events;
}

const h2s = (page: Page) => page.getByTestId("result").locator("h2").allTextContents();

test.describe("the full result view (Section 10.3; brief, Part B)", () => {
  test("follows the brief's order, with Block A directly under the scores", async ({ page }) => {
    await openResult(page);
    await expect(page.locator("h1")).toHaveText("Your pattern: Anxious (preoccupied)");
    const scores = page.getByTestId("result-scores");
    await expect(scores).toHaveText(
      "Attachment anxiety 71/100, highAttachment avoidance 13/100, low",
    );
    await expect(scores.locator("xpath=following-sibling::*[1]")).toHaveText(blockA.text);
    expect(await h2s(page)).toEqual([
      t.acts.why,
      t.acts.yours,
      t.acts.since,
      t.acts.after(she),
      formCopy.result.heading,
      t.share.heading,
      t.goDeeper,
    ]);
    // Block D after everything else in the view.
    const crisis = page.getByTestId("result").getByTestId("crisis-block");
    await expect(crisis).toBeVisible();
    const [deeper, block] = [
      await page.getByRole("heading", { name: t.goDeeper }).boundingBox(),
      await crisis.boundingBox(),
    ];
    expect(block!.y).toBeGreaterThan(deeper!.y);
  });

  test("Act 1: her read under its caveat, then the dynamic for his × her pairing", async ({
    page,
  }) => {
    await openResult(page);
    const read = page.getByTestId("partner-read");
    await expect(read.locator("h3")).toHaveText(
      "Her pattern, as you experienced it: Avoidant (dismissive)",
    );
    // The caveat is the first thing under the headline.
    const caveatBox = read.getByTestId("partner-caveat");
    await expect(caveatBox).toHaveText(`${caveat.lead} ${plain(caveat.body)}`);
    await expect(caveatBox).toContainText("it can't label her");
    await expect(caveatBox.locator("em")).toHaveText("you experienced");
    await expect(read.locator("h3 + *")).toHaveAttribute("data-testid", "partner-caveat");
    for (const p of herReads.avoidant.paragraphs) await expect(read).toContainText(plain(p));
    await expect(read).toContainText(`${t.meansLead} ${plain(herReads.avoidant.means)}`);
    await expect(read).toContainText(`${t.sinceLead} ${plain(herReads.avoidant.since)}`);

    const dynamic = page.getByTestId("dynamic");
    await expect(dynamic).toHaveAttribute("data-dynamic", "anxious-avoidant");
    await expect(dynamic).toContainText(dynamics["anxious-avoidant"].title);
    for (const p of dynamics["anxious-avoidant"].paragraphs) {
      await expect(dynamic).toContainText(plain(p));
    }
  });

  test("Act 2: his profile content, with no lean for a high/low result", async ({ page }) => {
    await openResult(page);
    const copy = profileCopy.anxious;
    const main = page.getByRole("main");
    for (const text of [copy.description, copy.afterBreakup, copy.noContactRisk]) {
      await expect(main.getByText(text, { exact: true })).toBeVisible();
    }
    for (const item of [...copy.watchOuts, ...copy.strengths]) {
      await expect(main.getByText(item, { exact: true })).toBeVisible();
    }
    await expect(page.getByTestId("lean")).toHaveCount(0);
  });

  test("a secure result with a moderate dimension leads with the lean and its watch-outs", async ({
    page,
  }) => {
    // Fixture 2's pattern: all "Sometimes" — 50/50, secure with the mixed lean.
    const all = (ids: readonly { questionId: string }[], value: number) =>
      ids.map((a) => ({ questionId: a.questionId, value }));
    await openResult(page, savedQuiz({ his: all(fixture1.answers, 2) }));
    await expect(page.locator("h1")).toHaveText("Your pattern: Secure");
    const lean = page.getByTestId("lean");
    await expect(lean.locator("p")).toHaveText(profileCopy.secure.leans!.mixed);
    await expect(lean.locator("li")).toHaveText(leanWatchOuts("mixed"));
  });

  test("since the breakup: the decodes his answers selected, in order", async ({ page }) => {
    await openResult(page);
    // The seeded answers put a2, a4 and a6 at "Sometimes" or above.
    const shown = page.getByTestId("decodes").locator("[data-decode]");
    expect(await shown.evaluateAll((els) => els.map((e) => e.getAttribute("data-decode")))).toEqual(
      ["a2", "a4", "a6"],
    );
    for (const id of ["a2", "a4", "a6"]) {
      await expect(page.getByRole("heading", { name: decodes[id]!.heading })).toBeVisible();
    }
    await expect(page.getByText(decodeFallback)).toHaveCount(0);
  });

  test("with no selector at the threshold, the single fallback line", async ({ page }) => {
    const none = ["a1", "a2", "a3", "a4", "a5", "a6"].map((questionId) => ({
      questionId,
      value: quizConfig.selectorThreshold - 1,
    }));
    await openResult(page, savedQuiz({ selectors: none }));
    await expect(page.getByTestId("decodes")).toHaveText(decodeFallback);
  });

  test("Act 3: the bridge, its two tools, then the email form with the programme line", async ({
    page,
  }) => {
    await openResult(page);
    await expect(page.getByText(plain(bridges.anxious))).toBeVisible();
    const act = page.locator("section", {
      has: page.getByRole("heading", { name: t.acts.after(she) }),
    });
    await expect(act.getByRole("link", { name: "Start a no-contact streak" })).toHaveAttribute(
      "href",
      routes.tracker,
    );
    await expect(act.getByRole("link", { name: "Check before you text" })).toHaveAttribute(
      "href",
      routes.decision,
    );
    await expect(page.getByTestId("email-result")).toContainText(programmeLine);
  });

  test("go deeper: exactly the profile's two next steps; no affiliate above the email form", async ({
    page,
  }) => {
    await openResult(page);
    const steps = page.getByTestId("next-steps").getByRole("link");
    await expect(steps).toHaveCount(2);
    expect(await steps.evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(
      profileCopy.anxious.nextSteps.map((s) => s.href),
    );
    // Every slot ships disabled (Section 13.4), so none renders at all.
    await expect(page.locator("[data-slot-id]")).toHaveCount(0);
  });

  test("an older question-set version shows the updated notice above the result", async ({
    page,
  }) => {
    await openResult(page, { ...persona, version: "men-v0" });
    await expect(page.getByText(t.outdated)).toBeVisible();
  });
});

test.describe("tracker offer (Sections 10.3 item 5, 11.1)", () => {
  test("one click starts a streak today, with the default goal", async ({ page }) => {
    const events = captureCollect(page);
    await openResult(page);
    const offer = page.getByTestId("tracker-offer");
    await expect(offer).toContainText(t.trackerOffer);
    await offer.getByRole("button", { name: trackerCopy.setup.submit }).click();
    await expect(offer).toContainText(trackerCopy.streak.dayZero);
    await expect(offer.getByRole("link", { name: t.trackerOpen })).toHaveAttribute(
      "href",
      routes.tracker,
    );
    const tracker = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), TRACKER);
    const today = toLocalDate(new Date());
    expect(tracker).toMatchObject({ startDate: addDays(today, 1), goalDays: 30, checkIns: [] });
    await expect.poll(() => events.some((e) => e.name === "tracker_created")).toBe(true);
    expect(events).toContainEqual({ name: "tracker_created", params: { goal_days: 30 } });
  });

  test("declining leaves nothing behind", async ({ page }) => {
    await openResult(page);
    await expect(page.getByTestId("tracker-offer").getByRole("button")).toBeVisible();
    expect(await page.evaluate((k) => localStorage.getItem(k), TRACKER)).toBeNull();
  });

  test("an existing streak is shown, never replaced", async ({ page }) => {
    const today = toLocalDate(new Date());
    const running = createTracker({ lastContact: addDays(today, -12), today, goalDays: 60 });
    await openResult(page, persona, { [TRACKER]: running });
    const offer = page.getByTestId("tracker-offer");
    await expect(offer).toContainText(trackerCopy.streak.dayOf(12, 60));
    await expect(offer.getByRole("button")).toHaveCount(0);
  });
});

test.describe("share and the shared view (Section 9.6; Fixture 7)", () => {
  const token = `v=${quizConfig.questionSetVersion}&a=72&v2=18`;

  test("copies the link with only the profile name and the site name", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const events = captureCollect(page);
    await openResult(page);
    await expect(page.getByText(t.share.body(she))).toBeVisible();
    await page.getByRole("button", { name: t.share.button }).click();
    await expect(page.getByText(t.share.copied)).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    // His own link: Persona A's scores, not the shared-view token below.
    const own = `v=${quizConfig.questionSetVersion}&a=${fixture1.expected.anxietyNorm}&v2=${fixture1.expected.avoidanceNorm}`;
    expect(copied).toBe(
      `My attachment pattern: Anxious, ${site.name} ${new URL(`${routes.quizResults}?${own}`, site.url).toString()}`,
    );
    // Scores and version only — nothing about her, no answers.
    expect(copied).not.toMatch(/a=13|83|q\d\d|h\d+/);
    await expect.poll(() => events.some((e) => e.name === "quiz_result_shared")).toBe(true);
    expect(events).toContainEqual({ name: "quiz_result_shared", params: { profile: "anxious" } });
  });

  test("a shared link renders his profile view under the banner — and nothing about her", async ({
    page,
  }) => {
    // A fresh browser: no saved result of its own.
    const res = await page.goto(`${routes.quizResults}?${token}`);
    expect(res?.status()).toBe(200);
    const view = page.getByTestId("result-shared");
    await expect(view).toContainText(t.sharedBanner);
    await expect(page.locator("h1")).toHaveText("Your pattern: Anxious (preoccupied)");
    await expect(page.getByTestId("result-scores")).toHaveText(
      "Attachment anxiety 72/100, highAttachment avoidance 18/100, low",
    );
    await expect(page.getByTestId("self-reflection-disclaimer")).toHaveText(blockA.text);
    // No pronoun answer travels in a link: the profile's partner lines use they/them (2.5).
    const neutral = profileCopyFor(pronounTerms.they).anxious;
    await expect(view).toContainText(neutral.description);
    for (const line of neutral.watchOuts) await expect(view).toContainText(line);
    await expect(view).toContainText("Checking their profiles or status many times a day.");
    await expect(view).not.toContainText(/\b(she|her|hers|herself|he|him|his|himself)\b/i);
    for (const id of ["partner-read", "dynamic", "decodes", "email-result", "tracker-offer"]) {
      await expect(page.getByTestId(id), id).toHaveCount(0);
    }
    await expect(page.locator('main input[type="email"]')).toHaveCount(0);
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toMatch(/noindex/);
    await expect(page.getByTestId("crisis-block")).toBeVisible();
  });

  test("a shared link shows the sharer's result even where a result is saved", async ({ page }) => {
    await seed(page, {
      [QUIZ]: savedQuiz({ his: fixture1.answers.map((a) => ({ ...a, value: 0 })) }),
    });
    await page.goto(`${routes.quizResults}?${token}`);
    await expect(page.getByTestId("result-shared")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Your pattern: Anxious (preoccupied)");
  });

  test("the banner's quiz link counts the visit as a share in quiz_view", async ({ page }) => {
    const events = captureCollect(page);
    await page.goto(`${routes.quizResults}?${token}`);
    await page.getByTestId("result-shared").getByRole("link", { name: t.sharedCta }).click();
    await expect(page).toHaveURL(new RegExp(`${routes.quiz}\\?from=share$`));
    await expect.poll(() => events.some((e) => e.name === "quiz_view")).toBe(true);
    expect(events).toContainEqual({ name: "quiz_view", params: { source: "share" } });
  });
});

test.describe("emailing the result (Section 13.1 a; founder decision, Session 5)", () => {
  test("sends his share token and her perceived-score token — never answers", async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route("**/api/email/", async (route) => {
      body = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ json: { ok: true } });
    });
    await openResult(page);
    const form = page.getByTestId("email-result");
    await form.getByLabel(formCopy.emailLabel).fill("reader@example.com");
    await form.getByRole("button", { name: formCopy.result.submit }).click();
    await expect(form.getByRole("status")).toContainText(
      formCopy.result.success("reader@example.com"),
    );
    const v = quizConfig.questionSetVersion;
    const { anxietyNorm, avoidanceNorm } = herFixtures.h1.expected;
    expect(body).toEqual({
      action: "send_result",
      email: "reader@example.com",
      token: `v=${v}&a=71&v2=13`,
      perceived: `v=${v}&a=${anxietyNorm}&v2=${avoidanceNorm}`,
      // The two pronoun answers, as enum values only (amendment brief, 2.5).
      pronouns: { taker: "he", partner: "she" },
      // Only the three "how it ended" answers the email needs, as option ids (v3, 6).
      ending: { b1: "partner", b2: "distance", b5: "distant" },
      alsoJoinList: false,
      website: "",
    });
  });
});

test.describe("joining the list from the result (Section 13.1 b)", () => {
  test("only the separate, unticked box asks to join — and the join is reported", async ({
    page,
  }) => {
    const events = captureCollect(page);
    let body: Record<string, unknown> | null = null;
    await page.route("**/api/email/", async (route) => {
      body = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ json: { ok: true, listJoined: true } });
    });
    await openResult(page);
    const form = page.getByTestId("email-result");
    const box = form.getByRole("checkbox", { name: formCopy.result.alsoJoin });
    await expect(box).not.toBeChecked();
    await form.getByLabel(formCopy.emailLabel).fill("reader@example.com");
    await box.check();
    await form.getByRole("button", { name: formCopy.result.submit }).click();
    await expect(form.getByRole("status")).toContainText(formCopy.result.joinedToo);
    expect(body).toMatchObject({ action: "send_result", alsoJoinList: true });
    await expect.poll(() => events.some((e) => e.name === "newsletter_signup")).toBe(true);
    expect(events).toContainEqual({ name: "newsletter_signup", params: { placement: "result" } });
  });
});

test.describe("print, accessibility and layout (Sections 8.1, 8.3, 16.4)", () => {
  test("print keeps the result, Block A and Block D, and drops the controls", async ({ page }) => {
    await openResult(page);
    await page.emulateMedia({ media: "print" });
    await expect(page.getByTestId("self-reflection-disclaimer")).toBeVisible();
    await expect(page.getByTestId("partner-read")).toBeVisible();
    await expect(page.getByTestId("result").getByTestId("crisis-block")).toBeVisible();
    for (const id of ["email-result", "tracker-offer"]) {
      await expect(page.getByTestId(id), id).toBeHidden();
    }
    await expect(page.getByRole("button", { name: t.share.button })).toBeHidden();
  });

  test("no late layout shift on the full or the shared view (Section 16.3 CLS ≤ 0.05)", async ({
    page,
  }) => {
    const cls = () =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let total = 0;
            new PerformanceObserver((list) => {
              for (const e of list.getEntries() as (PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              })[]) {
                if (!e.hadRecentInput) total += e.value;
              }
            }).observe({ type: "layout-shift", buffered: true });
            setTimeout(() => resolve(total), 1000);
          }),
      );
    await openResult(page);
    expect(await cls()).toBeLessThanOrEqual(0.05);
    await page.goto(`${routes.quizResults}?v=${quizConfig.questionSetVersion}&a=72&v2=18`);
    await expect(page.getByTestId("result-shared")).toBeVisible();
    expect(await cls()).toBeLessThanOrEqual(0.05);
  });

  test("axe: zero critical issues on the full and the shared view", async ({ page }) => {
    const critical = async () =>
      (await new AxeBuilder({ page }).analyze()).violations
        .filter((v) => v.impact === "critical")
        .map((v) => v.id);
    await openResult(page);
    expect(await critical()).toEqual([]);
    await page.goto(`${routes.quizResults}?v=${quizConfig.questionSetVersion}&a=72&v2=18`);
    await expect(page.getByTestId("result-shared")).toBeVisible();
    expect(await critical()).toEqual([]);
  });

  test("no horizontal scroll, and every control is at least 44px tall", async ({ page }) => {
    await openResult(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    // Links inside a sentence (Block D's "Crisis Resources") are exempt (WCAG 2.5.8).
    const controls = page
      .getByTestId("result")
      .locator("a:not([data-testid='crisis-block'] a), button, input[type='email']");
    for (const control of await controls.all()) {
      if (!(await control.isVisible())) continue;
      expect(
        (await control.boundingBox())!.height,
        (await control.textContent()) ?? "",
      ).toBeGreaterThanOrEqual(44);
    }
  });
});
