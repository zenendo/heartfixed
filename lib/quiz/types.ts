import { z } from "zod/mini";
import type { PartnerTerms } from "@/config/copy";
import { quizConfig } from "@/config/quiz";

/** Data model — Section 9.1. */

export type Dimension = "anxiety" | "avoidance";
export const DIMENSIONS = ["anxiety", "avoidance"] as const satisfies readonly Dimension[];

export interface QuizQuestion {
  /** Stable, e.g. "q07" — never reused for different text. */
  id: string;
  /** Question-set version, e.g. "men-v1". */
  version: string;
  /** "men" at launch; see Section 2.3. */
  audience: string;
  /**
   * The situation, behaviour-framed. Partner references are tokens — {subject},
   * {object}, {possessive} — resolved by renderStem from config/copy.ts.
   */
  stem: string;
  /** Which dimension a high answer loads on. */
  dimension: Dimension;
  /** True when agreement indicates LOW loading. */
  reversed: boolean;
  /** Default 1; allowed 0.5–1.5, set only in data review. */
  weight: number;
  /** Per-question override of the partner dictionary (Section 2.3). */
  partnerTerms?: Partial<PartnerTerms>;
}

/** value: 0–4 Likert. */
export interface QuizAnswer {
  questionId: string;
  value: number;
}

export type Band = "low" | "moderate" | "high";
export type ProfileId = "secure" | "anxious" | "avoidant" | "fearful-avoidant";
/** Named lean for a secure result with a moderate dimension (Section 9.4). */
export type Lean = "none" | "anxious" | "avoidant" | "mixed";

export interface QuizResult {
  version: string;
  /** Summed weighted scores. */
  anxietyRaw: number;
  avoidanceRaw: number;
  /** 0–100 normalized (Section 9.3). */
  anxietyNorm: number;
  avoidanceNorm: number;
  anxietyBand: Band;
  avoidanceBand: Band;
  profileId: ProfileId;
  /** ISO date, client-side only. */
  completedAt: string;
  /**
   * Set when the attention-check item was answered wrongly (Section 9.2). Used only
   * to exclude a completion from aggregate analysis; never shown to the visitor.
   */
  attentionFlag: boolean;
}

/**
 * Zod schemas — the single validation source shared by the UI and the engine tests.
 * These run in the browser on the tool pages, so they stick to the zod/mini features
 * the tools already use (refine rather than regex, plain shapes rather than partial or
 * extend): every extra schema type lands in the zod chunk every tool page loads
 * (Section 16.3).
 */

const nonEmpty = () => z.string().check(z.minLength(1));

/** A string matching `pattern`. */
export const matching = (pattern: RegExp) => z.string().check(z.refine((s) => pattern.test(s)));

const optionalTerm = () => z.optional(nonEmpty());

export const quizQuestionSchema = z.object({
  id: matching(/^[a-z0-9-]+$/),
  version: nonEmpty(),
  audience: nonEmpty(),
  stem: nonEmpty(),
  dimension: z.enum(DIMENSIONS),
  reversed: z.boolean(),
  weight: z.number().check(z.minimum(0.5), z.maximum(1.5)),
  partnerTerms: z.optional(
    z.object({ subject: optionalTerm(), object: optionalTerm(), possessive: optionalTerm() }),
  ),
}) satisfies z.ZodMiniType<QuizQuestion>;

export const quizAnswerSchema = z.object({
  questionId: nonEmpty(),
  value: z.int().check(z.minimum(quizConfig.likert.min), z.maximum(quizConfig.likert.max)),
}) satisfies z.ZodMiniType<QuizAnswer>;

/** A since-the-breakup selector (quiz build brief, Part A): unscored, 0–4 scale. */
export interface SelectorItem {
  id: string;
  /** Partner references are tokens, as in QuizQuestion.stem. */
  stem: string;
  partnerTerms?: Partial<PartnerTerms>;
}

/**
 * Her pattern as he experienced it (brief, Part A) — scored from the her module with
 * the same engine, bands and profile table. Never a clinical label for her, and never part
 * of a share token (Section 9.6; brief, Part B sharing rule).
 */
export type PerceivedResult = Pick<
  QuizResult,
  | "anxietyRaw"
  | "avoidanceRaw"
  | "anxietyNorm"
  | "avoidanceNorm"
  | "anxietyBand"
  | "avoidanceBand"
  | "profileId"
>;

/** Unscored context answers, keyed by context-question id (Section 9.2). */
export type ContextAnswers = Record<string, string>;

/**
 * What saves under heartfixed-quiz-v1 on completion (Section 9.6): his result, her
 * perceived pattern, every answer (scored, attention, her, selectors), and context.
 * Lives only in this browser.
 */
export interface SavedQuiz {
  version: string;
  result: QuizResult;
  perceived: PerceivedResult;
  answers: QuizAnswer[];
  context: ContextAnswers;
}

/** An in-progress attempt under heartfixed-quiz-progress-v1 (Section 10.2). */
export interface QuizProgress {
  version: string;
  /** Index into the runner's step list. */
  step: number;
  /** Likert answers by item id: his, the attention check, hers and the selectors. */
  answers: Record<string, number>;
  context: ContextAnswers;
  /** ISO timestamps. An attempt not touched for 7 days is discarded. */
  startedAt: string;
  savedAt: string;
}

const BANDS = ["low", "moderate", "high"] as const;
const PROFILE_IDS = ["secure", "anxious", "avoidant", "fearful-avoidant"] as const;
const norm = () => z.int().check(z.minimum(0), z.maximum(100));
const raw = () => z.number().check(z.minimum(0));
const KEY = /^[a-z0-9-]{1,40}$/;

/**
 * A plain object of id → value, every key and value checked. (A custom check rather
 * than z.record keeps that schema type out of the zod chunk every tool page shares.)
 */
function mapOf<V>(valid: (v: unknown) => v is V) {
  return z.custom<Record<string, V>>(
    (input) =>
      typeof input === "object" &&
      input !== null &&
      Object.getPrototypeOf(input) === Object.prototype &&
      Object.entries(input).every(([k, v]) => KEY.test(k) && valid(v)),
  );
}

const contextSchema = mapOf((v): v is string => typeof v === "string" && KEY.test(v));

const perceivedShape = {
  anxietyRaw: raw(),
  avoidanceRaw: raw(),
  anxietyNorm: norm(),
  avoidanceNorm: norm(),
  anxietyBand: z.enum(BANDS),
  avoidanceBand: z.enum(BANDS),
  profileId: z.enum(PROFILE_IDS),
};

export const perceivedResultSchema = z.object(
  perceivedShape,
) satisfies z.ZodMiniType<PerceivedResult>;

export const quizResultSchema = z.object({
  ...perceivedShape,
  version: nonEmpty(),
  completedAt: z.iso.datetime(),
  attentionFlag: z.boolean(),
}) satisfies z.ZodMiniType<QuizResult>;

export const savedQuizSchema = z.object({
  version: nonEmpty(),
  result: quizResultSchema,
  perceived: perceivedResultSchema,
  answers: z.array(quizAnswerSchema).check(z.maxLength(100)),
  context: contextSchema,
}) satisfies z.ZodMiniType<SavedQuiz>;

export const quizProgressSchema = z.object({
  version: nonEmpty(),
  step: z.int().check(z.minimum(0), z.maximum(100)),
  answers: mapOf(
    (v): v is number =>
      Number.isInteger(v) &&
      (v as number) >= quizConfig.likert.min &&
      (v as number) <= quizConfig.likert.max,
  ),
  context: contextSchema,
  startedAt: z.iso.datetime(),
  savedAt: z.iso.datetime(),
}) satisfies z.ZodMiniType<QuizProgress>;
