import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { baseUrl, noindexRoutes, routes, tools } from "../../config/site";
import { fullTitle, routeMetadata } from "../../lib/seo/metadata";
import { ogImagePath, ogKeyFor } from "../../lib/seo/ogConfig";
import { PROHIBITED_SCHEMA_TYPES, validateJsonLd } from "../../lib/seo/schema";

/**
 * Session 12 — Section 16.4 SEO acceptance: schema validates with no prohibited types;
 * the sitemap lists exactly the Section 6 indexable routes; every page's title,
 * description, canonical and OG match Section 12.2; axe reports zero critical issues.
 * Plus the Section 19.1 `{{` sweep and the 404 page.
 */

const NOT_BUILT_YET = new Set<string>([routes.quiz, routes.quizResults]); // Sessions 4–5
const BUILT = Object.values(routes).filter((r) => !NOT_BUILT_YET.has(r));
const abs = (path: string) => new URL(path, baseUrl).toString();

async function jsonLd(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((t) => JSON.parse(t) as Record<string, unknown>);
}

const meta = (page: Page, attr: "name" | "property", key: string) =>
  page.locator(`meta[${attr}="${key}"]`).getAttribute("content");

for (const route of BUILT) {
  test.describe(route, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route);
    });

    test("title, description, canonical, OG and Twitter match lib/seo/metadata.ts", async ({
      page,
    }) => {
      const m = routeMetadata[route]!;
      const title = fullTitle(m.title);
      const image = abs(ogImagePath(ogKeyFor(route)));
      await expect(page).toHaveTitle(title);
      expect(await meta(page, "name", "description")).toBe(m.description);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(abs(route));
      expect(await meta(page, "property", "og:title")).toBe(title);
      expect(await meta(page, "property", "og:description")).toBe(m.description);
      expect(await meta(page, "property", "og:url")).toBe(abs(route));
      expect(await meta(page, "property", "og:image")).toBe(image);
      expect(await meta(page, "name", "twitter:card")).toBe("summary_large_image");
      expect(await meta(page, "name", "twitter:image")).toBe(image);
      expect(await page.locator('meta[name="robots"]').count()).toBe(0);
    });

    test("JSON-LD: sitewide WebSite + Organization, every block valid, none prohibited", async ({
      page,
    }) => {
      const blocks = await jsonLd(page);
      const types = blocks.map((b) => b["@type"]);
      expect(types.filter((t) => t === "WebSite")).toHaveLength(1);
      expect(types.filter((t) => t === "Organization")).toHaveLength(1);
      for (const block of blocks) expect(validateJsonLd(block)).toEqual([]);
      const all = JSON.stringify(blocks);
      for (const type of PROHIBITED_SCHEMA_TYPES) expect(all).not.toContain(`"${type}"`);
    });

    test("axe: zero critical violations", async ({ page }) => {
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.filter((v) => v.impact === "critical").map((v) => v.id)).toEqual([]);
    });
  });
}

test.describe("built pages", () => {
  test("no `{{` placeholder token in any page's HTML (Section 19.1)", async ({ request }) => {
    for (const route of BUILT) {
      expect(await (await request.get(route)).text(), route).not.toContain("{{");
    }
  });

  test("every OG card and the touch icon are served directly as PNG, no redirect", async ({
    request,
  }) => {
    const paths = [
      ...new Set(BUILT.map((r) => ogImagePath(ogKeyFor(r)))),
      ogImagePath("quiz"),
      "/apple-touch-icon/",
    ];
    for (const path of paths) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/png");
    }
  });
});

test.describe("sitemap.xml and robots.txt", () => {
  test("the sitemap lists exactly the Section 6 indexable routes", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const indexable = Object.values(routes).filter((r) => !noindexRoutes.includes(r));
    expect(locs).toEqual(indexable.map(abs));
  });

  test("robots.txt disallows the API and the results shell and names the sitemap", async ({
    request,
  }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toMatch(/User-Agent: \*/);
    expect(txt).toMatch(/Allow: \/\n/);
    expect(txt).toContain("Disallow: /api/");
    expect(txt).toContain(`Disallow: ${routes.quizResults}`);
    expect(txt).toContain(`Sitemap: ${abs("/sitemap.xml")}`);
  });
});

test.describe("404 page (Section 12.2)", () => {
  test("is a real 404, noindex, links the three tools and the crisis page", async ({ page }) => {
    const res = await page.goto("/no-such-page/");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toMatch(/noindex/);
    const main = page.getByRole("main");
    for (const tool of tools) await expect(main.locator(`a[href="${tool.href}"]`)).toBeVisible();
    await expect(main.locator(`a[href="${routes.crisis}"]`)).toBeVisible();
    await expect(page.getByRole("contentinfo").getByTestId("crisis-footer-line")).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === "critical").map((v) => v.id)).toEqual([]);
  });
});

test.describe("axe on the tools' interactive states (Section 16.4)", () => {
  test.use({ timezoneId: "America/New_York" });

  test("tracker: a running streak", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-10-31T14:00:00-04:00"));
    await page.goto(routes.tracker);
    await page.getByRole("button", { name: "Start my streak" }).click();
    await expect(page.getByTestId("day-line")).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === "critical").map((v) => v.id)).toEqual([]);
  });

  test("decision tool: the outcome view", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-01T14:00:00-05:00"));
    await page.goto(routes.decision);
    await page.getByRole("radio", { name: "More than 3 months" }).check();
    await page.getByRole("radio", { name: "More than a month ago" }).check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: /^I miss/ }).check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page
      .getByRole("group", { name: "Have you been drinking tonight?" })
      .getByRole("radio", { name: "No" })
      .check();
    await page
      .getByRole("group", { name: "Have you already drafted and deleted this more than once?" })
      .getByRole("radio", { name: "No" })
      .check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Skip — I don't have a draft" }).click();
    await expect(page.getByTestId("outcome")).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === "critical").map((v) => v.id)).toEqual([]);
  });
});
