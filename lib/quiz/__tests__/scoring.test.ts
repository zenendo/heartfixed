import { describe, expect, it } from "vitest";
import {
  QuizScoringError,
  bandFor,
  effectiveValue,
  leanFor,
  maxRawFor,
  profileFor,
  scoreQuiz,
  type Band,
  type ProfileId,
  type QuizAnswer,
} from "@/lib/quiz";
import {
  COMPLETED_AT,
  answersFromEffective,
  bandEdgeBank,
  fixture2,
  fixture3,
  fixture5,
  fixture6,
  tempBank,
  uniformAnswers,
} from "./fixtures";

const opts = { completedAt: COMPLETED_AT };

describe("Section 16.2 quiz fixtures", () => {
  it.todo("Fixture 1 — Persona A: 72/100 high, 18/100 low, anxious (Session 4, launch bank)");

  it("Fixture 2 — all-neutral: half of maximum, 50/50 moderate, secure with mixed lean", () => {
    const result = scoreQuiz(fixture2.answers, tempBank, opts);
    expect(result).toMatchObject(fixture2.expected);
    expect(result.anxietyRaw).toBe(maxRawFor(tempBank, "anxiety") / 2);
    expect(result.avoidanceRaw).toBe(maxRawFor(tempBank, "avoidance") / 2);
    expect(leanFor(result)).toBe(fixture2.expectedLean);
  });

  it("Fixture 3 — straight-line maximum: reversed items contribute 0", () => {
    for (const id of fixture3.reversedIds) {
      const q = tempBank.find((x) => x.id === id)!;
      expect(q.reversed, id).toBe(true);
      expect(effectiveValue(q, 4), id).toBe(0);
    }
    expect(
      tempBank
        .filter((q) => q.reversed)
        .map((q) => q.id)
        .sort(),
    ).toEqual([...fixture3.reversedIds].sort());
    const result = scoreQuiz(fixture3.answers, tempBank, opts);
    expect(result).toMatchObject(fixture3.expected);
  });

  it.todo("Fixture 4 — mirror personas: avoidant and fearful-avoidant (Session 4, launch bank)");

  describe("Fixture 5 — band edges at 33/34 and 66/67 on both dimensions", () => {
    it.each(fixture5.cases)("$name", ({ answers, expected }) => {
      const result = scoreQuiz(answers, bandEdgeBank, opts);
      expect(result).toMatchObject(expected);
      expect(result.anxietyBand).toBe(
        fixture5.bands[expected.anxietyNorm as keyof typeof fixture5.bands],
      );
      expect(result.avoidanceBand).toBe(
        fixture5.bands[expected.avoidanceNorm as keyof typeof fixture5.bands],
      );
    });

    it("uses a weighted max raw computed from the data (46, not 48)", () => {
      expect(maxRawFor(bandEdgeBank, "anxiety")).toBe(46);
      expect(maxRawFor(bandEdgeBank, "avoidance")).toBe(46);
    });
  });

  it("Fixture 6 — 23 of 24 answers throws, naming the missing item", () => {
    expect(() => scoreQuiz(fixture6.answers, tempBank, opts)).toThrow(QuizScoringError);
    expect(() => scoreQuiz(fixture6.answers, tempBank, opts)).toThrow(fixture6.missingId);
  });
  // Fixture 6's second half — the runner makes this state unreachable — is a UI test
  // for Session 4. TODO(session-4)
});

describe("Section 16.4 quiz-engine acceptance", () => {
  it("is deterministic: the same answers scored 100 times give identical results", () => {
    const answers = tempBank.map((q, i) => ({ questionId: q.id, value: (i * 7) % 5 }));
    const first = scoreQuiz(answers, tempBank, opts);
    for (let i = 0; i < 100; i++) {
      expect(scoreQuiz(answers, tempBank, opts)).toEqual(first);
    }
  });

  const table: [Band, Band, ProfileId][] = [
    ["low", "low", "secure"],
    ["low", "moderate", "secure"],
    ["moderate", "low", "secure"],
    ["moderate", "moderate", "secure"],
    ["high", "low", "anxious"],
    ["high", "moderate", "anxious"],
    ["low", "high", "avoidant"],
    ["moderate", "high", "avoidant"],
    ["high", "high", "fearful-avoidant"],
  ];

  it.each(table)("anxiety %s + avoidance %s → %s (Section 9.4)", (anx, avo, profile) => {
    expect(profileFor(anx, avo)).toBe(profile);
  });

  it("context answers demonstrably do not alter scores", () => {
    const scored = uniformAnswers(tempBank, 3);
    const withContext: QuizAnswer[] = [
      ...scored,
      { questionId: "ctx-time-since-breakup", value: 0 },
      { questionId: "ctx-no-contact", value: 4 },
    ];
    expect(scoreQuiz(withContext, tempBank, opts)).toEqual(scoreQuiz(scored, tempBank, opts));
  });
});

describe("scoreQuiz validation and rules", () => {
  it.each([5, -1, 2.5, Number.NaN])("rejects an out-of-scale value (%s)", (value) => {
    const answers = uniformAnswers(tempBank, 2);
    answers[0] = { questionId: "q01", value };
    expect(() => scoreQuiz(answers, tempBank, opts)).toThrow(QuizScoringError);
  });

  it("rejects two answers for the same question", () => {
    const answers = [...uniformAnswers(tempBank, 2), { questionId: "q01", value: 3 }];
    expect(() => scoreQuiz(answers, tempBank, opts)).toThrow(/More than one answer/);
  });

  it("rejects a question set mixing versions", () => {
    const mixed = tempBank.map((q, i) => (i === 0 ? { ...q, version: "men-v2" } : q));
    expect(() => scoreQuiz(uniformAnswers(mixed, 2), mixed, opts)).toThrow(/version/);
  });

  it("applies the weight after reversal", () => {
    const q = { ...tempBank[0]!, reversed: true, weight: 1.5 };
    expect(effectiveValue(q, 1)).toBe(4.5);
  });

  it("bands normalized scores at the config edges", () => {
    expect([0, 33, 34, 66, 67, 100].map(bandFor)).toEqual([
      "low",
      "low",
      "moderate",
      "moderate",
      "high",
      "high",
    ]);
  });

  it("returns integer normalized scores, rounding half up", () => {
    // 6/48 = 12.5 → 13 on the 12-item bank.
    const answers = answersFromEffective(tempBank, {
      anxiety: [2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      avoidance: Array(12).fill(2),
    });
    const result = scoreQuiz(answers, tempBank, opts);
    expect(result.anxietyRaw).toBe(6);
    expect(result.anxietyNorm).toBe(13);
  });

  it("passes completedAt through without reading the clock", () => {
    expect(scoreQuiz(fixture2.answers, tempBank, opts).completedAt).toBe(COMPLETED_AT);
  });

  describe("attention check (Section 9.2)", () => {
    const check = { questionId: "attn-01", expectedValue: 1 };
    const withAttention = (value?: number) => [
      ...fixture2.answers,
      ...(value === undefined ? [] : [{ questionId: "attn-01", value }]),
    ];

    it("passing it leaves the flag clear", () => {
      const r = scoreQuiz(withAttention(1), tempBank, { ...opts, attentionCheck: check });
      expect(r.attentionFlag).toBe(false);
    });

    it("failing or skipping it sets the flag but still returns the full result", () => {
      for (const answers of [withAttention(3), withAttention()]) {
        const r = scoreQuiz(answers, tempBank, { ...opts, attentionCheck: check });
        expect(r.attentionFlag).toBe(true);
        expect(r).toMatchObject(fixture2.expected);
      }
    });

    it("never changes the scores", () => {
      const pass = scoreQuiz(withAttention(1), tempBank, { ...opts, attentionCheck: check });
      const fail = scoreQuiz(withAttention(4), tempBank, { ...opts, attentionCheck: check });
      expect({ ...fail, attentionFlag: false }).toEqual(pass);
    });
  });

  describe("leanFor (Section 9.4 nuance rule)", () => {
    it.each([
      ["moderate", "low", "anxious"],
      ["low", "moderate", "avoidant"],
      ["moderate", "moderate", "mixed"],
      ["low", "low", "none"],
    ] as const)("secure with %s/%s → %s lean", (anxietyBand, avoidanceBand, lean) => {
      expect(leanFor({ profileId: "secure", anxietyBand, avoidanceBand })).toBe(lean);
    });

    it("non-secure profiles carry no lean", () => {
      expect(
        leanFor({ profileId: "anxious", anxietyBand: "high", avoidanceBand: "moderate" }),
      ).toBe("none");
    });
  });
});
