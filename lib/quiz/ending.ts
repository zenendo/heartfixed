import type { DynamicId } from "./dynamics";
import { endingQuestions, type EndingAnswers } from "./questions";
import type { ContextAnswers, ProfileId } from "./types";

/**
 * "How it ended" — quiz v3 amendment brief, 4 and 5. Unscored: these answers choose
 * result copy and never reach scoring. They're stored with the context answers
 * (brief, 2), so this reads them back out by question id.
 */

const IDS = endingQuestions.map((q) => q.id);

export function endingAnswersFrom(context: ContextAnswers): EndingAnswers {
  const answers: EndingAnswers = {};
  for (const id of IDS) {
    const value = context[id];
    const valid = endingQuestions.find((q) => q.id === id)!.options.some((o) => o.value === value);
    if (value !== undefined && valid) answers[id] = value;
  }
  return answers;
}

/** True when all five are answered — a result saved before the block has none. */
export const isEndingComplete = (answers: EndingAnswers) => IDS.every((id) => answers[id]);

export type FitId = "avoidant" | "fearful" | "explosion" | "anxious";

/**
 * At most one fit line (brief, 5). Conditions in priority order, first match wins.
 * "Her experienced pattern" is her module's four-pattern classification, as the reads use.
 */
export function endingFitFor({
  herProfile,
  dynamic,
  answers,
}: {
  herProfile: ProfileId;
  dynamic: DynamicId;
  answers: EndingAnswers;
}): FitId | null {
  const { b1, b2, b5 } = answers;
  if (herProfile === "avoidant" && (b2 === "distance" || b2 === "blindsided")) return "avoidant";
  if (herProfile === "fearful-avoidant" && (b2 === "cycles" || b5 === "on-off")) return "fearful";
  if (dynamic === "anxious-avoidant" && (b2 === "event" || b5 === "fight")) return "explosion";
  if (herProfile === "anxious" && b1 === "partner") return "anxious";
  return null;
}
