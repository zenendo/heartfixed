import { expect, test, type Page } from "@playwright/test";
import { quizConfig } from "../../config/quiz";
import { routes } from "../../config/site";
import { affiliateDisclosure, blockA, blockB } from "../../content/compliance";
import { contactPage } from "../../content/trust";
import { profileFor, profiles, type Band } from "../../lib/quiz";
import { SITEWIDE_SCHEMA_TYPES, validateJsonLd } from "../../lib/seo/schema";

/** Session 11 — the seven legal and trust pages (Sections 6, 14). */

const PAGES = [
  routes.privacy,
  routes.terms,
  routes.affiliateDisclosure,
  routes.about,
  routes.contact,
  routes.methodology,
  routes.crisis,
] as const;

/** The element that directly follows the H1 in the page content. */
const afterH1 = (page: Page) => page.locator("h1 + *");

for (const route of PAGES) {
  test.describe(route, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route);
    });

    test("one h1, canonical on its own route, valid BreadcrumbList", async ({ page }) => {
      await expect(page.locator("h1")).toHaveCount(1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonical!).pathname).toBe(route);
      const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
      // Page-level schema only: the sitewide WebSite/Organization are checked in seo.spec.ts.
      const blocks = raw
        .map((t) => JSON.parse(t) as Record<string, unknown>)
        .filter((b) => !(SITEWIDE_SCHEMA_TYPES as readonly unknown[]).includes(b["@type"]));
      expect(blocks.map((b) => b["@type"])).toEqual(["BreadcrumbList"]);
      for (const block of blocks) expect(validateJsonLd(block)).toEqual([]);
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

test("legal pages show a visible last-updated date", async ({ page }) => {
  for (const route of [routes.privacy, routes.terms, routes.affiliateDisclosure]) {
    await page.goto(route);
    await expect(page.getByTestId("last-updated").locator("time")).toBeVisible();
  }
});

test.describe("methodology", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.methodology);
  });

  test("Block A renders verbatim directly under the H1", async ({ page }) => {
    await expect(afterH1(page)).toHaveAttribute("data-testid", "self-reflection-disclaimer");
    await expect(afterH1(page)).toHaveText(blockA.text);
  });

  test("shows the Likert labels and a band table that matches the engine", async ({ page }) => {
    await expect(page.getByTestId("likert-labels").locator("li")).toHaveText([
      ...quizConfig.likert.labels,
    ]);
    const bands: Band[] = ["low", "moderate", "high"];
    const rows = page.getByTestId("band-table").locator("tbody tr");
    for (const [r, anxiety] of bands.entries()) {
      await expect(rows.nth(r).locator("td")).toHaveText(
        bands.map((avoidance) => profiles[profileFor(anxiety, avoidance)].name),
      );
    }
  });

  test("never mentions the attention check", async ({ page }) => {
    expect(await page.getByRole("main").innerText()).not.toMatch(/attention/i);
  });
});

test.describe("crisis resources", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.crisis);
  });

  test("Block D is the first thing under the H1", async ({ page }) => {
    await expect(afterH1(page)).toHaveAttribute("data-testid", "crisis-block");
  });

  test("lists 988 and the Crisis Text Line with device links", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByText("Call or text 988, any time, day or night.")).toBeVisible();
    await expect(main.getByText("Text HOME to 741741.")).toBeVisible();
    await expect(main.locator('a[href="tel:988"]')).toBeVisible();
    await expect(main.locator('a[href="sms:741741"]')).toBeVisible();
  });

  test("publishes no unverified international line", async ({ page }) => {
    await expect(page.getByTestId("international-lines")).toHaveCount(0);
    await expect(
      page
        .locator("section[aria-labelledby='intl-heading']")
        .getByText(/local emergency number always works/),
    ).toBeVisible();
  });
});

test.describe("about", () => {
  test("carries Block B, adults (18+), and links the crisis page", async ({ page }) => {
    await page.goto(routes.about);
    const main = page.getByRole("main");
    await expect(main.getByTestId("tool-disclaimer")).toHaveText(blockB.text);
    await expect(main.getByText(/For adults \(18\+\)/)).toBeVisible();
    await expect(main.locator(`a[href="${routes.crisis}"]`)).toBeVisible();
  });
});

test.describe("contact", () => {
  test("states response expectations and the pending address, never an empty mailto", async ({
    page,
  }) => {
    await page.goto(routes.contact);
    await expect(page.getByTestId("contact-expectations")).toHaveText(contactPage.expectations);
    await expect(page.getByTestId("contact-pending")).toHaveText(contactPage.emailPending);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  });
});

test.describe("affiliate disclosure", () => {
  test("quotes the proximity sentence and reports no live affiliate links", async ({ page }) => {
    await page.goto(routes.affiliateDisclosure);
    await expect(page.getByTestId("affiliate-status")).toHaveText(
      "Right now, no links on this site are affiliate links.",
    );
    await expect(page.getByRole("main").getByText(affiliateDisclosure.text)).toBeVisible();
  });
});
