import type { Dimension, QuizAnswer, QuizQuestion, QuizResult } from "../types";

/**
 * Engine fixtures — Section 16.2.
 *
 * The banks here are TEMPORARY TEST DATA, not production copy. They prove the engine
 * against the fixtures until the founder-reviewed launch bank arrives in Session 4.
 * If a fixture and the code ever disagree, stop and flag it — never edit an expected
 * value to make a test pass (Section 1).
 */

export const COMPLETED_AT = "2026-10-31T12:00:00.000Z";

function item(id: string, dimension: Dimension, reversed: boolean, weight = 1): QuizQuestion {
  return {
    id,
    version: "men-v1",
    audience: "men",
    stem: `Temporary test item ${id} (${dimension}${reversed ? ", reversed" : ""}), not production copy.`,
    dimension,
    reversed,
    weight,
  };
}

const qid = (n: number) => `q${String(n).padStart(2, "0")}`;

/**
 * Temporary full bank: 24 items, all weight 1. Odd ids load on anxiety, even ids on
 * avoidance. Reversed: q05, q17 (anxiety) and q08, q20 (avoidance) — exactly two per
 * dimension, four in total.
 */
const REVERSED = new Set(["q05", "q17", "q08", "q20"]);
export const tempBank: QuizQuestion[] = Array.from({ length: 24 }, (_, i) => {
  const id = qid(i + 1);
  return item(id, (i + 1) % 2 === 1 ? "anxiety" : "avoidance", REVERSED.has(id));
});

/**
 * Band-edge bank. A dimension of 12 weight-1 items can't produce 34 or 66 (its
 * reachable scores step 33 → 35 and 65 → 67), so Fixture 5 uses a bank where each
 * dimension has 11 weight-1 items plus one weight-0.5 item. Max raw per dimension =
 * 11 × 4 × 1 + 1 × 4 × 0.5 = 46. Reversed: be01, be02 (anxiety), be13, be14 (avoidance).
 */
export const bandEdgeBank: QuizQuestion[] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const id = `be${String(n).padStart(2, "0")}`;
  const dimension: Dimension = n <= 12 ? "anxiety" : "avoidance";
  const reversed = [1, 2, 13, 14].includes(n);
  const weight = n === 12 || n === 24 ? 0.5 : 1;
  return item(id, dimension, reversed, weight);
});

/** Every scored item answered with the same Likert value. */
export function uniformAnswers(bank: readonly QuizQuestion[], value: number): QuizAnswer[] {
  return bank.map((q) => ({ questionId: q.id, value }));
}

/**
 * Builds answers from per-item *effective* values (before weight), in bank order per
 * dimension. Reversed items get value = 4 − effective, so the fixture reads as the
 * score each item contributes.
 */
export function answersFromEffective(
  bank: readonly QuizQuestion[],
  effective: Record<Dimension, number[]>,
): QuizAnswer[] {
  const cursor: Record<Dimension, number> = { anxiety: 0, avoidance: 0 };
  return bank.map((q) => {
    const eff = effective[q.dimension][cursor[q.dimension]++];
    if (eff === undefined) throw new Error(`No effective value for ${q.id}`);
    return { questionId: q.id, value: q.reversed ? 4 - eff : eff };
  });
}

type Expected = Omit<QuizResult, "completedAt" | "attentionFlag">;

/**
 * Fixture 2 — all-neutral. Every answer is "Sometimes" (2).
 *
 * Hand verification (Section 16.2), per dimension (12 items, weight 1):
 *   - 10 non-reversed items: effective = 2 × 1 = 2 each → 20
 *   -  2 reversed items:     effective = (4 − 2) × 1 = 2 each → 4
 *   - raw = 20 + 4 = 24; max raw = 12 × 4 × 1 = 48 (exactly half of maximum)
 *   - normalized = round(24 / 48 × 100) = round(50) = 50 → "moderate" (34–66)
 * Both dimensions are identical: anxiety 24 → 50, avoidance 24 → 50.
 * Profile: moderate/moderate, neither high → "secure", with the mixed-lean paragraph.
 */
export const fixture2 = {
  answers: uniformAnswers(tempBank, 2),
  expected: {
    version: "men-v1",
    anxietyRaw: 24,
    avoidanceRaw: 24,
    anxietyNorm: 50,
    avoidanceNorm: 50,
    anxietyBand: "moderate",
    avoidanceBand: "moderate",
    profileId: "secure",
  } satisfies Expected,
  expectedLean: "mixed",
} as const;

/**
 * Fixture 3 — straight-line maximum. Every answer is "Almost always" (4).
 *
 * Hand computation, per dimension:
 *   - 10 non-reversed items: 4 × 1 = 4 each → 40
 *   -  2 reversed items:     (4 − 4) × 1 = 0 each → 0  (the reversal under test)
 *   - raw = 40; normalized = round(40 / 48 × 100) = round(83.33) = 83 → "high"
 * Profile: high/high → "fearful-avoidant". If reversal were ignored, raw would be 48
 * and normalized 100 — that is the bug this fixture exists to catch.
 */
export const fixture3 = {
  answers: uniformAnswers(tempBank, 4),
  reversedIds: ["q05", "q08", "q17", "q20"],
  expected: {
    version: "men-v1",
    anxietyRaw: 40,
    avoidanceRaw: 40,
    anxietyNorm: 83,
    avoidanceNorm: 83,
    anxietyBand: "high",
    avoidanceBand: "high",
    profileId: "fearful-avoidant",
  } satisfies Expected,
} as const;

/**
 * Fixture 5 — band edges, on bandEdgeBank (max raw 46 per dimension). Effective
 * vectors are 11 weight-1 items followed by the weight-0.5 item:
 *   raw 15   = 4+4+4+3            + 0.5×0 → round(1500/46 = 32.61) = 33 → low
 *   raw 15.5 = 4+4+4+3            + 0.5×1 → round(1550/46 = 33.70) = 34 → moderate
 *   raw 30.5 = 4×7+2              + 0.5×1 → round(3050/46 = 66.30) = 66 → moderate
 *   raw 31   = 4×7+3              + 0.5×0 → round(3100/46 = 67.39) = 67 → high
 */
const EDGE = {
  33: { raw: 15, vector: [4, 4, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0] },
  34: { raw: 15.5, vector: [4, 4, 4, 3, 0, 0, 0, 0, 0, 0, 0, 1] },
  66: { raw: 30.5, vector: [4, 4, 4, 4, 4, 4, 4, 2, 0, 0, 0, 1] },
  67: { raw: 31, vector: [4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0] },
} as const;

type EdgeScore = keyof typeof EDGE;

const edgeCase = (anxiety: EdgeScore, avoidance: EdgeScore) => ({
  name: `anxiety ${anxiety} / avoidance ${avoidance}`,
  answers: answersFromEffective(bandEdgeBank, {
    anxiety: [...EDGE[anxiety].vector],
    avoidance: [...EDGE[avoidance].vector],
  }),
  expected: {
    anxietyRaw: EDGE[anxiety].raw,
    avoidanceRaw: EDGE[avoidance].raw,
    anxietyNorm: anxiety,
    avoidanceNorm: avoidance,
  },
});

export const fixture5 = {
  bands: { 33: "low", 34: "moderate", 66: "moderate", 67: "high" } as const,
  cases: [edgeCase(33, 34), edgeCase(34, 33), edgeCase(66, 67), edgeCase(67, 66)],
};

/** Fixture 6 — incomplete input: 23 of 24 answers (q24 missing). */
export const fixture6 = {
  answers: uniformAnswers(tempBank, 2).slice(0, 23),
  missingId: "q24",
};
