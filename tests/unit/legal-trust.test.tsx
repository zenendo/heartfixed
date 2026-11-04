import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SelfReflectionDisclaimer } from "@/components/content/ComplianceBlocks";
import { legal } from "@/config/legal";
import { quizConfig } from "@/config/quiz";
import { routes } from "@/config/site";
import { routeMetadata } from "@/lib/seo/metadata";
import { affiliateDisclosure, blockA, blockB } from "@/content/compliance";
import { crisisPage, verifiedInternationalLines, type InternationalLine } from "@/content/crisis";
import type { Block, Section } from "@/content/guides/types";
import { affiliateDisclosurePage } from "@/content/legal/affiliate-disclosure";
import { privacyPolicy } from "@/content/legal/privacy";
import { termsOfUse } from "@/content/legal/terms";
import { QUIZ_QUESTION_COUNT, aboutPage, contactPage, methodologyPage } from "@/content/trust";

/** Session 11 — the legal and trust pages against Sections 14.1–14.5. */

const ROOT = path.resolve(__dirname, "../..");

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [String((value as (n: number) => string)(2))];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const textOf = (sections: readonly Section[]) =>
  sections.flatMap((s) => [s.heading, ...s.blocks.flatMap((b: Block) => strings(b))]).join("\n");
const headings = (sections: readonly Section[]) => sections.map((s) => s.heading);
const linksOf = (sections: readonly Section[]) =>
  sections.flatMap((s) =>
    s.blocks.flatMap((b) => ("links" in b ? b.links.map((l) => l.href) : [])),
  );

describe("Block A — self-reflection disclaimer (Section 14.3)", () => {
  // Copied from the spec. If this fails, the copy changed: do NOT edit this string.
  const BLOCK_A =
    "This assessment is a self-reflection tool informed by attachment research. It is not a medical or psychological diagnosis, it is not therapy, and it is not a substitute for professional support. Only a qualified professional who knows your full situation can assess your mental health. If you are struggling, please consider talking to a licensed professional.";

  it("is stored verbatim", () => {
    expect(blockA.text).toBe(BLOCK_A);
  });

  it("renders verbatim in readable body-size type", () => {
    const html = renderToStaticMarkup(<SelfReflectionDisclaimer />);
    expect(html.replace(/<[^>]+>/g, "")).toBe(BLOCK_A);
    expect(html).toContain("text-body");
    expect(html).not.toMatch(/text-(small|sm)\b/);
  });
});

describe("Privacy Policy — Section 14.4", () => {
  const text = textOf(privacyPolicy.sections) + privacyPolicy.intro.join("\n");

  it("covers every required topic", () => {
    expect(headings(privacyPolicy.sections)).toEqual(
      expect.arrayContaining([
        "What stays in your browser",
        "What we collect",
        "What we never collect",
        "Cookies and analytics",
        "Email",
        "Who we share data with",
        "Affiliate links",
        "How long we keep data",
        "Your choices and requests",
      ]),
    );
  });

  it("lists the browser-local data and the consequence of clearing it", () => {
    expect(text).toMatch(/quiz answers/i);
    expect(text).toMatch(/tracker/i);
    expect(text).toMatch(/unsent/i);
    expect(text).toMatch(/clearing your browser data erases it/i);
    expect(text).toMatch(/can't recover it/i);
  });

  it("names providers by category, says no sale, and no sharing of self-reflection content", () => {
    expect(text).toMatch(/An email provider/);
    expect(text).toMatch(/An analytics provider/);
    expect(text).toMatch(/never sell/i);
    expect(text).toMatch(/never share your self-reflection content/i);
    expect(text).toMatch(/including affiliate programmes/i);
  });

  it("names everything the result-email request carries (founder-approved, 2026-11-04)", () => {
    // Session B: the two pronoun answers.
    expect(text).toContain(
      "It also sends the two pronoun answers you chose at the start of the quiz, so the email uses the same words as your result page; like the scores, they're used only to write that one email and aren't stored.",
    );
    // Quiz v3: the three "how it ended" answers the email needs (b1, b2, b5).
    expect(text).toContain(
      "It also sends three of your answers about how the relationship ended (who ended it, how the ending arrived, and what happened just before), so the email can include the part of your result about the ending; like the scores, they're used only to write that one email and aren't stored.",
    );
    expect(legal.lastUpdated[routes.privacy]).toBe("2026-11-04");
  });

  it("says what an affiliate click shares — and what it doesn't", () => {
    expect(text).toMatch(/affiliate parameters/);
    expect(text).toMatch(/nothing about your results/i);
  });

  it("states retention from config, one-click unsubscribe, and a contact route", () => {
    expect(text).toContain(`${legal.listInactivityPurgeMonths} months`);
    expect(text).toMatch(/one-click unsubscribe/i);
    expect(linksOf(privacyPolicy.sections)).toContain(routes.contact);
  });

  it("keeps the three email actions separate (Section 13.1)", () => {
    expect(text).toMatch(/It does not add you to any list/);
    expect(text).toMatch(/never subscribes you/);
  });
});

describe("Terms of Use — Section 14.4", () => {
  const text = textOf(termsOfUse.sections);

  it("covers every required topic", () => {
    expect(headings(termsOfUse.sections)).toEqual(
      expect.arrayContaining([
        "What this site is for",
        "No professional relationship",
        "Results are self-reflection, not diagnosis",
        "Acceptable use",
        "Intellectual property",
        "Limitation of liability",
        "Contact",
      ]),
    );
  });

  it("mirrors Block B verbatim", () => {
    expect(text).toContain(blockB.text);
  });

  it("states the adults-only positioning and links crisis resources", () => {
    expect(text).toContain(`adults (${legal.minimumAge}+)`);
    expect(linksOf(termsOfUse.sections)).toEqual(
      expect.arrayContaining([routes.crisis, routes.contact, routes.methodology]),
    );
  });
});

describe("Affiliate Disclosure — Section 14.5", () => {
  const { doc, status } = affiliateDisclosurePage;
  const text = textOf(doc.sections);

  it("quotes the proximity sentence verbatim", () => {
    expect(text).toContain(affiliateDisclosure.text);
  });

  it("says money never changes results, recommendation order, or tool behaviour", () => {
    expect(text).toMatch(/quiz result/i);
    expect(text).toMatch(/order of recommendations/i);
    expect(text).toMatch(/how any tool behaves/i);
  });

  it("claims own use only where a resource is flagged (none are yet)", () => {
    expect(text).not.toMatch(/used these ourselves/i);
  });

  it("has a status line for none and for some", () => {
    expect(status.none).toMatch(/no links/);
    expect(status.some(1)).toMatch(/one placement/);
    expect(status.some(3)).toMatch(/3 placements/);
  });
});

describe("About, Contact, Methodology", () => {
  it("About states adults (18+) and links the crisis page (Section 14.1)", () => {
    expect(aboutPage.forWho.paragraphs.join(" ")).toContain("For adults (18+)");
    expect(aboutPage.links.items.map((l) => l.href)).toEqual(
      expect.arrayContaining([routes.crisis, routes.methodology]),
    );
  });

  it("Contact uses the Section 14.4 response-expectation line", () => {
    expect(contactPage.expectations).toBe(
      "Replies within a few days; this site cannot help with emergencies — see Crisis Resources.",
    );
  });

  it("Methodology takes every number from config/quiz.ts", () => {
    const text = strings(methodologyPage).join("\n");
    const { bankRules, bands } = quizConfig;
    expect(text).toContain(`${bankRules.scoredItems} questions about you`);
    expect(text).toContain(`${bankRules.itemsPerDimension} for attachment anxiety`);
    expect(text).toContain(`low (0–${bands.lowMax})`);
    expect(text).toContain(`high (${bands.moderateMax + 1}–100)`);
    expect(methodologyPage.scale.labels).toEqual(quizConfig.likert.labels);
    expect(text).toContain(quizConfig.contextNote);
    expect(text).toContain(quizConfig.likert.partnerLabels.join(", "));
  });

  it("Methodology counts the full quiz: 18 + 12 + 6 + 5 + 2 (v3 amendment brief)", () => {
    const text = strings(methodologyPage).join("\n");
    expect(QUIZ_QUESTION_COUNT).toBe(43);
    expect(text).toContain(
      "43 questions in all, one per screen, in five parts: about you, about her, since the breakup, how it ended, and where you are now.",
    );
    expect(text).toContain(
      "5 questions about how it ended. These do not change your scores; they change how the result explains what happened.",
    );
    expect(text).toContain(
      "18 questions about you, which give your scores: 9 for attachment anxiety and 9 for attachment avoidance.",
    );
    expect(text).toContain(
      "3 of the questions about you are worded the other way round (2 for attachment anxiety, 1 for attachment avoidance)",
    );
    expect(text).toContain("12 questions about how she showed up");
    expect(text).toContain("6 for each of the same two dimensions");
    expect(text).toContain("6 questions about what she's done since the breakup");
    expect(text).toContain('"Sometimes" or more');
    expect(text).toContain("2 optional context questions");
    expect(routeMetadata[routes.methodology]!.description).toContain(
      `its ${QUIZ_QUESTION_COUNT} questions`,
    );
    // Verbatim from the v3 amendment brief, 7.
    const meta = routeMetadata[routes.quiz]!.description!;
    expect(meta).toBe(
      "A free attachment style quiz for men: 43 questions about what you did, what your ex did, and how it ended. Full result free, no signup.",
    );
    expect(meta).toHaveLength(135);
    expect(
      readFileSync(path.resolve(__dirname, "../../heartfixed-quiz-v3-amendment-brief.md"), "utf8"),
    ).toContain(`(135 characters, inside the 155 cap): "${meta}"`);
  });

  it("Methodology describes the partner read in the founder's wording", () => {
    const text = strings(methodologyPage).join("\n");
    expect(text).not.toMatch(/anything about your ex/i);
    expect(text).toContain(
      "The quiz also asks how your partner showed up in the same relationship. Those answers describe the pattern you experienced",
    );
    expect(text).toContain(
      "We show that read because understanding the dynamic you were in is part of understanding the breakup.",
    );
  });

  it("Methodology uses the required framing and states the source discipline", () => {
    const text = strings(methodologyPage).join("\n");
    expect(methodologyPage.framing).toContain(
      "a self-reflection assessment informed by attachment research",
    );
    expect(text).toMatch(/not a clinical instrument/i);
    expect(text).toMatch(/original to this site/i);
  });

  it("Methodology never mentions the attention check (Section 9.2)", () => {
    expect(strings(methodologyPage).join("\n")).not.toMatch(/attention|reading check/i);
  });
});

describe("Crisis Resources — Section 14.3", () => {
  const usText = strings(crisisPage.us).join("\n");

  it("lists 988 (call/text) and the Crisis Text Line (text HOME to 741741)", () => {
    expect(usText).toMatch(/Call or text 988/);
    expect(usText).toMatch(/Text HOME to 741741/);
  });

  it("publishes no international number from memory", () => {
    expect(crisisPage.international.lines).toEqual([]);
  });

  it("renders an international line only with a source page and a check date", () => {
    const base = { country: "X", name: "Line", how: "Call 1" };
    const lines: InternationalLine[] = [
      { ...base, sourceUrl: "https://example.org/help", verifiedOn: "2026-11-01" },
      { ...base, sourceUrl: "", verifiedOn: "2026-11-01" },
      { ...base, sourceUrl: "https://example.org/help", verifiedOn: "" },
      { ...base, sourceUrl: "http://example.org/help", verifiedOn: "2026-11-01" },
    ];
    expect(verifiedInternationalLines(lines)).toHaveLength(1);
  });
});

describe("language rules — Section 14.2", () => {
  // Legal pages may explain prohibited terms; trust pages may not (outside Blocks A/B).
  const trustStrings = strings([aboutPage, contactPage, methodologyPage, crisisPage]);
  const prohibited =
    /therap|counsell?ing|treatment|diagnos|clinically proven|mental-health assessment|disorder|\bcure\b|guarantee|get (your ex|her|him|them) back/i;

  it("trust and crisis copy contains no prohibited term", () => {
    expect(trustStrings.filter((s) => prohibited.test(s))).toEqual([]);
  });

  it("no new page claims a subscription, trial or membership (Section 5.2)", () => {
    const all = [...trustStrings, ...strings([privacyPolicy, termsOfUse, affiliateDisclosurePage])];
    expect(all.filter((s) => /subscription|free trial|membership/i.test(s))).toEqual([]);
  });

  it("new source files hardcode no partner pronouns (Section 2.3)", () => {
    const files = [
      "content/trust.ts",
      "content/crisis.ts",
      "content/legal/privacy.ts",
      "content/legal/terms.ts",
      "content/legal/affiliate-disclosure.ts",
    ];
    const hits = files.flatMap((rel) =>
      readFileSync(path.join(ROOT, rel), "utf8")
        .split("\n")
        .filter((line) => /\b(she|her|hers|he|him|his)\b/i.test(line))
        .map((line) => `${rel}: ${line.trim()}`),
    );
    expect(hits).toEqual([]);
  });
});
