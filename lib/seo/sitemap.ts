import type { MetadataRoute } from "next";
import { guides } from "@/config/content";
import { legal } from "@/config/legal";
import { baseUrl, noindexRoutes, routes } from "@/config/site";

/** Last-modified dates we actually track; other routes omit it rather than guess. */
const lastModified: Record<string, string> = {
  ...Object.fromEntries(guides.map((g) => [g.route, g.lastReviewed])),
  [routes.privacy]: legal.lastUpdated,
  [routes.terms]: legal.lastUpdated,
  [routes.affiliateDisclosure]: legal.lastUpdated,
};

/** Exactly the Section 6 indexable routes (the results shell excluded) — Section 12.2. */
export function sitemapEntries(): MetadataRoute.Sitemap {
  return Object.values(routes)
    .filter((route) => !noindexRoutes.includes(route))
    .map((route) => ({
      url: new URL(route, baseUrl).toString(),
      ...(lastModified[route] && { lastModified: lastModified[route] }),
    }));
}
