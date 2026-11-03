import { expect, test } from "@playwright/test";
import { routes } from "../../config/site";
import { blockA, blockB, blockC } from "../../content/compliance";
import { savedQuiz, seed } from "./support/savedQuiz";

/**
 * The Section 16.4 guardrail acceptance sweep, run over every Section 6 route. Routes
 * a later session builds are listed as fixme, so the gap stays visible until it's
 * closed rather than silently passing.
 *
 * Block E and the decision-outcome Block D are covered in decision.spec.ts, which has
 * to drive the tool to reach them.
 */

const NOT_BUILT_YET: Record<string, string> = {};

/** Routes that render from this browser's storage get a saved state first. */
const SEEDED: Record<string, Record<string, unknown>> = {
  [routes.quizResults]: { "heartfixed-quiz-v1": savedQuiz() },
};

/** Legal pages may explain prohibited terms (Section 14.2, legal-page context). */
const LEGAL = new Set<string>([routes.privacy, routes.terms, routes.affiliateDisclosure]);

const PROHIBITED =
  /therap|counsell?ing|treatment|diagnos|clinically proven|mental-health assessment|get (your ex|her|him|them) back|regret leaving|make her miss you/i;

/** Where Section 14.1/16.4 require each block, by test id. */
const REQUIRED: Record<string, string[]> = {
  [routes.quiz]: ["self-reflection-disclaimer", "tool-disclaimer"],
  [routes.tracker]: ["tool-disclaimer", "crisis-block"],
  [routes.decision]: ["tool-disclaimer"],
  [routes.about]: ["tool-disclaimer"],
  [routes.crisis]: ["crisis-block"],
  [routes.methodology]: ["self-reflection-disclaimer"],
  [routes.quizResults]: ["self-reflection-disclaimer", "crisis-block"],
};

for (const route of Object.values(routes)) {
  if (NOT_BUILT_YET[route]) {
    test.fixme(`${route}: guardrails (${NOT_BUILT_YET[route]})`, () => {});
    continue;
  }

  test(`${route}: guardrails`, async ({ page }) => {
    if (SEEDED[route]) await seed(page, SEEDED[route]);
    const response = await page.goto(route);
    expect(response?.status(), "route is built").toBe(200);

    // Block C in the footer of every page.
    await expect(page.getByRole("contentinfo").getByTestId("crisis-footer-line")).toHaveText(
      blockC.text,
    );
    // Crisis page linked from the footer.
    await expect(page.getByRole("contentinfo").locator(`a[href="${routes.crisis}"]`)).toBeVisible();

    for (const testId of REQUIRED[route] ?? []) {
      await expect(page.getByTestId(testId).first(), testId).toBeVisible();
    }

    // No chat UI anywhere (Section 16.4).
    await expect(page.locator('[role="log"], [aria-label*="chat" i]')).toHaveCount(0);

    // Prohibited terms: none outside the verbatim Blocks A/B and legal-page context.
    if (!LEGAL.has(route)) {
      const text = (await page.locator("body").innerText())
        .split(blockA.text)
        .join("")
        .split(blockB.text)
        .join("");
      expect(text).not.toMatch(PROHIBITED);
      expect(await page.locator("head").innerHTML()).not.toMatch(PROHIBITED);
    }
  });
}
