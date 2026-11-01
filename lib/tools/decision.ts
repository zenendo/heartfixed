import { z } from "zod";
import { draftCheck as rules } from "@/config/content";

/**
 * "Should I text my ex?" decision logic — Section 11.2. Deterministic: no AI, no
 * network, no storage. The draft is examined in memory and never retained; results
 * carry only flags and counts, never the draft text.
 */

export const BREAKUP_BANDS = ["under-14-days", "14-days-to-3-months", "over-3-months"] as const;
export const CONTACT_BANDS = ["under-7-days", "7-to-30-days", "over-30-days"] as const;
/** Step 2. Ids are neutral; on-screen labels resolve partner terms from config/copy.ts. */
export const PURPOSES = [
  "logistics",
  "apology-closure",
  "miss-them",
  "want-them-back",
  "upset-by-them",
  "no-reason",
] as const;

export type Purpose = (typeof PURPOSES)[number];
export type Outcome = "dont_send" | "wait_24h" | "logistics_ok";

export const decisionInputSchema = z.object({
  sinceBreakup: z.enum(BREAKUP_BANDS),
  sinceContact: z.enum(CONTACT_BANDS),
  purpose: z.enum(PURPOSES),
  alcohol: z.boolean(),
  intensity: z.number().int().min(0).max(10),
  draftedAndDeleted: z.boolean(),
});
export type DecisionInput = z.infer<typeof decisionInputSchema>;

// ---- Step 4: draft check -----------------------------------------------------------

export interface DraftCheck {
  length: number;
  tooLong: boolean;
  questionMarks: number;
  manyQuestions: boolean;
  /** Which configured pressure / ultimatum phrases appear (config strings, not draft text). */
  pressurePhrases: string[];
  ultimatums: string[];
  apologies: number;
  stackedApologies: boolean;
  nightSend: boolean;
  /** No observation raised. */
  clean: boolean;
}

/** Local time 23:00–04:59 is night-send risk. */
export function isNightSend(moment: Date): boolean {
  const hour = moment.getHours();
  return hour >= rules.nightHours.start || hour < rules.nightHours.end;
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[‘’ʼ]/g, "'").replace(/\s+/g, " ");
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const containsPhrase = (text: string, phrase: string) =>
  new RegExp(`(^|[^a-z'])${escape(phrase)}($|[^a-z'])`).test(text);

/** Rule-based observations on a pasted draft. `sentAt` is the local time he'd send. */
export function checkDraft(draft: string, sentAt: Date): DraftCheck {
  const text = normalise(draft);
  const length = draft.trim().length;
  const questionMarks = (draft.match(/\?/g) ?? []).length;
  const pressurePhrases = rules.pressurePhrases.filter((p) => containsPhrase(text, p));
  const ultimatums = rules.ultimatumPhrases.filter((p) => containsPhrase(text, p));
  const apologies = (text.match(/\b(sorry|apologi[sz]e|apologi[sz]ing)\b/g) ?? []).length;
  const result = {
    length,
    tooLong: length > rules.maxLength,
    questionMarks,
    manyQuestions: questionMarks > rules.maxQuestionMarks,
    pressurePhrases,
    ultimatums,
    apologies,
    stackedApologies: apologies > rules.maxApologies,
    nightSend: isNightSend(sentAt),
  };
  return {
    ...result,
    clean:
      !result.tooLong &&
      !result.manyQuestions &&
      pressurePhrases.length === 0 &&
      ultimatums.length === 0 &&
      !result.stackedApologies &&
      !result.nightSend,
  };
}

// ---- Step 5: the ordered rule table ----------------------------------------------------

/** Contact within 7 days, or a breakup under 14 days old, weighs toward waiting. */
const isRecent = (i: DecisionInput) =>
  i.sinceContact === "under-7-days" || i.sinceBreakup === "under-14-days";

interface Rule {
  id: string;
  when: (input: DecisionInput, draft: DraftCheck | null) => boolean;
  outcome: Outcome;
}

/**
 * Evaluated top to bottom; the first match wins. Forced-wait rules first, then
 * logistics eligibility, then the default. No rule ever takes a position on whether a
 * message will bring anyone back.
 */
export const decisionRules: readonly Rule[] = [
  // Forced wait — "Nothing good gets sent drunk or at a 9."
  { id: "forced-alcohol", when: (i) => i.alcohol, outcome: "dont_send" },
  { id: "forced-intensity", when: (i) => i.intensity >= 8, outcome: "dont_send" },
  // Logistics eligibility — the only path to logistics_ok.
  {
    id: "logistics-clean",
    when: (i, d) => i.purpose === "logistics" && !i.draftedAndDeleted && d !== null && d.clean,
    outcome: "logistics_ok",
  },
  { id: "logistics-not-yet", when: (i) => i.purpose === "logistics", outcome: "wait_24h" },
  // Genuine but mistimed: a closure/apology draft that passes the checks, not too soon.
  {
    id: "closure-clean",
    when: (i, d) => i.purpose === "apology-closure" && !isRecent(i) && d !== null && d.clean,
    outcome: "wait_24h",
  },
  // Default.
  { id: "default", when: () => true, outcome: "dont_send" },
];

export interface Decision {
  outcome: Outcome;
  /** The rule that decided — lets the page name the rule in its copy. */
  ruleId: string;
  draft: DraftCheck | null;
}

/**
 * Decides the outcome. `draft` is optional (step 4 can be skipped); `sentAt` is the
 * local time the check runs.
 */
export function decide(input: DecisionInput, draft: string | null, sentAt: Date): Decision {
  const valid = decisionInputSchema.parse(input);
  const check = draft && draft.trim() ? checkDraft(draft, sentAt) : null;
  const rule = decisionRules.find((r) => r.when(valid, check))!;
  return { outcome: rule.outcome, ruleId: rule.id, draft: check };
}
