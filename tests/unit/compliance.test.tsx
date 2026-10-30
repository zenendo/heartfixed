import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrisisFooterLine } from "@/components/layout/CrisisFooterLine";
import { Footer } from "@/components/layout/Footer";
import { blockC } from "@/content/compliance";

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
