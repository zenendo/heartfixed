/**
 * Gendered-term / pronoun dictionary — Section 2.3, and the quiz v2 amendment brief,
 * Part 2 (2.2). Components never hardcode pronouns; they read them from here.
 *
 * The site itself stays men-first (amendment, 2.4): `copy.partner` is the she/her set
 * every static page uses. The quiz asks the taker's and the partner's pronouns, and the
 * quiz and its result render through a context of two of these sets (lib/quiz/pronouns).
 */
export const PRONOUN_IDS = ["he", "she", "they"] as const;
export type PronounId = (typeof PRONOUN_IDS)[number];

export interface PartnerTerms {
  /** "she" */
  subject: string;
  /** "her" (as in "texting her") */
  object: string;
  /** "her" (as in "her profile") */
  possessive: string;
  /** "hers" (as in "the choice was hers") */
  possessivePronoun: string;
  /** "herself" */
  reflexive: string;
  /** Verb agreement with the subject: singular "they" takes the plural forms. */
  was: string;
  has: string;
  is: string;
  does: string;
  /** The subject with "has" contracted: "she's", "they've" (as in "she's moved on"). */
  subjectHas: string;
  /** "woman" (as in "a woman who's no longer there") */
  noun: string;
  /** "women" */
  nounPlural: string;
  /** True for they/them: verbs outside the table above take their plural form. */
  plural: boolean;
}

export const pronounTerms: Record<PronounId, PartnerTerms> = {
  he: {
    subject: "he",
    object: "him",
    possessive: "his",
    possessivePronoun: "his",
    reflexive: "himself",
    was: "was",
    has: "has",
    is: "is",
    does: "does",
    subjectHas: "he's",
    noun: "man",
    nounPlural: "men",
    plural: false,
  },
  she: {
    subject: "she",
    object: "her",
    possessive: "her",
    possessivePronoun: "hers",
    reflexive: "herself",
    was: "was",
    has: "has",
    is: "is",
    does: "does",
    subjectHas: "she's",
    noun: "woman",
    nounPlural: "women",
    plural: false,
  },
  they: {
    subject: "they",
    object: "them",
    possessive: "their",
    possessivePronoun: "theirs",
    reflexive: "themselves",
    was: "were",
    has: "have",
    is: "are",
    does: "do",
    subjectHas: "they've",
    noun: "person",
    nounPlural: "people",
    plural: true,
  },
};

export interface AudienceCopy {
  audience: string;
  /** The site's default partner reference (she/her for the men's beachhead). */
  partner: PartnerTerms;
  /** The site's default reader (he/him), the quiz's default taker. */
  taker: PartnerTerms;
}

export const copy: AudienceCopy = {
  audience: "men",
  partner: pronounTerms.she,
  taker: pronounTerms.he,
};
