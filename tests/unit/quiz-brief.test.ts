import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { quizConfig } from "@/config/quiz";
import { QUIZ_MINUTES, runnerCopy } from "@/content/quiz";
import {
  attentionCheck,
  herQuestions,
  questions,
  renderStem,
  sinceBreakupSelectors,
} from "@/lib/quiz";

/**
 * Session 4 — the founder-approved quiz build brief is the content source (Part A).
 * This parses the brief's own tables and checks the shipped data against them word for
 * word, so the data can't drift from what the founder approved.
 */

const brief = readFileSync(path.resolve(__dirname, "../../heartfixed-quiz-build-brief.md"), "utf8");

/** Rows of the markdown table that follows `heading`, as trimmed cells. */
function table(heading: string): string[][] {
  const start = brief.indexOf(heading);
  expect(start, heading).toBeGreaterThan(-1);
  const lines = brief.slice(start).split("\n").slice(1);
  const rows: string[][] = [];
  for (const line of lines) {
    if (!line.startsWith("|")) {
      if (rows.length > 0) break;
      continue;
    }
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (/^-+$/.test(cells[0]!) || cells[0] === "ID") continue;
    rows.push(cells);
  }
  return rows;
}

describe("his 24 match the brief exactly", () => {
  const rows = table("## His 24");

  it("same ids, in the same order", () => {
    expect(questions.map((q) => q.id)).toEqual(rows.map((r) => r[0]));
  });

  it.each(rows)("%s: dimension, reversal, weight and wording", (id, dim, rev, wt, stem) => {
    const q = questions.find((x) => x.id === id)!;
    expect(q.dimension).toBe(dim);
    expect(q.reversed).toBe(rev === "yes");
    expect(q.weight).toBe(Number(wt));
    expect(renderStem(q)).toBe(stem);
  });
});

describe("her 12 match the brief exactly", () => {
  const rows = table("## Her 12");

  it("same ids, in the same order", () => {
    expect(herQuestions.map((q) => q.id)).toEqual(rows.map((r) => r[0]));
  });

  it.each(rows)("%s: dimension and wording", (id, dim, stem) => {
    const q = herQuestions.find((x) => x.id === id)!;
    expect(`her-${q.dimension}`).toBe(dim);
    expect(renderStem(q)).toBe(stem);
  });
});

describe("since-the-breakup selectors match the brief exactly", () => {
  const rows = table("## Since-the-breakup selectors");

  it("same ids, in the same order", () => {
    expect(sinceBreakupSelectors.map((s) => s.id)).toEqual(rows.map((r) => r[0]));
  });

  it.each(rows)("%s: wording", (id, stem) => {
    expect(renderStem(sinceBreakupSelectors.find((s) => s.id === id)!)).toBe(stem);
  });
});

describe("framing and scale (brief, Part A)", () => {
  it("the instruction line before question 1", () => {
    expect(brief).toContain(`**"${quizConfig.instruction}"**`);
  });

  it("the attention check wording and position 13", () => {
    expect(brief).toContain(`"${attentionCheck.stem}"`);
    expect(brief).toMatch(/inserted at runner position 13/);
    expect(attentionCheck.position).toBe(13);
  });

  it("the five scale labels and values", () => {
    const labels = quizConfig.likert.labels.map((label, value) => `${label} (${value})`);
    expect(brief).toContain(`Scale for every scored item: ${labels.join(", ")}.`);
  });
});

describe("time estimates", () => {
  it(`every "about N minutes" for the quiz says ${QUIZ_MINUTES}`, () => {
    const root = path.resolve(__dirname, "../..");
    const found = ["app", "components", "content", "lib"].flatMap((dir) =>
      readdirSync(path.join(root, dir), { recursive: true, encoding: "utf8" })
        .filter((f) => /\.tsx?$/.test(f))
        .flatMap((f) =>
          [...readFileSync(path.join(root, dir, f), "utf8").matchAll(/about (\d+) minutes/gi)].map(
            (m) => `${dir}/${f}: ${m[1]}`,
          ),
        ),
    );
    expect(found.length).toBeGreaterThan(5);
    expect(found.filter((f) => !f.endsWith(`: ${QUIZ_MINUTES}`))).toEqual([]);
  });
});

/** Founder changes made after the brief, on review of the Session 4 preview. */
describe("founder review changes", () => {
  it('her items and the selectors drop "like me"; his keep it', () => {
    expect(quizConfig.likert.partnerLabels).toEqual([
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Almost always",
    ]);
    expect(quizConfig.likert.labels[0]).toBe("Never like me");
    expect(quizConfig.likert.labels[4]).toBe("Almost always like me");
  });

  it("frames the switch to her questions", () => {
    expect(runnerCopy.herIntro).toBe(
      "Now think about her in the same relationship — how she showed up, as you experienced it.",
    );
  });
});
