/**
 * Site identity — Section 1.3 / 17.1. The ONLY place the brand name and domain are
 * written. Everything that renders the brand (wordmark, metadata, schema, emails,
 * legal party names) reads from here.
 */
export const site = {
  name: "HeartFixed",
  domain: "heartfixed.com",
  url: "https://heartfixed.com",
  tagline: "Tools for getting through a breakup",
  // TODO(session-11): founder supplies the public contact email (Section 19.2).
  contactEmail: "",
  // TODO(session-9): founder supplies a PO Box / business address for email footers.
  mailingAddress: "",
  // Empty at launch (Section 12.5). Add handles here only; footer and schema read them.
  social: {} as Record<string, string>,
} as const;

/** Base URL for metadata. Previews may override via env; production is site.url. */
export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;

/**
 * Route map — Section 6. Slugs are final as of Session 1: renaming one after launch
 * needs an entry in config/redirects.ts, never a silent rename.
 */
export const routes = {
  home: "/",
  quiz: "/attachment-style-quiz/",
  quizResults: "/attachment-style-quiz/results/",
  attachmentStyles: "/attachment-styles/",
  profileSecure: "/attachment-styles/secure/",
  profileAnxious: "/attachment-styles/anxious/",
  profileAvoidant: "/attachment-styles/avoidant/",
  profileFearfulAvoidant: "/attachment-styles/fearful-avoidant/",
  tracker: "/no-contact-tracker/",
  decision: "/should-i-text-my-ex/",
  noContactRule: "/no-contact-rule/",
  guideHowLong: "/guides/how-long-does-a-breakup-take/",
  guideDay14: "/guides/no-contact-day-14/",
  guideSheTexted: "/guides/she-texted-me-during-no-contact/",
  guideAfterBreakup: "/guides/attachment-styles-after-a-breakup/",
  resources: "/recommended-resources/",
  crisis: "/crisis-resources/",
  about: "/about/",
  methodology: "/methodology/",
  privacy: "/privacy-policy/",
  terms: "/terms/",
  affiliateDisclosure: "/affiliate-disclosure/",
  contact: "/contact/",
} as const;

export type RouteKey = keyof typeof routes;

/** Routes excluded from the sitemap and marked noindex (Sections 6, 12.2). */
export const noindexRoutes: readonly string[] = [routes.quizResults];

export type ToolKey = "quiz" | "tracker" | "decision";

export const tools: readonly { key: ToolKey; name: string; navLabel: string; href: string }[] = [
  {
    key: "quiz",
    name: "Attachment Style Quiz",
    navLabel: "Attachment quiz",
    href: routes.quiz,
  },
  {
    key: "tracker",
    name: "No-Contact Tracker",
    navLabel: "No-contact tracker",
    href: routes.tracker,
  },
  {
    key: "decision",
    name: "Should I Text My Ex?",
    navLabel: "Should I text my ex?",
    href: routes.decision,
  },
];

/** Footer navigation — Section 6 footer rule (tools, trust pages, legal pages). */
export const footerNav: readonly { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Tools",
    links: tools.map((t) => ({ label: t.name, href: t.href })),
  },
  {
    heading: "About this site",
    links: [
      { label: "Crisis Resources", href: routes.crisis },
      { label: "About", href: routes.about },
      { label: "Methodology", href: routes.methodology },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: routes.privacy },
      { label: "Terms of Use", href: routes.terms },
      { label: "Affiliate Disclosure", href: routes.affiliateDisclosure },
    ],
  },
];
