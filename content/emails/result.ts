import { site } from "@/config/site";
import { blockA, blockAShort } from "@/content/compliance";

/**
 * Quiz result email copy — Sections 13.2 and 14.4. Transactional: sent once, to the
 * address he entered, and it never subscribes him to anything.
 */
export const resultEmailCopy = {
  subject: (profileName: string) => `Your attachment result from ${site.name}: ${profileName}`,
  preheader: "Your pattern, your two scores, and a plan for the first 14 days.",
  /** Block A short form (Section 14.4), at the top of every transactional email. */
  shortDisclaimer: blockAShort.text,
  requestedNote: `You're getting this because you asked for your result to be emailed to you on ${site.name}. It's a one-off email: you haven't been added to any list.`,
  scoresHeading: "Your two scores",
  score: (label: string, score: number, band: string) => `${label}: ${score}/100, ${band}`,
  anxietyLabel: "Attachment anxiety",
  avoidanceLabel: "Attachment avoidance",
  whatItMeans: "What this means",
  watchOutsHeading: "Watch-outs",
  planHeading: "Your first 14 days",
  readingHeading: "If you want to read further",
  reading: {
    attached: "Attached, by Amir Levine and Rachel Heller",
    anxiouslyAttached: "Anxiously Attached, by Jessica Baum",
  },
  resourcesLink: "More books and programmes, by moment",
  shareHeading: "Your share link",
  shareNote: "It carries your two scores and the quiz version, never your answers.",
  trackerHeading: "Start your no-contact streak",
  trackerBody: "It takes ten seconds and lives only in your browser.",
  trackerLink: "Open the no-contact tracker",
  disclaimer: blockA.text,
  join: {
    heading: "Want more like this?",
    body: "There's a free email list: one or two emails a week on getting through a breakup. You're not on it. Joining is a separate choice, and you can leave anytime.",
    link: "Join the free email list",
  },
} as const;
