import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrisisFooterLine } from "@/components/layout/CrisisFooterLine";
import { Footer } from "@/components/layout/Footer";
import { CrisisBlock, ToolDisclaimer } from "@/components/content/ComplianceBlocks";
import { blockB, blockC } from "@/content/compliance";

// Section 14.3, Block C — copied from the spec. If this test fails, the copy changed:
// do NOT edit this string to make it pass.
const BLOCK_C =
  "If you are in crisis or thinking about harming yourself, call or text 988 (US Suicide and Crisis Lifeline, 24/7) or call your local emergency number. You deserve support from a person, right now — not a website.";

const textOf = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'");

describe("Block C — crisis line (Section 14.3)", () => {
  it("is stored verbatim", () => {
    expect(blockC.text).toBe(BLOCK_C);
    expect(blockC.text.split(blockC.emphasis)).toHaveLength(2);
  });

  it("renders verbatim with 988 in bold", () => {
    const html = renderToStaticMarkup(<CrisisFooterLine />);
    expect(textOf(html)).toBe(BLOCK_C);
    expect(html).toContain("<strong>988</strong>");
  });

  it("renders in body-size text, never small print, on the calm crisis panel", () => {
    const html = renderToStaticMarkup(<CrisisFooterLine />);
    expect(html).toContain("text-body");
    expect(html).not.toMatch(/text-(small|sm)\b/);
    expect(html).toContain("bg-crisis");
    expect(html).toContain("border-primary");
  });

  it("renders inside the footer", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html.startsWith("<footer")).toBe(true);
    expect(textOf(html)).toContain(BLOCK_C);
  });

  it("footer links the affiliate disclosure and crisis resources", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain('href="/affiliate-disclosure/"');
    expect(html).toContain('href="/crisis-resources/"');
  });
});

// Section 14.3, Blocks B and D — copied from the spec. Do NOT edit these to make a test
// pass. Block B names the settled brand; Block D's crisis-page reference renders as a
// link labelled "Crisis Resources" (Section 14.3 implementation note).
const BLOCK_B =
  "HeartFixed provides educational tools and information about attachment patterns and breakup recovery. It does not provide therapy, counselling, medical, or mental-health advice, and using this site does not create a therapist, counsellor, or clinician relationship of any kind.";
const BLOCK_D_SPEC =
  "If things feel heavier than a breakup: heartbreak can bring up thoughts of harming yourself, and there is no shame in that — but a website is not the right help for it. In the US, call or text 988 any time, day or night, to reach the Suicide and Crisis Lifeline. If you are outside the US, the `/crisis-resources/` page lists international helplines, and your local emergency number always works. Please reach out to a person today.";
const BLOCK_D = BLOCK_D_SPEC.replace("`/crisis-resources/`", "Crisis Resources");

describe("Block B — not-therapy disclaimer (Section 14.3)", () => {
  it("renders verbatim, with the brand from config", () => {
    expect(blockB.text).toBe(BLOCK_B);
    expect(textOf(renderToStaticMarkup(<ToolDisclaimer />))).toBe(BLOCK_B);
  });

  it("is readable, not small print", () => {
    expect(renderToStaticMarkup(<ToolDisclaimer />)).not.toMatch(/text-small\b/);
  });
});

describe("Block D — crisis block (Section 14.3)", () => {
  const html = renderToStaticMarkup(<CrisisBlock />);

  it("renders verbatim, with only the crisis-page reference turned into a link", () => {
    expect(textOf(html)).toBe(BLOCK_D);
    expect(html).toMatch(/<a [^>]*href="\/crisis-resources\/"[^>]*>Crisis Resources<\/a>/);
  });

  it("bolds the lead-in and 988, in body-size text on the calm crisis panel", () => {
    expect(html).toContain("<strong>If things feel heavier than a breakup:</strong>");
    expect(html).toContain("<strong>988</strong>");
    expect(html).toContain("text-body");
    expect(html).toContain("bg-crisis");
  });
});
