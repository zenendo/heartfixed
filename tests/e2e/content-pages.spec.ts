import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { guides, situationalTemplate, type GuideMeta } from "../../config/content";
import { noindexRoutes, routes, tools } from "../../config/site";
import { honestFraming } from "../../content/compliance";
import { guideContent } from "../../content/guides";
import { resourcesPage } from "../../content/resources";
import { profiles } from "../../lib/quiz";
import { validateJsonLd } from "../../lib/seo/schema";

/**
 * Session 10 — homepage hub, guides, situational template, resources. Section 18's
 * done-when: the Section 6 internal-linking rules verify, with no orphan routes.
 */

const PROHIBITED =
  /therap|counsell?ing|treatment|diagnos|clinically proven|mental-health assessment|disorder|get your ex back|regret leaving|make her miss you/i;
const SECTION_6 = new Set<string>(Object.values(routes));
const INDEXABLE = [...SECTION_6].filter((r) => !noindexRoutes.includes(r));
const toolHref = (key: string) => tools.find((t) => t.key === key)!.href;

async function jsonLdBlocks(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((text) => JSON.parse(text) as Record<string, unknown>);
}

async function internalLinks(request: APIRequestContext, route: string): Promise<string[] | null> {
  const res = await request.get(route);
  if (!res.ok()) return null; // not built yet (a later session) — reachable, not crawlable
  const html = await res.text();
  return [...html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)].map((m) => m[1]!);
}

test.describe("no orphan routes (Section 6)", () => {
  test("every indexable Section 6 route is within two clicks of the homepage", async ({
    request,
  }) => {
    const seen = new Set<string>([routes.home]);
    let frontier = [routes.home as string];
    for (let depth = 0; depth < 2; depth++) {
      const next: string[] = [];
      for (const route of frontier) {
        for (const href of (await internalLinks(request, route)) ?? []) {
          if (!seen.has(href)) {
            seen.add(href);
            next.push(href);
          }
        }
      }
      frontier = next;
    }
    expect(INDEXABLE.filter((r) => !seen.has(r))).toEqual([]);
  });

  test("every internal link on a built page points at a Section 6 route", async ({ request }) => {
    const bad: string[] = [];
    for (const route of SECTION_6) {
      for (const href of (await internalLinks(request, route)) ?? []) {
        if (!SECTION_6.has(href)) bad.push(`${route} → ${href}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test("tracker and decision tool link each other both ways", async ({ request }) => {
    expect(await internalLinks(request, routes.tracker)).toContain(routes.decision);
    expect(await internalLinks(request, routes.decision)).toContain(routes.tracker);
  });
});

test.describe("homepage hub", () => {
  test("links the tools, the attachment hub, all four profiles, every guide and resources", async ({
    page,
  }) => {
    await page.goto(routes.home);
    const main = page.getByRole("main");
    const targets = [
      ...tools.map((t) => t.href),
      routes.attachmentStyles,
      ...Object.values(profiles).map((p) => p.route),
      ...guides.map((g) => g.route),
      routes.resources,
    ];
    for (const href of targets)
      await expect(main.locator(`a[href="${href}"]`).first()).toBeVisible();
  });
});

for (const meta of guides) {
  const guide = guideContent(meta.route);

  test.describe(`guide ${meta.route}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(meta.route);
    });

    test("one h1 and a visible last-reviewed date from content metadata", async ({ page }) => {
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(guide.h1);
      const time = page.getByTestId("last-reviewed").locator("time");
      await expect(time).toBeVisible();
      await expect(time).toHaveAttribute("datetime", meta.lastReviewed);
    });

    test("ends with its tool block, then one sibling guide (Section 6)", async ({ page }) => {
      const block = page.getByTestId("tool-block");
      await expect(block).toHaveAttribute("data-tool", meta.tool);
      await expect(block.locator(`a[href="${toolHref(meta.tool)}"]`)).toBeVisible();
      const sibling = page.getByTestId("sibling-guide").locator("a");
      await expect(sibling).toHaveCount(1);
      await expect(sibling).toHaveAttribute("href", meta.sibling);
    });

    test("JSON-LD validates: Article + BreadcrumbList (+ FAQPage when it has FAQs)", async ({
      page,
    }) => {
      const blocks = await jsonLdBlocks(page);
      const expected = ["Article", "BreadcrumbList", ...(guide.faqs ? ["FAQPage"] : [])].sort();
      expect(blocks.map((b) => b["@type"]).sort()).toEqual(expected);
      for (const block of blocks) expect(validateJsonLd(block)).toEqual([]);
      const article = blocks.find((b) => b["@type"] === "Article")!;
      expect(article.datePublished).toBe(meta.datePublished);
      expect(article.dateModified).toBe(meta.lastReviewed);
    });

    test("no prohibited term, no byline, no affiliate slot rendered", async ({ page }) => {
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(PROHIBITED);
      expect(await page.locator("head").innerHTML()).not.toMatch(PROHIBITED);
      expect(text).not.toMatch(/\bby the [\w ]+ team\b|\breviewed by\b/i);
      await expect(page.getByTestId("affiliate-slot")).toHaveCount(0);
    });

    test("no horizontal scroll, 44px standalone links", async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      const small = await page.locator("main a").evaluateAll((els) =>
        els
          .filter((el) => !el.closest("p, td"))
          .filter((el) => el.getBoundingClientRect().height < 44)
          .map((el) => el.textContent?.trim()),
      );
      expect(small).toEqual([]);
    });
  });
}

test.describe("situational template (Section 12.3)", () => {
  for (const meta of guides.filter((g: GuideMeta) => g.kind === "situational")) {
    test(`${meta.route} renders the template sections in order`, async ({ page }) => {
      const guide = guideContent(meta.route);
      if (guide.kind !== "situational") throw new Error("not situational");
      await page.goto(meta.route);
      const headings = await page
        .locator("main section[aria-labelledby^='section-'] > h2")
        .allTextContents();
      expect(headings).toEqual(
        situationalTemplate.sections.map((s) => guide.headings?.[s.key] ?? s.heading),
      );
      const mistakes = page
        .locator("main section[aria-labelledby^='section-']")
        .nth(2)
        .locator("ol > li");
      await expect(mistakes).toHaveCount(3);
    });
  }
});

test.describe("recommended resources (Sections 12.4, 13.4)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.resources);
  });

  test("organised by moment, four resources, slots render nothing", async ({ page }) => {
    const headings = await page.locator("main section > h2").allTextContents();
    expect(headings).toEqual([
      resourcesPage.firstWeeks.heading,
      resourcesPage.pattern.heading,
      resourcesPage.deeper.heading,
    ]);
    await expect(page.getByTestId("resource")).toHaveCount(4);
    await expect(page.getByTestId("affiliate-slot")).toHaveCount(0);
  });

  test("the honest-framing line sits above the programmes", async ({ page }) => {
    const framing = page.getByTestId("honest-framing");
    await expect(framing).toHaveText(honestFraming.text);
    const deeper = page.locator("section[aria-labelledby='deeper-heading']");
    const framingBox = (await framing.boundingBox())!;
    const firstProgramme = (await deeper.getByTestId("resource").first().boundingBox())!;
    expect(framingBox.y).toBeLessThan(firstProgramme.y);
  });

  test("no outbound links while every slot is disabled, and no prohibited term", async ({
    page,
  }) => {
    await expect(page.getByRole("main").locator('a[href^="http"]')).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(PROHIBITED);
  });

  test("BreadcrumbList validates", async ({ page }) => {
    const blocks = await jsonLdBlocks(page);
    expect(blocks.map((b) => b["@type"])).toEqual(["BreadcrumbList"]);
    for (const block of blocks) expect(validateJsonLd(block)).toEqual([]);
  });
});

test("tracker page renders no affiliate slot while it is disabled", async ({ page }) => {
  await page.goto(routes.tracker);
  await expect(page.getByTestId("affiliate-slot")).toHaveCount(0);
});
