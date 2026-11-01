import { describe, expect, it } from "vitest";
import { faqs } from "@/content/faqs";
import { trackerCopy, trackerPage } from "@/content/tracker";
import { PROHIBITED_SCHEMA_TYPES, breadcrumbSchema, faqSchema, jsonLd } from "@/lib/seo/schema";

/** Every string the tracker can render, including templated ones at sample values. */
function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    return [0, 1, 17, 30].flatMap((n) => allStrings((value as (...a: number[]) => unknown)(n, 30)));
  }
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

const copyText = [
  ...allStrings(trackerCopy),
  ...allStrings(trackerPage),
  ...allStrings(faqs.tracker),
];

describe("tracker copy rules", () => {
  it("collects a meaningful amount of copy", () => {
    expect(copyText.length).toBeGreaterThan(80);
  });

  it("never uses the Section 11.1 shaming words", () => {
    const hits = copyText.filter((s) => /\b(failed|fail|relapse|clean|streak lost)\b/i.test(s));
    expect(hits).toEqual([]);
  });

  it("never uses Section 14.2 prohibited terms or outcome promises", () => {
    const prohibited =
      /therap(y|ist)|counsell?ing|treatment|diagnos(is|e)|get (her|him|them|your ex) back|regret leaving|miss you|guarantee/i;
    expect(copyText.filter((s) => prohibited.test(s))).toEqual([]);
  });

  it("never asks for the ex's name", () => {
    expect(copyText.filter((s) => /\bname\b/i.test(s) && !/no name/i.test(s))).toEqual([]);
  });

  it("states that notes stay in the browser (Section 11.1)", () => {
    expect(trackerCopy.checkIn.notePrivacy).toBe(
      "Notes stay in this browser and are never sent anywhere.",
    );
  });

  it("says 'full days' on the reset screen so a drop from the displayed day reads as intended", () => {
    expect(trackerCopy.slip.did(17)).toBe(
      "You did 17 full days. That progress is real, and the counter restarting doesn't erase it.",
    );
    expect(trackerCopy.slip.did(1)).toMatch(/^You did 1 full day\./);
  });

  it("formats the day line per Section 11.1", () => {
    expect(trackerCopy.streak.dayOf(17, 30)).toBe("Day 17 of 30");
    expect(trackerCopy.streak.pastGoal(32, 30)).toBe("Day 32 — past your 30-day goal");
  });
});

describe("JSON-LD (Section 12.2)", () => {
  it("builds FAQPage from the same items the page renders", () => {
    const schema = faqSchema(faqs.tracker);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity.map((q) => q.name)).toEqual(faqs.tracker.map((f) => f.question));
    expect(schema.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(
      faqs.tracker.map((f) => f.answer),
    );
  });

  it("builds BreadcrumbList with absolute URLs on the configured domain", () => {
    const schema = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "No-Contact Tracker", path: "/no-contact-tracker/" },
    ]);
    expect(schema.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://heartfixed.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "No-Contact Tracker",
        item: "https://heartfixed.com/no-contact-tracker/",
      },
    ]);
  });

  it("escapes '<' so content can't close the script tag", () => {
    expect(jsonLd({ a: "</script><script>alert(1)</script>" })).not.toContain("<");
  });

  it("uses no prohibited schema types", () => {
    const serialised = jsonLd([
      faqSchema(faqs.tracker),
      breadcrumbSchema([{ name: "Home", path: "/" }]),
    ]);
    for (const type of PROHIBITED_SCHEMA_TYPES) {
      expect(serialised).not.toContain(`"@type":"${type}"`);
    }
  });
});
