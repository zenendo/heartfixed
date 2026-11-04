import { describe, expect, it } from "vitest";
import { dynamicLeanLines, resultContentFor } from "@/content/quiz-result";
import { dynamicFor, pronounContext, profileFor, type Band } from "@/lib/quiz";

const ctx = pronounContext();
const { dynamics } = resultContentFor(ctx);

const BANDS: Band[] = ["low", "moderate", "high"];

/**
 * Session 5 — the dynamic-read composition rule (quiz build brief, Part B): six
 * archetypal reads, and every other pairing composed by dimension. Checked over all
 * 81 combinations of his bands × her bands.
 */

const side = (anxietyBand: Band, avoidanceBand: Band) => ({
  anxietyBand,
  avoidanceBand,
  profileId: profileFor(anxietyBand, avoidanceBand),
});

const COMBOS = BANDS.flatMap((a) => BANDS.map((v) => side(a, v)));

describe("dynamicFor — the six archetypes", () => {
  it.each([
    ["high", "low", "low", "high", "anxious-avoidant"],
    ["low", "high", "high", "low", "avoidant-anxious"],
    ["high", "low", "high", "low", "anxious-anxious"],
    ["low", "high", "low", "high", "avoidant-avoidant"],
    ["high", "high", "low", "low", "swing"],
    ["low", "low", "high", "high", "swing"],
    ["low", "low", "high", "low", "secure-involved"],
    ["high", "low", "low", "low", "secure-involved"],
  ] as const)("him %s/%s × her %s/%s → %s", (ha, hv, sa, sv, id) => {
    expect(dynamicFor(side(ha, hv), side(sa, sv))).toEqual({
      id,
      youLean: "none",
      herLean: "none",
    });
  });
});

describe("dynamicFor — composition across all 81 pairings", () => {
  const pairs = COMBOS.flatMap((you) => COMBOS.map((her) => ({ you, her })));

  it("covers 81 pairings, each with a read that exists", () => {
    expect(pairs).toHaveLength(81);
    for (const { you, her } of pairs) expect(dynamics[dynamicFor(you, her).id]).toBeDefined();
  });

  it("fearful-avoidant on either side is always the swing", () => {
    for (const { you, her } of pairs) {
      if (you.profileId === "fearful-avoidant" || her.profileId === "fearful-avoidant") {
        expect(dynamicFor(you, her).id).toBe("swing");
      }
    }
  });

  it("a secure lean borrows its pattern, and the view names that lean", () => {
    // Broadly secure with an anxious lean × avoidant: the pursue–withdraw loop.
    expect(dynamicFor(side("moderate", "low"), side("low", "high"))).toEqual({
      id: "anxious-avoidant",
      youLean: "anxious",
      herLean: "none",
    });
    // Avoidant × her broadly secure with a mixed lean: no lean to borrow.
    expect(dynamicFor(side("low", "high"), side("moderate", "moderate"))).toMatchObject({
      id: "secure-involved",
    });
    // Both broadly secure, his lean avoidant and hers anxious: the mirror loop.
    expect(dynamicFor(side("low", "moderate"), side("moderate", "low"))).toEqual({
      id: "avoidant-anxious",
      youLean: "avoidant",
      herLean: "anxious",
    });
  });

  it("a mixed lean or a low/low secure reads as secure-involved", () => {
    for (const { you, her } of pairs) {
      const fa = you.profileId === "fearful-avoidant" || her.profileId === "fearful-avoidant";
      const plainSecure = (s: typeof you) =>
        s.profileId === "secure" &&
        ((s.anxietyBand === "low" && s.avoidanceBand === "low") ||
          (s.anxietyBand === "moderate" && s.avoidanceBand === "moderate"));
      if (!fa && (plainSecure(you) || plainSecure(her))) {
        expect(dynamicFor(you, her).id).toBe("secure-involved");
      }
    }
  });

  it("lean lines appear only for a lean that chose the read, and render cleanly", () => {
    for (const { you, her } of pairs) {
      const pick = dynamicFor(you, her);
      const lines = dynamicLeanLines(pick, ctx);
      const expected = [pick.youLean, pick.herLean].filter((l) => l !== "none").length;
      expect(lines).toHaveLength(expected);
      if (pick.id === "swing" || pick.id === "secure-involved") expect(lines).toEqual([]);
      for (const line of lines) {
        expect(line).toMatch(/^(You're|As you experienced her)/);
        expect(line).not.toMatch(/\$\{|undefined/);
      }
    }
  });
});
