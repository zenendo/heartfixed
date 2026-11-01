import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DraftPrivacyNotice } from "@/components/content/ComplianceBlocks";
import { urgeTimer } from "@/config/content";
import { blockE } from "@/content/compliance";
import { NO_POSITION, RULE_LINE, decisionCopy, decisionPage, urgePrompt } from "@/content/decision";
import { faqs } from "@/content/faqs";

// Section 14.3, Block E — copied from the spec. Do NOT edit this to make a test pass.
const BLOCK_E =
  "Your draft stays in this browser. It is not sent anywhere, not stored after you leave this page, not used to train anything, and never seen by a person. The checks below run on your device.";

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    const fn = value as (...a: unknown[]) => unknown;
    return [0, 1, 3, 9].flatMap((n) => {
      try {
        return allStrings(fn(n, 5));
      } catch {
        return allStrings(fn(["you owe me"]));
      }
    });
  }
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

const text = [
  ...allStrings(decisionCopy),
  ...allStrings(decisionPage),
  ...allStrings(faqs.decision),
];

describe("Block E — draft-privacy notice (Section 14.3)", () => {
  it("is verbatim, in body-size text", () => {
    expect(blockE.text).toBe(BLOCK_E);
    const html = renderToStaticMarkup(createElement(DraftPrivacyNotice, { id: "x" }));
    expect(html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'")).toBe(BLOCK_E);
    expect(html).toContain("text-body");
  });
});

describe("decision copy rules (Sections 11.2, 14.2)", () => {
  it("collects a meaningful amount of copy", () => {
    expect(text.length).toBeGreaterThan(80);
  });

  it("names the forced-wait rule in the spec's words", () => {
    expect(RULE_LINE).toBe(
      "Nothing good gets sent drunk or at a 9. It can be true at 10am; it can't be sent at 1am like this.",
    );
    expect(decisionCopy.outcome.reasons["forced-alcohol"]).toContain(RULE_LINE);
    expect(decisionCopy.outcome.reasons["forced-intensity"]).toContain(RULE_LINE);
  });

  it("says it takes no position on reconciliation (Section 11.2)", () => {
    expect(NO_POSITION).toMatch(/takes no side/);
    expect(decisionCopy.outcome.noPosition).toBe(NO_POSITION);
  });

  it("never claims AI, a person, or a chat — only to deny them", () => {
    const claims = text.filter((s) =>
      /\b(our ai|ai-powered|powered by ai|ai coach|chat with|we read|someone (will )?read|a person reads)\b/i.test(
        s,
      ),
    );
    expect(claims).toEqual([]);
  });

  it("never promises an outcome or uses Section 14.2 terms", () => {
    const prohibited =
      /therap(y|ist)|counsell?ing|treatment|diagnos(is|e)|get (her|him|them|your ex) back|win (her|him|them) back|regret leaving|miss you|guarantee|\b(she|he|they)('ll| will) (reply|respond|come back|miss)/i;
    // A question ("Can it tell me how she'll respond?") isn't a promise; its answer is
    // checked like every other statement.
    expect(text.filter((s) => !s.trim().endsWith("?") && prohibited.test(s))).toEqual([]);
  });

  it("only the logistics outcome says sending can be reasonable", () => {
    expect(decisionCopy.outcome.heading).toEqual({
      dont_send: "Don't send this.",
      wait_24h: "Wait 24 hours, then re-run this.",
      logistics_ok: "Sending can be reasonable — send the logistics version.",
    });
  });
});

describe("urge-timer prompt cards (Section 11.2)", () => {
  it("are the three config-driven spec prompts, resolved with the partner dictionary", () => {
    expect(urgeTimer.minutes).toBe(30);
    expect(urgeTimer.prompts.map((p) => urgePrompt(p, 12))).toEqual([
      "What do you actually want to happen after she reads it?",
      "How will you feel at breakfast if she doesn't reply?",
      "Day 12 of no contact is worth more than this draft.",
    ]);
  });

  it("falls back on the day card without a tracker, or on Day 0", () => {
    const dayCard = urgeTimer.prompts[2];
    expect(urgePrompt(dayCard, null)).toBe(urgeTimer.noTrackerPrompt);
    expect(urgePrompt(dayCard, 0)).toBe(urgeTimer.noTrackerPrompt);
  });
});
