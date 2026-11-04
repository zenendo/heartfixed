import type { PartnerTerms } from "@/config/copy";
import { site } from "@/config/site";
import { cap } from "@/lib/quiz/pronouns";

/**
 * The result view's headings and short UI lines (Session 5). The two verbatim lines are
 * marked; the rest is Session 5 drafting where the brief and spec give none — flagged
 * for founder review in BUILD-LOG.md. Kept apart from content/quiz-result.ts so the
 * shared-link view loads none of Part B's reads.
 *
 * Lines that name the partner take the visitor's partner pronoun set (amendment brief,
 * 2.3); none uses an em dash (2.6).
 */

export const resultCopy = {
  headline: (label: string) => `Your pattern: ${label}`,
  score: (dimension: "anxiety" | "avoidance", score: number, band: string) =>
    `Attachment ${dimension} ${score}/100, ${band}`,
  acts: {
    why: "Why it happened",
    yours: "Your pattern in this relationship",
    since: "Since the breakup",
    after: (p: PartnerTerms) => `Getting over ${p.object}, with your pattern`,
  },
  /** Amendment brief, 2.2: "His pattern…", "Her pattern…", "Their pattern…". */
  herHeadline: (p: PartnerTerms, label: string) =>
    `${cap(p.possessive)} pattern, as you experienced it: ${label}`,
  meansLead: "Means / doesn't mean:",
  sinceLead: "Since the breakup:",
  dynamicHeading: "The dynamic between you",
  /** Composition rule (brief, Part B): a lean borrows the lean language of the profile rules. */
  dynamicLean: {
    you: (lean: string) =>
      `You're broadly secure, with ${lean} lean. Under breakup stress, the loop below is the one to watch.`,
    her: (p: PartnerTerms, lean: string) =>
      `As you experienced ${p.object}, ${p.subject} ${p.was} broadly secure, with ${lean} lean. Under stress, the loop below is the one ${p.subject} tended to run.`,
  },
  sections: {
    whatItMeans: "What this means",
    afterBreakup: "How this tends to show up after a breakup",
    risk: "Your no-contact risk",
    watchOuts: "Watch-outs",
    strengths: "Strengths",
  },
  /** Section 10.3 item 5, verbatim but for the em dash (amendment brief, 2.6). */
  trackerOffer:
    "Your risk window is the urge, not the decision. Start your no-contact streak now: it takes ten seconds and lives only in this browser.",
  trackerOpen: "Open the tracker",
  share: {
    heading: "Share your result",
    body: (p: PartnerTerms) =>
      `The link shows your pattern and your two scores: nothing about ${p.object}, and never your answers.`,
    button: "Copy the share link",
    copied: "Link copied.",
    copyFailed: "Copy the link below:",
    /** Section 10.3 item 8: the profile name and the site name only. */
    text: (name: string) => `My attachment pattern: ${name}, ${site.name}`,
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
