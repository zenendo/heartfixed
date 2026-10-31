import { copy, type PartnerTerms } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import { DIMENSIONS, quizQuestionSchema, type QuizQuestion } from "./types";

/**
 * Question data — Sections 9.1–9.2.
 *
 * TODO(session-4): replace with the founder-reviewed 24-item launch bank. The four
 * items below are schema proof only (two per dimension, one reversed each), written
 * to the framing rule: an observable behaviour in a concrete trigger situation, in
 * the recent past. They need founder review before they can ship.
 */
const base = {
  version: quizConfig.questionSetVersion,
  audience: quizConfig.audience,
  weight: 1,
} as const;

export const questions: QuizQuestion[] = [
  {
    ...base,
    id: "q01",
    dimension: "anxiety",
    reversed: false,
    // The spec's approved example pattern (Section 9.2).
    stem: "In the first days after an argument, I checked my phone for {possessive} reply more times than I can count.",
  },
  {
    ...base,
    id: "q02",
    dimension: "avoidance",
    reversed: false,
    stem: "When {subject} asked to spend more time together, I found reasons to keep some evenings to myself.",
  },
  {
    ...base,
    id: "q03",
    dimension: "anxiety",
    reversed: true,
    stem: "When {subject} took a few hours to answer a message, I got on with my day without checking.",
  },
  {
    ...base,
    id: "q04",
    dimension: "avoidance",
    reversed: true,
    stem: "When {subject} wanted to talk about something that upset {object}, I stayed in the conversation until we were done.",
  },
];

/**
 * Unscored instructional item shown at position 13 (Section 9.2). Failing it never
 * blocks results; it only sets QuizResult.attentionFlag. Never mentioned to the visitor.
 */
export const attentionCheck = {
  id: "attn-01",
  stem: "To show you're reading, choose 'Rarely' for this one.",
  expectedValue: 1, // "Rarely" on the Likert scale
  position: 13,
} as const;

const TOKEN = /\{(\w+)\}/g;

/** Resolves partner tokens in a stem from config/copy.ts, with per-question overrides. */
export function renderStem(question: QuizQuestion, terms: PartnerTerms = copy.partner): string {
  const merged: Record<string, string> = { ...terms, ...question.partnerTerms };
  return question.stem.replace(TOKEN, (match, key: string) => {
    const value = merged[key];
    if (value === undefined) {
      throw new Error(`Unknown token ${match} in question ${question.id}`);
    }
    return value;
  });
}

type BankRules = typeof quizConfig.bankRules;

/**
 * Checks a question bank against the launch rules (Section 9.2). Returns a list of
 * problems; an empty list means the bank is valid. The engine itself stays generic
 * so future assessments can use different shapes with their own rules.
 */
export function checkQuestionBank(
  bank: readonly QuizQuestion[],
  rules: BankRules = quizConfig.bankRules,
): string[] {
  const problems: string[] = [];

  for (const q of bank) {
    const parsed = quizQuestionSchema.safeParse(q);
    if (!parsed.success) problems.push(`${q.id}: ${parsed.error.issues[0]?.message}`);

    const words = q.stem.trim().split(/\s+/).length;
    if (words > rules.maxStemWords) problems.push(`${q.id}: stem is ${words} words`);

    const lower = q.stem.toLowerCase();
    for (const term of rules.bannedStemTerms) {
      if (lower.includes(term)) problems.push(`${q.id}: clinical term "${term}" in stem`);
    }

    try {
      renderStem(q);
    } catch (e) {
      problems.push((e as Error).message);
    }
  }

  const ids = bank.map((q) => q.id);
  if (new Set(ids).size !== ids.length) problems.push("duplicate question ids");
  if (new Set(bank.map((q) => q.version)).size > 1) problems.push("mixed versions");
  if (new Set(bank.map((q) => q.audience)).size > 1) problems.push("mixed audiences");

  if (bank.length !== rules.scoredItems) {
    problems.push(`expected ${rules.scoredItems} scored items, got ${bank.length}`);
  }
  for (const dimension of DIMENSIONS) {
    const items = bank.filter((q) => q.dimension === dimension);
    if (items.length !== rules.itemsPerDimension) {
      problems.push(`expected ${rules.itemsPerDimension} ${dimension} items, got ${items.length}`);
    }
    const reversed = items.filter((q) => q.reversed).length;
    if (reversed !== rules.reversedPerDimension) {
      problems.push(
        `expected ${rules.reversedPerDimension} reversed ${dimension} items, got ${reversed}`,
      );
    }
  }

  return problems;
}
