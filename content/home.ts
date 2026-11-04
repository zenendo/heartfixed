import { copy } from "@/config/copy";
import type { ToolKey } from "@/config/site";

const { partner } = copy;

/** Homepage copy. Partner references resolve through config/copy.ts (Section 2.3). */
export const home = {
  // Positioning line — Section 2.
  hero: `Find out why you attach the way you do — and get through the breakup without texting ${partner.object}.`,
  intro: "Three free tools for the weeks after a breakup. No account, no paywall, no catch.",
  toolsHeading: "Start with the one you need right now",
  tools: {
    quiz: {
      summary: `38 questions about what you actually did — and what ${copy.partner.subject} did — in your last relationship. About 5 minutes. Your full result is free — no email needed.`,
      cta: "Take the quiz",
    },
    tracker: {
      summary:
        "Count the days since last contact and protect the streak. No account — it lives only in this browser.",
      cta: "Start a streak",
    },
    decision: {
      summary: `About to text ${partner.object}? Work through five short steps before you hit send.`,
      cta: "Check before you send",
    },
  } satisfies Record<ToolKey, { summary: string; cta: string }>,
  patterns: {
    heading: "Understand your pattern",
    intro:
      "Four attachment patterns describe how you tend to act when a relationship feels close, distant or under threat. Read about each, or take the quiz to see where your own scores land.",
    cardLink: (name: string) => `More on the ${name.toLowerCase()} pattern`,
    hubLink: "All four attachment styles, explained",
  },
  guides: {
    heading: "Guides for the hard moments",
    intro: "Short, specific, and written for the week you're actually in.",
  },
  resources: {
    heading: "When you want to go deeper",
    body: "The books and programmes worth your time, organised by the moment you're in — not by what pays.",
    link: "Recommended resources",
  },
  howItWorks: {
    heading: "How this site works",
    points: [
      {
        term: "Free in full",
        text: "Every tool and every result is free. No paywall, no blurred report, no account.",
      },
      {
        term: "Stays on your device",
        text: "Quiz answers, your streak and any draft you check stay in your browser. Nothing is sent to us.",
      },
      {
        term: "Rules, not a chatbot",
        text: "The tools are fixed rules written in advance. No AI, and nothing pretending to be a person.",
      },
    ],
    methodology: "How the quiz works",
    about: "About this site",
  },
};
