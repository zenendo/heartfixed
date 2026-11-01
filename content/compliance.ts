import { routes, site } from "@/config/site";

/**
 * Verbatim compliance copy — Section 14.3. Do not paraphrase, shorten, move, or
 * "improve" any of this text. tests/unit/compliance.test.tsx pins it word for word.
 */

/** A run of verbatim text: plain, bold, or (Block D only) the crisis-page link. */
export type Segment = string | { strong: string } | { link: string; href: string };

/**
 * Block B — general not-therapy disclaimer. Footer area of every tool page and the
 * About page. The brand name comes from config/site.ts; the words are otherwise fixed.
 */
export const blockB = {
  text: `${site.name} provides educational tools and information about attachment patterns and breakup recovery. It does not provide therapy, counselling, medical, or mental-health advice, and using this site does not create a therapist, counsellor, or clinician relationship of any kind.`,
} as const;

/** Block C — crisis line. Footer of every page, body-size text, 988 in bold. */
export const blockC = {
  text: "If you are in crisis or thinking about harming yourself, call or text 988 (US Suicide and Crisis Lifeline, 24/7) or call your local emergency number. You deserve support from a person, right now — not a website.",
  emphasis: "988",
} as const;

/**
 * Block D — crisis block. Quiz result view, decision-tool outcome view, tracker page,
 * and the top of /crisis-resources/. Per the Section 14.3 implementation note, the
 * reference to the crisis page renders as a link to it; the words are otherwise
 * unchanged.
 */
export const blockD: readonly Segment[] = [
  { strong: "If things feel heavier than a breakup:" },
  " heartbreak can bring up thoughts of harming yourself, and there is no shame in that — but a website is not the right help for it. In the US, call or text ",
  { strong: "988" },
  " any time, day or night, to reach the Suicide and Crisis Lifeline. If you are outside the US, the ",
  { link: "Crisis Resources", href: routes.crisis },
  " page lists international helplines, and your local emergency number always works. Please reach out to a person today.",
];

// TODO(session-5): Block A (self-reflection disclaimer).
/** Block E — draft-privacy notice. Directly above the decision tool's draft textarea. */
export const blockE = {
  text: "Your draft stays in this browser. It is not sent anywhere, not stored after you leave this page, not used to train anything, and never seen by a person. The checks below run on your device.",
} as const;
