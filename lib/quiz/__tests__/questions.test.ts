import { describe, expect, it } from "vitest";
import { pronounTerms } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import {
  attentionCheck,
  checkProfileCopy,
  checkQuestionBank,
  herQuestions,
  maxRawFor,
  profiles,
  questions,
  renderStem,
  sinceBreakupSelectors,
  type ProfileCopy,
} from "@/lib/quiz";
import { bandEdgeBank, tempBank } from "./fixtures";

describe("launch question data (Section 9.1; quiz build brief, Part A)", () => {
  it("his 18 pass the Section 9.2 launch rules (v2 amendment brief, 1.1)", () => {
    expect(checkQuestionBank(questions)).toEqual([]);
  });

  it("her 12 pass the her-module rules: 6 per dimension, none reversed, weight 1", () => {
    expect(checkQuestionBank(herQuestions, quizConfig.herBankRules)).toEqual([]);
    expect(herQuestions.every((q) => q.weight === 1 && !q.reversed)).toBe(true);
  });

  it("cuts q04, q10, q11, q17, q21 and q24, leaving 9 per dimension", () => {
    for (const id of ["q04", "q10", "q11", "q17", "q21", "q24"]) {
      expect(
        questions.some((q) => q.id === id),
        id,
      ).toBe(false);
    }
    expect(questions.filter((q) => q.dimension === "anxiety")).toHaveLength(9);
    expect(questions.filter((q) => q.dimension === "avoidance")).toHaveLength(9);
  });

  it("q19, q20 and q23 are reversed; q20 and q23 are the only weight-0.5 items; max raw is 34", () => {
    expect(questions.filter((q) => q.reversed).map((q) => q.id)).toEqual(["q19", "q20", "q23"]);
    expect(questions.filter((q) => q.weight !== 1).map((q) => [q.id, q.weight])).toEqual([
      ["q20", 0.5],
      ["q23", 0.5],
    ]);
    expect(maxRawFor(questions, "anxiety")).toBe(34);
    expect(maxRawFor(questions, "avoidance")).toBe(34);
    expect(maxRawFor(herQuestions, "anxiety")).toBe(24);
  });

  it("every id is unique across his, hers, the selectors, attention and context", () => {
    const ids = [
      ...questions.map((q) => q.id),
      ...herQuestions.map((q) => q.id),
      ...sinceBreakupSelectors.map((s) => s.id),
      attentionCheck.id,
      ...quizConfig.contextQuestions.map((c) => c.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves partner references from config/copy.ts, never literals", () => {
    for (const q of [...questions, ...herQuestions, ...sinceBreakupSelectors]) {
      expect(q.stem, q.id).not.toMatch(/\b(she|her|hers|he|him|his)\b/i);
      expect(renderStem(q), q.id).not.toMatch(/[{}]/);
    }
  });

  it("supports other dictionaries, overrides and a capitalised sentence start (Section 2.3)", () => {
    const h5 = herQuestions.find((q) => q.id === "h5")!;
    expect(renderStem(h5)).toMatch(/^She asked whether I still loved her/);
    expect(renderStem(h5, pronounTerms.they)).toMatch(/^They asked whether I still loved them/);
    expect(renderStem({ ...h5, partnerTerms: { subject: "he", object: "him" } })).toMatch(
      /^He asked whether I still loved him/,
    );
  });

  it("throws on an unknown token", () => {
    expect(() => renderStem({ ...questions[0]!, stem: "When {partnerName} called" })).toThrow(
      /Unknown token/,
    );
  });
});

describe("attention check (Section 9.2)", () => {
  it("sits at position 7, after the first third of his 18, and expects 'Rarely'", () => {
    expect(attentionCheck.position).toBe(7);
    expect(quizConfig.likert.labels[attentionCheck.expectedValue]).toBe("Rarely");
    expect(attentionCheck.stem).toContain("'Rarely'");
  });

  it("is not a scored question", () => {
    expect(questions.some((q) => q.id === attentionCheck.id)).toBe(false);
    expect(herQuestions.some((q) => q.id === attentionCheck.id)).toBe(false);
  });
});

describe("Likert scale and context questions (Section 9.2)", () => {
  it("uses one 0–4 scale with the spec labels", () => {
    expect(quizConfig.likert).toEqual({
      min: 0,
      max: 4,
      labels: ["Never like me", "Rarely", "Sometimes", "Often", "Almost always like me"],
      partnerLabels: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
    });
  });

  it("defines exactly two unscored context questions with the on-screen note", () => {
    expect(quizConfig.contextQuestions.map((c) => c.id)).toEqual([
      "ctx-time-since-breakup",
      "ctx-no-contact",
    ]);
    // The brief's note, its em dash now a period (amendment brief, 2.6).
    expect(quizConfig.contextNote).toBe(
      "These don't change your scores. They help us show you the right next step.",
    );
  });
});

describe("checkQuestionBank (Section 9.2 launch rules)", () => {
  /** The engine test banks keep the v1 shape: 24 items, 12 per dimension, 2 reversed each. */
  const engineRules = {
    ...quizConfig.bankRules,
    scoredItems: 24,
    itemsPerDimension: 12,
    reversedPerDimension: { anxiety: 2, avoidance: 2 },
  };

  it("passes the temporary full bank and the band-edge bank, under their own 24-item shape", () => {
    expect(checkQuestionBank(tempBank, engineRules)).toEqual([]);
    expect(checkQuestionBank(bandEdgeBank, engineRules)).toEqual([]);
  });

  it("reports a short bank, an unbalanced bank, and wrong reversal counts", () => {
    const problems = checkQuestionBank(tempBank.slice(0, 23), engineRules);
    expect(problems).toContain("expected 24 scored items, got 23");
    expect(problems).toContain("expected 12 avoidance items, got 11");

    const extraReversed = tempBank.map((q) => (q.id === "q01" ? { ...q, reversed: true } : q));
    expect(checkQuestionBank(extraReversed, engineRules)).toContain(
      "expected 2 reversed anxiety items, got 3",
    );
  });

  it("checks each dimension's reversal count on its own (v2: 2 anxiety, 1 avoidance)", () => {
    const flipped = questions.map((q) => (q.id === "q20" ? { ...q, reversed: false } : q));
    expect(checkQuestionBank(flipped)).toEqual(["expected 1 reversed avoidance items, got 0"]);
  });

  it("reports long stems, clinical terms, bad weights, duplicates and mixed versions", () => {
    const bank = tempBank.map((q) => ({ ...q }));
    bank[0]!.stem = Array(29).fill("word").join(" ");
    bank[1]!.stem = "I showed protest behaviour after an argument.";
    bank[2]!.weight = 2;
    bank[3]!.id = "q01";
    bank[4]!.version = "men-v2";
    const problems = checkQuestionBank(bank, engineRules).join("\n");
    expect(problems).toMatch(/stem is 29 words/);
    expect(problems).toMatch(/clinical term "protest behaviour"/);
    expect(problems).toMatch(/q03: /);
    expect(problems).toMatch(/duplicate question ids/);
    expect(problems).toMatch(/mixed versions/);
  });
});

describe("profiles data structure (Section 9.4)", () => {
  it("defines all four profiles with labels and their Section 6 pages", () => {
    expect(Object.keys(profiles).sort()).toEqual(
      ["anxious", "avoidant", "fearful-avoidant", "secure"].sort(),
    );
    expect(profiles.anxious.label).toBe("Anxious (preoccupied)");
    expect(profiles.avoidant.route).toBe("/attachment-styles/avoidant/");
  });

  const words = (n: number) => Array(n).fill("word").join(" ");
  const sample = (descriptionWords: number): ProfileCopy => ({
    headline: "h",
    description: words(descriptionWords),
    afterBreakup: "a",
    noContactRisk: "r",
    watchOuts: ["w1", "w2", "w3"],
    strengths: ["s1", "s2", "s3"],
    nextSteps: [
      { label: "One", href: "/one/" },
      { label: "Two", href: "/two/" },
    ],
  });

  it("checkProfileCopy enforces the 120–180 word description", () => {
    expect(checkProfileCopy("anxious", sample(150))).toEqual([]);
    expect(checkProfileCopy("anxious", sample(119))).toHaveLength(1);
    expect(checkProfileCopy("anxious", sample(181))).toHaveLength(1);
  });

  it("checkProfileCopy requires lean paragraphs on secure only", () => {
    expect(checkProfileCopy("secure", sample(150))).toEqual(["secure: missing lean paragraphs"]);
    const leans = { anxious: "a", avoidant: "b", mixed: "c" };
    expect(checkProfileCopy("secure", { ...sample(150), leans })).toEqual([]);
    expect(checkProfileCopy("avoidant", { ...sample(150), leans })).toHaveLength(1);
  });
});
