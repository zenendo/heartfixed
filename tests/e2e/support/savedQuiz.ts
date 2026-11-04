import type { Page } from "@playwright/test";
import {
  attentionCheck,
  completeAttempt,
  emptyProgress,
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
export function savedQuiz({
  his = fixture1.answers,
  her = herFixtures.h1.answers,
  selectors = SELECTORS,
}: {
  his?: readonly QuizAnswer[];
  her?: readonly QuizAnswer[];
  selectors?: readonly QuizAnswer[];
} = {}): SavedQuiz {
  const now = new Date();
  const progress = emptyProgress(now);
  for (const a of [...his, ...her, ...selectors]) progress.answers[a.questionId] = a.value;
  progress.answers[attentionCheck.id] = attentionCheck.expectedValue;
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
