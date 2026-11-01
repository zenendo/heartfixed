import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { blockB } from "../../content/compliance";
import { faqs } from "../../content/faqs";

/**
 * /no-contact-tracker/ — Section 16.4 tracker acceptance criteria plus the Section 14
 * guardrails. The clock is fixed at 14:00 on 2026-10-31 in New York, so "today" is
 * deterministic.
 */

const URL = "/no-contact-tracker/";
const KEY = "heartfixed-tracker-v1";
const TODAY = "2026-10-31";
const SHAMING = /\b(failed|fail|relapse|clean|streak lost)\b/i;

test.use({ timezoneId: "America/New_York" });

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-31T14:00:00-04:00"));
});

interface State {
  version: 1;
  startDate: string;
  goalDays: 30 | 60 | 90;
  checkIns: { date: string; urgeLevel: 0 | 1 | 2 | 3; note?: string }[];
  slips: { date: string; restartedOn: string }[];
  longestStreak: number;
  reminderOptIn: boolean;
  goalReachedOn?: string;
}

/** Last contact on Oct 14 → Day 1 is Oct 15 → Day 17 today. */
const day17: State = {
  version: 1,
  startDate: "2026-10-15",
  goalDays: 30,
  checkIns: [
    { date: "2026-10-28", urgeLevel: 1 },
    { date: "2026-10-30", urgeLevel: 0 },
  ],
  slips: [],
  longestStreak: 0,
  reminderOptIn: false,
};

async function seed(page: Page, value: State | string) {
  await page.goto(URL);
  await page.evaluate(([key, raw]) => localStorage.setItem(key, raw), [
    KEY,
    typeof value === "string" ? value : JSON.stringify(value),
  ] as const);
  await page.reload();
}

const stored = (page: Page) =>
  page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as State);
  }, KEY);

const mainText = (page: Page) => page.getByRole("main").innerText();

test.describe("server-rendered content (Section 11.1)", () => {
  test("explainer, goal guidance, contact list, FAQ and schema are in the initial HTML", async ({
    request,
  }) => {
    const html = await (await request.get(URL)).text();
    for (const text of [
      "No-Contact Tracker",
      "How no contact works",
      "30, 60 or 90 days?",
      "What counts as contact",
      ...faqs.tracker.map((f) => f.question),
    ]) {
      expect(html, text).toContain(text.replace(/'/g, "&#x27;"));
    }
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('href="/no-contact-rule/"');
  });

  test("Block D (crisis block) and Block B render on the page; Block C in the footer", async ({
    page,
  }) => {
    await page.goto(URL);
    await expect(page.getByTestId("crisis-block")).toContainText(
      "If things feel heavier than a breakup:",
    );
    await expect(
      page.getByTestId("crisis-block").getByRole("link", { name: "Crisis Resources" }),
    ).toHaveAttribute("href", "/crisis-resources/");
    await expect(page.getByTestId("tool-disclaimer")).toHaveText(blockB.text);
    await expect(page.getByTestId("crisis-footer-line")).toBeVisible();
  });

  test("has breadcrumbs, one h1, and a canonical URL", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Home");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/no-contact-tracker\/$/,
    );
  });
});

test.describe("setup (Section 11.1)", () => {
  test("one screen, defaults to today and 30 days, asks for nothing else", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByLabel("When did you last have contact?")).toHaveValue(TODAY);
    await expect(page.getByRole("radio", { name: "30 days" })).toBeChecked();
    await expect(page.getByRole("radio")).toHaveCount(3);
    await expect(page.locator("form input:not([type=radio]):not([type=date])")).toHaveCount(0);

    await page.getByRole("button", { name: "Start my streak" }).click();
    await expect(page.getByTestId("day-line")).toHaveText(
      "Day 0 — your first full day starts tomorrow",
    );
    await expect(page.locator("#streak-heading")).toBeFocused();
    expect(await stored(page)).toMatchObject({ startDate: "2026-11-01", goalDays: 30 });
  });

  test("a past last-contact date and a 60-day goal give Day 17 of 60", async ({ page }) => {
    await page.goto(URL);
    await page.getByLabel("When did you last have contact?").fill("2026-10-14");
    await page.getByRole("radio", { name: "60 days" }).check();
    await page.getByRole("button", { name: "Start my streak" }).click();
    await expect(page.getByTestId("day-line")).toHaveText("Day 17 of 60");
  });

  test("a future date shows an inline error and saves nothing", async ({ page }) => {
    await page.goto(URL);
    await page.getByLabel("When did you last have contact?").fill("2026-11-05");
    await page.getByRole("button", { name: "Start my streak" }).click();
    await expect(page.getByText("That date is in the future.")).toBeVisible();
    await expect(page.getByLabel("When did you last have contact?")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(await stored(page)).toBeNull();
  });
});

test.describe("streak view and check-in (Sections 8.2, 11.1)", () => {
  test("shows the day count as the hero, the goal line, and the urge shortcut", async ({
    page,
  }) => {
    await seed(page, day17);
    await expect(page.getByTestId("day-line")).toHaveText("Day 17 of 30");
    await expect(page.getByText("13 days to your goal")).toBeVisible();
    await expect(page.getByRole("link", { name: "I'm about to break it" })).toHaveAttribute(
      "href",
      "/should-i-text-my-ex/?from=tracker",
    );
  });

  test("calendar cells are labelled by date and status, with missed days as gaps", async ({
    page,
  }) => {
    await seed(page, day17);
    const cell = (date: string) => page.locator(`li[data-date="${date}"]`);
    await expect(cell("2026-10-28")).toHaveAttribute("data-status", "checked");
    await expect(cell("2026-10-28")).toContainText("Wed, Oct 28: checked in");
    await expect(cell("2026-10-29")).toHaveAttribute("data-status", "missed");
    await expect(cell("2026-10-29")).toContainText("Thu, Oct 29: no check-in");
  });

  test("checking in saves locally, and the note is never sent over the network", async ({
    page,
  }) => {
    await seed(page, day17);
    const note = "Saw the photos again at 2am — private note 7f3a";
    const outbound: string[] = [];
    page.on("request", (req) => outbound.push(`${req.url()} ${req.postData() ?? ""}`));

    await page.getByRole("radio", { name: "Strong" }).check();
    await page.getByLabel("Private note (optional)").fill(note);
    await expect(
      page.getByText("Notes stay in this browser and are never sent anywhere."),
    ).toBeVisible();
    await page.getByLabel("Which day?").selectOption(TODAY);
    await page.getByRole("button", { name: "Still no contact" }).click();

    await expect(page.getByText("Checked in for today.")).toBeVisible();
    await expect(page.locator(`li[data-date="${TODAY}"]`)).toHaveAttribute(
      "data-status",
      "checked",
    );
    expect((await stored(page))!.checkIns).toContainEqual({ date: TODAY, urgeLevel: 2, note });
    expect(
      outbound.filter((r) => r.includes("7f3a") || r.includes(encodeURIComponent(note))),
    ).toEqual([]);
  });

  test("back-filling a missed day marks it but doesn't change the streak", async ({ page }) => {
    await seed(page, day17);
    await page.getByLabel("Which day?").selectOption("2026-10-29");
    await page.getByRole("button", { name: "Still no contact" }).click();
    await expect(page.getByText("Missed day checked in.")).toBeVisible();
    await expect(page.locator('li[data-date="2026-10-29"]')).toHaveAttribute(
      "data-status",
      "checked",
    );
    await expect(page.getByTestId("day-line")).toHaveText("Day 17 of 30");
  });

  test("notes are capped at 500 characters", async ({ page }) => {
    await seed(page, day17);
    await page.getByLabel("Private note (optional)").fill("x".repeat(600));
    await expect(page.getByLabel("Private note (optional)")).toHaveValue("x".repeat(500));
    await expect(page.getByText("500 of 500 characters")).toBeVisible();
  });

  test("a stored 500-character note renders without breaking the page", async ({ page }) => {
    await seed(page, {
      ...day17,
      checkIns: [{ date: "2026-10-30", urgeLevel: 3, note: "y".repeat(500) }],
    });
    await expect(page.getByTestId("day-line")).toHaveText("Day 17 of 30");
  });
});

test.describe("slip flow (Section 11.1)", () => {
  test("asks one question, restarts today, keeps longest and total, and never shames", async ({
    page,
  }) => {
    const seen: string[] = [];
    await seed(page, day17);
    seen.push(await mainText(page));

    await page.getByRole("button", { name: "I broke no contact" }).click();
    await expect(page.locator("#slip-heading")).toBeFocused();
    seen.push(await mainText(page));

    await page.getByRole("button", { name: "Restart the counter" }).click();
    await expect(page.getByText("Choose what happened to continue.")).toBeVisible();
    seen.push(await mainText(page));

    await page.getByRole("radio", { name: /reached out and I replied/ }).check();
    await page.getByRole("button", { name: "Restart the counter" }).click();

    await expect(page.locator("#slip-done-heading")).toBeFocused();
    await expect(page.getByText("You did 16 full days.")).toBeVisible();
    await expect(page.getByText("Total days without contact so far: 16")).toBeVisible();
    await expect(page.getByText("Your longest streak: 16 days")).toBeVisible();
    await expect(page.getByText("Your new streak starts today.")).toBeVisible();
    await expect(page.getByRole("link", { name: /texted me during no contact/ })).toHaveAttribute(
      "href",
      "/guides/she-texted-me-during-no-contact/",
    );
    seen.push(await mainText(page));

    expect(await stored(page)).toMatchObject({
      longestStreak: 16,
      slips: [{ date: TODAY, restartedOn: TODAY }],
      startDate: day17.startDate,
      checkIns: day17.checkIns,
    });

    await page.getByRole("button", { name: "Back to my tracker" }).click();
    await expect(page.getByTestId("day-line")).toHaveText(
      "Day 0 — your first full day starts tomorrow",
    );
    seen.push(await mainText(page));

    for (const text of seen) expect(text).not.toMatch(SHAMING);
  });

  test("other slip types don't show the guide link", async ({ page }) => {
    await seed(page, day17);
    await page.getByRole("button", { name: "I broke no contact" }).click();
    await page.getByRole("radio", { name: "I texted or messaged" }).check();
    await page.getByRole("button", { name: "Restart the counter" }).click();
    await expect(page.getByText("You did 16 full days.")).toBeVisible();
    await expect(page.getByRole("link", { name: /texted me during no contact/ })).toHaveCount(0);
  });

  test("going back from the question changes nothing", async ({ page }) => {
    await seed(page, day17);
    await page.getByRole("button", { name: "I broke no contact" }).click();
    await page.getByRole("button", { name: "Go back" }).click();
    await expect(page.getByTestId("day-line")).toHaveText("Day 17 of 30");
    expect((await stored(page))!.slips).toEqual([]);
  });
});

test.describe("goals (Section 11.1)", () => {
  // Last contact Oct 1 → Day 30 today.
  const day30: State = { ...day17, startDate: "2026-10-02", checkIns: [] };

  test("completion at exactly day 30 shows once, then offers 60 and 90", async ({ page }) => {
    await seed(page, day30);
    await expect(page.getByText("Day 30. You reached your goal.")).toBeVisible();
    expect((await stored(page))!.goalReachedOn).toBe(TODAY);

    await page.reload();
    await expect(page.getByTestId("day-line")).toHaveText("Day 30 of 30");
    await expect(page.getByText("Day 30. You reached your goal.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Extend to 90 days" })).toBeVisible();

    await page.getByRole("button", { name: "Extend to 60 days" }).click();
    await expect(page.getByTestId("day-line")).toHaveText("Day 30 of 60");
    expect(await stored(page)).toMatchObject({ goalDays: 60, startDate: day30.startDate });
  });

  test("past the goal reads 'Day N — past your 30-day goal'", async ({ page }) => {
    await seed(page, { ...day30, startDate: "2026-09-30", goalReachedOn: "2026-10-29" });
    await expect(page.getByTestId("day-line")).toHaveText("Day 32 — past your 30-day goal");
  });
});

test.describe("your data (Sections 8.3, 11.1, 16.4)", () => {
  test("Clear my data deletes the localStorage key", async ({ page }) => {
    await seed(page, day17);
    await page.getByRole("button", { name: "Clear my data on this device" }).click();
    await expect(page.locator("#confirm-clear-heading")).toBeFocused();
    await page.getByRole("button", { name: "Yes, delete it" }).click();

    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();
    await expect(page.getByRole("heading", { name: "Start your streak" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Start your streak" })).toBeVisible();
  });

  test("Keep it leaves the data alone", async ({ page }) => {
    await seed(page, day17);
    await page.getByRole("button", { name: "Start over" }).click();
    await page.getByRole("button", { name: "Keep it" }).click();
    expect(await stored(page)).toEqual(day17);
  });

  test("JSON export downloads exactly the visitor's own stored data", async ({ page }) => {
    await seed(page, day17);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download as JSON" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(`no-contact-tracker-${TODAY}.json`);
    const body = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(body).toEqual({ [KEY]: day17 });
  });

  test("CSV export downloads one row per check-in and slip", async ({ page }) => {
    await seed(page, {
      ...day17,
      slips: [{ date: "2026-10-20", restartedOn: "2026-10-20" }],
      checkIns: [{ date: "2026-10-30", urgeLevel: 2, note: "Hard, but okay" }],
    });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download as CSV" }).click(),
    ]);
    const csv = await readFile((await download.path())!, "utf8");
    expect(csv).toBe(
      [
        "type,date,urge_level,note,restarted_on",
        'check-in,2026-10-30,2,"Hard, but okay",',
        "slip,2026-10-20,,,2026-10-20",
        "",
      ].join("\r\n"),
    );
  });

  test("print shows the streak summary and the disclaimer, not the page chrome", async ({
    page,
  }) => {
    await seed(page, day17);
    await page.emulateMedia({ media: "print" });
    await expect(page.getByRole("heading", { name: "No-contact tracker summary" })).toBeVisible();
    await expect(page.getByTestId("tool-disclaimer")).toBeVisible();
    await expect(page.getByRole("heading", { name: "How no contact works" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Still no contact" })).toBeHidden();
  });
});

test.describe("resilience (Section 16.4)", () => {
  test("a corrupted stored value shows a plain-English recovery path", async ({ page }) => {
    await seed(page, "{not valid json");
    await expect(
      page.getByRole("heading", { name: "We couldn't read your saved tracker" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Start fresh" }).click();
    await expect(page.getByRole("heading", { name: "Start your streak" })).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();
  });

  test("a well-formed but invalid value is treated as corrupted too", async ({ page }) => {
    await seed(page, JSON.stringify({ ...day17, goalDays: 45 }));
    await expect(
      page.getByRole("heading", { name: "We couldn't read your saved tracker" }),
    ).toBeVisible();
  });

  test("blocked storage: the tracker still works for the visit and says so", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
    });
    await page.goto(URL);
    await expect(page.getByText("This browser isn't letting the tracker save.")).toBeVisible();
    await page.getByRole("button", { name: "Start my streak" }).click();
    await expect(page.getByTestId("day-line")).toHaveText(
      "Day 0 — your first full day starts tomorrow",
    );
  });
});

test.describe("layout (Sections 8.1, 8.3)", () => {
  test("no horizontal scroll, and controls are at least 44px tall", async ({ page }) => {
    await seed(page, day17);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const small = await page
      .locator(
        "main button:visible, main label:has(input[type=radio]):visible, main select:visible, main input[type=date]:visible",
      )
      .evaluateAll((els) =>
        els
          .filter((el) => el.getBoundingClientRect().height < 44)
          .map((el) => el.outerHTML.slice(0, 80)),
      );
    expect(small).toEqual([]);
  });
});
