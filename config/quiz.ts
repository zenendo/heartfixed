/**
 * Quiz configuration — Sections 9.2, 9.3 and 17.1.
 * Band edges live here so a threshold change is a config change plus a test update.
 */
export const quizConfig = {
  questionSetVersion: "men-v1",
  audience: "men",
  /** One 5-point scale for every scored question (Section 9.2). */
  likert: {
    min: 0,
    max: 4,
    labels: ["Never like me", "Rarely", "Sometimes", "Often", "Almost always like me"],
    /** Her 12 and the since-the-breakup items: the visitor isn't describing himself. */
    partnerLabels: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
  },
  /** Normalized 0–100 bands: low 0–33, moderate 34–66, high 67–100. */
  bands: {
    lowMax: 33,
    moderateMax: 66,
  },
  /** Launch bank shape and framing rules (Section 9.2), checked by checkQuestionBank. */
  bankRules: {
    scoredItems: 24,
    itemsPerDimension: 12,
    reversedPerDimension: 2,
    maxStemWords: 28,
    bannedStemTerms: ["hyperactivation", "deactivation", "protest behaviour", "protest behavior"],
  },
  /**
   * The perceived-pattern module about her (quiz build brief, Part A): 12 items, 6 per
   * dimension, none reversed, all weight 1. Same scale, bands and profile table.
   */
  herBankRules: {
    scoredItems: 12,
    itemsPerDimension: 6,
    reversedPerDimension: 0,
    maxStemWords: 28,
    bannedStemTerms: ["hyperactivation", "deactivation", "protest behaviour", "protest behavior"],
  },
  /**
   * Since-the-breakup selectors (brief, Part A): unscored. An item answered at or above
   * this value selects its decode section on the result page (Session 5).
   */
  selectorThreshold: 2,
  /** Instruction line shown before question 1 (brief, Part A). */
  instruction: "Answer thinking about your most recent relationship.",
  /** In-progress attempts older than this are discarded (Section 10.2). */
  inProgressMaxAgeDays: 7,
  /**
   * Unscored context questions, asked after the last scored item. They select
   * result-page supporting copy only and never reach scoreQuiz.
   */
  contextNote: "These don't change your scores — they help us show you the right next step.",
  contextQuestions: [
    {
      id: "ctx-time-since-breakup",
      prompt: "How long ago did the breakup happen?",
      options: [
        { value: "under-2-weeks", label: "Less than 2 weeks ago" },
        { value: "2-weeks-to-2-months", label: "2 weeks to 2 months ago" },
        { value: "2-to-6-months", label: "2 to 6 months ago" },
        { value: "over-6-months", label: "More than 6 months ago" },
        { value: "no-breakup", label: "We haven't broken up" },
      ],
    },
    {
      id: "ctx-no-contact",
      prompt: "Are you in no contact right now?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "trying", label: "I'm trying to start" },
        { value: "no", label: "No" },
      ],
    },
  ],
} as const;
