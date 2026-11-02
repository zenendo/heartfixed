import { describe, expect, it } from "vitest";
import { routes } from "@/config/site";
import { hubCopy, profilePageCopy, profilePages } from "@/content/attachment-styles";
import { faqs } from "@/content/faqs";
import { checkProfileCopy, profileCopy, profiles, type ProfileId } from "@/lib/quiz";
import { breadcrumbSchema, faqSchema, validateJsonLd } from "@/lib/seo/schema";

/**
 * Session 8 — the attachment hub and profile pages. Section 9.4 profile rules, the
 * Section 14.2 language rules over every string the pages render, and the schema the
 * pages emit.
 */

const IDS = Object.keys(profiles) as ProfileId[];

/** Every string in a nested copy object; functions are called with a sample name. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [String((value as (s: string) => string)("Anxious"))];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const pageStrings = strings([
  profileCopy,
  profilePages,
  profilePageCopy,
  hubCopy,
  faqs.attachmentStyles,
  faqs.profiles,
]);

describe("profile copy — Section 9.4", () => {
  it.each(IDS)("%s meets checkProfileCopy (120–180 word description, all fields)", (id) => {
    expect(checkProfileCopy(id, profileCopy[id])).toEqual([]);
  });

  it("secure carries all three lean paragraphs, each naming its lean", () => {
    const leans = profileCopy.secure.leans!;
    expect(leans.anxious).toMatch(/anxious lean/);
    expect(leans.avoidant).toMatch(/avoidant lean/);
    expect(leans.mixed).toMatch(/mixed lean/);
  });

  it("risk paragraphs name what Section 9.4 requires", () => {
    expect(profileCopy.anxious.noContactRisk).toMatch(/message-checking/);
    expect(profileCopy.anxious.noContactRisk).toMatch(/reconciliation fantasies/);
    expect(profileCopy.avoidant.noContactRisk).toMatch(/delayed grief/);
    expect(profileCopy.avoidant.noContactRisk).toMatch(/rebound dating/);
    expect(profileCopy["fearful-avoidant"].noContactRisk).toMatch(/oscillation/);
  });

  it("is gender-neutral, so a future audience can reuse it (Section 2.3)", () => {
    const text = strings(profileCopy).join("\n");
    expect(text).not.toMatch(/\b(she|her|hers|he|him|his|girlfriend|boyfriend)\b/i);
  });

  it("next steps point at Section 6 routes", () => {
    const valid = new Set<string>(Object.values(routes));
    for (const id of IDS) {
      for (const step of profileCopy[id].nextSteps) expect(valid).toContain(step.href);
    }
  });

  it("each profile's route is its id under /attachment-styles/", () => {
    for (const id of IDS) expect(profiles[id].route).toBe(`${routes.attachmentStyles}${id}/`);
  });
});

describe("language rules — Section 14.2", () => {
  it("scans the copy", () => {
    expect(pageStrings.length).toBeGreaterThan(80);
  });

  it("contains no prohibited term", () => {
    const prohibited =
      /therap|counsell?ing|treatment|diagnos|clinically|mental-health assessment|disorder|\bcure\b|guarantee|get (your ex|her|him|them) back|regret leaving|miss you/i;
    expect(pageStrings.filter((s) => prohibited.test(s))).toEqual([]);
  });

  it("never calls the reader's pattern a condition or an identity", () => {
    const identity =
      /\byou (have|suffer from) (an? )?(anxious|avoidant|fearful|secure|attachment)/i;
    expect(pageStrings.filter((s) => identity.test(s))).toEqual([]);
  });

  it("promises no recovery timeline", () => {
    const timeline = /\b(over (her|him|them|it) in|heal(ed)? in|within \d+ days)\b/i;
    expect(pageStrings.filter((s) => timeline.test(s))).toEqual([]);
  });

  it("describes the quiz with the Section 14.2 framing", () => {
    expect(profilePageCopy.quizCta.body).toMatch(
      /a self-reflection assessment informed by attachment research/,
    );
  });
});

describe("schema — Section 12.2", () => {
  it.each([
    ["hub", faqs.attachmentStyles] as const,
    ...IDS.map((id) => [id, faqs.profiles[id]] as const),
  ])("%s FAQPage validates", (_name, items) => {
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(validateJsonLd(faqSchema(items))).toEqual([]);
  });

  it("profile breadcrumbs validate", () => {
    const trail = [
      { name: "Home", path: routes.home },
      { name: "Attachment styles", path: routes.attachmentStyles },
      { name: profiles.anxious.name, path: profiles.anxious.route },
    ];
    expect(validateJsonLd(breadcrumbSchema(trail))).toEqual([]);
  });

  it("the validator rejects prohibited and malformed schema", () => {
    expect(
      validateJsonLd({ "@context": "https://schema.org", "@type": "MedicalWebPage" }),
    ).not.toEqual([]);
    expect(
      validateJsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Q", acceptedAnswer: { "@type": "Answer", text: "" } },
        ],
      }),
    ).not.toEqual([]);
    expect(
      validateJsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Q",
            author: { "@type": "Person", name: "X" },
            acceptedAnswer: { "@type": "Answer", text: "A" },
          },
        ],
      }),
    ).toContain("root.mainEntity[0].author: prohibited type Person");
    expect(
      validateJsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ "@type": "ListItem", position: 2, name: "Home", item: "/" }],
      }),
    ).toHaveLength(2);
  });
});
