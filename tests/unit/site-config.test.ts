import { describe, expect, it } from "vitest";
import { affiliatePrograms, affiliateSlots } from "@/config/affiliates";
import { PRONOUN_IDS, copy, pronounTerms } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import { redirects } from "@/config/redirects";
import { footerNav, noindexRoutes, routes, site, tools } from "@/config/site";

describe("config/site.ts — settled brand (Section 1.3)", () => {
  it("ships the settled brand and domain", () => {
    expect(site.name).toBe("HeartFixed");
    expect(site.domain).toBe("heartfixed.com");
    expect(site.url).toBe("https://heartfixed.com");
  });

  it("has no social handles at launch (Section 12.5)", () => {
    expect(Object.keys(site.social)).toHaveLength(0);
  });
});

describe("routes — Section 6 URL map", () => {
  const all = Object.values(routes);

  it("defines exactly the 23 Section 6 routes", () => {
    expect(all).toHaveLength(23);
    expect(new Set(all).size).toBe(all.length);
  });

  it("uses trailing slashes on every route", () => {
    for (const r of all) expect(r).toMatch(/^\/([a-z0-9-]+\/)*$/);
  });

  it("marks only the results shell noindex", () => {
    expect(noindexRoutes).toEqual(["/attachment-style-quiz/results/"]);
  });

  it("lists the three tools in nav order", () => {
    expect(tools.map((t) => t.href)).toEqual([routes.quiz, routes.tracker, routes.decision]);
  });

  it("footer carries the tools, Crisis Resources, About, Methodology, Privacy, Terms, Affiliate Disclosure, Contact", () => {
    const hrefs = footerNav.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs.sort()).toEqual(
      [
        routes.quiz,
        routes.tracker,
        routes.decision,
        routes.crisis,
        routes.about,
        routes.methodology,
        routes.privacy,
        routes.terms,
        routes.affiliateDisclosure,
        routes.contact,
      ].sort(),
    );
  });

  it("ships only the founder-approved /quiz/ short address before launch", () => {
    expect(redirects).toEqual([{ source: "/quiz/", destination: routes.quiz }]);
  });
});

describe("config/affiliates.ts — Section 13.4", () => {
  it("ships every slot disabled", () => {
    expect(affiliateSlots.length).toBeGreaterThan(0);
    for (const slot of affiliateSlots) expect(slot.enabled, slot.id).toBe(false);
  });

  it("builds the full slot inventory (4 result, tracker, decision, 4 resources, email 5, guide 3)", () => {
    expect(affiliateSlots).toHaveLength(12);
    expect(new Set(affiliateSlots.map((s) => s.id)).size).toBe(12);
  });

  it("has no programmes, URLs, or offer copy at launch", () => {
    expect(affiliatePrograms).toEqual([]);
    for (const slot of affiliateSlots) {
      expect(slot.url).toBeUndefined();
      expect(slot.programKey).toBeUndefined();
    }
  });
});

describe("config/quiz.ts and config/copy.ts", () => {
  it("uses the men-v2 question set (v2 amendment, Section 9.1) and Section 9.3 band edges", () => {
    expect(quizConfig.questionSetVersion).toBe("men-v2");
    expect(quizConfig.bands).toEqual({ lowMax: 33, moderateMax: 66 });
  });

  it("defaults partner references to she/her for the men's beachhead (Section 2.3)", () => {
    expect(copy.audience).toBe("men");
    expect(copy.partner).toBe(pronounTerms.she);
    expect(copy.taker).toBe(pronounTerms.he);
  });

  it("carries the amendment's three token sets, with plural agreement for they (2.2)", () => {
    expect(PRONOUN_IDS).toEqual(["he", "she", "they"]);
    const row = (id: (typeof PRONOUN_IDS)[number]) => {
      const t = pronounTerms[id];
      return [
        t.subject,
        t.object,
        t.possessive,
        t.possessivePronoun,
        t.reflexive,
        t.was,
        t.has,
        t.is,
        t.does,
      ];
    };
    expect(row("he")).toEqual(["he", "him", "his", "his", "himself", "was", "has", "is", "does"]);
    expect(row("she")).toEqual([
      "she",
      "her",
      "her",
      "hers",
      "herself",
      "was",
      "has",
      "is",
      "does",
    ]);
    expect(row("they")).toEqual([
      "they",
      "them",
      "their",
      "theirs",
      "themselves",
      "were",
      "have",
      "are",
      "do",
    ]);
    // 2.3's noun mapping: man / woman / person, men / women / people.
    expect(PRONOUN_IDS.map((id) => pronounTerms[id].noun)).toEqual(["man", "woman", "person"]);
    expect(PRONOUN_IDS.map((id) => pronounTerms[id].nounPlural)).toEqual([
      "men",
      "women",
      "people",
    ]);
    expect(PRONOUN_IDS.map((id) => pronounTerms[id].plural)).toEqual([false, false, true]);
  });
});
