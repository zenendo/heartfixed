import { expect, test, type Page } from "@playwright/test";
import { blockE } from "../../content/compliance";
import { NO_POSITION, RULE_LINE } from "../../content/decision";
import { faqs } from "../../content/faqs";

/**
 * /should-i-text-my-ex/ — Section 16.4 decision acceptance criteria plus the Section 14
 * guardrails. Clock: Sunday 2026-11-01, 14:00 New York time (after the DST change).
 */

const URL = "/should-i-text-my-ex/";
const VAULT = "heartfixed-unsent-v1";
const RECHECK = "heartfixed-recheck-v1";
const DAYTIME = new Date("2026-11-01T14:00:00-05:00");
const NIGHT = new Date("2026-10-31T01:30:00-04:00");
const CLEAN_LOGISTICS = "Hi — when works for me to pick up the boxes from your place this week?";

test.use({ timezoneId: "America/New_York" });

const next = (page: Page) => page.getByRole("button", { name: "Continue" }).click();
const group = (page: Page, name: string) => page.getByRole("group", { name });

interface Walk {
  breakup?: string;
  contact?: string;
  purpose: RegExp;
  alcohol?: boolean;
  intensity?: number;
  drafted?: boolean;
  draft?: string;
}

/** Answers all five steps and lands on the outcome view. */
async function walk(page: Page, w: Walk) {
  await page.getByRole("radio", { name: w.breakup ?? "More than 3 months" }).check();
  await page.getByRole("radio", { name: w.contact ?? "More than a month ago" }).check();
  await next(page);
  await page.getByRole("radio", { name: w.purpose }).check();
  await next(page);
  await group(page, "Have you been drinking tonight?")
    .getByRole("radio", { name: w.alcohol ? "Yes" : "No" })
    .check();
  if (w.intensity !== undefined) {
    await page.getByLabel("How intense does it feel right now?").fill(String(w.intensity));
  }
  await group(page, "Have you already drafted and deleted this more than once?")
    .getByRole("radio", { name: w.drafted ? "Yes" : "No" })
    .check();
  await next(page);
  if (w.draft) {
    await page.getByLabel("Your draft").fill(w.draft);
    await next(page);
  } else {
    await page.getByRole("button", { name: "Skip — I don't have a draft" }).click();
  }
  await expect(page.locator("#outcome-heading")).toBeFocused();
}

const outcome = (page: Page) => page.getByTestId("outcome");
const stored = (page: Page, key: string) => page.evaluate((k) => localStorage.getItem(k), key);

test.describe("server-rendered content and guardrails", () => {
  test("rules, outcomes, FAQ and schema are in the initial HTML", async ({ request }) => {
    const html = await (await request.get(URL)).text();
    for (const text of ["Should I Text My Ex?", "How this works", "The three answers"]) {
      expect(html).toContain(text);
    }
    for (const f of faqs.decision) expect(html).toContain(f.question.replace(/'/g, "&#x27;"));
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  test("the copy says plainly that no AI is involved", async ({ page }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await expect(page.getByText(/no AI, no chat, and nobody reading it/)).toBeVisible();
    await expect(page.getByTestId("tool-disclaimer")).toBeVisible();
  });
});

test.describe("the five-step flow (Section 8.3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
  });

  test("shows progress, blocks with an inline error, and Back preserves answers", async ({
    page,
  }) => {
    await expect(page.getByTestId("progress")).toHaveText("Step 1 of 5");
    await next(page);
    await expect(page.getByText("Choose an answer to continue.")).toBeVisible();
    await expect(page.getByTestId("progress")).toHaveText("Step 1 of 5");

    await page.getByRole("radio", { name: "Less than 2 weeks" }).check();
    await page.getByRole("radio", { name: "In the last 7 days" }).check();
    await next(page);
    await expect(page.getByTestId("progress")).toHaveText("Step 2 of 5");
    await expect(page.locator("#step-2-heading")).toBeFocused();
    await page.getByRole("radio", { name: /^I miss/ }).check();
    await next(page);
    await page.getByLabel("How intense does it feel right now?").fill("6");

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("radio", { name: /^I miss/ })).toBeChecked();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("radio", { name: "Less than 2 weeks" })).toBeChecked();
    await next(page);
    await next(page);
    await expect(page.getByTestId("intensity-value")).toHaveText("6 out of 10");
  });

  test("Start over clears every answer and the draft", async ({ page }) => {
    await walk(page, { purpose: /^I miss/, draft: "remember us" });
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(page.getByTestId("progress")).toHaveText("Step 1 of 5");
    await expect(page.getByRole("radio", { name: "More than 3 months" })).not.toBeChecked();
    await page.getByRole("radio", { name: "More than 3 months" }).check();
    await page.getByRole("radio", { name: "More than a month ago" }).check();
    await next(page);
    await page.getByRole("radio", { name: /^I miss/ }).check();
    await next(page);
    await group(page, "Have you been drinking tonight?").getByRole("radio", { name: "No" }).check();
    await group(page, "Have you already drafted and deleted this more than once?")
      .getByRole("radio", { name: "No" })
      .check();
    await next(page);
    await expect(page.getByLabel("Your draft")).toHaveValue("");
  });
});

test.describe("draft privacy (Section 16.4 acceptance)", () => {
  test("pasted draft text appears in no outbound request and no storage", async ({
    page,
    context,
  }) => {
    const MARKER = "zq7-lakehouse-9481";
    const draft = `After everything, ${MARKER}, you owe me a reply.`;
    const outbound: string[] = [];
    page.on("request", (req) => {
      outbound.push([req.url(), req.postData() ?? "", JSON.stringify(req.headers())].join("\n"));
    });

    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await walk(page, { purpose: /^I want/, draft });
    await expect(outcome(page)).toHaveAttribute("data-outcome", "dont_send");
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByLabel("Your draft").fill(`${draft} more`);
    await next(page);

    const leaks = outbound.filter(
      (r) => r.includes(MARKER) || r.includes(encodeURIComponent(MARKER)),
    );
    expect(leaks).toEqual([]);

    const storage = await page.evaluate(() =>
      JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }),
    );
    expect(storage).not.toContain(MARKER);
    expect(JSON.stringify(await context.cookies())).not.toContain(MARKER);
  });

  test("leaving the page leaves nothing behind", async ({ page }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await walk(page, { purpose: /^I miss/, draft: "nothing should survive this" });
    await page.goto("/");
    await page.goto(URL);
    await expect(page.getByTestId("progress")).toHaveText("Step 1 of 5");
    const all = await page.evaluate(() => JSON.stringify({ ...localStorage }));
    expect(all).not.toContain("nothing should survive");
  });

  test("Block E renders directly above the textarea, which has spellcheck off", async ({
    page,
  }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await page.getByRole("radio", { name: "More than 3 months" }).check();
    await page.getByRole("radio", { name: "More than a month ago" }).check();
    await next(page);
    await page.getByRole("radio", { name: /^Logistics/ }).check();
    await next(page);
    await group(page, "Have you been drinking tonight?").getByRole("radio", { name: "No" }).check();
    await group(page, "Have you already drafted and deleted this more than once?")
      .getByRole("radio", { name: "No" })
      .check();
    await next(page);

    const notice = page.getByTestId("draft-privacy");
    const textarea = page.getByLabel("Your draft");
    await expect(notice).toHaveText(blockE.text);
    expect(
      await textarea.evaluate((el) => el.previousElementSibling?.getAttribute("data-testid")),
    ).toBe("draft-privacy");
    const [n, t] = [await notice.boundingBox(), await textarea.boundingBox()];
    expect(n!.y + n!.height).toBeLessThanOrEqual(t!.y);
    await expect(textarea).toHaveAttribute("spellcheck", "false");
  });

  test("observations update locally as he types, including night-send at 01:30", async ({
    page,
  }) => {
    await page.clock.setFixedTime(NIGHT);
    await page.goto(URL);
    await page.getByRole("radio", { name: "More than 3 months" }).check();
    await page.getByRole("radio", { name: "More than a month ago" }).check();
    await next(page);
    await page.getByRole("radio", { name: /^Logistics/ }).check();
    await next(page);
    await group(page, "Have you been drinking tonight?").getByRole("radio", { name: "No" }).check();
    await group(page, "Have you already drafted and deleted this more than once?")
      .getByRole("radio", { name: "No" })
      .check();
    await next(page);
    await page.getByLabel("Your draft").fill("After everything, you owe me. Just reply.");
    const obs = page.getByTestId("draft-observations");
    await expect(obs).toContainText("“you owe me”, “after everything”, “just reply”");
    await expect(obs).toContainText("Night-send risk");
  });
});

test.describe("outcomes (Section 11.2)", () => {
  test("alcohol forces don't send, names the rule, offers next actions and Block D", async ({
    page,
  }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await walk(page, { purpose: /^Logistics/, alcohol: true, draft: CLEAN_LOGISTICS });
    await expect(outcome(page)).toHaveAttribute("data-outcome", "dont_send");
    await expect(page.locator("#outcome-heading")).toHaveText("Don't send this.");
    await expect(outcome(page)).toContainText(RULE_LINE);
    await expect(page.getByText(NO_POSITION)).toBeVisible();
    await expect(page.getByTestId("crisis-block")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start the 30-minute urge timer" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save it unsent" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a no-contact streak" })).toHaveAttribute(
      "href",
      "/no-contact-tracker/",
    );
  });

  test("intensity 9 forces don't send", async ({ page }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await walk(page, { purpose: /^Logistics/, intensity: 9, draft: CLEAN_LOGISTICS });
    await expect(outcome(page)).toHaveAttribute("data-outcome", "dont_send");
    await expect(outcome(page)).toContainText(RULE_LINE);
  });

  test("logistics, calm, clean draft, daytime → the logistics version", async ({ page }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await walk(page, { purpose: /^Logistics/, intensity: 3, draft: CLEAN_LOGISTICS });
    await expect(outcome(page)).toHaveAttribute("data-outcome", "logistics_ok");
    await expect(page.getByText("One or two sentences.")).toBeVisible();
    await expect(page.getByText(/doesn't write it for you/)).toBeVisible();
    await expect(page.getByTestId("crisis-block")).toBeVisible();
  });

  test("the same logistics draft at 01:30 → wait 24 hours", async ({ page }) => {
    await page.clock.setFixedTime(NIGHT);
    await page.goto(URL);
    await walk(page, { purpose: /^Logistics/, intensity: 3, draft: CLEAN_LOGISTICS });
    await expect(outcome(page)).toHaveAttribute("data-outcome", "wait_24h");
    await expect(page.getByText("Night-send risk", { exact: false }).first()).toBeVisible();
  });

  test("closure with a clean draft → wait 24h with a concrete re-check time and reminder", async ({
    page,
  }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    await walk(page, {
      purpose: /^An apology or closure/,
      intensity: 4,
      draft: "I'm sorry for how I ended things. I hope you're well.",
    });
    await expect(outcome(page)).toHaveAttribute("data-outcome", "wait_24h");
    await expect(page.getByText("Re-check: Monday at 2:00 PM.")).toBeVisible();

    await page.getByRole("button", { name: "Remind me on this device" }).click();
    await expect(
      page.getByText("Reminder saved on this device for Monday at 2:00 PM."),
    ).toBeVisible();
    const saved = JSON.parse((await stored(page, RECHECK))!);
    expect(saved).toEqual({ version: 1, recheckAt: "2026-11-02T19:00:00.000Z" });
    expect(await stored(page, RECHECK)).not.toContain("sorry");

    await page.reload();
    await expect(page.getByText("You planned to re-check this Monday at 2:00 PM.")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).click();
    expect(await stored(page, RECHECK)).toBeNull();
  });
});

test.describe("unsent list (Section 11.2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
  });

  test("saving keeps the draft on this device only, and deleting removes it", async ({ page }) => {
    const draft = "I still think about the lake. I miss you.";
    await walk(page, { purpose: /^I miss/, draft });
    await page.getByRole("button", { name: "Save it unsent" }).click();
    await expect(page.getByText("Saved to your unsent list. It wasn't sent.")).toBeVisible();
    await expect(page.getByTestId("vault-entry")).toContainText(draft);
    expect(JSON.parse((await stored(page, VAULT))!).entries[0].text).toBe(draft);

    await page.reload();
    await expect(page.getByTestId("vault-entry")).toContainText(draft);
    await page.getByTestId("vault-entry").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("vault-entry")).toHaveCount(0);
    expect(JSON.parse((await stored(page, VAULT))!).entries).toEqual([]);
  });

  test("with no draft, he can write it out instead and keep it", async ({ page }) => {
    await walk(page, { purpose: /^No reason/ });
    await page.getByRole("button", { name: "Write it out instead" }).click();
    await page.getByLabel("Write what you wanted to say").fill("Just wanted to hear your voice.");
    await page.getByRole("button", { name: "Save it unsent" }).click();
    await expect(page.getByTestId("vault-entry")).toContainText("Just wanted to hear your voice.");
  });

  test("Clear my data deletes the unsent list and reminder keys", async ({ page }) => {
    await walk(page, { purpose: /^I miss/, draft: "delete me" });
    await page.getByRole("button", { name: "Save it unsent" }).click();
    await page.evaluate(
      (k) =>
        localStorage.setItem(
          k,
          JSON.stringify({ version: 1, recheckAt: "2026-11-02T19:00:00.000Z" }),
        ),
      RECHECK,
    );
    await page.getByRole("button", { name: "Clear my data on this device" }).click();
    await page.getByRole("button", { name: "Yes, delete it" }).click();
    expect(await stored(page, VAULT)).toBeNull();
    expect(await stored(page, RECHECK)).toBeNull();
    await expect(page.getByTestId("vault-entry")).toHaveCount(0);
  });

  test("a corrupted unsent list doesn't break the page", async ({ page }) => {
    await page.evaluate((k) => localStorage.setItem(k, "{broken"), VAULT);
    await page.reload();
    await expect(page.getByTestId("progress")).toHaveText("Step 1 of 5");
  });
});

test.describe("urge timer (Sections 11.2, 16.4)", () => {
  test("counts down 30 minutes with reduced motion, rotating prompts, then offers the tracker", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install({ time: DAYTIME });
    await page.goto(URL);
    await page.getByRole("button", { name: "Just start the 30-minute urge timer" }).click();

    const display = page.getByTestId("timer-display");
    await expect(page.locator("#timer-heading")).toBeFocused();
    await expect(display).toHaveText("30:00");
    await expect(page.getByTestId("timer-prompt")).toHaveText(
      "What do you actually want to happen after she reads it?",
    );

    await page.clock.runFor(61_000);
    await expect(display).toHaveText("28:59");
    await expect(page.getByTestId("timer-prompt")).toHaveText(
      "How will you feel at breakfast if she doesn't reply?",
    );

    await page.clock.runFor(29 * 60_000);
    await expect(
      page.getByRole("heading", { name: "30 minutes. You made it through." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start a no-contact streak — it takes ten seconds" }),
    ).toHaveAttribute("href", "/no-contact-tracker/");
  });

  test("with a tracker: the day card uses his day count and completion offers the check-in", async ({
    page,
  }) => {
    await page.clock.install({ time: DAYTIME });
    await page.goto(URL);
    // Last contact Oct 15 → Day 17 on Nov 1.
    await page.evaluate(() =>
      localStorage.setItem(
        "heartfixed-tracker-v1",
        JSON.stringify({
          version: 1,
          startDate: "2026-10-16",
          goalDays: 30,
          checkIns: [],
          slips: [],
          longestStreak: 0,
          reminderOptIn: false,
        }),
      ),
    );
    await page.goto(`${URL}?from=tracker`);
    await expect(page.getByText("From your tracker: Day 17 of no contact.")).toBeVisible();

    await page.getByRole("button", { name: "Just start the 30-minute urge timer" }).click();
    await page.getByRole("button", { name: "Next prompt" }).click();
    await page.getByRole("button", { name: "Next prompt" }).click();
    await expect(page.getByTestId("timer-prompt")).toHaveText(
      "Day 17 of no contact is worth more than this draft.",
    );
    await page.clock.runFor(30 * 60_000 + 1000);
    await expect(page.getByRole("link", { name: "Check in on your tracker" })).toBeVisible();
  });

  test("stopping returns to where he was", async ({ page }) => {
    await page.clock.install({ time: DAYTIME });
    await page.goto(URL);
    await walk(page, { purpose: /^I miss/ });
    await page.getByRole("button", { name: "Start the 30-minute urge timer" }).click();
    await page.getByRole("button", { name: "Stop the timer" }).click();
    await expect(page.locator("#outcome-heading")).toBeFocused();
  });
});

test.describe("layout (Sections 8.1, 8.3)", () => {
  test("no horizontal scroll, and controls are at least 44px tall", async ({ page }) => {
    await page.clock.setFixedTime(DAYTIME);
    await page.goto(URL);
    for (let step = 1; step <= 3; step++) {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `step ${step}`).toBeLessThanOrEqual(0);
      const small = await page
        .locator(
          "main button:visible, main label:has(input[type=radio]):visible, main input[type=range]:visible",
        )
        .evaluateAll((els) =>
          els
            .filter((el) => el.getBoundingClientRect().height < 44)
            .map((el) => el.outerHTML.slice(0, 80)),
        );
      expect(small, `step ${step}`).toEqual([]);
      if (step === 1) {
        await page.getByRole("radio", { name: "More than 3 months" }).check();
        await page.getByRole("radio", { name: "More than a month ago" }).check();
      } else if (step === 2) {
        await page.getByRole("radio", { name: /^I miss/ }).check();
      }
      if (step < 3) await next(page);
    }
  });
});
