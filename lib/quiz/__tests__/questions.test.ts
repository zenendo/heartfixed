import { describe, expect, it } from "vitest";
import { copy } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import {
  attentionCheck,
  checkProfileCopy,
  checkQuestionBank,
  profiles,
  questions,
  quizQuestionSchema,
  renderStem,
  type ProfileCopy,
} from "@/lib/quiz";
import { bandEdgeBank, tempBank } from "./fixtures";

describe("sample questions (schema proof, Section 9.1)", () => {
  it("ships two items per dimension, one reversed each", () => {
    for (const dimension of ["anxiety", "avoidance"] as const) {
      const items = questions.filter((q) => q.dimension === dimension);
      expect(items).toHaveLength(2);
      expect(items.filter((q) => q.reversed)).toHaveLength(1);
    }
  });

  it.each(questions)("$id matches the schema and Section 9.2 framing limits", (q) => {
    expect(quizQuestionSchema.safeParse(q).success).toBe(true);
    expect(q.version).toBe(quizConfig.questionSetVersion);
    expect(q.audience).toBe(quizConfig.audience);
    expect(q.stem.split(/\s+/).length).toBeLessThanOrEqual(quizConfig.bankRules.maxStemWords);
    // The only bank-rule problems for the samples are the 24-item shape counts.
    expect(checkQuestionBank([q]).filter((p) => p.startsWith(q.id))).toEqual([]);
  });

  it("resolves partner references from config/copy.ts, never literals", () => {
    for (const q of questions) {
      expect(q.stem).not.toMatch(/\b(she|her|hers)\b/i);
      expect(renderStem(q)).not.toMatch(/[{}]/);
    }
    expect(renderStem(questions[0]!)).toContain(`for ${copy.partner.possessive} reply`);
  });

  it("supports a per-question partner override and other dictionaries (Section 2.3)", () => {
    const q = questions[1]!;
    expect(renderStem(q, { subject: "they", object: "them", possessive: "their" })).toMatch(
      /^When they asked/,
    );
    expect(renderStem({ ...q, partnerTerms: { subject: "he" } })).toMatch(/^When he asked/);
  });

  it("throws on an unknown token", () => {
    expect(() => renderStem({ ...questions[0]!, stem: "When {partnerName} called" })).toThrow(
      /Unknown token/,
    );
  });
});

describe("attention check (Section 9.2)", () => {
  it("sits at position 13 and expects 'Rarely'", () => {
    expect(attentionCheck.position).toBe(13);
    expect(quizConfig.likert.labels[attentionCheck.expectedValue]).toBe("Rarely");
    expect(attentionCheck.stem).toContain("'Rarely'");
  });

  it("is not a scored question", () => {
    expect(questions.some((q) => q.id === attentionCheck.id)).toBe(false);
  });
});

describe("Likert scale and context questions (Section 9.2)", () => {
  it("uses one 0–4 scale with the spec labels", () => {
    expect(quizConfig.likert).toEqual({
      min: 0,
      max: 4,
      labels: ["Never like me", "Rarely", "Sometimes", "Often", "Almost always like me"],
    });
  });

  it("defines exactly two unscored context questions with the on-screen note", () => {
    expect(quizConfig.contextQuestions.map((c) => c.id)).toEqual([
      "ctx-time-since-breakup",
      "ctx-no-contact",
    ]);
    expect(quizConfig.contextNote).toBe(
      "These don't change your scores — they help us show you the right next step.",
    );
  });
});

describe("checkQuestionBank (Section 9.2 launch rules)", () => {
  it("passes the temporary full bank and the band-edge bank", () => {
    expect(checkQuestionBank(tempBank)).toEqual([]);
    expect(checkQuestionBank(bandEdgeBank)).toEqual([]);
  });

  it.todo("passes the founder-reviewed launch bank (Session 4)");

  it("reports a short bank, an unbalanced bank, and wrong reversal counts", () => {
    const problems = checkQuestionBank(tempBank.slice(0, 23));
    expect(problems).toContain("expected 24 scored items, got 23");
    expect(problems).toContain("expected 12 avoidance items, got 11");

    const extraReversed = tempBank.map((q) => (q.id === "q01" ? { ...q, reversed: true } : q));
    expect(checkQuestionBank(extraReversed)).toContain("expected 2 reversed anxiety items, got 3");
  });

  it("reports long stems, clinical terms, bad weights, duplicates and mixed versions", () => {
    const bank = tempBank.map((q) => ({ ...q }));
    bank[0]!.stem = Array(29).fill("word").join(" ");
    bank[1]!.stem = "I showed protest behaviour after an argument.";
    bank[2]!.weight = 2;
    bank[3]!.id = "q01";
    bank[4]!.version = "men-v2";
    const problems = checkQuestionBank(bank).join("\n");
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
