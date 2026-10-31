import { quizConfig } from "@/config/quiz";
import {
  quizAnswerSchema,
  type Band,
  type Dimension,
  type Lean,
  type ProfileId,
  type QuizAnswer,
  type QuizQuestion,
  type QuizResult,
} from "./types";

/**
 * Scoring — Section 9.3. Pure functions: no I/O, no clock, no randomness. The same
 * answers always produce the same result. Reversal is handled only in this file.
 */

export class QuizScoringError extends Error {
  override name = "QuizScoringError";
}

const SCALE_MAX = quizConfig.likert.max;

/** Step 2: reversed items score `max − value`, then the weight applies. */
export function effectiveValue(question: QuizQuestion, value: number): number {
  return (question.reversed ? SCALE_MAX - value : value) * question.weight;
}

/** Step 4: the maximum raw score is computed from the data, never hardcoded. */
export function maxRawFor(questions: readonly QuizQuestion[], dimension: Dimension): number {
  return questions
    .filter((q) => q.dimension === dimension)
    .reduce((sum, q) => sum + SCALE_MAX * q.weight, 0);
}

/**
 * Step 4: normalize to an integer 0–100, rounding half up. The tiny epsilon stops
 * floating-point error (e.g. 66.49999999 for an exact 66.5) from rounding down.
 */
export function normalize(raw: number, maxRaw: number): number {
  return Math.floor((raw * 100) / maxRaw + 0.5 + 1e-9);
}

/** Step 5: band edges come from config/quiz.ts. */
export function bandFor(norm: number): Band {
  if (norm <= quizConfig.bands.lowMax) return "low";
  if (norm <= quizConfig.bands.moderateMax) return "moderate";
  return "high";
}

/** Step 6: profile from both bands — the Section 9.4 table. */
export function profileFor(anxietyBand: Band, avoidanceBand: Band): ProfileId {
  const anxious = anxietyBand === "high";
  const avoidant = avoidanceBand === "high";
  if (anxious && avoidant) return "fearful-avoidant";
  if (anxious) return "anxious";
  if (avoidant) return "avoidant";
  return "secure";
}

/** Section 9.4 nuance rule: which lean paragraph a secure result shows. */
export function leanFor(
  result: Pick<QuizResult, "profileId" | "anxietyBand" | "avoidanceBand">,
): Lean {
  if (result.profileId !== "secure") return "none";
  const anx = result.anxietyBand === "moderate";
  const avo = result.avoidanceBand === "moderate";
  if (anx && avo) return "mixed";
  if (anx) return "anxious";
  if (avo) return "avoidant";
  return "none";
}

export interface ScoreOptions {
  /** ISO timestamp supplied by the caller, so scoring itself never reads the clock. */
  completedAt: string;
  /** The unscored attention-check item and the value that passes it. */
  attentionCheck?: { questionId: string; expectedValue: number };
}

/**
 * Scores a completed quiz. Throws QuizScoringError on incomplete or invalid input —
 * missing answers are a UI bug, never imputed. Answers whose ids are not scored
 * questions (context or attention items) are ignored, so they cannot move scores.
 */
export function scoreQuiz(
  answers: readonly QuizAnswer[],
  questions: readonly QuizQuestion[],
  options: ScoreOptions,
): QuizResult {
  // Step 1: validate.
  const versions = new Set(questions.map((q) => q.version));
  if (versions.size !== 1) {
    throw new QuizScoringError(`Expected one question-set version, got ${versions.size}`);
  }
  const scoredIds = new Set(questions.map((q) => q.id));
  if (scoredIds.size !== questions.length) {
    throw new QuizScoringError("Duplicate question ids in the question set");
  }

  const values = new Map<string, number>();
  for (const answer of answers) {
    if (!scoredIds.has(answer.questionId)) continue;
    if (!quizAnswerSchema.safeParse(answer).success) {
      throw new QuizScoringError(`Invalid answer value for ${answer.questionId}`);
    }
    if (values.has(answer.questionId)) {
      throw new QuizScoringError(`More than one answer for ${answer.questionId}`);
    }
    values.set(answer.questionId, answer.value);
  }

  const missing = questions.filter((q) => !values.has(q.id)).map((q) => q.id);
  if (missing.length > 0) {
    throw new QuizScoringError(`Incomplete quiz — no answer for ${missing.join(", ")}`);
  }

  // Steps 2–5, per dimension.
  const score = (dimension: Dimension) => {
    const maxRaw = maxRawFor(questions, dimension);
    if (maxRaw === 0) throw new QuizScoringError(`No questions load on ${dimension}`);
    const raw = questions
      .filter((q) => q.dimension === dimension)
      .reduce((sum, q) => sum + effectiveValue(q, values.get(q.id)!), 0);
    const norm = normalize(raw, maxRaw);
    return { raw, norm, band: bandFor(norm) };
  };
  const anxiety = score("anxiety");
  const avoidance = score("avoidance");

  const attention = options.attentionCheck;
  const attentionFlag = attention
    ? answers.find((a) => a.questionId === attention.questionId)?.value !== attention.expectedValue
    : false;

  // Step 6.
  return {
    version: questions[0]!.version,
    anxietyRaw: anxiety.raw,
    avoidanceRaw: avoidance.raw,
    anxietyNorm: anxiety.norm,
    avoidanceNorm: avoidance.norm,
    anxietyBand: anxiety.band,
    avoidanceBand: avoidance.band,
    profileId: profileFor(anxiety.band, avoidance.band),
    completedAt: options.completedAt,
    attentionFlag,
  };
}
