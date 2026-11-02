import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AffiliateSlot } from "@/components/content/AffiliateSlot";
import { FounderNote } from "@/components/content/FounderNote";
import { affiliateSlots, type AffiliateSlot as Slot } from "@/config/affiliates";
import { guides, situationalTemplate } from "@/config/content";
import { routes, tools } from "@/config/site";
import { affiliateDisclosure, honestFraming } from "@/content/compliance";
import { allGuides, guideContent, toolBlocks } from "@/content/guides";
import type { Block, Guide } from "@/content/guides/types";
import { home } from "@/content/home";
import { resourcesPage } from "@/content/resources";
import { checkSlotCopy, renderableSlot, slotLimitFor } from "@/lib/affiliates";
import { routeMetadata } from "@/lib/seo/metadata";
import { articleSchema, faqSchema, validateJsonLd } from "@/lib/seo/schema";

/**
 * Session 10 — guides, the situational template, the resources page, the homepage hub,
 * affiliate slots and FounderNote.
 */

const ROOT = path.resolve(__dirname, "../..");
const SECTION_6 = new Set<string>(Object.values(routes));

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const blocksOf = (guide: Guide): Block[] =>
  guide.kind === "article"
    ? guide.sections.flatMap((s) => [...s.blocks])
    : [...guide.whySpikes, ...guide.normal];

const pageStrings = strings([allGuides, toolBlocks, home, resourcesPage]);

describe("guide registry — Section 12.3", () => {
  it("ships the five launch guides, each a Section 6 route with content and metadata", () => {
    expect(guides.map((g) => g.route)).toEqual([
      routes.noContactRule,
      routes.guideAfterBreakup,
      routes.guideHowLong,
      routes.guideDay14,
      routes.guideSheTexted,
    ]);
    for (const g of guides) {
      expect(SECTION_6).toContain(g.route);
      expect(guideContent(g.route).kind).toBe(g.kind);
      expect(routeMetadata[g.route]).toBeDefined();
    }
  });

  it("every guide ends with a real tool and a different sibling guide (Section 6)", () => {
    const toolKeys = tools.map((t) => t.key);
    const guideRoutes = guides.map((g) => g.route);
    for (const g of guides) {
      expect(toolKeys).toContain(g.tool);
      expect(guideRoutes).toContain(g.sibling);
      expect(g.sibling).not.toBe(g.route);
    }
  });

  it("matches the briefs' tool blocks", () => {
    const toolOf = (route: string) => guides.find((g) => g.route === route)!.tool;
    expect(toolOf(routes.noContactRule)).toBe("tracker");
    expect(toolOf(routes.guideAfterBreakup)).toBe("quiz");
    expect(toolOf(routes.guideHowLong)).toBe("tracker");
    expect(toolOf(routes.guideDay14)).toBe("tracker");
    expect(toolOf(routes.guideSheTexted)).toBe("decision");
  });

  it("dates are ISO and last-reviewed is never before published", () => {
    for (const g of guides) {
      expect(g.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(g.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(g.lastReviewed >= g.datePublished).toBe(true);
    }
  });

  it("every in-content link points at a Section 6 route", () => {
    const hrefs = allGuides.flatMap((g) =>
      blocksOf(g).flatMap((b) => ("links" in b ? b.links.map((l) => l.href) : [])),
    );
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) expect(SECTION_6).toContain(href);
  });
});

describe("situational template — Section 12.3", () => {
  const situational = allGuides.filter((g) => g.kind === "situational");

  it("is proven on both launch instances", () => {
    expect(situational.map((g) => g.route)).toEqual([routes.guideDay14, routes.guideSheTexted]);
  });

  it("defines why it spikes, what's normal, three mistakes, the next 24 hours — in order", () => {
    expect(situationalTemplate.sections.map((s) => s.key)).toEqual([
      "whySpikes",
      "normal",
      "mistakes",
      "next24",
    ]);
  });

  it.each(situational.map((g) => [g.route, g] as const))("%s fills every section", (_r, g) => {
    if (g.kind !== "situational") throw new Error("not situational");
    expect(g.intro.length).toBeGreaterThan(0);
    expect(g.whySpikes.length).toBeGreaterThan(0);
    expect(g.normal.length).toBeGreaterThan(0);
    expect(g.mistakes).toHaveLength(3);
    expect(g.next24.length).toBeGreaterThanOrEqual(3);
  });
});

describe("language rules — Sections 12.5 and 14.2", () => {
  it("scans the copy", () => {
    expect(pageStrings.length).toBeGreaterThan(150);
  });

  it("contains no prohibited term", () => {
    const prohibited =
      /therap|counsell?ing|treatment|diagnos|clinically|mental-health assessment|disorder|\bcure\b|guarantee|get (your ex|her|him|them) back|regret leaving|miss you/i;
    expect(pageStrings.filter((s) => prohibited.test(s))).toEqual([]);
  });

  it("promises no recovery timeline", () => {
    const timeline =
      /\b(over (her|him|them|it) in|heal(ed)? in|within \d+ days|by day \d+ you('ll| will))\b/i;
    expect(pageStrings.filter((s) => timeline.test(s))).toEqual([]);
  });

  it("carries no byline (Section 12.5)", () => {
    expect(
      pageStrings.filter((s) => /\bby the [\w ]+ team\b|\breviewed by\b|^by [A-Z]/i.test(s)),
    ).toEqual([]);
  });

  it("new content sources hardcode no partner pronouns (Section 2.3)", () => {
    const dir = path.join(ROOT, "content/guides");
    const files = [
      ...readdirSync(dir).map((f) => path.join("content/guides", f)),
      "content/resources.ts",
      "content/home.ts",
    ];
    const hits = files.flatMap((rel) =>
      readFileSync(path.join(ROOT, rel), "utf8")
        .split("\n")
        .filter((line) => !line.startsWith("import "))
        .filter((line) => /\b(she|her|hers|he|him|his)\b/i.test(line))
        .map((line) => `${rel}: ${line.trim()}`),
    );
    expect(hits).toEqual([]);
  });

  it("resources name no URL, price or payout (Section 13.4)", () => {
    const text = strings(resourcesPage).join("\n");
    expect(text).not.toMatch(/https?:|www\.|\$|\d+%|commission rate|payout/i);
  });
});

describe("compliance copy — verbatim", () => {
  it("Section 14.5 disclosure", () => {
    expect(affiliateDisclosure.text).toBe(
      "We may earn a commission if you buy through links on this page. It doesn't change what we recommend first or what you'll pay.",
    );
  });

  it("Section 13.4 honest-framing line", () => {
    expect(honestFraming.text).toBe(
      "Some men want to try to reconcile; some want to move on. These are different goals — pick the resource for the goal you actually have.",
    );
  });
});

describe("affiliate slots — Section 13.4", () => {
  const enabled: Slot = {
    id: "test-slot",
    page: "/test/",
    position: "test",
    enabled: true,
    heading: "A book worth reading",
    body: "A clear introduction to attachment.",
    ctaLabel: "See the book",
    url: "https://example.com/book",
    disclosureId: "proximity",
  };

  it("all ship disabled at launch", () => {
    expect(affiliateSlots.filter((s) => s.enabled)).toEqual([]);
  });

  it("respect the per-page limit (two, or four on the resources page)", () => {
    const perPage = new Map<string, number>();
    for (const s of affiliateSlots) perPage.set(s.page, (perPage.get(s.page) ?? 0) + 1);
    for (const [page, count] of perPage) expect(count).toBeLessThanOrEqual(slotLimitFor(page));
  });

  it("every slot referenced by guide or resource content exists", () => {
    const ids = [
      ...allGuides.flatMap((g) => blocksOf(g).flatMap((b) => ("slot" in b ? [b.slot] : []))),
      ...resourcesPage.pattern.resources.map((r) => r.slotId),
      ...resourcesPage.deeper.resources.map((r) => r.slotId),
    ];
    expect(ids).toContain("guide-how-long-in-content");
    for (const id of ids) expect(() => renderableSlot(id)).not.toThrow();
  });

  it("a disabled slot renders nothing at all", () => {
    expect(renderToStaticMarkup(<AffiliateSlot id="resources-1" />)).toBe("");
    expect(
      renderToStaticMarkup(
        <AffiliateSlot id="test-slot" slots={[{ ...enabled, enabled: false }]} />,
      ),
    ).toBe("");
  });

  it("an enabled but incomplete slot renders nothing", () => {
    const html = renderToStaticMarkup(
      <AffiliateSlot id="test-slot" slots={[{ ...enabled, url: undefined }]} />,
    );
    expect(html).toBe("");
  });

  it("an enabled slot renders the disclosure first, in body size, with sponsored rel", () => {
    const html = renderToStaticMarkup(<AffiliateSlot id="test-slot" slots={[enabled]} />);
    const disclosureAt = html.indexOf(affiliateDisclosure.text.slice(0, 30));
    expect(disclosureAt).toBeGreaterThan(-1);
    expect(disclosureAt).toBeLessThan(html.indexOf(enabled.heading!));
    expect(html).toMatch(/<p class="[^"]*\btext-body\b[^"]*" data-testid="affiliate-disclosure">/);
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).toContain('href="https://example.com/book"');
  });

  it("an unknown slot id fails loudly", () => {
    expect(() => renderableSlot("no-such-slot")).toThrow(/Unknown affiliate slot/);
  });

  it("slot copy may not promise an outcome or quote money", () => {
    expect(checkSlotCopy(enabled)).toEqual([]);
    expect(checkSlotCopy({ ...enabled, body: "Make her regret it." })).not.toEqual([]);
    expect(checkSlotCopy({ ...enabled, body: "Earn 75% back." })).not.toEqual([]);
    expect(checkSlotCopy({ ...enabled, heading: "Only $47" })).not.toEqual([]);
    expect(checkSlotCopy({ ...enabled, body: "Learn the basics." })).toEqual([]);
    for (const slot of affiliateSlots) expect(checkSlotCopy(slot)).toEqual([]);
  });
});

describe("FounderNote — Section 12.5", () => {
  it("renders a heading and paragraphs, and no media wrapper when media is empty", () => {
    const html = renderToStaticMarkup(<FounderNote heading="A note" body={["One.", "Two."]} />);
    expect(html).toContain("<h2");
    expect(html).toContain("A note");
    expect(html.match(/<p/g)).toHaveLength(2);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("mb-4");
  });

  it("renders the optional media slot when given", () => {
    const html = renderToStaticMarkup(
      <FounderNote body="Body." media={<span data-media="yes">media</span>} />,
    );
    expect(html).toContain('data-media="yes"');
    expect(html).not.toContain("<h2");
  });

  it("is used on zero pages at launch", () => {
    const users = ["app", "components"].flatMap((dir) =>
      readdirSync(path.join(ROOT, dir), { recursive: true, encoding: "utf8" })
        .filter((f) => /\.tsx?$/.test(f) && !f.endsWith("FounderNote.tsx"))
        .filter((f) => readFileSync(path.join(ROOT, dir, f), "utf8").includes("FounderNote"))
        .map((f) => `${dir}/${f}`),
    );
    expect(users).toEqual([]);
  });
});

describe("schema — Section 12.2", () => {
  it.each(guides.map((g) => [g.route, g] as const))("%s Article validates", (route, g) => {
    const schema = articleSchema({
      route,
      headline: guideContent(route).h1,
      description: routeMetadata[route]!.description,
      datePublished: g.datePublished,
      dateModified: g.lastReviewed,
    });
    expect(validateJsonLd(schema)).toEqual([]);
  });

  it("guide FAQs validate", () => {
    for (const g of allGuides) if (g.faqs) expect(validateJsonLd(faqSchema(g.faqs))).toEqual([]);
  });

  it("rejects a Person author and a modified date before publication", () => {
    const base = articleSchema({
      route: routes.guideDay14,
      headline: "H",
      description: "D",
      datePublished: "2026-11-01",
      dateModified: "2026-11-01",
    });
    expect(validateJsonLd({ ...base, author: { "@type": "Person", name: "X" } })).not.toEqual([]);
    expect(validateJsonLd({ ...base, dateModified: "2026-10-01" })).not.toEqual([]);
  });
});
