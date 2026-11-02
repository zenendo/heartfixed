/**
 * Content configuration — Section 17.1: guide metadata, situational template data,
 * decision-tool phrase list and urge-timer prompt cards.
 */

import { routes, type ToolKey } from "@/config/site";

/**
 * Guide metadata — Section 12.3. Titles and descriptions for <head> live in
 * lib/seo/metadata.ts; the words on the page live in content/guides/. Dates are ISO
 * (YYYY-MM-DD) and change only when the content actually changes (Section 12.2).
 */
export interface GuideMeta {
  route: string;
  kind: "article" | "situational";
  /** The tool block the guide ends with (Section 6). */
  tool: ToolKey;
  /** The one sibling guide the guide ends with (Section 6). */
  sibling: string;
  datePublished: string;
  lastReviewed: string;
}

export const guides: readonly GuideMeta[] = [
  {
    route: routes.noContactRule,
    kind: "article",
    tool: "tracker",
    sibling: routes.guideHowLong,
    datePublished: "2026-11-01",
    lastReviewed: "2026-11-01",
  },
  {
    route: routes.guideAfterBreakup,
    kind: "article",
    tool: "quiz",
    sibling: routes.guideHowLong,
    datePublished: "2026-11-01",
    lastReviewed: "2026-11-01",
  },
  {
    route: routes.guideHowLong,
    kind: "article",
    tool: "tracker",
    sibling: routes.guideDay14,
    datePublished: "2026-11-01",
    lastReviewed: "2026-11-01",
  },
  {
    route: routes.guideDay14,
    kind: "situational",
    tool: "tracker",
    sibling: routes.guideSheTexted,
    datePublished: "2026-11-01",
    lastReviewed: "2026-11-01",
  },
  {
    route: routes.guideSheTexted,
    kind: "situational",
    tool: "decision",
    sibling: routes.noContactRule,
    datePublished: "2026-11-01",
    lastReviewed: "2026-11-01",
  },
];

export const guideMeta = (route: string): GuideMeta => {
  const meta = guides.find((g) => g.route === route);
  if (!meta) throw new Error(`No guide metadata for ${route}`);
  return meta;
};

/**
 * The situational template — Section 12.3. Every situational page has these sections,
 * in this order, then its tool block and sibling link. A new situational page is a new
 * content file plus a `guides` entry above and a metadata entry: no template changes.
 * A page may override a heading to fit its moment.
 */
export const situationalTemplate = {
  sections: [
    { key: "whySpikes", heading: "Why it hits so hard now" },
    { key: "normal", heading: "What's normal this week" },
    { key: "mistakes", heading: "The three mistakes" },
    { key: "next24", heading: "Your next 24 hours" },
  ],
} as const;

export type SituationalSectionKey = (typeof situationalTemplate.sections)[number]["key"];

/**
 * Draft-check rules for the decision tool (Section 11.2, step 4). Matching is local,
 * case-insensitive and whole-phrase. Founder-maintained: adding a phrase here is the
 * only change needed.
 */
export const draftCheck = {
  maxLength: 600,
  /** More question marks than this is reported as an observation. */
  maxQuestionMarks: 2,
  /** More apologies than this counts as "apologies stacked". */
  maxApologies: 2,
  /** Local hours flagged as night-send risk: from 23:00 up to (not including) 05:00. */
  nightHours: { start: 23, end: 5 },
  pressurePhrases: [
    "you owe me",
    "after everything",
    "just reply",
    "answer me",
    "i deserve an answer",
    "why won't you",
  ],
  ultimatumPhrases: [
    "if you don't",
    "last chance",
    "or else",
    "this is the last time",
    "never hear from me again",
  ],
} as const;

/**
 * Urge timer (Section 11.2): a 30-minute countdown with rotating prompt cards.
 * Tokens: {subject} → partner reference from config/copy.ts; {day} → the tracker's
 * current day when a tracker exists (otherwise noTrackerPrompt replaces that card).
 */
export const urgeTimer = {
  minutes: 30,
  rotateSeconds: 60,
  prompts: [
    "What do you actually want to happen after {subject} reads it?",
    "How will you feel at breakfast if {subject} doesn't reply?",
    "Day {day} of no contact is worth more than this draft.",
  ],
  noTrackerPrompt: "Every day of no contact is worth more than this draft.",
} as const;
