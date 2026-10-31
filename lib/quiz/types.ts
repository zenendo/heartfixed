import { z } from "zod";
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

/** Zod schemas — the single validation source shared by the UI and the engine tests. */

const partnerTermsSchema = z.object({
  subject: z.string().min(1),
  object: z.string().min(1),
  possessive: z.string().min(1),
});

export const quizQuestionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string().min(1),
  audience: z.string().min(1),
  stem: z.string().min(1),
  dimension: z.enum(DIMENSIONS),
  reversed: z.boolean(),
  weight: z.number().min(0.5).max(1.5),
  partnerTerms: partnerTermsSchema.partial().optional(),
}) satisfies z.ZodType<QuizQuestion>;

export const quizAnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.number().int().min(quizConfig.likert.min).max(quizConfig.likert.max),
}) satisfies z.ZodType<QuizAnswer>;
