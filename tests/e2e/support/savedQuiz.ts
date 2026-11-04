import type { Page } from "@playwright/test";
import {
  attentionCheck,
  completeAttempt,
  emptyProgress,
  type EndingAnswers,
  type QuizAnswer,
  type SavedQuiz,
} from "../../../lib/quiz";
import { fixture1, herFixtures } from "../../../lib/quiz/__tests__/fixtures";

/** The since-the-breakup answers the journeys use: a2, a4 and a6 reach the threshold. */
export const SELECTORS: QuizAnswer[] = ["a1", "a2", "a3", "a4", "a5", "a6"].map((id, i) => ({
  questionId: id,
  value: [0, 3, 1, 2, 0, 4][i]!,
}));

/**
 * A saved result built by the engine itself (completeAttempt), so result-view tests can
 * start on the page without driving 39 screens. Defaults to Fixture 1 with H1.
 */
/** The "how it ended" answers seeded results carry (v3): weeks of distance, she ended it. */
export const ENDING: Required<EndingAnswers> = {
  b1: "partner",
  b2: "distance",
  b3: "went-quiet",
  b4: "none",
  b5: "distant",
};

export function savedQuiz({
  his = fixture1.answers,
  her = herFixtures.h1.answers,
  selectors = SELECTORS,
  ending = ENDING,
}: {
  his?: readonly QuizAnswer[];
  her?: readonly QuizAnswer[];
  selectors?: readonly QuizAnswer[];
  ending?: EndingAnswers;
} = {}): SavedQuiz {
  const now = new Date();
  const progress = emptyProgress(now);
  for (const a of [...his, ...her, ...selectors]) progress.answers[a.questionId] = a.value;
  progress.answers[attentionCheck.id] = attentionCheck.expectedValue;
  progress.context = { ...(ending as Record<string, string>) };
  return completeAttempt(progress, now);
}

/** Puts a saved result (and optionally other keys) into this page's storage before load. */
export async function seed(page: Page, entries: Record<string, unknown>) {
  await page.addInitScript((items) => {
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, entries);
}
