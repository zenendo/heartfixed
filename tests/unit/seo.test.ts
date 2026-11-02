import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { redirects } from "@/config/redirects";
import { baseUrl, noindexRoutes, routes, site } from "@/config/site";
import { ogCards } from "@/content/og";
import { metadataFor, notFoundMetadata, routeMetadata } from "@/lib/seo/metadata";
import { OG_KEYS, ogImagePath, ogKeyFor } from "@/lib/seo/ogConfig";
import { checkRedirects } from "@/lib/seo/redirects";
import { organizationSchema, validateJsonLd, websiteSchema } from "@/lib/seo/schema";
import { sitemapEntries } from "@/lib/seo/sitemap";

/** Session 12 — the Section 12.2 metadata audit, sitemap, robots, OG, redirects, schema. */

const ALL = Object.values(routes);
const INDEXABLE = ALL.filter((r) => !noindexRoutes.includes(r));

describe("metadata audit — Section 12.2", () => {
  it("every Section 6 route has metadata", () => {
    expect(ALL.filter((r) => !routeMetadata[r])).toEqual([]);
  });

  it("titles and descriptions are unique", () => {
    const metas = ALL.map((r) => routeMetadata[r]!);
    expect(new Set(metas.map((m) => m.title)).size).toBe(metas.length);
    expect(new Set(metas.map((m) => m.description)).size).toBe(metas.length);
  });

  it("tool pages state the free / no-signup fact", () => {
    for (const route of [routes.quiz, routes.tracker, routes.decision]) {
      const { description } = routeMetadata[route]!;
      expect(description).toMatch(/\bfree\b/i);
      expect(description).toMatch(/no signup|no account/i);
    }
  });

  it("canonical, OG and Twitter all point at the route and its card", () => {
    for (const route of ALL) {
      const m = metadataFor(route);
      const image = { url: ogImagePath(ogKeyFor(route)) };
      expect(m.alternates?.canonical).toBe(route);
      expect(m.openGraph).toMatchObject({ url: route, title: m.title, images: [image] });
      expect(m.twitter).toMatchObject({ card: "summary_large_image", images: [image] });
    }
  });

  it("each tool has its own card; everything else uses the site card", () => {
    expect(ogKeyFor(routes.tracker)).toBe("tracker");
    expect(ogKeyFor(routes.decision)).toBe("decision");
    expect(ogKeyFor(routes.quiz)).toBe("quiz");
    expect(ogKeyFor(routes.guideDay14)).toBe("site");
    expect(OG_KEYS.sort()).toEqual(["decision", "quiz", "site", "tracker"]);
  });

  it("only the results shell is noindex", () => {
    expect(ALL.filter((r) => metadataFor(r).robots)).toEqual([routes.quizResults]);
    expect(metadataFor(routes.quizResults).robots).toMatchObject({ index: false });
  });

  it("the 404 page has its own title", () => {
    expect(notFoundMetadata.title).toBe(`Page not found | ${site.name}`);
  });
});

describe("OG card copy", () => {
  it("contains no Section 14.2 prohibited term", () => {
    const text = Object.values(ogCards)
      .flatMap((c) => Object.values(c))
      .join("\n");
    expect(text).not.toMatch(/therap|counsell?ing|treatment|diagnos|guarantee|get your ex back/i);
  });
});

describe("sitemap and robots — Section 12.2", () => {
  it("the sitemap lists exactly the Section 6 indexable routes, absolute", () => {
    const urls = sitemapEntries().map((e) => e.url);
    expect(urls).toEqual(INDEXABLE.map((r) => new URL(r, baseUrl).toString()));
    expect(urls).not.toContain(new URL(routes.quizResults, baseUrl).toString());
  });

  it("guide and legal entries carry their real last-modified dates", () => {
    const byUrl = new Map(sitemapEntries().map((e) => [e.url, e.lastModified]));
    expect(byUrl.get(new URL(routes.guideDay14, baseUrl).toString())).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
    expect(byUrl.get(new URL(routes.privacy, baseUrl).toString())).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(byUrl.get(new URL(routes.tracker, baseUrl).toString())).toBeUndefined();
  });

  it("robots allows all, disallows /api/ and the results shell, and points at the sitemap", () => {
    const r = robots();
    expect(r.rules).toEqual([
      { userAgent: "*", allow: "/", disallow: ["/api/", routes.quizResults] },
    ]);
    expect(r.sitemap).toBe(new URL("/sitemap.xml", baseUrl).toString());
  });
});

describe("redirects — Section 6", () => {
  it("the shipped list is valid", () => {
    expect(checkRedirects(redirects)).toEqual([]);
  });

  it("rejects shadowing, unknown destinations, bad paths, duplicates and chains", () => {
    expect(checkRedirects([{ source: "/old-tracker/", destination: routes.tracker }])).toEqual([]);
    expect(checkRedirects([{ source: routes.tracker, destination: routes.decision }])).not.toEqual(
      [],
    );
    expect(checkRedirects([{ source: "/old/", destination: "/nowhere/" }])).not.toEqual([]);
    expect(checkRedirects([{ source: "/Old", destination: routes.tracker }])).not.toEqual([]);
    expect(
      checkRedirects([
        { source: "/a/", destination: routes.tracker },
        { source: "/a/", destination: routes.decision },
      ]),
    ).not.toEqual([]);
    expect(
      checkRedirects([
        { source: "/a/", destination: "/b/" },
        { source: "/b/", destination: routes.tracker },
      ]).join(" "),
    ).toMatch(/chains/);
  });
});

describe("sitewide schema — Section 12.2", () => {
  it("WebSite and Organization validate, with no Person and no empty sameAs", () => {
    expect(validateJsonLd(websiteSchema())).toEqual([]);
    const org = organizationSchema();
    expect(validateJsonLd(org)).toEqual([]);
    expect(JSON.stringify(org)).not.toContain("Person");
    expect("sameAs" in org).toBe(false);
  });
});
