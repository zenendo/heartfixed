import { copy } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import { routes } from "@/config/site";
import { herQuestions, questions, sinceBreakupSelectors } from "@/lib/quiz";
import type { FaqItem } from "@/lib/seo/schema";

/**
 * Quiz page and runner copy — Sections 10.1–10.2 and the quiz build brief (Part A).
 * Partner references resolve through config/copy.ts (Section 2.3). Counts come from
 * the question data, so the copy can't drift from what the runner asks.
 *
 * The brief supplies the question data, the instruction line, the attention check,
 * the "About her — N of 12" label and the context note. The rest of this file is
 * Session 4 drafting from facts in the spec and the brief — flagged for founder
 * review in BUILD-LOG.md.
 *
 * Section 14.2: own copy never uses the prohibited clinical terms; they appear only
 * inside the verbatim Blocks A and B.
 */

const { partner } = copy;
const his = questions.length;
const hers = herQuestions.length;
const since = sinceBreakupSelectors.length;
const context = quizConfig.contextQuestions.length;

/** One answer screen each, at roughly 6–7 seconds a screen. */
export const QUIZ_MINUTES = 5;

export const quizPage = {
  h1: "Attachment Style Quiz for Men",
  promise: [
    `See how you tend to act when a relationship feels close, distant or uncertain — and what that pattern means for getting through this breakup.`,
    `${his} questions about you, then ${hers} about ${partner.object} and ${since} about what's happened since; about ${QUIZ_MINUTES} minutes, with the full result free and no email needed.`,
  ],
  profiles: {
    heading: "The four patterns it measures",
    intro:
      "Your result is one of four patterns, from where your two scores land. Each has its own page if you want to read more first.",
  },
  how: {
    heading: "How the quiz works",
    paragraphs: [
      "It scores two things separately: attachment anxiety — how strongly you react to distance — and attachment avoidance — how uncomfortable you get with closeness. Your pattern comes from where the two scores land.",
      `Every question about you describes something you did in a specific situation in your most recent relationship, answered on a five-point scale from "${quizConfig.likert.labels[0]}" to "${quizConfig.likert.labels[4]}". The questions about ${partner.object} give a read of the pattern you experienced from ${partner.object} — they can't label ${partner.object}, and they don't change your own scores.`,
      "The score is calculated in your browser. The same answers always give the same result, and there's nothing to unlock.",
    ],
    methodologyLink: "How the questions are written and scored",
  },
  audience: {
    heading: "Who it's for",
    forText:
      "Men after a breakup, or in a relationship pattern they want to understand — the checking, the chasing, the going quiet.",
    notForHeading: "Who it isn't for",
    notForText:
      "It's a self-reflection tool, not a medical or psychological assessment, and it isn't the right help in a crisis.",
  },
  faqHeading: "Questions about the quiz",
  trust: {
    heading: "Your answers stay in this browser",
    body: "No account and no email needed. Your answers and result are saved only on this device, and nothing about them is sent to us. Delete them any time with “Clear my data”.",
    link: { label: "Read the privacy policy", href: routes.privacy },
  },
} as const;

export const quizFaqs: FaqItem[] = [
  {
    question: "Do I need to give my email to see my result?",
    answer:
      "No. The full result shows on the page as soon as you finish. Emailing yourself a copy is optional and separate.",
  },
  {
    question: `Why does it ask about ${partner.object}?`,
    answer: `${hers} questions ask what ${partner.subject} did in the same relationship. They give a read of the pattern you experienced from ${partner.object}, which helps make sense of what you lived through. Only ${partner.subject} could describe ${partner.possessive} own pattern, so it's never a label for ${partner.object}, and it doesn't change your scores.`,
  },
  {
    question: "Are my answers sent anywhere?",
    answer:
      "No. Your answers and result are saved only in this browser on this device. A shared result link carries your two scores and the quiz version, never your answers.",
  },
  {
    question: "How long does it take?",
    answer: `About ${QUIZ_MINUTES} minutes: ${his} questions about you, ${hers} about ${partner.object}, ${since} about what's happened since the breakup, and ${context} optional questions about where you are now. One per screen, and you can go back at any time.`,
  },
];

export const runnerCopy = {
  instruction: quizConfig.instruction,
  /** Founder-approved framing line before the first question about the partner. */
  herIntro: `Now think about ${partner.object} in the same relationship — how ${partner.subject} showed up, as you experienced it.`,
  start: "Start the quiz",
  next: "Next",
  back: "Back",
  finish: "See my result",
  skip: "Skip",
  chooseError: "Choose an answer to continue.",
  progress: {
    his: (n: number, total: number) => `Question ${n} of ${total}`,
    her: (n: number, total: number) => `About ${partner.object} — ${n} of ${total}`,
    selector: (n: number, total: number) => `Since the breakup — ${n} of ${total}`,
    context: (n: number, total: number) => `About where you are now — ${n} of ${total}`,
  },
  /** The resume prompt, built from the same labels ("question 9 of 24"). */
  resume: (label: string) =>
    `Continue where you left off — ${label.charAt(0).toLowerCase()}${label.slice(1)}`,
  resumeCta: "Continue",
  contextNote: quizConfig.contextNote,
  startOver: "Start over",
  saved: {
    heading: "You've taken this quiz on this device",
    see: "See your result",
    retake: "Take it again",
    confirm: "Taking it again will replace your saved result.",
    confirmYes: "Yes, take it again",
    confirmNo: "Keep my result",
  },
  outdated: {
    heading: "The quiz has been updated",
    body: "It has changed since you took it, so your saved result may not be comparable with a new one.",
    retake: "Take the updated quiz",
    keep: "Keep my old result",
  },
  clear: "Clear my data on this device",
  cleared: "Your quiz answers and saved result have been deleted from this browser.",
  corrupt:
    "Your saved quiz data on this device couldn't be read, so it has been cleared. You can take the quiz again.",
  storageUnavailable:
    "This browser isn't saving data, so your progress won't be kept if you leave the page. The quiz still works.",
} as const;
