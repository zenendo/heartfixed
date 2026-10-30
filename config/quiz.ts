/**
 * Quiz configuration — Sections 9.3 and 17.1.
 * Band edges live here so a threshold change is a config change plus a test update.
 */
export const quizConfig = {
  questionSetVersion: "men-v1",
  audience: "men",
  /** Normalized 0–100 bands: low 0–33, moderate 34–66, high 67–100. */
  bands: {
    lowMax: 33,
    moderateMax: 66,
  },
  /** In-progress attempts older than this are discarded (Section 10.2). */
  inProgressMaxAgeDays: 7,
  // TODO(session-2): context-question definitions (time since breakup; currently in
  // no contact) — unscored, used only to select result-page supporting copy.
} as const;
