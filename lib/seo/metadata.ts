import type { Metadata } from "next";
import { copy } from "@/config/copy";
import { baseUrl, noindexRoutes, routes, site } from "@/config/site";
import { APPLE_ICON_PATH, OG_SIZE, ogAlt, ogImagePath, ogKeyFor } from "@/lib/seo/ogConfig";

const Subject = copy.partner.subject.charAt(0).toUpperCase() + copy.partner.subject.slice(1);

/**
 * Per-route metadata — Section 12.2. No metadata literals inside page components.
 * Titles: ≤ 60 chars including the brand suffix, keyword first, brand last.
 * Descriptions: ≤ 155 chars; tool pages state the free / no-signup fact.
 * OG images: each tool has its own card, every other page the site card (lib/seo/og).
 */
export interface RouteMeta {
  title: string;
  description: string;
}

export const routeMetadata: Partial<Record<string, RouteMeta>> = {
  [routes.home]: {
    title: "Attachment Style Quiz for Men & Breakup Tools",
    description:
      "A free attachment style quiz for men, a no-contact tracker, and a should-I-text-my-ex tool. Full results free — no signup, no account.",
  },
  [routes.tracker]: {
    title: "No-Contact Tracker: Free, No Account Needed",
    description:
      "Count the days since you last had contact, check in daily and protect the streak. Free, no signup, and everything stays in your browser.",
  },
  [routes.decision]: {
    title: "Should I Text My Ex? A Free 5-Step Check",
    description:
      "About to text your ex? Work through five short steps and check your draft first. Free, no signup, and your draft never leaves your browser.",
  },
  [routes.attachmentStyles]: {
    title: "Attachment Styles: The 4 Patterns, for Men",
    description:
      "Secure, anxious, avoidant and fearful-avoidant, explained by what men actually do in relationships and after a breakup. Plus a free quiz.",
  },
  [routes.profileSecure]: {
    title: "Secure Attachment in Men: Signs and Strengths",
    description:
      "What a secure attachment pattern looks like in men, how it shows up after a breakup, its watch-outs and strengths. Check your own scores free.",
  },
  [routes.profileAnxious]: {
    title: "Anxious Attachment in Men: Signs and Breakups",
    description:
      "The signs of anxious attachment in men, why no contact is so hard with it, and what helps after a breakup. Check your own scores free.",
  },
  [routes.profileAvoidant]: {
    title: "Avoidant Attachment in Men: Signs and Breakups",
    description:
      "The signs of avoidant attachment in men, why the grief often arrives late, and what helps after a breakup. Check your own scores free.",
  },
  [routes.profileFearfulAvoidant]: {
    title: "Fearful-Avoidant Attachment in Men: The Signs",
    description:
      "The push-pull of fearful-avoidant attachment in men, how it swings after a breakup, and what helps. Check your own scores free.",
  },
  [routes.noContactRule]: {
    title: "The No Contact Rule: How Long, and Exceptions",
    description:
      "What counts as contact, 30, 60 or 90 days, the real exceptions (children, housing, money), and what to do if it breaks. Plus a free tracker.",
  },
  [routes.guideAfterBreakup]: {
    title: "Attachment Styles After a Breakup, for Men",
    description:
      "How anxious, avoidant, fearful-avoidant and secure patterns behave after a breakup, why the anxious–avoidant loop keeps running, and what helps.",
  },
  [routes.guideHowLong]: {
    title: "How Long Does a Breakup Take? Honest Answers",
    description:
      "No fixed date, but honest ranges: what makes a breakup take longer, what the first 90 days tend to feel like, and what actually helps.",
  },
  [routes.guideDay14]: {
    title: "No Contact Day 14: Why It Gets Harder Now",
    description:
      "Why the second week of no contact can be harder than the first, what's normal, the three common mistakes, and a plan for the next 24 hours.",
  },
  [routes.guideSheTexted]: {
    title: `${Subject} Texted Me During No Contact: What Now?`,
    description:
      "Your ex texted during no contact. Why it feels so urgent, the three mistakes to avoid, and exactly what to do in the next 24 hours.",
  },
  [routes.resources]: {
    title: "Breakup Books and Programmes, by Moment",
    description:
      "Books and programmes for getting through a breakup, organised by the moment you're in: the first weeks, understanding your pattern, going deeper.",
  },
  [routes.crisis]: {
    title: "Crisis Resources: 988 and Other Helplines",
    description:
      "If you're in crisis or thinking about harming yourself, call or text 988 in the US, any time. Helplines and emergency guidance in one place.",
  },
  [routes.about]: {
    title: "About: Free Breakup Tools for Men",
    description:
      "Free tools and guides for men going through a breakup. Private by design, free in full, no AI and no accounts. How the site works and is funded.",
  },
  [routes.methodology]: {
    title: "How the Attachment Quiz Works: Methodology",
    description:
      "What the attachment quiz measures, how its 38 questions are written and scored, the score bands, and what a self-reflection assessment can't tell you.",
  },
  [routes.privacy]: {
    title: "Privacy Policy",
    description:
      "Your quiz answers, tracker and drafts stay in your browser. What we collect (only an email you choose to give), what we never collect, and your choices.",
  },
  [routes.terms]: {
    title: "Terms of Use",
    description:
      "The terms for using this site's free breakup tools and guides: what they're for, what they aren't, acceptable use and limits of liability.",
  },
  [routes.affiliateDisclosure]: {
    title: "Affiliate Disclosure",
    description:
      "How affiliate links work on this site, how you'll know one when you see it, and what money never changes: results, recommendation order or tools.",
  },
  [routes.contact]: {
    title: "Contact",
    description:
      "Questions, corrections, or a request about your email data. Replies within a few days. This site can't help in an emergency — see Crisis Resources.",
  },
  // The quiz routes are built in Sessions 4–5; their metadata is ready here.
  [routes.quiz]: {
    title: "Attachment Style Quiz for Men: Free Results",
    description:
      "A free attachment style quiz for men: 38 questions about what you did, and what your ex did, in your last relationship. Full result free, no signup.",
  },
  [routes.quizResults]: {
    title: "Your Attachment Quiz Result",
    description:
      "Your attachment pattern and scores from the free attachment style quiz for men. Take the quiz to get your own result.",
  },
};

export const fullTitle = (title: string) => `${title} | ${site.name}`;

/** The not-found page. Next adds noindex to it on its own. */
export const notFoundMetadata: Metadata = {
  title: fullTitle("Page not found"),
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: site.name,
  title: site.name,
  openGraph: { siteName: site.name, type: "website", locale: "en_US" },
  icons: { apple: APPLE_ICON_PATH },
};

export function metadataFor(route: string): Metadata {
  const meta = routeMetadata[route];
  if (!meta) throw new Error(`No metadata defined for route ${route}`);
  const title = fullTitle(meta.title);
  const key = ogKeyFor(route);
  const image = { url: ogImagePath(key), ...OG_SIZE, alt: ogAlt(key) };
  return {
    title,
    description: meta.description,
    alternates: { canonical: route },
    // Shared-result shells are noindex (Sections 6, 9.6); everything else is indexable.
    ...(noindexRoutes.includes(route) && { robots: { index: false, follow: true } }),
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: "en_US",
      url: route,
      title,
      description: meta.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
      images: [image],
    },
  };
}
