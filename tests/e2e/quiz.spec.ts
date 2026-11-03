import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { quizConfig } from "../../config/quiz";
import { routes } from "../../config/site";
import { blockA } from "../../content/compliance";
import { runnerCopy } from "../../content/quiz";
import { collectRequestSchema, type CollectRequest } from "../../lib/analyticsSchema";
import {
  attentionCheck,
  herQuestions,
  questions,
  renderStem,
  runnerSteps,
  sinceBreakupSelectors,
  type QuizAnswer,
  type RunnerStep,
} from "../../lib/quiz";
import { fixture1, fixture4, herFixtures } from "../../lib/quiz/__tests__/fixtures";

/**
 * Session 4 — the quiz page and runner (Sections 10.1–10.2; quiz build brief, Part A).
 * Every journey drives the real runner one screen at a time, checks each screen's
 * question against the data, and ends on the stored result and the result view.
 */

/** His items keep "like me"; her items and the selectors drop it (founder, Session 4). */
const labelsFor = (step: RunnerStep) =>
  step.kind === "her" || step.kind === "selector"
    ? quizConfig.likert.partnerLabels
    : quizConfig.likert.labels;
const byId = new Map(
  [...questions, ...herQuestions, ...sinceBreakupSelectors].map((q) => [q.id, q]),
);

function stemFor(step: RunnerStep): string {
  if (step.kind === "attention") return attentionCheck.stem;
  if (step.kind === "context")
    return quizConfig.contextQuestions.find((c) => c.id === step.id)!.prompt;
  return renderStem(byId.get(step.id)!);
}

const SELECTORS: QuizAnswer[] = ["a1", "a2", "a3", "a4", "a5", "a6"].map((id, i) => ({
  questionId: id,
  value: [0, 3, 1, 2, 0, 4][i]!,
}));

interface Journey {
  his: readonly QuizAnswer[];
  her: readonly QuizAnswer[];
  attention?: number;
  /** Context option values; a missing one is skipped (they're optional). */
  context?: Record<string, string>;
}

async function stored(page: Page, key: string) {
  return page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, key);
}

/** Answers one runner screen: checks the question, picks the answer, moves on. */
async function answerStep(page: Page, step: RunnerStep, value: number | string | undefined) {
  await expect(page.locator("#quiz-question")).toHaveText(stemFor(step));
  if (step.kind === "context") {
    const option = quizConfig.contextQuestions
      .find((c) => c.id === step.id)!
      .options.find((o) => o.value === value);
    if (option) await page.getByRole("radio", { name: option.label, exact: true }).check();
    else return page.getByRole("button", { name: runnerCopy.skip }).click();
  } else {
    await page.getByRole("radio", { name: labelsFor(step)[value as number], exact: true }).check();
  }
  const last = step === runnerSteps[runnerSteps.length - 1];
  await page.getByRole("button", { name: last ? runnerCopy.finish : runnerCopy.next }).click();
}

async function runQuiz(page: Page, journey: Journey) {
  const values = new Map<string, number | string>([
    ...[...journey.his, ...journey.her, ...SELECTORS].map(
      (a) => [a.questionId, a.value] as [string, number],
    ),
    [attentionCheck.id, journey.attention ?? attentionCheck.expectedValue],
    ...Object.entries(journey.context ?? {}),
  ]);
  await page.goto(routes.quiz);
  await page.getByRole("button", { name: runnerCopy.start }).click();
  for (const step of runnerSteps) await answerStep(page, step, values.get(step.id));
  await expect(page).toHaveURL(new RegExp(`${routes.quizResults}$`));
}

function captureCollect(page: Page) {
  const bodies: string[] = [];
  const all: string[] = [];
  page.on("request", (req) => {
    all.push(`${req.url()} ${req.postData() ?? ""}`);
    if (req.url().includes("/api/collect/") && req.method() === "POST") {
      bodies.push(req.postData() ?? "");
    }
  });
  return { bodies, all };
}

test.describe("the pre-quiz page (Section 10.1)", () => {
  test("H1, the promise and Block A sit above the start button; no email field", async ({
    page,
  }) => {
    await page.goto(routes.quiz);
    await expect(page.locator("h1")).toHaveText("Attachment Style Quiz for Men");
    const disclaimer = page.getByTestId("self-reflection-disclaimer");
    await expect(disclaimer).toHaveText(blockA.text);
    const start = page.getByRole("button", { name: runnerCopy.start });
    await expect(start).toBeVisible();
    const [d, s] = [await disclaimer.boundingBox(), await start.boundingBox()];
    expect(d!.y).toBeLessThan(s!.y);
    await expect(page.getByRole("main").locator('input[type="email"]')).toHaveCount(0);
    await expect(page.locator("[data-slot-id]")).toHaveCount(0);
  });

  test("profiles, how it works, who it's for, FAQ and trust are in the initial HTML", async ({
    request,
  }) => {
    const html = await (await request.get(routes.quiz)).text();
    for (const text of [
      "The four patterns it measures",
      "How the quiz works",
      "Who it isn&#x27;t for",
      "Questions about the quiz",
      "Your answers stay in this browser",
      "/attachment-styles/fearful-avoidant/",
      '"@type":"FAQPage"',
    ]) {
      expect(html, text).toContain(text);
    }
  });
});

test.describe("end-to-end fixtures (Section 16.2; brief, Part A)", () => {
  // Each journey answers all 45 screens; allow for a loaded machine.
  test.describe.configure({ timeout: 90_000 });

  test("Fixture 1 — Persona A with H1: anxious 72/18; her pattern avoidant 83/13", async ({
    page,
  }) => {
    const { bodies, all } = captureCollect(page);
    await runQuiz(page, {
      his: fixture1.answers,
      her: herFixtures.h1.answers,
      context: { "ctx-time-since-breakup": "2-weeks-to-2-months", "ctx-no-contact": "trying" },
    });

    // The result view: headline, both scores, Block A directly under them.
    await expect(page.locator("h1")).toHaveText("Your pattern: Anxious (preoccupied)");
    const scores = page.getByTestId("result-scores");
    await expect(scores).toHaveText(
      "Attachment anxiety 72/100 — highAttachment avoidance 18/100 — low",
    );
    await expect(scores.locator("xpath=following-sibling::*[1]")).toHaveText(blockA.text);
    await expect(page.getByTestId("crisis-block")).toBeVisible();
    // The full Part B view from the real run: her read, the dynamic, the decodes.
    await expect(page.getByTestId("partner-read").locator("h3")).toHaveText(
      "Her pattern, as you experienced it: Avoidant (dismissive)",
    );
    await expect(page.getByTestId("dynamic")).toHaveAttribute("data-dynamic", "anxious-avoidant");
    expect(
      await page
        .getByTestId("decodes")
        .locator("[data-decode]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-decode"))),
    ).toEqual(["a2", "a4", "a6"]);

    // What saved: his result, her perceived pattern, every answer, context.
    const saved = await stored(page, "heartfixed-quiz-v1");
    expect(saved!.result).toMatchObject({ ...fixture1.expected, attentionFlag: false });
    expect(saved!.perceived).toEqual(herFixtures.h1.expected);
    expect(saved!.context).toEqual({
      "ctx-time-since-breakup": "2-weeks-to-2-months",
      "ctx-no-contact": "trying",
    });
    expect(saved!.answers).toHaveLength(24 + 1 + 12 + 6);
    expect(await stored(page, "heartfixed-quiz-progress-v1")).toBeNull();

    // Analytics: his profile and bands only — no answers, nothing about her.
    await expect.poll(() => bodies.length).toBeGreaterThanOrEqual(3);
    const events = bodies.flatMap((b) => {
      expect(collectRequestSchema.safeParse(JSON.parse(b)).success).toBe(true);
      return (JSON.parse(b) as CollectRequest).events;
    });
    expect(events).toContainEqual({ name: "quiz_view", params: { source: "organic" } });
    expect(events).toContainEqual({ name: "quiz_started", params: {} });
    expect(events).toContainEqual({
      name: "quiz_completed",
      params: { profile: "anxious", anxiety_band: "high", avoidance_band: "low" },
    });
    // No request of any kind carries an answer key or the her result.
    expect(all.filter((r) => /"(q\d\d|h\d+|a\d|attn-01|answers|perceived)"/.test(r))).toEqual([]);
  });

  test("Persona A with H2: her pattern anxious 88/13; context skipped", async ({ page }) => {
    await runQuiz(page, { his: fixture1.answers, her: herFixtures.h2.answers });
    await expect(page.locator("h1")).toHaveText("Your pattern: Anxious (preoccupied)");
    const saved = await stored(page, "heartfixed-quiz-v1");
    expect(saved!.result).toMatchObject(fixture1.expected);
    expect(saved!.perceived).toEqual(herFixtures.h2.expected);
    expect(saved!.context).toEqual({});
    await expect(page.getByTestId("partner-read").locator("h3")).toHaveText(
      "Her pattern, as you experienced it: Anxious (preoccupied)",
    );
    await expect(page.getByTestId("dynamic")).toHaveAttribute("data-dynamic", "anxious-anxious");
  });

  test("Fixture 4 — avoidant, with a wrong attention answer flagged silently", async ({ page }) => {
    await runQuiz(page, {
      his: fixture4.avoidant.answers,
      her: herFixtures.h2.answers,
      attention: 3,
    });
    await expect(page.locator("h1")).toHaveText("Your pattern: Avoidant (dismissive)");
    await expect(page.getByTestId("result-scores")).toHaveText(
      "Attachment anxiety 9/100 — lowAttachment avoidance 83/100 — high",
    );
    const saved = await stored(page, "heartfixed-quiz-v1");
    expect(saved!.result).toMatchObject({ ...fixture4.avoidant.expected, attentionFlag: true });
    // The flag is never shown: no mention of the check itself (the result copy may
    // still say "reading" in its own sense, as in "rereading old messages").
    await expect(page.getByRole("main").getByText(/attention|reading check/i)).toHaveCount(0);
  });

  test("Fixture 4 — fearful-avoidant", async ({ page }) => {
    await runQuiz(page, { his: fixture4.fearfulAvoidant.answers, her: herFixtures.h1.answers });
    await expect(page.locator("h1")).toHaveText("Your pattern: Fearful-avoidant (disorganized)");
    const saved = await stored(page, "heartfixed-quiz-v1");
    expect(saved!.result).toMatchObject(fixture4.fearfulAvoidant.expected);
  });

  test("Fixture 7 (shell half) — a tampered token shows the take-the-quiz shell, not an error", async ({
    page,
  }) => {
    const res = await page.goto(`${routes.quizResults}?v=men-v1&a=999&v2=18`);
    expect(res?.status()).toBe(200);
    await expect(page.getByTestId("result-empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Take the quiz" })).toHaveAttribute(
      "href",
      routes.quiz,
    );
  });
});

test.describe("the runner (Sections 8.3, 10.2)", () => {
  test.describe.configure({ timeout: 90_000 });

  test("labels each section, leaves the attention check unnumbered, shows the instruction", async ({
    page,
  }) => {
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    const progress = page.getByTestId("quiz-progress");
    await expect(progress).toHaveText("Question 1 of 24");
    await expect(page.getByText(quizConfig.instruction)).toBeVisible();
    await expect(page.locator("#quiz-question")).toBeFocused();

    const seen: Record<number, string> = {};
    const framed: number[] = [];
    for (const [i, step] of runnerSteps.entries()) {
      seen[i] = (await progress.textContent()) ?? "";
      if (await page.getByTestId("partner-intro").isVisible()) framed.push(i);
      if (step.kind !== "context") {
        const shown = await page
          .getByRole("radio")
          .evaluateAll((els) =>
            els.map((el) => (el as HTMLInputElement).labels?.[0]?.textContent?.trim()),
          );
        expect(shown, step.id).toEqual([...labelsFor(step)]);
      }
      if (i === runnerSteps.length - 1) break;
      await answerStep(page, step, step.kind === "context" ? undefined : 2);
    }
    expect(seen[11]).toBe("Question 12 of 24");
    expect(seen[12]).toBe(""); // the attention check
    expect(seen[13]).toBe("Question 13 of 24");
    expect(seen[25]).toBe("About her — 1 of 12");
    expect(seen[36]).toBe("About her — 12 of 12");
    expect(seen[37]).toBe("Since the breakup — 1 of 6");
    expect(seen[43]).toBe("About where you are now — 1 of 2");
    expect(framed).toEqual([25]); // the framing line, before her first question only
    await expect(page.getByText(quizConfig.contextNote)).toBeVisible();
  });

  test("won't advance without an answer (Fixture 6), and Back keeps answers", async ({ page }) => {
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    await page.getByRole("button", { name: runnerCopy.next }).click();
    await expect(page.getByText(runnerCopy.chooseError)).toBeVisible();
    await expect(page.getByTestId("quiz-progress")).toHaveText("Question 1 of 24");

    await page.getByRole("radio", { name: "Often", exact: true }).check();
    await expect(page.getByText(runnerCopy.chooseError)).toHaveCount(0);
    await page.getByRole("button", { name: runnerCopy.next }).click();
    await page.getByRole("radio", { name: "Rarely", exact: true }).check();
    await page.getByRole("button", { name: runnerCopy.back }).click();
    await expect(page.getByRole("radio", { name: "Often", exact: true })).toBeChecked();
    await page.getByRole("button", { name: runnerCopy.next }).click();
    await expect(page.getByRole("radio", { name: "Rarely", exact: true })).toBeChecked();
  });

  test("works by keyboard alone: arrows to choose, Enter to advance", async ({ page }) => {
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#quiz-question")).toBeFocused();
    for (let i = 1; i <= 3; i++) {
      await expect(page.locator("#quiz-question")).toBeFocused();
      await page.keyboard.press("Tab"); // into the radio group
      await page.keyboard.press("ArrowDown"); // selects "Rarely"
      await page.keyboard.press("Enter"); // submits the form
      await expect(page.getByTestId("quiz-progress")).toHaveText(`Question ${i + 1} of 24`);
    }
    const progress = await stored(page, "heartfixed-quiz-progress-v1");
    expect(progress!.answers).toEqual({ q01: 1, q02: 1, q03: 1 });
  });

  test("restores after a browser restart, from where he left off", async ({ browser }) => {
    const first = await browser.newContext();
    const page = await first.newPage();
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    for (const step of runnerSteps.slice(0, 9)) await answerStep(page, step, 3);
    const state = await first.storageState();
    await first.close();

    const second = await browser.newContext({ storageState: state });
    const again = await second.newPage();
    await again.goto(routes.quiz);
    await expect(again.getByText("Continue where you left off — question 10 of 24")).toBeVisible();
    await again.getByRole("button", { name: runnerCopy.resumeCta }).click();
    await expect(again.getByTestId("quiz-progress")).toHaveText("Question 10 of 24");
    await again.getByRole("button", { name: runnerCopy.back }).click();
    await expect(again.getByRole("radio", { name: "Often", exact: true })).toBeChecked();
    await second.close();
  });

  test("discards an attempt untouched for more than 7 days", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-10T12:00:00Z"));
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem(
        "heartfixed-quiz-progress-v1",
        JSON.stringify({
          version: "men-v1",
          step: 5,
          answers: { q01: 2, q02: 2, q03: 2, q04: 2, q05: 2 },
          context: {},
          startedAt: "2026-11-01T12:00:00.000Z",
          savedAt: "2026-11-02T11:00:00.000Z",
        }),
      );
    });
    await page.goto(routes.quiz);
    await expect(page.getByRole("button", { name: runnerCopy.start })).toBeVisible();
    await expect(page.getByText(/Continue where you left off/)).toHaveCount(0);
    expect(await stored(page, "heartfixed-quiz-progress-v1")).toBeNull();
  });

  test("a return visit offers the saved result; retaking asks first; clearing deletes", async ({
    page,
  }) => {
    await runQuiz(page, { his: fixture1.answers, her: herFixtures.h1.answers });
    await page.goto(routes.quiz);
    await expect(page.getByText(runnerCopy.saved.heading)).toBeVisible();
    await page.getByRole("button", { name: runnerCopy.saved.retake }).click();
    await expect(page.getByText(runnerCopy.saved.confirm)).toBeVisible();
    await page.getByRole("button", { name: runnerCopy.saved.confirmNo }).click();
    await page.getByRole("button", { name: runnerCopy.saved.see }).click();
    await expect(page).toHaveURL(new RegExp(`${routes.quizResults}$`));
    await expect(page.locator("h1")).toHaveText("Your pattern: Anxious (preoccupied)");

    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.clear }).click();
    await expect(page.getByText(runnerCopy.cleared)).toBeVisible();
    expect(await stored(page, "heartfixed-quiz-v1")).toBeNull();
    expect(await stored(page, "heartfixed-quiz-progress-v1")).toBeNull();
    await page.goto(routes.quizResults);
    await expect(page.getByTestId("result-empty")).toBeVisible();
  });

  test("a corrupted saved value is cleared with a plain-English note", async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("heartfixed-quiz-v1", "{not json");
    });
    await page.goto(routes.quiz);
    await expect(page.getByText(runnerCopy.corrupt)).toBeVisible();
    await page.getByRole("button", { name: runnerCopy.start }).click();
    await expect(page.getByTestId("quiz-progress")).toHaveText("Question 1 of 24");
  });

  test("axe: zero critical issues on the page, mid-runner and on the result", async ({ page }) => {
    const critical = async () =>
      (await new AxeBuilder({ page }).analyze()).violations
        .filter((v) => v.impact === "critical")
        .map((v) => v.id);
    await page.goto(routes.quiz);
    expect(await critical()).toEqual([]);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    await page.getByRole("button", { name: runnerCopy.next }).click(); // error state
    expect(await critical()).toEqual([]);
    await page.goto(routes.quizResults);
    expect(await critical()).toEqual([]);
  });

  test("no horizontal scroll, and controls are at least 44px tall", async ({ page }) => {
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    for (const control of await page.getByTestId("quiz-runner").locator("label, button").all()) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  });
});
