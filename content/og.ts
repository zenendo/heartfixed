/**
 * Open Graph card copy — Section 12.2 ("a per-tool OG image"), served at /og/<key>/.
 * The quiz card is already live for Session 4. The brand name on each
 * card comes from config/site.ts. Language rules (Section 14.2) apply here too.
 */
export type OgKey = "site" | "quiz" | "tracker" | "decision";

export const ogCards: Record<OgKey, { eyebrow: string; title: string; subtitle: string }> = {
  site: {
    eyebrow: "Free tools for men after a breakup",
    title: "Find your pattern. Get through the breakup.",
    subtitle: "Attachment quiz · No-contact tracker · Should I text my ex?",
  },
  quiz: {
    eyebrow: "Attachment style quiz for men",
    title: "What do you actually do when it gets close?",
    subtitle: "24 questions · about 3 minutes · full result free",
  },
  tracker: {
    eyebrow: "No-contact tracker",
    title: "Count the days. Protect the streak.",
    subtitle: "Free · no account · stays in your browser",
  },
  decision: {
    eyebrow: "Should I text my ex?",
    title: "Five steps before you hit send.",
    subtitle: "Free · no signup · your draft never leaves your browser",
  },
};
