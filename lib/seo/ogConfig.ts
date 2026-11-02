import { noindexRoutes, routes, site } from "@/config/site";
import { ogCards, type OgKey } from "@/content/og";

/**
 * Open Graph image settings, shared by metadata, schema and the /og/<key>/ route.
 * Kept apart from lib/seo/og.tsx so importing them never pulls in next/og.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_KEYS = Object.keys(ogCards) as OgKey[];
export const APPLE_ICON_PATH = "/apple-touch-icon/";

export type { OgKey };

/** Each tool gets its own card (Section 12.2); every other page uses the site card. */
export function ogKeyFor(route: string): OgKey {
  if (route === routes.tracker) return "tracker";
  if (route === routes.decision) return "decision";
  if (route === routes.quiz || noindexRoutes.includes(route)) return "quiz";
  return "site";
}

/** Trailing slash included, so the URL is served directly with no redirect. */
export const ogImagePath = (key: OgKey) => `/og/${key}/`;

export function ogAlt(key: OgKey): string {
  const card = ogCards[key];
  return `${site.name}: ${card.eyebrow}. ${card.title}`;
}
