import { expect, test, type Page } from "@playwright/test";
import { routes } from "../../config/site";
import { profilePages } from "../../content/attachment-styles";
import { faqs } from "../../content/faqs";
import { profileFor, profiles, type Band, type ProfileId } from "../../lib/quiz";
import { SITEWIDE_SCHEMA_TYPES, validateJsonLd } from "../../lib/seo/schema";

/**
 * Session 8 — /attachment-styles/ and the four profile pages. Section 18's done-when:
 * schema validates and no page contains a Section 14.2 prohibited term. Plus the
 * Section 6 linking rules for profile pages.
 */

const IDS = Object.keys(profiles) as ProfileId[];
const BANDS: Band[] = ["low", "moderate", "high"];
const PROHIBITED =
  /therap|counsell?ing|treatment|diagnos|clinically proven|mental-health assessment|disorder|get your ex back|regret leaving|make her miss you/i;

async function jsonLdBlocks(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  // Page-level schema only: the sitewide WebSite/Organization are checked in seo.spec.ts.
  return raw
    .map((text) => JSON.parse(text) as Record<string, unknown>)
    .filter((b) => !(SITEWIDE_SCHEMA_TYPES as readonly unknown[]).includes(b["@type"]));
}

const PAGES = [
  { name: "hub", path: routes.attachmentStyles, faq: faqs.attachmentStyles },
  ...IDS.map((id) => ({ name: id, path: profiles[id].route, faq: faqs.profiles[id] })),
];

for (const p of PAGES) {
  test.describe(`${p.name} (${p.path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(p.path);
    });

    test("one h1, a unique title, canonical on its own route", async ({ page }) => {
      await expect(page.locator("h1")).toHaveCount(1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonical!).pathname).toBe(p.path);
    });

    test("JSON-LD validates: BreadcrumbList + FAQPage, no prohibited types", async ({ page }) => {
      const blocks = await jsonLdBlocks(page);
      expect(blocks.map((b) => b["@type"]).sort()).toEqual(["BreadcrumbList", "FAQPage"]);
      for (const block of blocks) expect(validateJsonLd(block)).toEqual([]);
    });

    test("FAQ schema matches the visible FAQ exactly", async ({ page }) => {
      const faq = (await jsonLdBlocks(page)).find((b) => b["@type"] === "FAQPage")!;
      const names = (faq.mainEntity as { name: string }[]).map((q) => q.name);
      expect(names).toEqual(p.faq.map((f) => f.question));
      const visible = await page
        .locator("section[aria-labelledby='faq-heading'] dt")
        .allTextContents();
      expect(visible).toEqual(names);
    });

    test("rendered page contains no Section 14.2 prohibited term", async ({ page }) => {
      const text = await page.locator("body").innerText();
      const head = await page.locator("head").innerHTML();
      expect(text).not.toMatch(PROHIBITED);
      expect(head).not.toMatch(PROHIBITED);
    });

    test("links the quiz and the methodology page", async ({ page }) => {
      const main = page.getByRole("main");
      await expect(main.locator(`a[href="${routes.quiz}"]`).first()).toBeVisible();
      await expect(main.locator(`a[href="${routes.methodology}"]`).first()).toBeVisible();
    });

    test("no horizontal scroll", async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("standalone links are at least 44px tall (inline text links exempt)", async ({ page }) => {
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

test("hub links all four profiles and the band table matches the engine", async ({ page }) => {
  await page.goto(routes.attachmentStyles);
  const cards = page.getByTestId("profile-card");
  await expect(cards).toHaveCount(4);
  for (const id of IDS) {
    await expect(cards.locator(`a[href="${profiles[id].route}"]`)).toBeVisible();
  }
  const rows = page.getByTestId("band-table").locator("tbody tr");
  for (const [r, anxiety] of BANDS.entries()) {
    const cells = await rows.nth(r).locator("td").allTextContents();
    expect(cells).toEqual(BANDS.map((avoidance) => profiles[profileFor(anxiety, avoidance)].name));
  }
});

for (const id of IDS) {
  test(`${id} links the other three profiles and the tracker`, async ({ page }) => {
    await page.goto(profiles[id].route);
    await expect(page.locator("h1")).toHaveText(profilePages[id].h1);
    const others = page.getByTestId("other-profiles").locator("a");
    await expect(others).toHaveCount(3);
    const hrefs = await others.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.sort()).toEqual(
      IDS.filter((o) => o !== id)
        .map((o) => profiles[o].route)
        .sort(),
    );
    await expect(
      page.getByRole("main").locator(`a[href="${routes.tracker}"]`).first(),
    ).toBeVisible();
  });
}

for (const font of [null, "DejaVu Sans, Verdana"]) {
  test(`band table fits 320px without breaking words (${font ?? "default font"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(routes.attachmentStyles);
    // CI's Linux fonts run wider than macOS's; the wide-font pass guards against that.
    if (font) await page.addStyleTag({ content: `* { font-family: ${font} !important; }` });
    const fit = await page.getByTestId("band-table").evaluate((table) => {
      const brokenWords = [...table.querySelectorAll("th, td")].filter((cell) => {
        const range = document.createRange();
        range.selectNodeContents(cell);
        const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
        const words = cell.textContent!.trim().match(/[^\s-]+/g)?.length ?? 0;
        return words > 0 && lines > words;
      });
      return {
        tooWide: table.scrollWidth > table.parentElement!.clientWidth,
        brokenWords: brokenWords.map((c) => c.textContent),
      };
    });
    expect(fit).toEqual({ tooWide: false, brokenWords: [] });
  });
}

test("secure page shows all three lean paragraphs and four score combinations", async ({
  page,
}) => {
  await page.goto(routes.profileSecure);
  const what = page.locator("section[aria-labelledby='what-heading']");
  await expect(what.getByText(/with an anxious lean/)).toBeVisible();
  await expect(what.getByText(/with an avoidant lean/)).toBeVisible();
  await expect(what.getByText(/with a mixed lean/)).toBeVisible();
  await expect(page.getByTestId("band-combinations").locator("li")).toHaveCount(4);
});

test("an unknown profile slug is a 404", async ({ page }) => {
  const response = await page.goto("/attachment-styles/not-a-style/");
  expect(response?.status()).toBe(404);
});
