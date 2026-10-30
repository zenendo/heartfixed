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
      summary:
        "24 questions about what you actually do in relationships. About 3 minutes. Your full result is free — no email needed.",
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
};
