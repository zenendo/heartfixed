import { describe, expect, it } from "vitest";
import { quizConfig } from "@/config/quiz";
import {
  QuizScoringError,
  attentionCheck,
  completeAttempt,
  emptyProgress,
  isAttemptExpired,
  isResumable,
  quizProgressSchema,
  runnerSteps,
  savedQuizSchema,
  type QuizProgress,
  opensPartnerSection,
  pronounsFor,
  scaleLabelsFor,
} from "@/lib/quiz";
import { fixture1, herFixtures } from "./fixtures";

const NOW = new Date("2026-11-02T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

function progressFrom(answers: { questionId: string; value: number }[]): QuizProgress {
  return {
    ...emptyProgress(NOW),
    step: runnerSteps.length - 1,
    answers: Object.fromEntries(answers.map((a) => [a.questionId, a.value])),
    pronouns: { taker: "he", partner: "she" },
  };
}

const selectors = ["a1", "a2", "a3", "a4", "a5", "a6"].map((id, i) => ({
  questionId: id,
  value: [0, 3, 1, 2, 0, 4][i]!,
}));

describe("runner screen order (Section 10.2; brief, Part A)", () => {
  it("the two pronoun questions → his 18 with the attention check → her 12 → 6 selectors → 2 context", () => {
    expect(runnerSteps.map((s) => s.kind)).toEqual([
      "pronouns",
      "pronouns",
      ...Array(6).fill("his"),
      "attention",
      ...Array(12).fill("his"),
      ...Array(12).fill("her"),
      ...Array(6).fill("selector"),
      ...Array(2).fill("context"),
    ]);
  });

  it("asks the taker's pronouns, then the partner's, unnumbered (amendment brief, 2.1)", () => {
    expect(runnerSteps.slice(0, 2)).toEqual([
      { kind: "pronouns", id: "taker" },
      { kind: "pronouns", id: "partner" },
    ]);
  });

  it("puts the attention check at position 7 of his section, unnumbered, between q07 and q08", () => {
    const at = runnerSteps.findIndex((s) => s.kind === "his") + attentionCheck.position - 1;
    expect(runnerSteps[at]).toEqual({ kind: "attention", id: attentionCheck.id });
    expect(runnerSteps[at - 1]).toMatchObject({ id: "q07", number: 6, total: 18 });
    expect(runnerSteps[at + 1]).toMatchObject({ id: "q08", number: 7, total: 18 });
  });

  it("numbers each section on its own", () => {
    const label = (kind: string) =>
      runnerSteps.filter((s) => s.kind === kind).map((s) => ("number" in s ? s.number : 0));
    expect(label("his")).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
    expect(label("her")).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
    expect(label("selector")).toEqual([1, 2, 3, 4, 5, 6]);
    expect(runnerSteps.slice(-2).map((s) => s.id)).toEqual(
      quizConfig.contextQuestions.map((c) => c.id),
    );
  });
});

describe("per-section answer labels and framing (founder review, Session 4)", () => {
  it('drops "like me" only where the visitor isn\'t describing himself', () => {
    for (const step of runnerSteps) {
      if (step.kind === "context" || step.kind === "pronouns") continue;
      const expected =
        step.kind === "his" || step.kind === "attention"
          ? quizConfig.likert.labels
          : quizConfig.likert.partnerLabels;
      expect(scaleLabelsFor(step), step.id).toEqual(expected);
    }
  });

  it("frames only the first question about the partner", () => {
    expect(runnerSteps.filter(opensPartnerSection).map((s) => s.id)).toEqual(["h1"]);
  });
});

describe("completeAttempt — what saves on the final answer (Section 9.6)", () => {
  const attention = { questionId: attentionCheck.id, value: 1 };

  it("Persona A + H1: his result, her perceived pattern, every answer, context", () => {
    const progress = progressFrom([
      ...fixture1.answers,
      attention,
      ...herFixtures.h1.answers,
      ...selectors,
    ]);
    progress.context = { "ctx-no-contact": "trying" };
    const saved = completeAttempt(progress, NOW);
    expect(saved.result).toMatchObject({
      ...fixture1.expected,
      completedAt: NOW.toISOString(),
      attentionFlag: false,
    });
    expect(saved.perceived).toEqual(herFixtures.h1.expected);
    expect(saved.answers).toHaveLength(18 + 1 + 12 + 6);
    expect(saved.context).toEqual({ "ctx-no-contact": "trying" });
    expect(saved.pronouns).toEqual({ taker: "he", partner: "she" });
    expect(savedQuizSchema.safeParse(saved).success).toBe(true);
  });

  it("saves the pronoun answers with the result, and the scores don't depend on them", () => {
    const answers = [...fixture1.answers, attention, ...herFixtures.h1.answers, ...selectors];
    const they = completeAttempt(
      { ...progressFrom(answers), pronouns: { taker: "she", partner: "they" } },
      NOW,
    );
    expect(they.pronouns).toEqual({ taker: "she", partner: "they" });
    const plain = completeAttempt(progressFrom(answers), NOW);
    expect(they.result).toEqual(plain.result);
    expect(they.perceived).toEqual(plain.perceived);
  });

  it("a result saved before the pronoun questions still validates (the default path)", () => {
    const saved = completeAttempt(
      progressFrom(fixture1.answers.concat(herFixtures.h1.answers)),
      NOW,
    );
    const older: Partial<typeof saved> = { ...saved };
    delete older.pronouns;
    expect(savedQuizSchema.safeParse(older).success).toBe(true);
  });

  it("a wrong attention answer only sets the flag", () => {
    const saved = completeAttempt(
      progressFrom([...fixture1.answers, { ...attention, value: 3 }, ...herFixtures.h2.answers]),
      NOW,
    );
    expect(saved.result).toMatchObject({ ...fixture1.expected, attentionFlag: true });
    expect(saved.perceived).toEqual(herFixtures.h2.expected);
  });

  it("throws if a scored item is missing (Fixture 6 — the runner prevents it)", () => {
    const incomplete = progressFrom([...fixture1.answers.slice(1), ...herFixtures.h1.answers]);
    expect(() => completeAttempt(incomplete, NOW)).toThrow(QuizScoringError);
  });
});

describe("in-progress attempts (Section 10.2)", () => {
  const touched = (daysAgo: number): QuizProgress => ({
    ...emptyProgress(NOW),
    step: 9,
    answers: { q01: 2 },
    pronouns: { taker: "they", partner: "he" },
    savedAt: new Date(NOW.getTime() - daysAgo * DAY).toISOString(),
  });

  it("resumes within 7 days of the last answer and discards after", () => {
    expect(isAttemptExpired(touched(7), NOW)).toBe(false);
    expect(isResumable(touched(7), NOW)).toBe(true);
    expect(isAttemptExpired(touched(7.01), NOW)).toBe(true);
    expect(isResumable(touched(7.01), NOW)).toBe(false);
  });

  it("doesn't resume an empty attempt or one from another question set", () => {
    expect(isResumable({ ...touched(1), answers: {} }, NOW)).toBe(false);
    expect(isResumable({ ...touched(1), version: "men-v0" }, NOW)).toBe(false);
  });

  it("doesn't resume one saved before the pronoun questions, whose steps predate them", () => {
    expect(isResumable({ ...touched(1), pronouns: undefined }, NOW)).toBe(false);
    expect(isResumable({ ...touched(1), pronouns: { taker: "he" } }, NOW)).toBe(false);
  });

  it("renders stems with the chosen partner set, she/her by default", () => {
    expect(pronounsFor(touched(1)).subject).toBe("he");
    expect(pronounsFor({}).subject).toBe("she");
  });

  it("validates the stored shape, rejecting out-of-scale and tampered values", () => {
    expect(quizProgressSchema.safeParse(touched(1)).success).toBe(true);
    expect(quizProgressSchema.safeParse({ ...touched(1), pronouns: { taker: "it" } }).success).toBe(
      false,
    );
    expect(quizProgressSchema.safeParse({ ...touched(1), answers: { q01: 5 } }).success).toBe(
      false,
    );
    expect(
      quizProgressSchema.safeParse({ ...touched(1), context: { "ctx-no-contact": "<b>" } }).success,
    ).toBe(false);
  });
});
