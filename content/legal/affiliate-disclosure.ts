import { routes, site } from "@/config/site";
import { affiliateDisclosure } from "@/content/compliance";
import type { Block } from "@/content/guides/types";
import { resourcesPage, type Resource } from "@/content/resources";
import type { LegalDoc } from "./types";

/**
 * Affiliate Disclosure — Section 14.5. Covers what affiliate links are, that money
 * never changes results, recommendation order or tool behaviour, how the launch
 * recommendations were chosen (own use stated only where `ownUse` is true), and how to
 * ask questions. The "right now" status is computed from config/affiliates.ts by the
 * page, so it can't go stale.
 */

const resources: readonly Resource[] = [
  ...resourcesPage.pattern.resources,
  ...resourcesPage.deeper.resources,
];

const usedOurselves = resources.filter((r) => r.ownUse).map((r) => r.name);

const chosenBlocks: Block[] = [
  {
    p: "Recommendations are organised by the moment you're in — the first weeks, understanding your pattern, going deeper — not by what pays. Free tools on this site always come first.",
  },
  usedOurselves.length > 0
    ? { p: `We've used these ourselves: ${usedOurselves.join(", ")}.` }
    : {
        p: "Each resource is there because it explains something the tools on this site can't, in more depth.",
      },
  { links: [{ label: "Recommended resources", href: routes.resources }] },
];

export const affiliateDisclosurePage = {
  status: {
    none: "Right now, no links on this site are affiliate links.",
    some: (n: number) =>
      `Right now, ${n === 1 ? "one placement" : `${n} placements`} on this site ${n === 1 ? "is an affiliate link" : "are affiliate links"}. Each has the disclosure directly above it.`,
  },
  doc: {
    h1: "Affiliate Disclosure",
    intro: [
      `${site.name} is free, with no ads and no paywall. To pay for it, some recommendations of books and programmes may be affiliate links.`,
    ],
    sections: [
      {
        heading: "What an affiliate link is",
        blocks: [
          {
            p: "An affiliate link is an ordinary link to another site that tells that site you came from here. If you buy something after clicking it, we may receive a commission. You pay the same price either way.",
          },
        ],
      },
      {
        heading: "How you'll know",
        blocks: [
          { p: "Wherever an affiliate link appears, this sentence sits directly above it:" },
          { callout: affiliateDisclosure.text },
          {
            p: "It's in normal-size text, next to the link — never hidden in a footer or behind another link.",
          },
        ],
      },
      {
        heading: "What money never changes",
        blocks: [
          {
            list: [
              "Your quiz result. Scoring is the same for everyone, and full results are always free.",
              "The order of recommendations.",
              "How any tool behaves, including what the decision tool tells you.",
            ],
          },
        ],
      },
      {
        heading: "How recommendations are chosen",
        blocks: chosenBlocks,
      },
      {
        heading: "What a click shares",
        blocks: [
          {
            p: "The destination site learns that you arrived from here, through its affiliate parameters. It learns nothing about your results, answers or anything else you did on this site.",
          },
        ],
      },
      {
        heading: "Questions",
        blocks: [{ links: [{ label: "Contact us", href: routes.contact }] }],
      },
    ],
  } satisfies LegalDoc,
} as const;
