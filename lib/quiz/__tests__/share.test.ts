import { describe, expect, it } from "vitest";
import { decodeShareToken, encodeShareToken, scoreQuiz, shareLink } from "@/lib/quiz";
import { COMPLETED_AT, fixture2, fixture3, tempBank } from "./fixtures";

const opts = { completedAt: COMPLETED_AT };

describe("Fixture 7 — share token round-trip (Section 9.6)", () => {
  const results = [
    scoreQuiz(fixture2.answers, tempBank, opts),
    scoreQuiz(fixture3.answers, tempBank, opts),
    { version: "men-v1", anxietyNorm: 72, avoidanceNorm: 18 },
    { version: "men-v1", anxietyNorm: 0, avoidanceNorm: 100 },
  ];

  it.each(results)("round-trips %# to the identical profile, scores and version", (result) => {
    const decoded = decodeShareToken(encodeShareToken(result));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.result).toMatchObject({
      version: result.version,
      anxietyNorm: result.anxietyNorm,
      avoidanceNorm: result.avoidanceNorm,
      isCurrentVersion: true,
    });
    if ("profileId" in result) {
      expect(decoded.result.profileId).toBe(result.profileId);
      expect(decoded.result.anxietyBand).toBe(result.anxietyBand);
      expect(decoded.result.avoidanceBand).toBe(result.avoidanceBand);
    }
  });

  it("matches the Section 9.6 shape: v=men-v1&a=72&v2=18", () => {
    expect(encodeShareToken({ version: "men-v1", anxietyNorm: 72, avoidanceNorm: 18 })).toBe(
      "v=men-v1&a=72&v2=18",
    );
    expect(shareLink({ version: "men-v1", anxietyNorm: 72, avoidanceNorm: 18 })).toBe(
      "/attachment-style-quiz/results/?v=men-v1&a=72&v2=18",
    );
  });

  it("carries scores and version only — never answers, raw sums, dates, or flags", () => {
    const full = scoreQuiz(fixture3.answers, tempBank, opts);
    const keys = [...new URLSearchParams(encodeShareToken(full)).keys()];
    expect(keys).toEqual(["v", "a", "v2"]);
  });

  it.each([
    ["score above 100", "v=men-v1&a=150&v2=18"],
    ["negative score", "v=men-v1&a=-1&v2=18"],
    ["non-numeric score", "v=men-v1&a=abc&v2=18"],
    ["decimal score", "v=men-v1&a=7.5&v2=18"],
    ["leading zero", "v=men-v1&a=072&v2=18"],
    ["missing score", "v=men-v1&a=72"],
    ["repeated score", "v=men-v1&a=72&a=10&v2=18"],
    ["missing version", "a=72&v2=18"],
    ["unsafe version", "v=<script>&a=72&v2=18"],
    ["empty token", ""],
  ])("rejects a tampered token: %s", (_label, token) => {
    expect(decodeShareToken(token)).toEqual({ ok: false });
  });

  it("recomputes the profile from scores and ignores any extra parameters", () => {
    const decoded = decodeShareToken("v=men-v1&a=10&v2=10&profile=fearful-avoidant&q01=4");
    expect(decoded).toMatchObject({ ok: true, result: { profileId: "secure" } });
  });

  it("flags tokens from an older question set rather than rejecting them", () => {
    expect(decodeShareToken("v=men-v0&a=72&v2=18")).toMatchObject({
      ok: true,
      result: { version: "men-v0", isCurrentVersion: false, profileId: "anxious" },
    });
  });

  it("accepts URLSearchParams as well as strings", () => {
    expect(decodeShareToken(new URLSearchParams("v=men-v1&a=72&v2=18")).ok).toBe(true);
  });

  it("refuses to encode an out-of-range result", () => {
    expect(() =>
      encodeShareToken({ version: "men-v1", anxietyNorm: 101, avoidanceNorm: 0 }),
    ).toThrow();
  });
});
