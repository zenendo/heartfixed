import { expect, test } from "@playwright/test";
import { footerNav, site, tools } from "../../config/site";
import { blockC } from "../../content/compliance";

test.describe("homepage skeleton (Session 1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the brand from config and one h1", async ({ page }) => {
    await expect(page).toHaveTitle(new RegExp(`\\| ${site.name}$`));
    await expect(page.getByRole("banner").getByRole("link", { name: site.name })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("has header, main and footer landmarks", async ({ page }) => {
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
  });

  test("footer renders Block C verbatim, in body-size text, with 988 in bold", async ({ page }) => {
    const line = page.getByRole("contentinfo").getByTestId("crisis-footer-line");
    await expect(line).toBeVisible();
    await expect(line).toHaveText(blockC.text);
    await expect(line.locator("strong")).toHaveText("988");
    const fontSize = await line.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(17);
  });

  test("footer links every Section 6 footer destination", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    for (const link of footerNav.flatMap((g) => g.links)) {
      await expect(footer.locator(`a[href="${link.href}"]`).first()).toBeVisible();
    }
  });

  test("links all three tools from the homepage", async ({ page }) => {
    const main = page.getByRole("main");
    for (const tool of tools) {
      await expect(main.locator(`a[href="${tool.href}"]`)).toBeVisible();
    }
  });

  test("has no horizontal scroll (Section 8.1 — usable at 320px)", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("interactive targets are at least 44px tall (Section 8.3)", async ({ page }) => {
    const small = await page
      .locator("header a, main a, footer nav a")
      .evaluateAll((els) =>
        els
          .filter((el) => el.getBoundingClientRect().height < 44)
          .map((el) => el.textContent?.trim()),
      );
    expect(small).toEqual([]);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("sets a canonical URL on the configured domain", async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe(`${process.env.NEXT_PUBLIC_SITE_URL || site.url}/`);
  });

  test("loads no third-party resources (Section 8.1 — no web fonts, widgets)", async ({
    page,
    baseURL,
  }) => {
    const external: string[] = [];
    page.on("request", (req) => {
      if (!req.url().startsWith(baseURL!)) external.push(req.url());
    });
    // Not "networkidle": link prefetches for not-yet-built routes keep it from settling.
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    expect(external).toEqual([]);
  });
});
