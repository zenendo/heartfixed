import { pronounTerms, type PartnerTerms, type PronounId } from "@/config/copy";

/**
 * The pronoun context the quiz and its result render through — quiz v2 amendment brief,
 * Part 2 (2.1–2.3). Two token sets: the taker's (t) and the partner's (p). The taker
 * speaks as "I" in the stems and is "you" in the result, so `t` mostly supplies the
 * taker-side nouns ("the next man who gets close enough").
 */

export interface PronounChoice {
  taker: PronounId;
  partner: PronounId;
}

export interface PronounContext {
  t: PartnerTerms;
  p: PartnerTerms;
}

/**
 * The default rendering path: a he/him taker and a she/her partner, which is exactly the
 * founder-approved canonical copy. Results saved before the pronoun questions use it.
 */
export const DEFAULT_PRONOUNS: PronounChoice = { taker: "he", partner: "she" };

export function pronounContext(choice: PronounChoice = DEFAULT_PRONOUNS): PronounContext {
  return { t: pronounTerms[choice.taker], p: pronounTerms[choice.partner] };
}

/**
 * Agreement for a verb outside the token table (2.2): the singular form for he and she,
 * the plural for they ("she reaches out", "they reach out").
 */
export const agree = (who: PartnerTerms, singular: string, plural: string) =>
  who.plural ? plural : singular;

/** Sentence-start and headline forms: "She", "His pattern", "Their pattern". */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
