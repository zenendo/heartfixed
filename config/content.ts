/**
 * Content configuration — Section 17.1: guide metadata, situational template data,
 * decision-tool phrase list and urge-timer prompt cards.
 */

// TODO(session-10): guide metadata (title, description, datePublished, lastReviewed,
// tool block) and the situational template structure (Section 12.3).

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
