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
