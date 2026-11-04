import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailResultForm } from "@/components/quiz/EmailResultForm";
import { EmailSignup } from "@/components/content/EmailSignup";
import type { AffiliateSlot } from "@/config/affiliates";
import { quizConfig } from "@/config/quiz";
import { baseUrl, routes, site } from "@/config/site";
import {
  affiliateDisclosure,
  blockA,
  blockAShort,
  blockC,
  honestFraming,
} from "@/content/compliance";
import { actionLists } from "@/content/emails/actionLists";
import { formCopy } from "@/content/emails/forms";
import { dailyReminder, goalReached } from "@/content/emails/reminders";
import { welcomeSequence } from "@/content/emails/welcome";
import { handleEmailRequest } from "@/lib/email/handler";
import {
  REMINDER_PROPERTIES,
  memoryProvider,
  providerFromEnv,
  resendProvider,
  type EmailProvider,
} from "@/lib/email/provider";
import { createRateLimiter } from "@/lib/email/rateLimit";
import {
  MissingMailingAddressError,
  UNSUBSCRIBE_PLACEHOLDER,
  renderBlock,
  renderMarketingEmail,
  marketingReasons,
} from "@/lib/email/render";
import { buildResultEmail, resultFromToken } from "@/lib/email/resultEmail";
import { EMAIL_PATTERN, checkEmail } from "@/lib/email/rules";
import { emailRequestSchema, emailSchema } from "@/lib/email/validate";
import { z } from "zod";
import { plain, resultContentFor, resultCopy } from "@/content/quiz-result";
import { pronounContext } from "@/lib/quiz";
import { encodeShareToken, leanWatchOuts, profileCopy } from "@/lib/quiz";

/** Session 9 — email flows: Sections 13.1–13.4, 14.4, 14.5 and 16.1. */

const VERSION = quizConfig.questionSetVersion;
const EMAIL = "reader@example.com";
const tokenFor = (anxietyNorm: number, avoidanceNorm: number, version: string = VERSION) =>
  encodeShareToken({ version, anxietyNorm, avoidanceNorm });
const REMINDERS = {
  startDate: "2026-10-15",
  goalDays: 30 as const,
  hour: 20,
  timeZone: "America/New_York",
};

const deps = (provider: EmailProvider | null = memoryProvider(), limit = 100) => ({
  provider,
  limiter: createRateLimiter({ limit }),
});

describe("consent separation — Section 13.1 (the acceptance-critical part)", () => {
  it("(a) a result send with the box unticked sends once and subscribes to nothing", async () => {
    const p = memoryProvider();
    const res = await handleEmailRequest(
      { action: "send_result", email: EMAIL, token: tokenFor(72, 18), alsoJoinList: false },
      "1.1.1.1",
      deps(p),
    );
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(p.calls.map((c) => c.kind)).toEqual(["send"]);
  });

  it("(a)+(b) joins the list only because the separate box was ticked", async () => {
    const p = memoryProvider();
    const res = await handleEmailRequest(
      { action: "send_result", email: EMAIL, token: tokenFor(72, 18), alsoJoinList: true },
      "1.1.1.1",
      deps(p),
    );
    expect(res.body).toEqual({ ok: true, listJoined: true });
    expect(p.calls).toMatchObject([
      { kind: "send" },
      { kind: "joinList", email: EMAIL, placement: "result" },
    ]);
  });

  it("(b) a list join never sends a result and never turns on reminders", async () => {
    for (const placement of ["footer", "tracker", "result"] as const) {
      const p = memoryProvider();
      await handleEmailRequest({ action: "join_list", email: EMAIL, placement }, "ip", deps(p));
      expect(p.calls).toEqual([{ kind: "joinList", email: EMAIL, placement }]);
    }
  });

  it("(c) reminders are their own opt-in, independent of list membership", async () => {
    const p = memoryProvider();
    await handleEmailRequest(
      { action: "reminders_on", email: EMAIL, reminders: REMINDERS },
      "ip",
      deps(p),
    );
    expect(p.calls).toEqual([{ kind: "enableReminders", email: EMAIL, settings: REMINDERS }]);
  });

  it("if the list join fails after the result is sent, says so honestly", async () => {
    const p: EmailProvider = {
      ...memoryProvider(),
      async joinList() {
        throw new Error("down");
      },
    };
    const res = await handleEmailRequest(
      { action: "send_result", email: EMAIL, token: tokenFor(72, 18), alsoJoinList: true },
      "ip",
      deps(p),
    );
    expect(res.body).toEqual({ ok: true, listJoined: false });
  });
});

describe("the endpoint's guards — Section 13.1", () => {
  it("rejects a bad address with a code, and calls nothing", async () => {
    const p = memoryProvider();
    const res = await handleEmailRequest(
      { action: "join_list", email: "not-an-email", placement: "footer" },
      "ip",
      deps(p),
    );
    expect(res).toEqual({ status: 400, body: { ok: false, error: "invalid_email" } });
    expect(p.calls).toEqual([]);
  });

  it("accepts disposable addresses (Section 13.1)", async () => {
    const p = memoryProvider();
    await handleEmailRequest(
      { action: "join_list", email: "someone@mailinator.com", placement: "footer" },
      "ip",
      deps(p),
    );
    expect(p.calls).toHaveLength(1);
  });

  it("a filled honeypot looks like success and does nothing", async () => {
    const p = memoryProvider();
    const res = await handleEmailRequest(
      { action: "join_list", email: EMAIL, placement: "footer", website: "http://spam" },
      "ip",
      deps(p),
    );
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(p.calls).toEqual([]);
  });

  it("rate-limits to the configured requests per IP, per IP", async () => {
    const d = deps(memoryProvider(), 5);
    const req = { action: "join_list", email: EMAIL, placement: "footer" };
    for (let i = 0; i < 5; i++) expect((await handleEmailRequest(req, "a", d)).status).toBe(200);
    expect(await handleEmailRequest(req, "a", d)).toEqual({
      status: 429,
      body: { ok: false, error: "rate_limited" },
    });
    expect((await handleEmailRequest(req, "b", d)).status).toBe(200);
  });

  it("the window slides: an hour later the IP may send again", () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 1, now: () => now });
    expect(limiter.hit("a")).toBe(true);
    expect(limiter.hit("a")).toBe(false);
    now = 3_600_000;
    expect(limiter.hit("a")).toBe(true);
  });

  it("refuses tampered, malformed and outdated result tokens", async () => {
    for (const token of [
      tokenFor(72, 18).replace("72", "720"),
      "nonsense",
      tokenFor(72, 18, "men-v0"),
    ]) {
      const p = memoryProvider();
      const res = await handleEmailRequest(
        { action: "send_result", email: EMAIL, token, alsoJoinList: false },
        "ip",
        deps(p),
      );
      expect(res.body).toEqual({ ok: false, error: "invalid_request" });
      expect(p.calls).toEqual([]);
    }
  });

  it("with no provider configured, says so instead of pretending to send", async () => {
    const res = await handleEmailRequest(
      { action: "join_list", email: EMAIL, placement: "footer" },
      "ip",
      deps(null),
    );
    expect(res).toEqual({ status: 503, body: { ok: false, error: "not_configured" } });
  });

  it("a provider failure is a code, and no response ever echoes the address", async () => {
    const broken: EmailProvider = {
      name: "broken",
      send: () => Promise.reject(new Error("x")),
      joinList: () => Promise.reject(new Error("x")),
      enableReminders: () => Promise.reject(new Error("x")),
    };
    const res = await handleEmailRequest(
      { action: "join_list", email: EMAIL, placement: "footer" },
      "ip",
      deps(broken),
    );
    expect(res).toEqual({ status: 502, body: { ok: false, error: "provider_error" } });
    expect(JSON.stringify(res)).not.toContain(EMAIL);
  });

  it("rejects bad reminder settings: goal, hour, date and time zone", () => {
    const bad = [
      { ...REMINDERS, goalDays: 45 },
      { ...REMINDERS, hour: 24 },
      { ...REMINDERS, startDate: "2026-13-40" },
      { ...REMINDERS, timeZone: "Mars/Olympus" },
    ];
    for (const reminders of bad) {
      expect(
        emailRequestSchema.safeParse({ action: "reminders_on", email: EMAIL, reminders }).success,
      ).toBe(false);
    }
  });

  it("strips anything else the browser sends — answers can't ride along", () => {
    const parsed = emailRequestSchema.parse({
      action: "join_list",
      email: EMAIL,
      placement: "footer",
      answers: [4, 4, 4],
      note: "private",
    });
    expect(Object.keys(parsed).sort()).toEqual(["action", "email", "placement"]);
  });

  it("the email code never logs anything", () => {
    const dirs = ["lib/email", "app/api"];
    const root = path.resolve(__dirname, "../..");
    const hits = dirs.flatMap((dir) =>
      readdirSync(path.join(root, dir), { recursive: true, encoding: "utf8" })
        .filter((f) => /\.tsx?$/.test(f))
        .filter((f) => /console\./.test(readFileSync(path.join(root, dir, f), "utf8"))),
    );
    expect(hits).toEqual([]);
  });
});

describe("the result email — Section 13.2", () => {
  const result = resultFromToken(tokenFor(72, 18));
  const email = buildResultEmail(result);

  it("takes the profile from the engine, not the browser", () => {
    expect(result.profileId).toBe("anxious");
    expect(result.anxietyBand).toBe("high");
  });

  it("has the Section 13.2 subject", () => {
    expect(email.subject).toBe(`Your attachment result from ${site.name}: Anxious`);
  });

  it("contains both scores with bands, the description, watch-outs and the 14-day plan", () => {
    for (const body of [email.text, email.html]) {
      expect(body).toContain("Attachment anxiety: 72/100, high");
      expect(body).toContain("Attachment avoidance: 18/100, low");
    }
    expect(email.text).toContain(profileCopy.anxious.description);
    for (const w of profileCopy.anxious.watchOuts) expect(email.text).toContain(w);
    for (const stage of actionLists.anxious) {
      for (const a of stage.actions) expect(email.text).toContain(a);
    }
  });

  it("links the share link, the tracker and the reading list, absolutely", () => {
    expect(email.text).toContain(new URL(routes.quizResults, baseUrl).toString());
    expect(email.text).toContain(`v=${VERSION}&a=72&v2=18`);
    expect(email.text).toContain(new URL(routes.tracker, baseUrl).toString());
    expect(email.text).toContain(new URL(routes.resources, baseUrl).toString());
    expect(email.text).toContain("Anxiously Attached");
  });

  it("carries Block A, its short form, the requested-on-site note and Block C", () => {
    expect(email.text.startsWith(blockAShort.text)).toBe(true);
    expect(email.text).toContain(blockA.text);
    expect(email.text).toMatch(/asked for your result to be emailed/);
    expect(email.text).toContain(blockC.text);
  });

  it("offers the list only as a separate, clearly-labelled link", () => {
    expect(email.text).toMatch(/You're not on it\. Joining is a separate choice/);
    expect(email.text).toContain(`${new URL(routes.home, baseUrl).toString()}#email-signup`);
  });

  it("shows the lean paragraph for a secure result with a moderate dimension", () => {
    const secure = buildResultEmail(resultFromToken(tokenFor(50, 20)));
    expect(secure.text).toContain(profileCopy.secure.leans!.anxious);
    for (const w of leanWatchOuts("anxious")) expect(secure.text).toContain(`- ${w}`);
  });

  it("is escaped HTML with no raw angle brackets from content", () => {
    expect(email.html).not.toMatch(/<script/i);
    expect(email.html).toContain("Your pattern: Anxious (preoccupied)");
  });
});

describe("the partner read in the result email — founder decision, Session 5", () => {
  const you = resultFromToken(tokenFor(72, 18));
  // Her perceived scores, as from H1: avoidant 83 / anxiety 13.
  const her = resultFromToken(tokenFor(13, 83));
  const email = buildResultEmail(you, her);
  const { caveat, dynamics, herReads } = resultContentFor(pronounContext());
  const read = herReads.avoidant;

  it("carries her read with the caveat first, then the dynamic", () => {
    const at = (s: string) => email.text.indexOf(s);
    expect(at("Her pattern, as you experienced it: Avoidant (dismissive)")).toBeGreaterThan(-1);
    expect(at(caveat.lead)).toBeGreaterThan(at("Her pattern, as you experienced it"));
    expect(at(plain(read.paragraphs[0]!))).toBeGreaterThan(at(caveat.lead));
    expect(email.text).toContain(
      `${resultCopy.dynamicHeading}: ${dynamics["anxious-avoidant"].title}`,
    );
    for (const p of dynamics["anxious-avoidant"].paragraphs) expect(email.text).toContain(plain(p));
    expect(email.html).toContain("<em>you experienced</em>");
  });

  it("leaves both out when no partner token is sent", () => {
    const without = buildResultEmail(you);
    expect(without.text).not.toContain("as you experienced it");
    expect(without.text).not.toContain(resultCopy.dynamicHeading);
  });

  it("the share link in it still carries only his scores", () => {
    expect(email.text).toContain(`v=${VERSION}&a=72&v2=18`);
    expect(email.text).not.toContain("a=13");
  });

  it("the endpoint takes the partner token, and rejects a malformed one", async () => {
    const ok = memoryProvider();
    const sent = await handleEmailRequest(
      {
        action: "send_result",
        email: EMAIL,
        token: tokenFor(72, 18),
        perceived: tokenFor(13, 83),
        alsoJoinList: false,
      },
      "ip",
      deps(ok),
    );
    expect(sent).toEqual({ status: 200, body: { ok: true } });
    expect(JSON.stringify(ok.calls)).toContain("as you experienced it");

    const bad = memoryProvider();
    const refused = await handleEmailRequest(
      {
        action: "send_result",
        email: EMAIL,
        token: tokenFor(72, 18),
        perceived: tokenFor(13, 83).replace("83", "830"),
        alsoJoinList: false,
      },
      "ip",
      deps(bad),
    );
    expect(refused.body).toEqual({ ok: false, error: "invalid_request" });
    expect(bad.calls).toEqual([]);
  });

  it("renders with the pronoun answers sent with it, and accepts only the three ids (2.5)", async () => {
    const send = (pronouns: unknown) =>
      handleEmailRequest(
        {
          action: "send_result",
          email: EMAIL,
          token: tokenFor(72, 18),
          perceived: tokenFor(13, 83),
          pronouns,
          alsoJoinList: false,
        },
        "ip",
        deps(memoryProvider()),
      );
    const provider = memoryProvider();
    await handleEmailRequest(
      {
        action: "send_result",
        email: EMAIL,
        token: tokenFor(72, 18),
        perceived: tokenFor(13, 83),
        pronouns: { taker: "she", partner: "they" },
        alsoJoinList: false,
      },
      "ip",
      deps(provider),
    );
    expect(JSON.stringify(provider.calls)).toContain("Their pattern, as you experienced it");
    for (const bad of [{ taker: "it", partner: "she" }, { taker: "he" }, "he/she"]) {
      expect((await send(bad)).body).toEqual({ ok: false, error: "invalid_request" });
    }
  });
});

describe("list and reminder emails — Sections 13.2, 14.4, 14.5", () => {
  const preview = { reason: marketingReasons.list, preview: true };

  it("refuse to render without the config mailing address", () => {
    expect(site.mailingAddress).toBe("");
    expect(() => renderMarketingEmail(welcomeSequence[0]!, { reason: "x" })).toThrow(
      MissingMailingAddressError,
    );
    expect(renderMarketingEmail(welcomeSequence[0]!, preview).text).toMatch(/set mailingAddress/);
  });

  it("carry Resend's one-click unsubscribe link and the crisis line", () => {
    expect(UNSUBSCRIBE_PLACEHOLDER).toBe("{{{RESEND_UNSUBSCRIBE_URL}}}");
    for (const t of welcomeSequence) {
      const e = renderMarketingEmail(t, preview);
      expect(e.html).toContain(`href="${UNSUBSCRIBE_PLACEHOLDER}"`);
      expect(e.text).toContain(blockC.text);
    }
  });

  it("the welcome sequence is five emails over ten days, in order (Section 13.2)", () => {
    expect(welcomeSequence.map((t) => t.sendDay)).toEqual([0, 2, 4, 7, 10]);
  });

  it("each welcome email links what Section 13.2 says it links", () => {
    const hrefs = (i: number) =>
      welcomeSequence[i]!.blocks.flatMap((b) => ("link" in b ? [b.link.href] : []));
    expect(hrefs(0)).toContain(routes.tracker);
    expect(hrefs(1)).toContain(routes.noContactRule);
    expect(hrefs(2)).toEqual(expect.arrayContaining([routes.guideAfterBreakup, routes.resources]));
    expect(hrefs(3)).toEqual(expect.arrayContaining([routes.guideDay14, routes.guideSheTexted]));
  });

  it("email 5: honest framing, and a disabled slot falls back to the resources page", () => {
    const five = welcomeSequence[4]!;
    const e = renderMarketingEmail(five, preview);
    expect(e.text).toContain(honestFraming.text);
    expect(e.text).not.toContain(affiliateDisclosure.text);
    expect(e.text).toContain(new URL(routes.resources, baseUrl).toString());
  });

  it("email 5: an enabled slot carries the disclosure directly above it, in the email", () => {
    const slot: AffiliateSlot = {
      id: "email-welcome-5",
      page: "email:welcome-5",
      position: "recommendation",
      enabled: true,
      heading: "A programme",
      body: "What it covers.",
      ctaLabel: "See it",
      url: "https://example.com/p",
      disclosureId: "proximity",
    };
    const block = welcomeSequence[4]!.blocks.find((b) => "slot" in b)!;
    const out = renderBlock(block, [slot]);
    expect(out.text.indexOf(affiliateDisclosure.text)).toBe(0);
    expect(out.html.indexOf("We may earn")).toBeLessThan(out.html.indexOf("A programme"));
    expect(out.html).toContain('rel="sponsored nofollow noopener"');
  });

  it("reminders read as product notifications and tolerate being wrong", () => {
    const daily = dailyReminder(12, 30);
    expect(daily.subject).toBe("Day 12. Still going.");
    expect(renderMarketingEmail(daily, preview).text).toContain(
      "If you've already checked in today, ignore this.",
    );
    expect(goalReached(30).subject).toBe("Day 30. You reached your goal.");
    expect(renderMarketingEmail(goalReached(30), preview).text).toMatch(/Reminders stop here/);
  });

  it("no email copy uses urgency, person-like attachment, subscription or prohibited terms", () => {
    const all = [...welcomeSequence, dailyReminder(12, 30), goalReached(30)].flatMap((t) => [
      t.subject,
      t.preheader,
      ...t.blocks.flatMap((b) => ("p" in b ? [b.p] : "list" in b ? b.list : [])),
    ]);
    all.push(...Object.values(actionLists).flatMap((s) => s.flatMap((st) => st.actions)));
    const text = all.join("\n");
    expect(text).not.toMatch(/last chance|hurry|act now|don't miss|limited time|expires/i);
    expect(text).not.toMatch(
      /we miss you|miss(ed)? you|thinking of you|checking on you|here for you/i,
    );
    expect(text).not.toMatch(/subscription|free trial|membership/i);
    expect(text).not.toMatch(
      /therap|counsell?ing|treatment|diagnos|guarantee|get (your ex|her) back/i,
    );
  });
});

describe("the Resend adapter — Section 7.1 (REST, no SDK)", () => {
  type Call = { url: string; init: RequestInit };
  function fakeFetch(statuses: number[]) {
    const calls: Call[] = [];
    const fn = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response("{}", { status: statuses.shift() ?? 200 });
    }) as unknown as typeof fetch;
    return { calls, fn };
  }
  const config = (f: typeof fetch) => ({
    apiKey: "re_test",
    from: "Site <results@example.com>",
    listTopicId: "topic-list",
    reminderTopicId: "topic-rem",
    fetch: f,
  });
  const body = (c: Call) => JSON.parse(String(c.init.body)) as Record<string, unknown>;

  it("sends with auth, the from address, a category tag, html and text", async () => {
    const { calls, fn } = fakeFetch([200]);
    await resendProvider(config(fn)).send({
      to: EMAIL,
      subject: "S",
      html: "<p>h</p>",
      text: "h",
      tag: "result-email",
    });
    expect(calls[0]!.url).toBe("https://api.resend.com/emails");
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(body(calls[0]!)).toMatchObject({
      from: "Site <results@example.com>",
      to: [EMAIL],
      tags: [{ name: "category", value: "result-email" }],
    });
  });

  it("joins the list by opting into the list topic only", async () => {
    const { calls, fn } = fakeFetch([200]);
    await resendProvider(config(fn)).joinList(EMAIL, "footer");
    expect(calls).toHaveLength(1);
    expect(body(calls[0]!)).toEqual({
      email: EMAIL,
      unsubscribed: false,
      topics: [{ id: "topic-list", subscription: "opt_in" }],
    });
  });

  it("reminders opt into the reminder topic, with the four properties", async () => {
    const { calls, fn } = fakeFetch([200]);
    await resendProvider(config(fn)).enableReminders(EMAIL, REMINDERS);
    expect(body(calls[0]!)).toMatchObject({
      topics: [{ id: "topic-rem", subscription: "opt_in" }],
      properties: {
        [REMINDER_PROPERTIES.startDate]: "2026-10-15",
        [REMINDER_PROPERTIES.goalDays]: 30,
        [REMINDER_PROPERTIES.hour]: 20,
        [REMINDER_PROPERTIES.timeZone]: "America/New_York",
      },
    });
  });

  it("an existing contact is updated instead (contact, then topics)", async () => {
    const { calls, fn } = fakeFetch([409, 200, 200]);
    await resendProvider(config(fn)).joinList(EMAIL, "footer");
    expect(calls.map((c) => `${c.init.method} ${c.url}`)).toEqual([
      "POST https://api.resend.com/contacts",
      `PATCH https://api.resend.com/contacts/${encodeURIComponent(EMAIL)}`,
      `PATCH https://api.resend.com/contacts/${encodeURIComponent(EMAIL)}/topics`,
    ]);
  });

  it("auth and rate errors fail instead of falling through to an update", async () => {
    for (const status of [401, 403, 429]) {
      const { calls, fn } = fakeFetch([status]);
      await expect(resendProvider(config(fn)).joinList(EMAIL, "footer")).rejects.toThrow();
      expect(calls).toHaveLength(1);
    }
  });

  it("picks the provider from the environment", () => {
    expect(providerFromEnv({})).toBeNull();
    expect(providerFromEnv({ EMAIL_PROVIDER: "memory" })?.name).toBe("memory");
    expect(
      providerFromEnv({
        EMAIL_PROVIDER_API_KEY: "k",
        EMAIL_FROM_ADDRESS: "a@b.c",
        EMAIL_LIST_ID: "l",
        EMAIL_REMINDER_TOPIC_ID: "r",
      })?.name,
    ).toBe("resend");
    expect(
      providerFromEnv({ EMAIL_PROVIDER_API_KEY: "k", EMAIL_FROM_ADDRESS: "a@b.c" }),
    ).toBeNull();
  });
});

describe("the zod-free address check — Sections 13.1, 16.3", () => {
  it("copies zod's own email regex exactly", () => {
    expect(EMAIL_PATTERN.source).toBe(z.regexes.email.source);
  });

  it("agrees with the server schema on every case", () => {
    for (const input of [
      "reader@example.com",
      "  reader@example.com  ",
      "first.last+tag@sub.example.co.uk",
      "o'neil@example.com",
      "not-an-email",
      "reader@",
      "@example.com",
      "reader@example",
      ".reader@example.com",
      "a..b@example.com",
      "reader @example.com",
      "",
      `${"a".repeat(245)}@example.com`,
      `${"a".repeat(244)}@example.com`,
    ]) {
      expect(checkEmail(input) === null, JSON.stringify(input)).toBe(
        emailSchema.safeParse(input).success,
      );
    }
  });
});

describe("forms — Sections 13.1, 13.3", () => {
  it("the footer form is labelled as a subscription with the verbatim microcopy", () => {
    expect(formCopy.list.microcopy).toBe(
      "One or two emails a week on getting through a breakup. Free, unsubscribe anytime.",
    );
    const html = renderToStaticMarkup(<EmailSignup placement="footer" />);
    expect(html).toContain(formCopy.list.microcopy);
    expect(html.match(/type="email"/g)).toHaveLength(1);
    expect(html).toContain('name="website"');
    expect(html).toContain('tabindex="-1"');
  });

  it("the result form's list box is separate, verbatim and unchecked by default", () => {
    expect(formCopy.result.alsoJoin).toBe(
      "Also join the free email list: one or two emails a week on getting through this, unsubscribe anytime",
    );
    const html = renderToStaticMarkup(
      <EmailResultForm result={{ version: VERSION, anxietyNorm: 72, avoidanceNorm: 18 }} />,
    );
    expect(html).toContain(formCopy.result.alsoJoin);
    expect(html).toMatch(/type="checkbox"/);
    expect(html).not.toMatch(/checked=""/);
    expect(html).toContain("already complete");
  });
});
