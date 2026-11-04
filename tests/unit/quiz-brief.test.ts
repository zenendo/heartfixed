import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PRONOUN_IDS, pronounTerms } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import { QUIZ_MINUTES, runnerCopy } from "@/content/quiz";
import { QUIZ_QUESTION_COUNT } from "@/content/trust";
import {
  attentionCheck,
  herQuestions,
  questions,
  renderStem,
  sinceBreakupSelectors,
} from "@/lib/quiz";
import { dashless } from "./support/dashless";

/**
 * Session 4 — the founder-approved quiz build brief is the content source (Part A).
 * This parses the brief's own tables and checks the shipped data against them word for
 * word, so the data can't drift from what the founder approved.
 *
 * Session A (quiz v2) — the v2 amendment brief wins where the two disagree. Its Part 1
 * cuts, weight move and stem edits are parsed from the amendment itself and applied on
 * top of the Nov 2 tables, so both documents stay the checked source.
 */

const root = path.resolve(__dirname, "../..");
const brief = readFileSync(path.join(root, "heartfixed-quiz-build-brief.md"), "utf8");
const amendment = readFileSync(path.join(root, "heartfixed-quiz-v2-amendment-brief.md"), "utf8");

/** The text of an amendment section, from its heading to the next "## ". */
function section(heading: string): string {
  const start = amendment.indexOf(heading);
  expect(start, heading).toBeGreaterThan(-1);
  const rest = amendment.slice(start + heading.length);
  const end = rest.indexOf("\n## ");
  return end === -1 ? rest : rest.slice(0, end);
}

/** 1.1: the bolded ids in the two cut lists. */
const CUTS = [...section("## 1.1 The cuts").matchAll(/\*\*(q\d\d)\*\*/g)].map((m) => m[1]!);
/** 1.3: every `- **id:** "stem"` rewording, keyed by id. */
const REWORDED = new Map(
  [...section("## 1.3 Rewordings").matchAll(/^- \*\*([qha]\d+):\*\* "(.+?)"/gm)].map((m) => [
    m[1]!,
    m[2]!,
  ]),
);
/** 1.2: the 0.5 anchor moves from q24 to q20. */
const V2_WEIGHTS: Record<string, number> = { q20: 0.5 };
const stemFor = (id: string, nov2: string) => REWORDED.get(id) ?? nov2;

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

describe("the amendment parses as expected", () => {
  it("six cuts, three per dimension, and ten rewordings", () => {
    expect(CUTS).toEqual(["q11", "q17", "q21", "q04", "q10", "q24"]);
    expect([...REWORDED.keys()]).toEqual([
      ...["q07", "q08", "q13", "q16", "q18", "q22"],
      ...["h4", "h5", "h12"],
      ...["a1", "a3", "a5", "a6"],
    ]);
    expect(section("## 1.2 Weights and scoring")).toMatch(/the 0\.5 weight moves to q20/);
  });
});

describe("his 18 match the briefs exactly (Nov 2 table, v2 amendment applied)", () => {
  const rows = table("## His 24").filter((r) => !CUTS.includes(r[0]!));

  it("same ids, in the same order, after the cuts", () => {
    expect(rows).toHaveLength(18);
    expect(questions.map((q) => q.id)).toEqual(rows.map((r) => r[0]));
  });

  it.each(rows)("%s: dimension, reversal, weight and wording", (id, dim, rev, wt, stem) => {
    const q = questions.find((x) => x.id === id)!;
    expect(q.dimension).toBe(dim);
    expect(q.reversed).toBe(rev === "yes");
    expect(q.weight).toBe(V2_WEIGHTS[id] ?? Number(wt));
    expect(renderStem(q)).toMatch(dashless(stemFor(id, stem)));
  });
});

describe("her 12 match the briefs exactly (v2 rewordings applied)", () => {
  const rows = table("## Her 12");

  it("same ids, in the same order", () => {
    expect(herQuestions.map((q) => q.id)).toEqual(rows.map((r) => r[0]));
  });

  it.each(rows)("%s: dimension and wording", (id, dim, stem) => {
    const q = herQuestions.find((x) => x.id === id)!;
    expect(`her-${q.dimension}`).toBe(dim);
    expect(renderStem(q)).toMatch(dashless(stemFor(id, stem)));
  });
});

describe("since-the-breakup selectors match the briefs exactly (v2 rewordings applied)", () => {
  const rows = table("## Since-the-breakup selectors");

  it("same ids, in the same order", () => {
    expect(sinceBreakupSelectors.map((s) => s.id)).toEqual(rows.map((r) => r[0]));
  });

  it.each(rows)("%s: wording", (id, stem) => {
    expect(renderStem(sinceBreakupSelectors.find((s) => s.id === id)!)).toMatch(
      dashless(stemFor(id, stem)),
    );
  });
});

describe("framing and scale (brief, Part A)", () => {
  it("the instruction line before question 1", () => {
    expect(brief).toContain(`**"${quizConfig.instruction}"**`);
  });

  it("the attention check wording, and position 7: after roughly the first third of his 18", () => {
    expect(brief).toContain(`"${attentionCheck.stem}"`);
    expect(section("## 1.1 The cuts")).toMatch(/after roughly the first third of his items/);
    expect(attentionCheck.position - 1).toBe(questions.length / 3);
  });

  it("the five scale labels and values", () => {
    const labels = quizConfig.likert.labels.map((label, value) => `${label} (${value})`);
    expect(brief).toContain(`Scale for every scored item: ${labels.join(", ")}.`);
  });
});

describe("time estimates", () => {
  it(`every "N questions about what you actually did" says ${QUIZ_QUESTION_COUNT}`, () => {
    const found = ["app", "components", "content", "lib"].flatMap((dir) =>
      readdirSync(path.join(root, dir), { recursive: true, encoding: "utf8" })
        .filter((f) => /\.tsx?$/.test(f))
        .flatMap((f) =>
          [
            ...readFileSync(path.join(root, dir, f), "utf8").matchAll(
              /(\d+) questions about what you (actually )?did/gi,
            ),
          ].map((m) => `${dir}/${f}: ${m[1]}`),
        ),
    );
    // The quiz meta description, the homepage card, the FAQ, the profile callout, the guide.
    expect(found).toHaveLength(5);
    expect(found.filter((f) => !f.endsWith(`: ${QUIZ_QUESTION_COUNT}`))).toEqual([]);
  });

  it(`the count is 38: 18 + 12 + 6 + 2 (v2 amendment brief, 1.1)`, () => {
    expect(QUIZ_QUESTION_COUNT).toBe(38);
    expect(section("## 1.1 The cuts")).toContain(
      "Counted questions drop from 44 to **38** (18 + 12 + 6 + 2)",
    );
  });

  it(`every "about N minutes" for the quiz says ${QUIZ_MINUTES}`, () => {
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

  it('labels the partner section "About your ex: N of 12" (v2 amendment brief, 1.5)', () => {
    expect(section("## 1.5 Count-dependent copy")).toContain('"About your ex: N of 12"');
    expect(runnerCopy.progress.her(3, 12)).toBe("About your ex: 3 of 12");
    expect(runnerCopy.progress.his(3, 18)).toBe("Question 3 of 18");
  });

  it("frames the switch to the partner's questions with the amendment's line (2.3)", () => {
    const template = /\*\*Partner module framing line:\*\* "(.+?)"/.exec(amendment)![1]!;
    expect(template).toBe(
      "Now think about {p-object} in the same relationship: how {p-subject} showed up, as you experienced it.",
    );
    for (const id of PRONOUN_IDS) {
      const p = pronounTerms[id];
      expect(runnerCopy.herIntro(p)).toBe(
        template.replace("{p-object}", p.object).replace("{p-subject}", p.subject),
      );
    }
  });

  it("asks the two pronoun questions in the amendment's words (2.1)", () => {
    const section = amendment.slice(amendment.indexOf("## 2.1"), amendment.indexOf("## 2.2"));
    expect(section).toContain(`"${runnerCopy.pronouns.intro}"`);
    expect(section).toContain(`**"${runnerCopy.pronouns.taker}"**`);
    expect(section).toContain(`**"${runnerCopy.pronouns.partner}"**`);
    const options = Object.values(runnerCopy.pronouns.options);
    expect(section).toContain(`options **${options[0]}**, **${options[1]}**, **${options[2]}**`);
  });
});
