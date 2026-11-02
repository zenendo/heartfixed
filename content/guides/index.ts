import { guides } from "@/config/content";
import type { ToolKey } from "@/config/site";
import { attachmentStylesAfterABreakup } from "./attachment-styles-after-a-breakup";
import { howLongDoesABreakupTake } from "./how-long-does-a-breakup-take";
import { noContactDay14 } from "./no-contact-day-14";
import { noContactRule } from "./no-contact-rule";
import { sheTextedMeDuringNoContact } from "./she-texted-me-during-no-contact";
import type { Guide, ToolBlockCopy } from "./types";

/** Every launch guide, keyed by route. Order follows config/content.ts `guides`. */
const byRoute = new Map<string, Guide>(
  [
    noContactRule,
    attachmentStylesAfterABreakup,
    howLongDoesABreakupTake,
    noContactDay14,
    sheTextedMeDuringNoContact,
  ].map((g) => [g.route, g]),
);

export function guideContent(route: string): Guide {
  const guide = byRoute.get(route);
  if (!guide) throw new Error(`No guide content for ${route}`);
  return guide;
}

export const allGuides: readonly Guide[] = guides.map((g) => guideContent(g.route));

/** Default tool-block copy; a guide may override heading/body for its moment. */
export const toolBlocks: ToolBlockCopy = {
  quiz: {
    heading: "Find your pattern",
    body: "Take the quiz: a self-reflection assessment informed by attachment research. About 3 minutes, and the full result is free.",
    cta: "Take the quiz",
  },
  tracker: {
    heading: "Start your no-contact streak",
    body: "It takes ten seconds, needs no account, and lives only in this browser.",
    cta: "Open the no-contact tracker",
  },
  decision: {
    heading: "If the urge is right now",
    body: "Use this first. Five short steps, built for the moment your thumb is over the send button.",
    cta: "Check before you send",
  },
} satisfies Record<ToolKey, unknown>;

export const guideCopy = {
  lastReviewed: "Last reviewed",
  published: "Published",
  sibling: "Read next",
  faqHeading: "Questions people ask",
} as const;

export type { Guide } from "./types";
