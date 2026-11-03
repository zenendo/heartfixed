import { legal } from "@/config/legal";
import { copy } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import { routes, site } from "@/config/site";

/**
 * About, Contact and Methodology copy — Sections 12.5, 14.1, 14.2 and 14.4. Faceless:
 * no founder name, photo or byline. Section 14.2 terms appear only inside the verbatim
 * Blocks A and B, which the pages render from content/compliance.ts.
 * TODO(session-11 founder): the About facts are yours to confirm (Section 18, Week 3).
 */

const { bands, bankRules, likert, contextQuestions } = quizConfig;

export const aboutPage = {
  h1: `About ${site.name}`,
  intro: [
    `${site.name} is a set of free tools and guides for men going through a breakup: an attachment-style assessment, a no-contact tracker, a tool for the moment you're about to text your ex, and short guides for the hardest weeks.`,
    "It's built for the specific, miserable moment most people land here in — often late at night, often with a message already written — and for the weeks after.",
  ],
  forWho: {
    heading: "Who it's for",
    paragraphs: [
      `For adults (${legal.minimumAge}+). It's written for men, because that's who it was built for first, and because most breakup advice isn't written with them in mind.`,
      "It's for understanding your own patterns and getting through the weeks after a breakup — not for winning anyone back, and not for crisis.",
    ],
  },
  principles: {
    heading: "How it works",
    items: [
      {
        term: "Free in full",
        text: "Every tool and every result is free. No paywall, no blurred report, no account.",
      },
      {
        term: "Private by design",
        text: "Your answers, your tracker and your drafts stay in your browser. We never see them.",
      },
      {
        term: "Rules, not a chatbot",
        text: "There's no AI on this site and nothing pretends to be a person. The tools are fixed rules written in advance.",
      },
      {
        term: "Honest about money",
        text: "The site may earn from affiliate links to books and programmes. Every one is disclosed right next to it, and money never changes a result or a recommendation.",
      },
    ],
  },
  notHeading: "What it isn't",
  links: {
    heading: "More about the site",
    items: [
      { label: "How the assessment works", href: routes.methodology },
      { label: "Crisis resources", href: routes.crisis },
      { label: "Affiliate disclosure", href: routes.affiliateDisclosure },
      { label: "Privacy policy", href: routes.privacy },
      { label: "Contact", href: routes.contact },
    ],
  },
} as const;

export const contactPage = {
  h1: "Contact",
  intro: "Questions, corrections, or a request about your email data — this is the place.",
  emailLabel: "Email",
  /** Shown only while config/site.ts has no contactEmail (founder supplies it). */
  emailPending: "The contact address will be listed here before launch.",
  expectations:
    "Replies within a few days; this site cannot help with emergencies — see Crisis Resources.",
  crisisLink: "Crisis resources",
  topics: {
    heading: "What we can help with",
    items: [
      "Questions about how a tool or the assessment works.",
      "Corrections to anything on the site.",
      "Requests to see or delete the email address we hold for you.",
      "Questions about affiliate links.",
    ],
  },
  localData: {
    heading: "About the data in your browser",
    text: 'We can\'t see or delete your quiz answers, tracker or drafts — they never reach us. Use "Clear my data" in each tool to delete them yourself.',
  },
  privacyNote:
    "Please don't send private details about yourself or anyone else. A short description of your question is enough.",
} as const;

const PROFILE_COUNT = 4;

export const methodologyPage = {
  h1: "How the Assessment Works",
  framing: `The attachment quiz is a self-reflection assessment informed by attachment research. Here is exactly what it asks, how it scores, and what it can't tell you.`,
  measures: {
    heading: "What it measures",
    paragraphs: [
      "Researchers who study adult attachment describe it with two dimensions. Attachment anxiety is how strongly you react to distance in a relationship — the worry about being left, and the urge to close the gap. Attachment avoidance is how uncomfortable you are with closeness — the pull to keep space and handle things alone.",
      `The assessment scores you on both, separately. Your pattern comes from where the two scores land, which is why there are ${PROFILE_COUNT} patterns and not one scale.`,
    ],
  },
  questions: {
    heading: "The questions",
    items: [
      `${bankRules.scoredItems} scored questions: ${bankRules.itemsPerDimension} for attachment anxiety and ${bankRules.itemsPerDimension} for attachment avoidance.`,
      "Each one describes something you did, in a specific situation, in your last relationship or now — an unanswered message, an argument, a partner asking for closeness or for space. Not how you'd describe yourself.",
      `${bankRules.reversedPerDimension * 2} of them are worded the other way round (${bankRules.reversedPerDimension} per dimension), so agreeing means lower, not higher. That catches answering on autopilot.`,
      `${contextQuestions.length} optional context questions at the end — how long ago the breakup was, and whether you're in no contact. ${quizConfig.contextNote}`,
      "The questions are original to this site. They aren't copied from any published questionnaire or from any other quiz.",
    ],
  },
  scale: {
    heading: "How you answer",
    intro: "Every question about you uses the same five-point scale:",
    partnerNote: `The questions about ${copy.partner.object} and about what's happened since use the same scale without "like me": ${likert.partnerLabels.join(", ")}.`,
    labels: likert.labels,
  },
  scoring: {
    heading: "How it scores",
    items: [
      `Each answer scores ${likert.min} to ${likert.max}. For the reversed questions, the score is flipped.`,
      "The scores for each dimension are added up and converted to a number from 0 to 100.",
      `Each number falls into a band: low (0–${bands.lowMax}), moderate (${bands.lowMax + 1}–${bands.moderateMax}) or high (${bands.moderateMax + 1}–100).`,
      "The two bands together give your pattern, as in the table below.",
      "If your pattern is secure but one or both scores are moderate, your result names the lean — the pattern most likely to show up under stress.",
    ],
    tableCaption:
      "Which pattern each combination lands in. Rows are your anxiety score; columns are your avoidance score.",
  },
  integrity: {
    heading: "Same answers, same result",
    items: [
      "Scoring is a fixed calculation. The same answers always give the same result — no randomness, and no difference by time of day or where you came from.",
      "The score is calculated in your browser. Your answers are never sent to us.",
      "A shared result link carries your two scores and the quiz version — never your answers.",
      "The full result is free. There's nothing to unlock.",
    ],
  },
  limits: {
    heading: "What it can't tell you",
    paragraphs: [
      "It's not a clinical instrument. It describes how you've tended to act in relationships, based on your own answers, at one point in time. It can't account for everything that shaped a relationship.",
      // Founder-approved (Session 4), with "label" for the brief's clinical verb: Section 14.2.
      `The quiz also asks how your partner showed up in the same relationship. Those answers describe the pattern you experienced — they can't label ${copy.partner.object}, and only ${copy.partner.subject} could describe ${copy.partner.possessive} own pattern. We show that read because understanding the dynamic you were in is part of understanding the breakup.`,
      "Patterns aren't permanent. Stress shifts them, and so do time and experience. If you take it again in a few months, a different result can be real progress, not a mistake.",
    ],
  },
  sources: {
    heading: "Where the ideas come from",
    paragraph:
      "The two dimensions come from decades of adult attachment research. If you want to read further, the books most people start with are Attached by Amir Levine and Rachel Heller, and Anxiously Attached by Jessica Baum.",
  },
  links: [
    { label: "Take the quiz", href: routes.quiz },
    { label: "The four attachment styles", href: routes.attachmentStyles },
  ],
} as const;
