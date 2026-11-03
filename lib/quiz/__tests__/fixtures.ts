import type { Dimension, QuizAnswer, QuizQuestion, QuizResult } from "../types";

/**
 * Engine fixtures — Section 16.2, and the her-module fixtures from the quiz build brief.
 *
 * Fixtures 1 and 4 and H1/H2 run on the founder-approved launch data in
 * lib/quiz/questions.ts. The tempBank and bandEdgeBank below are TEST DATA, not
 * production copy: they pin engine behaviour (Fixtures 2, 3, 5, 6) independently of
 * the launch wording. If a fixture and the code ever disagree, stop and flag it —
 * never edit an expected value to make a test pass (Section 1).
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

// ---- Launch-bank fixtures (Session 4) ---------------------------------------------

/** Answers keyed by item id, as the brief writes them (raw values, before reversal). */
const answersFrom = (values: Record<string, number>): QuizAnswer[] =>
  Object.entries(values).map(([questionId, value]) => ({ questionId, value }));

/**
 * Fixture 1 — Persona A (Section 10.4; brief, Part A), on the launch bank.
 * Max raw per dimension = 11 × 4 × 1 + 1 × 4 × 0.5 = 46.
 *
 * Hand verification, effective value per item (reversed: 4 − value; then × weight):
 *   anxiety:   q01 2, q03 4, q05 3, q07 4, q09 2, q11 2, q13 2, q15 2, q17 4  → 25
 *              q19 (R) value 1 → 3                                             → 28
 *              q21 3                                                           → 31
 *              q23 (R, ×0.5) value 0 → 4 × 0.5 = 2                             → 33
 *              raw 33; round(33 / 46 × 100 = 71.74) = 72 → high (67–100)
 *   avoidance: q02 0, q04 1, q06 0, q08 1, q10 1, q12 1, q14 1, q16 0, q18 0  → 5
 *              q20 (R) value 3 → 1                                             → 6
 *              q22 1                                                           → 7
 *              q24 (R, ×0.5) value 1 → 3 × 0.5 = 1.5                           → 8.5
 *              raw 8.5; round(8.5 / 46 × 100 = 18.48) = 18 → low (0–33)
 *   profile: high / low → "anxious".
 */
export const fixture1 = {
  // prettier-ignore
  answers: answersFrom({
    q01: 2, q03: 4, q05: 3, q07: 4, q09: 2, q11: 2, q13: 2, q15: 2, q17: 4, q19: 1, q21: 3, q23: 0,
    q02: 0, q04: 1, q06: 0, q08: 1, q10: 1, q12: 1, q14: 1, q16: 0, q18: 0, q20: 3, q22: 1, q24: 1,
  }),
  expected: {
    version: "men-v1",
    anxietyRaw: 33,
    avoidanceRaw: 8.5,
    anxietyNorm: 72,
    avoidanceNorm: 18,
    anxietyBand: "high",
    avoidanceBand: "low",
    profileId: "anxious",
  } satisfies Expected,
} as const;

/**
 * Fixture 4 — mirror personas (Section 16.2). The spec fixes the outcomes (profile and
 * per-dimension bands); the brief doesn't give answer patterns, so these two are
 * constructed for the launch bank and hand-computed here.
 *
 * Avoidant:
 *   anxiety:   q01 1, q03 0, q05 0, q07 1, q09 0, q11 0, q13 1, q15 1, q17 0, q21 0 → 4
 *              q19 (R) value 4 → 0; q23 (R, ×0.5) value 4 → 0                   → 4
 *              round(4 / 46 × 100 = 8.70) = 9 → low
 *   avoidance: q02 3, q04 3, q06 4, q08 3, q10 3, q12 4, q14 4, q16 3, q18 2, q22 4 → 33
 *              q20 (R) value 1 → 3                                              → 36
 *              q24 (R, ×0.5) value 0 → 4 × 0.5 = 2                              → 38
 *              round(38 / 46 × 100 = 82.61) = 83 → high
 * Fearful-avoidant:
 *   anxiety:   q01 4, q03 3, q05 3, q07 4, q09 3, q11 3, q13 3, q15 4, q17 3, q21 2 → 32
 *              q19 (R) value 1 → 3                                              → 35
 *              q23 (R, ×0.5) value 1 → 3 × 0.5 = 1.5                            → 36.5
 *              round(36.5 / 46 × 100 = 79.35) = 79 → high
 *   avoidance: q02 3, q04 2, q06 3, q08 4, q10 3, q12 3, q14 4, q16 3, q18 3, q22 3 → 31
 *              q20 (R) value 1 → 3                                              → 34
 *              q24 (R, ×0.5) value 1 → 3 × 0.5 = 1.5                            → 35.5
 *              round(35.5 / 46 × 100 = 77.17) = 77 → high
 */
export const fixture4 = {
  avoidant: {
    // prettier-ignore
    answers: answersFrom({
      q01: 1, q03: 0, q05: 0, q07: 1, q09: 0, q11: 0, q13: 1, q15: 1, q17: 0, q19: 4, q21: 0, q23: 4,
      q02: 3, q04: 3, q06: 4, q08: 3, q10: 3, q12: 4, q14: 4, q16: 3, q18: 2, q20: 1, q22: 4, q24: 0,
    }),
    expected: {
      version: "men-v1",
      anxietyRaw: 4,
      avoidanceRaw: 38,
      anxietyNorm: 9,
      avoidanceNorm: 83,
      anxietyBand: "low",
      avoidanceBand: "high",
      profileId: "avoidant",
    } satisfies Expected,
  },
  fearfulAvoidant: {
    // prettier-ignore
    answers: answersFrom({
      q01: 4, q03: 3, q05: 3, q07: 4, q09: 3, q11: 3, q13: 3, q15: 4, q17: 3, q19: 1, q21: 2, q23: 1,
      q02: 3, q04: 2, q06: 3, q08: 4, q10: 3, q12: 3, q14: 4, q16: 3, q18: 3, q20: 1, q22: 3, q24: 1,
    }),
    expected: {
      version: "men-v1",
      anxietyRaw: 36.5,
      avoidanceRaw: 35.5,
      anxietyNorm: 79,
      avoidanceNorm: 77,
      anxietyBand: "high",
      avoidanceBand: "high",
      profileId: "fearful-avoidant",
    } satisfies Expected,
  },
} as const;

type ExpectedPerceived = Omit<Expected, "version">;

/**
 * Her-module fixtures H1 and H2 (brief, Part A, hand-computed there). Six items per
 * dimension, none reversed, weight 1: max raw 24.
 *   H1: her-avoidance h2 4 + h4 3 + h6 4 + h8 3 + h10 4 + h12 2 = 20; round(83.33) = 83 high
 *       her-anxiety   h1 0 + h3 1 + h5 0 + h7 1 + h9 0 + h11 1  = 3;  round(12.5)  = 13 low
 *       → avoidant (as experienced)
 *   H2: her-anxiety   h1 4 + h3 4 + h5 3 + h7 3 + h9 4 + h11 3  = 21; round(87.5)  = 88 high
 *       her-avoidance h2 1 + h4 0 + h6 1 + h8 0 + h10 1 + h12 0 = 3;  round(12.5)  = 13 low
 *       → anxious (as experienced)
 * Both 12.5 and 87.5 are exact halves, so these also pin "round half up".
 */
export const herFixtures = {
  h1: {
    // prettier-ignore
    answers: answersFrom({
      h2: 4, h4: 3, h6: 4, h8: 3, h10: 4, h12: 2,
      h1: 0, h3: 1, h5: 0, h7: 1, h9: 0, h11: 1,
    }),
    expected: {
      anxietyRaw: 3,
      avoidanceRaw: 20,
      anxietyNorm: 13,
      avoidanceNorm: 83,
      anxietyBand: "low",
      avoidanceBand: "high",
      profileId: "avoidant",
    } satisfies ExpectedPerceived,
  },
  h2: {
    // prettier-ignore
    answers: answersFrom({
      h1: 4, h3: 4, h5: 3, h7: 3, h9: 4, h11: 3,
      h2: 1, h4: 0, h6: 1, h8: 0, h10: 1, h12: 0,
    }),
    expected: {
      anxietyRaw: 21,
      avoidanceRaw: 3,
      anxietyNorm: 88,
      avoidanceNorm: 13,
      anxietyBand: "high",
      avoidanceBand: "low",
      profileId: "anxious",
    } satisfies ExpectedPerceived,
  },
} as const;
