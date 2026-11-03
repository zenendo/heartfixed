import { copy } from "@/config/copy";
import { site } from "@/config/site";

/**
 * The result view's headings and short UI lines (Session 5). The two verbatim lines are
 * marked; the rest is Session 5 drafting where the brief and spec give none — flagged
 * for founder review in BUILD-LOG.md. Kept apart from content/quiz-result.ts so the
 * shared-link view loads none of Part B's reads.
 */

const { subject, object, possessive } = copy.partner;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const resultCopy = {
  headline: (label: string) => `Your pattern: ${label}`,
  score: (dimension: "anxiety" | "avoidance", score: number, band: string) =>
    `Attachment ${dimension} ${score}/100 — ${band}`,
  acts: {
    why: "Why it happened",
    yours: "Your pattern in this relationship",
    since: "Since the breakup",
    after: `Getting over ${object}, with your pattern`,
  },
  herHeadline: (label: string) => `${cap(possessive)} pattern, as you experienced it: ${label}`,
  meansLead: "Means / doesn't mean:",
  sinceLead: "Since the breakup:",
  dynamicHeading: "The dynamic between you",
  /** Composition rule (brief, Part B): a lean borrows the lean language of the profile rules. */
  dynamicLean: {
    you: (lean: string) =>
      `You're broadly secure, with ${lean} lean — under breakup stress, the loop below is the one to watch.`,
    her: (lean: string) =>
      `As you experienced ${object}, ${subject} was broadly secure, with ${lean} lean — under stress, the loop below is the one ${subject} tended to run.`,
  },
  sections: {
    whatItMeans: "What this means",
    afterBreakup: "How this tends to show up after a breakup",
    risk: "Your no-contact risk",
    watchOuts: "Watch-outs",
    strengths: "Strengths",
  },
  /** Section 10.3 item 5, verbatim. */
  trackerOffer:
    "Your risk window is the urge, not the decision. Start your no-contact streak now — it takes ten seconds and lives only in this browser.",
  trackerOpen: "Open the tracker",
  share: {
    heading: "Share your result",
    body: `The link shows your pattern and your two scores — nothing about ${object}, and never your answers.`,
    button: "Copy the share link",
    copied: "Link copied.",
    copyFailed: "Copy the link below:",
    /** Section 10.3 item 8: the profile name and the site name only. */
    text: (name: string) => `My attachment pattern: ${name} — ${site.name}`,
  },
  print: "Print / Save PDF",
  goDeeper: "Go deeper",
  retake: "Take the quiz again",
  outdated:
    "The quiz has changed since you took it, so this result may not be comparable with a new one.",
  /** Section 9.6, verbatim. */
  sharedBanner: "This is a shared result. Take the assessment to get your own.",
  sharedCta: "Take the quiz",
  sharedProfileHeading: (name: string) => `About the ${name.toLowerCase()} pattern`,
} as const;
