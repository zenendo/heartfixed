import type { Metadata } from "next";
import { baseUrl, routes, site } from "@/config/site";

/**
 * Per-route metadata — Section 12.2. No metadata literals inside page components.
 * Titles: ≤ 60 chars including the brand suffix, keyword first, brand last.
 * Descriptions: ≤ 155 chars; tool pages state the free / no-signup fact.
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
  // TODO(session-12): metadata for every other Section 6 route, plus per-tool OG images.
};

export const fullTitle = (title: string) => `${title} | ${site.name}`;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: site.name,
  title: site.name,
  openGraph: { siteName: site.name, type: "website", locale: "en_US" },
};

export function metadataFor(route: string): Metadata {
  const meta = routeMetadata[route];
  if (!meta) throw new Error(`No metadata defined for route ${route}`);
  const title = fullTitle(meta.title);
  return {
    title,
    description: meta.description,
    alternates: { canonical: route },
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: "en_US",
      url: route,
      title,
      description: meta.description,
    },
    twitter: { card: "summary", title, description: meta.description },
  };
}
