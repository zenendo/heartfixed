import { copy, type PartnerTerms } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import { DIMENSIONS, quizQuestionSchema, type QuizQuestion, type SelectorItem } from "./types";

/**
 * Question data — Sections 9.1–9.2 and the founder-approved quiz build brief
 * (the quiz build brief in the repo root, Part A, 2026-11-02). The brief is the content
 * source: tests/unit/quiz-brief.test.ts renders every stem below and checks it against
 * the brief's tables word for word, so a typo here fails the build.
 *
 * Partner references are tokens resolved from a pronoun set in config/copy.ts (Section
 * 2.3; amendment brief, 2.2): {subject}, {object}, {possessive}, {reflexive}, the
 * agreement forms {was} and {has}, {subjectHas} ("she's", "they've"), and {Subject} for a
 * sentence-initial "She". The runner renders them with the partner pronouns the visitor
 * chose; the default is she/her.
 */
const base = {
  version: quizConfig.questionSetVersion,
  audience: quizConfig.audience,
} as const;

const item = (
  id: string,
  dimension: QuizQuestion["dimension"],
  stem: string,
  reversed = false,
  weight = 1,
): QuizQuestion => ({ ...base, id, dimension, reversed, weight, stem });

/**
 * His 18 (men-v2): the v1 24 less q04, q10, q11, q17, q21 and q24 (quiz v2 amendment
 * brief, Part 1). q19, q20 and q23 reversed; q20 and q23 weight 0.5, so each dimension
 * has max raw 34.
 */
export const questions: QuizQuestion[] = [
  item(
    "q01",
    "anxiety",
    "When {subject} took a while to reply, I checked my phone regularly instead of focusing on my own life.",
  ),
  item(
    "q02",
    "avoidance",
    "When {subject} asked to talk about our relationship, I avoided the conversation instead of being present.",
  ),
  item(
    "q03",
    "anxiety",
    "After an argument, I sent several messages in a row to try to fix things that same day.",
  ),
  item(
    "q05",
    "anxiety",
    "When {subject} said {subject} needed space, I texted {object} anyway to check if we were okay.",
  ),
  item(
    "q06",
    "avoidance",
    "When {subject} told me how {subject} felt about me, I changed the subject or made a joke of it.",
  ),
  item(
    "q07",
    "anxiety",
    "In the days immediately after our breakup, I kept checking {possessive} social media accounts.",
  ),
  item(
    "q08",
    "avoidance",
    "When our relationship started to feel serious, I found reasons in {possessive} flaws to pull back.",
  ),
  item(
    "q09",
    "anxiety",
    "When {subject} went quiet and pulled away, I chased {object} with texts to see if everything was okay.",
  ),
  item(
    "q12",
    "avoidance",
    "After an argument, I went quiet for days rather than talk through what happened.",
  ),
  item(
    "q13",
    "anxiety",
    "When {subject} wouldn't say what had hurt {object}, I apologized for things I only guessed {subject} {was} upset about.",
  ),
  item(
    "q14",
    "avoidance",
    "When something was bothering me, I kept it to myself rather than tell {object}.",
  ),
  item(
    "q15",
    "anxiety",
    "When I felt insecure about our relationship, I asked {object} for reassurance.",
  ),
  item("q16", "avoidance", "When {subject} wanted to meet my friends or family, I put it off."),
  item(
    "q18",
    "avoidance",
    "When things were going well, I looked for ways to get away from {object}.",
  ),
  item(
    "q19",
    "anxiety",
    "When {subject} took a full day to reply, I was able to go about my day and focus on my own life without checking my phone.",
    true,
  ),
  item(
    "q20",
    "avoidance",
    "When {subject} made bids to connect with me, I stayed present and talked with {object} even when it felt uncomfortable.",
    true,
    0.5,
  ),
  item("q22", "avoidance", "After our breakup, I told myself I felt nothing about it."),
  item(
    "q23",
    "anxiety",
    "After an argument, I waited until we were both calm before I brought it up again.",
    true,
    0.5,
  ),
];

/**
 * Her 12 — the perceived-pattern module (brief, Part A): the pattern he experienced
 * from her in the same relationship, never a clinical label for her. `dimension` here means
 * her-anxiety / her-avoidance. No reversed items, all weight 1.
 */
export const herQuestions: QuizQuestion[] = [
  item(
    "h1",
    "anxiety",
    "When I didn't reply for a few hours, {subject} sent several messages or called until I answered.",
  ),
  item(
    "h2",
    "avoidance",
    "When I tried to talk about our relationship, {subject} changed the subject or shut down.",
  ),
  item(
    "h3",
    "anxiety",
    "When I needed time alone, {subject} kept pushing to talk until I gave in.",
  ),
  item(
    "h4",
    "avoidance",
    "After an argument, {subject} went quiet instead of talking through what happened.",
  ),
  item("h5", "anxiety", "{Subject} asked whether I still loved {object} or whether we were okay."),
  item(
    "h6",
    "avoidance",
    "When I was upset or needed support, {subject} became uncomfortable or distant.",
  ),
  item(
    "h7",
    "anxiety",
    "When I spent time with friends without {object}, {subject} checked up on me or got nervous.",
  ),
  item(
    "h8",
    "avoidance",
    "When I tried to get {object} to talk to me about something, {subject} pulled back or said {subject} needed space.",
  ),
  item(
    "h9",
    "anxiety",
    "When I pulled away or seemed distant, {subject} tried harder to get close: more messages, more affection, more plans.",
  ),
  item(
    "h10",
    "avoidance",
    "When our relationship started to feel serious, {subject} found faults in me or reasons it wouldn't work.",
  ),
  item(
    "h11",
    "anxiety",
    "When we argued, {subject} needed to settle it right away, even if it was late at night.",
  ),
  item(
    "h12",
    "avoidance",
    "When I asked about {possessive} friends, plans, or feelings, {subject} kept them to {reflexive}.",
  ),
];

/** Since-the-breakup selectors (brief, Part A). Unscored; same 0–4 scale. */
export const sinceBreakupSelectors: SelectorItem[] = [
  {
    id: "a1",
    stem: "Since the breakup, there have been long stretches with no messages or check-ins from {object}.",
  },
  {
    id: "a2",
    stem: 'Since the breakup, {subject} {has} reached out at odd moments, a random meme, a "hey", then gone quiet again.',
  },
  {
    id: "a3",
    stem: "Since the breakup, I have seen {object} out with friends or posting as if {subject} {has} already moved on.",
  },
  {
    id: "a4",
    stem: "Since the breakup, {subject} {has} contacted me when {subjectHas} been drinking or late at night.",
  },
  {
    id: "a5",
    stem: "Since the breakup, {subject} {has} kept contact going in small ways, such as liking my posts or watching my stories.",
  },
  {
    id: "a6",
    stem: "Since the breakup, {subject} {has} expressed missing me or regret about how things ended.",
  },
];

/**
 * Unscored instructional item shown at runner position 7, between q07 and q08 (after
 * the first third of his 18), and not counted in "Question N of 18" (Section 9.2; v2
 * amendment brief, 1.1). Failing it never blocks results; it only sets
 * QuizResult.attentionFlag. Never mentioned to the visitor.
 */
export const attentionCheck = {
  id: "attn-01",
  stem: "To show you're reading, choose 'Rarely' for this one.",
  expectedValue: 1, // "Rarely" on the Likert scale
  position: 7,
} as const;

const TOKEN = /\{(\w+)\}/g;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Resolves partner tokens in a stem from config/copy.ts, with per-question overrides.
 * A capitalised token ({Subject}) gives the capitalised term, for sentence starts.
 */
export function renderStem(
  question: Pick<QuizQuestion, "id" | "stem" | "partnerTerms">,
  terms: PartnerTerms = copy.partner,
): string {
  const merged: Record<string, unknown> = { ...terms, ...question.partnerTerms };
  return question.stem.replace(TOKEN, (match, key: string) => {
    const lower = key.charAt(0).toLowerCase() + key.slice(1);
    const value = merged[key] ?? (key !== lower ? merged[lower] : undefined);
    if (typeof value !== "string") {
      throw new Error(`Unknown token ${match} in question ${question.id}`);
    }
    return key !== lower ? capitalize(value) : value;
  });
}

export interface BankRules {
  scoredItems: number;
  itemsPerDimension: number;
  reversedPerDimension: Readonly<Record<QuizQuestion["dimension"], number>>;
  maxStemWords: number;
  bannedStemTerms: readonly string[];
}

/**
 * Checks a question bank against its shape and framing rules (Section 9.2). Returns a
 * list of problems; an empty list means the bank is valid. The engine itself stays
 * generic so future assessments can use different shapes with their own rules.
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
    const expected = rules.reversedPerDimension[dimension];
    if (reversed !== expected) {
      problems.push(`expected ${expected} reversed ${dimension} items, got ${reversed}`);
    }
  }

  return problems;
}
