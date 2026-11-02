import type { SituationalSectionKey } from "@/config/content";
import type { ToolKey } from "@/config/site";
import type { FaqItem } from "@/lib/seo/schema";

/**
 * Guide content model — Section 12.3. Guides are typed data rendered by one template
 * (components/content/GuideBody.tsx), so publishing a guide never touches a component.
 */
export type Block =
  | { p: string }
  | { list: readonly string[]; ordered?: boolean }
  | { callout: string }
  /** A list with a bold lead-in per item, e.g. "Right now: …". */
  | { terms: readonly { term: string; text: string }[]; ordered?: boolean }
  | { links: readonly { label: string; href: string }[] }
  /** An affiliate slot by id (config/affiliates.ts). Renders nothing while disabled. */
  | { slot: string };

export interface Section {
  heading: string;
  blocks: readonly Block[];
}

interface GuideBase {
  route: string;
  /** Breadcrumb and card name. */
  shortTitle: string;
  /** One line for guide cards on the homepage and elsewhere. */
  summary: string;
  h1: string;
  intro: readonly string[];
  /** Overrides the default tool-block copy with moment-appropriate words. */
  toolBlock?: { heading?: string; body?: string };
  faqs?: readonly FaqItem[];
}

export interface ArticleGuide extends GuideBase {
  kind: "article";
  sections: readonly Section[];
}

export interface Mistake {
  title: string;
  text: string;
}

export interface Step {
  when: string;
  what: string;
}

export interface SituationalGuide extends GuideBase {
  kind: "situational";
  whySpikes: readonly Block[];
  normal: readonly Block[];
  mistakes: readonly [Mistake, Mistake, Mistake];
  next24: readonly Step[];
  headings?: Partial<Record<SituationalSectionKey, string>>;
}

export type Guide = ArticleGuide | SituationalGuide;

export type ToolBlockCopy = Record<ToolKey, { heading: string; body: string; cta: string }>;
