import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { pronounTerms } from "../../config/copy";
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
  type PronounChoice,
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

function stemFor(step: RunnerStep, partner = pronounTerms.she): string {
  if (step.kind === "pronouns") return runnerCopy.pronouns[step.id];
  if (step.kind === "attention") return attentionCheck.stem;
  if (step.kind === "context")
    return quizConfig.contextQuestions.find((c) => c.id === step.id)!.prompt;
  return renderStem(byId.get(step.id)!, partner);
}

const DEFAULT_CHOICE: PronounChoice = { taker: "he", partner: "she" };

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
  /** The two pronoun answers; he/him and she/her when not given. */
  pronouns?: PronounChoice;
}

async function stored(page: Page, key: string) {
  return page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, key);
}

/** Answers one runner screen: checks the question, picks the answer, moves on. */
async function answerStep(
  page: Page,
  step: RunnerStep,
  value: number | string | undefined,
  choice: PronounChoice = DEFAULT_CHOICE,
) {
  await expect(page.locator("#quiz-question")).toHaveText(
    stemFor(step, pronounTerms[choice.partner]),
  );
  if (step.kind === "pronouns") {
    // One tap answers and advances (amendment brief, 2.1).
    const label = runnerCopy.pronouns.options[choice[step.id]];
    return page.getByRole("button", { name: label, exact: true }).click();
  }
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

/** Taps through the two pronoun screens (amendment brief, 2.1). */
async function passPronouns(page: Page, choice: PronounChoice = DEFAULT_CHOICE) {
  for (const step of runnerSteps.slice(0, 2)) await answerStep(page, step, undefined, choice);
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
  for (const step of runnerSteps) {
    await answerStep(page, step, values.get(step.id), journey.pronouns);
  }
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
  // Each journey answers all 39 screens; allow for a loaded machine.
  test.describe.configure({ timeout: 90_000 });

  test("Fixture 1 — Persona A with H1: anxious 71/13; her pattern avoidant 83/13", async ({
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
      "Attachment anxiety 71/100, highAttachment avoidance 13/100, low",
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
    expect(saved!.answers).toHaveLength(18 + 1 + 12 + 6);
    expect(saved!.pronouns).toEqual({ taker: "he", partner: "she" });
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
    // No request of any kind carries an answer key, the her result, or the pronoun
    // answers (amendment brief, 2.4: analytics unchanged).
    expect(
      all.filter((r) =>
        /"(q\d\d|h\d+|a\d|attn-01|answers|perceived|pronouns|taker|partner)"/.test(r),
      ),
    ).toEqual([]);
    for (const event of events) {
      expect(Object.keys(event.params)).not.toContain("pronouns");
      for (const value of Object.values(event.params)) {
        expect(["he", "she", "they"]).not.toContain(value);
      }
    }
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

  test("Fixture 4 — Persona B, avoidant, with a wrong attention answer flagged silently", async ({
    page,
  }) => {
    await runQuiz(page, {
      his: fixture4.avoidant.answers,
      her: herFixtures.h2.answers,
      attention: 3,
      pronouns: { taker: "she", partner: "they" },
    });
    await expect(page.locator("h1")).toHaveText("Your pattern: Avoidant (dismissive)");
    // A they/them partner, chosen on the pronoun screens: the whole result follows it.
    await expect(page.getByTestId("partner-read").locator("h3")).toHaveText(
      "Their pattern, as you experienced it: Anxious (preoccupied)",
    );
    await expect(page.locator("#act-after")).toHaveText("Getting over them, with your pattern");
    await expect(page.getByTestId("result-scores")).toHaveText(
      "Attachment anxiety 29/100, lowAttachment avoidance 87/100, high",
    );
    const saved = await stored(page, "heartfixed-quiz-v1");
    expect(saved!.result).toMatchObject({ ...fixture4.avoidant.expected, attentionFlag: true });
    expect(saved!.pronouns).toEqual({ taker: "she", partner: "they" });
    await expect(page.getByRole("main")).not.toContainText(/\b(she|her|hers|herself)\b/i);
    // The flag is never shown: no mention of the check itself (the result copy may
    // still say "reading" in its own sense, as in "rereading old messages").
    await expect(page.getByRole("main").getByText(/attention|reading check/i)).toHaveCount(0);
  });

  test("Fixture 4 — Persona C, fearful-avoidant", async ({ page }) => {
    await runQuiz(page, {
      his: fixture4.fearfulAvoidant.answers,
      her: herFixtures.h1.answers,
      pronouns: { taker: "they", partner: "he" },
    });
    await expect(page.locator("h1")).toHaveText("Your pattern: Fearful-avoidant (disorganized)");
    await expect(page.getByTestId("partner-read").locator("h3")).toHaveText(
      "His pattern, as you experienced it: Avoidant (dismissive)",
    );
    await expect(page.getByTestId("result-scores")).toHaveText(
      "Attachment anxiety 79/100, highAttachment avoidance 76/100, high",
    );
    const saved = await stored(page, "heartfixed-quiz-v1");
    expect(saved!.result).toMatchObject(fixture4.fearfulAvoidant.expected);
  });

  test("Fixture 4 — Persona D, secure", async ({ page }) => {
    await runQuiz(page, { his: fixture4.secure.answers, her: herFixtures.h2.answers });
    await expect(page.locator("h1")).toHaveText("Your pattern: Secure");
    await expect(page.getByTestId("result-scores")).toHaveText(
      "Attachment anxiety 21/100, lowAttachment avoidance 24/100, low",
    );
    const saved = await stored(page, "heartfixed-quiz-v1");
    expect(saved!.result).toMatchObject(fixture4.secure.expected);
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
    await expect(page.locator("#quiz-question")).toBeFocused();
    await passPronouns(page);
    await expect(progress).toHaveText("Question 1 of 18");
    await expect(page.getByText(quizConfig.instruction)).toBeVisible();
    await expect(page.locator("#quiz-question")).toBeFocused();

    const seen: Record<number, string> = {};
    const framed: number[] = [];
    for (const [i, step] of runnerSteps.entries()) {
      if (step.kind === "pronouns") continue;
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
    // Screens 0 and 1 are the pronoun questions.
    expect(seen[7]).toBe("Question 6 of 18");
    expect(seen[8]).toBe(""); // the attention check
    expect(seen[9]).toBe("Question 7 of 18");
    expect(seen[20]).toBe("Question 18 of 18");
    expect(seen[21]).toBe("About your ex: 1 of 12");
    expect(seen[32]).toBe("About your ex: 12 of 12");
    expect(seen[33]).toBe("Since the breakup: 1 of 6");
    expect(seen[39]).toBe("About where you are now: 1 of 2");
    expect(framed).toEqual([21]); // the framing line, before her first question only
    await expect(page.getByTestId("partner-intro")).toHaveCount(0);
    await expect(page.getByText(quizConfig.contextNote)).toBeVisible();
  });

  test("won't advance without an answer (Fixture 6), and Back keeps answers", async ({ page }) => {
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    await passPronouns(page);
    await page.getByRole("button", { name: runnerCopy.next }).click();
    await expect(page.getByText(runnerCopy.chooseError)).toBeVisible();
    await expect(page.getByTestId("quiz-progress")).toHaveText("Question 1 of 18");

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
    // The pronoun screens: Tab to an answer, Enter taps it.
    for (const heading of [runnerCopy.pronouns.taker, runnerCopy.pronouns.partner]) {
      await expect(page.locator("#quiz-question")).toBeFocused();
      await expect(page.locator("#quiz-question")).toHaveText(heading);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
    }
    await expect(page.locator("#quiz-question")).toBeFocused();
    for (let i = 1; i <= 3; i++) {
      await expect(page.locator("#quiz-question")).toBeFocused();
      await page.keyboard.press("Tab"); // into the radio group
      await page.keyboard.press("ArrowDown"); // selects "Rarely"
      await page.keyboard.press("Enter"); // submits the form
      await expect(page.getByTestId("quiz-progress")).toHaveText(`Question ${i + 1} of 18`);
    }
    const progress = await stored(page, "heartfixed-quiz-progress-v1");
    expect(progress!.answers).toEqual({ q01: 1, q02: 1, q03: 1 });
    expect(progress!.pronouns).toEqual({ taker: "he", partner: "he" });
  });

  test("restores after a browser restart, from where he left off", async ({ browser }) => {
    const first = await browser.newContext();
    const page = await first.newPage();
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    for (const step of runnerSteps.slice(0, 11)) await answerStep(page, step, 3);
    const state = await first.storageState();
    await first.close();

    const second = await browser.newContext({ storageState: state });
    const again = await second.newPage();
    await again.goto(routes.quiz);
    // Eleven screens in: the two pronoun screens, six of his, the attention check, two more.
    await expect(again.getByText("Continue where you left off: question 9 of 18")).toBeVisible();
    await again.getByRole("button", { name: runnerCopy.resumeCta }).click();
    await expect(again.getByTestId("quiz-progress")).toHaveText("Question 9 of 18");
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
          version: "men-v2",
          step: 5,
          answers: { q01: 2, q02: 2, q03: 2, q05: 2, q06: 2 },
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
    await expect(page.locator("#quiz-question")).toHaveText(runnerCopy.pronouns.taker);
  });

  test("axe: zero critical issues on the page, mid-runner and on the result", async ({ page }) => {
    const critical = async () =>
      (await new AxeBuilder({ page }).analyze()).violations
        .filter((v) => v.impact === "critical")
        .map((v) => v.id);
    await page.goto(routes.quiz);
    expect(await critical()).toEqual([]);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    expect(await critical()).toEqual([]); // the first pronoun screen
    await passPronouns(page);
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
    // The pronoun screen, then the first question.
    for (let screen = 0; screen < 2; screen++) {
      const controls = await page.getByTestId("quiz-runner").locator("label, button").all();
      expect(controls.length).toBeGreaterThan(3);
      for (const control of controls) {
        expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      if (screen === 0) await passPronouns(page);
    }
  });
});

test.describe("the two pronoun questions (amendment brief, 2.1)", () => {
  test("ask before question 1, unnumbered, one tap each, with the intro on the first", async ({
    page,
  }) => {
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    const question = page.locator("#quiz-question");
    await expect(question).toHaveText(runnerCopy.pronouns.taker);
    await expect(page.getByText(runnerCopy.pronouns.intro)).toBeVisible();
    await expect(page.getByTestId("quiz-progress")).toHaveCount(0);
    const options = page.getByTestId("pronoun-question").getByRole("button");
    await expect(options).toHaveText(["He/Him", "She/Her", "They/Them"]);
    await expect(page.getByRole("button", { name: runnerCopy.back })).toHaveCount(0);

    await page.getByRole("button", { name: "She/Her", exact: true }).click();
    await expect(question).toHaveText(runnerCopy.pronouns.partner);
    await expect(page.getByText(runnerCopy.pronouns.intro)).toHaveCount(0);
    await expect(page.getByTestId("quiz-progress")).toHaveCount(0);

    // Back keeps the first answer, shown as pressed.
    await page.getByRole("button", { name: runnerCopy.back }).click();
    await expect(page.getByRole("button", { name: "She/Her", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: "She/Her", exact: true }).click();
    await page.getByRole("button", { name: "They/Them", exact: true }).click();
    await expect(page.getByTestId("quiz-progress")).toHaveText("Question 1 of 18");
    await expect(page.getByText(quizConfig.instruction)).toBeVisible();
    const progress = await stored(page, "heartfixed-quiz-progress-v1");
    expect(progress!.pronouns).toEqual({ taker: "she", partner: "they" });
  });

  test("the stems and the framing line follow the partner's pronouns", async ({ page }) => {
    const choice: PronounChoice = { taker: "they", partner: "they" };
    await page.goto(routes.quiz);
    await page.getByRole("button", { name: runnerCopy.start }).click();
    await passPronouns(page, choice);
    // q01, with the they/them partner.
    await expect(page.locator("#quiz-question")).toHaveText(
      "When they took a while to reply, I checked my phone regularly instead of focusing on my own life.",
    );
    // Through his section to the first question about the partner.
    for (const step of runnerSteps.slice(2, 21)) await answerStep(page, step, 2, choice);
    await expect(page.getByTestId("partner-intro")).toHaveText(
      "Now think about them in the same relationship: how they showed up, as you experienced it.",
    );
    await expect(page.locator("#quiz-question")).toHaveText(
      "When I didn't reply for a few hours, they sent several messages or called until I answered.",
    );
  });
});
