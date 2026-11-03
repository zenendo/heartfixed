import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  bridgeTools,
  bridges,
  caveat,
  decodeFallback,
  decodes,
  dynamics,
  herReads,
  programmeLine,
  resultCopy,
} from "@/content/quiz-result";
import { routes } from "@/config/site";
import { profileCopy, sinceBreakupSelectors, type ProfileId } from "@/lib/quiz";

/**
 * Session 5 — the result view's content against the founder-approved brief (Part B),
 * word for word. Founder-approved changes (2026-11-02) are applied to the brief's text
 * before comparing, and listed here so nothing else can drift:
 * - Section 14.2: "can't diagnose her" → "can't label her"; "manufacture a diagnosis"
 *   → "manufacture a villain".
 * - The decode fallback says "the read above", since it renders after the reads.
 * - The profiles' third-person lines speak to the reader ("you"): PRONOUN_CHANGES.
 * - So do her reads and the dynamics (founder decision, 2026-11-03): READ_CHANGES.
 */

const brief = readFileSync(path.resolve(__dirname, "../../heartfixed-quiz-build-brief.md"), "utf8");
const partB = brief.slice(brief.indexOf("# Part B"), brief.indexOf("# Part C"));

const SUBSTITUTIONS: [string, string][] = [
  ["it can't diagnose her", "it can't label her"],
  ["manufacture a diagnosis", "manufacture a villain"],
  // The fallback renders after Acts 1 and 2, so the read is above it (2026-11-03).
  ["changes the read below", "changes the read above"],
];
const approved = (text: string) =>
  SUBSTITUTIONS.reduce((t, [from, to]) => t.replace(from, to), text);

/** The brief's section bodies, keyed by their "### " heading. */
function sections(from: string, to: string): Map<string, string> {
  const body = partB.slice(partB.indexOf(from), partB.indexOf(to));
  const map = new Map<string, string>();
  for (const block of body.split("\n### ").slice(1)) {
    const [head, ...rest] = block.split("\n");
    map.set(head!.trim(), rest.join("\n").trim());
  }
  return map;
}

const IDS: Record<string, ProfileId> = {
  Secure: "secure",
  Anxious: "anxious",
  Avoidant: "avoidant",
  "Fearful-Avoidant": "fearful-avoidant",
};

/** The brief's numbered list, "(1) a. (2) b. (3) c." */
const numbered = (text: string) =>
  text
    .split(/\(\d\)\s*/)
    .slice(1)
    .map((s) => s.trim());

/** Brief line → shipped line, for the founder's second-person change. */
const PRONOUN_CHANGES: Record<string, string> = {
  "He can usually name what he misses, keep routines going, and talk to friends without turning every conversation into a case for getting back together.":
    "You can usually name what you miss, keep routines going, and talk to friends without turning every conversation into a case for getting back together.",
  'Treating a calm week as proof he is "done" and dropping his boundaries early.':
    'Treating a calm week as proof you are "done" and dropping your boundaries early.',
  "Can name what he feels without acting on every feeling.":
    "You can name what you feel without acting on every feeling.",
  "Keeps daily routines going under stress.": "You keep daily routines going under stress.",
  "Can end contact cleanly and mean it.": "You can end contact cleanly and mean it.",
  "Notices his own feelings quickly.": "You notice your own feelings quickly.",
  "Willing to talk honestly when he feels safe.":
    "You're willing to talk honestly when you feel safe.",
  "Cares deeply and shows up when it counts.": "You care deeply and show up when it counts.",
  "He may say he is fine, stay busy, and date again quickly — then find the old feelings surfacing weeks later, often aimed at the wrong person.":
    "You may say you are fine, stay busy, and date again quickly — then find the old feelings surfacing weeks later, often aimed at the wrong person.",
  "Can stay calm under pressure.": "You can stay calm under pressure.",
  "Values independence and can hold boundaries.": "You value independence and can hold boundaries.",
  "Practical about daily life even in a hard week.":
    "You're practical about daily life even in a hard week.",
  "Sees both sides of a situation quickly.": "You see both sides of a situation quickly.",
  "Can be deeply honest once he slows down.": "You can be deeply honest once you slow down.",
  "Knows what closeness costs — and what it is worth.":
    "You know what closeness costs — and what it is worth.",
};
/** Brief phrase → shipped phrase, for her reads and the dynamics. Each occurs once. */
const READ_CHANGES: [string, string][] = [
  ["heard his side", "heard your side"],
  ["When he was upset", "When you were upset"],
  ["checked up when he was out", "checked up when you were out"],
  ["asked whether he still loved", "asked whether you still loved"],
  ["felt him pull away", "felt you pull away"],
  ["when he tried to get", "when you tried to get"],
  ["in him, in the fit", "in you, in the fit"],
  ["His vulnerability made", "Your vulnerability made"],
  ["compartments he wasn't invited into", "compartments you weren't invited into"],
  ["shutdowns predated him", "shutdowns predated you"],
  [
    "less-needy version of him would have fixed it",
    "less-needy version of you would have fixed it",
  ],
  ["could pursue him hard", "could pursue you hard"],
  ["needing to know he still loved", "needing to know you still loved"],
  ["almost any move he made rang", "almost any move you made rang"],
  ["a puzzle he failed to solve", "a puzzle you failed to solve"],
  ["a message about him", "a message about you"],
  ["restarts his own clock", "restarts your own clock"],
  ["His pattern treats distance as danger", "Your pattern treats distance as danger"],
  ["his alarm fired and he pursued", "your alarm fired and you pursued"],
  ["the more he chased", "the more you chased"],
  ["withdrawal was his alarm's loudest", "withdrawal was your alarm's loudest"],
  ["still ringing his alarm every day", "still ringing your alarm every day"],
  ["What protects him specifically", "What protects you specifically"],
  ["and he's the only side he controls", "and you're the only side you control"],
  ["with him in the other seat", "with you in the other seat"],
  ["His pattern needed room", "Your pattern needed room"],
  ["so he deflected", "so you deflected"],
  ["confirmed his belief that closeness", "confirmed your belief that closeness"],
  ["his distance confirmed", "your distance confirmed"],
  ["Two things he deserves to hear plainly", "Two things you deserve to hear plainly"],
  ["First: his withdrawal was a pattern", "First: your withdrawal was a pattern"],
  ["he'll be tempted to cast himself as", "you'll be tempted to cast yourself as"],
  ["His recovery risk in this pairing", "Your recovery risk in this pairing"],
  ["His no-contact can't run", "Your no-contact can't run"],
  ["the 1 a.m. version of him makes choices", "the 1 a.m. version of you makes choices"],
  ["The risk for him now isn't contact", "The risk for you now isn't contact"],
  ["the processing he skips", "the processing you skip"],
  ["a code he failed to crack", "a code you failed to crack"],
  ["and he can hand it back", "and you can hand it back"],
  ["If it was him: his work starts", "If it was you: your work starts"],
  ["If he leaned secure and", "If you leaned secure and"],
  [
    "didn't, his profile section holds his (smaller)",
    "didn't, your profile section holds your (smaller)",
  ],
  [
    "leaned secure and he didn't, his pattern did",
    "leaned secure and you didn't, your pattern did",
  ],
  ["in his own read", "in your own read"],
];
const inReads = (text: string) => READ_CHANGES.reduce((t, [from, to]) => t.replace(from, to), text);

const converted = (text: string) =>
  Object.entries(PRONOUN_CHANGES).reduce((t, [from, to]) => t.replace(from, to), text);

const NEXT_STEP_HREFS: Record<string, string> = {
  "No-contact tracker": routes.tracker,
  '"Should I text my ex?" decision tool': routes.decision,
  'guide "Attachment Styles After a Breakup."': routes.guideAfterBreakup,
  'guide "The No Contact Rule."': routes.noContactRule,
  'guide "How Long Does a Breakup Take?"': routes.guideHowLong,
};

describe("his profiles (Act 2) match the brief", () => {
  const profilesBrief = sections("## His profiles (Act 2)", "## Her reads");

  for (const [name, id] of Object.entries(IDS)) {
    const body = profilesBrief.get(name)!;
    const field = (label: string) =>
      new RegExp(`- \\*\\*${label}:\\*\\* (.*)`).exec(body)?.[1]?.trim() ?? "";

    it(`${name}: description, after a breakup and risk`, () => {
      const copy = profileCopy[id];
      expect(copy.description).toBe(field("Description"));
      expect(copy.afterBreakup).toBe(converted(field("After a breakup")));
      expect(copy.noContactRisk).toBe(field("No-contact risk"));
    });

    it(`${name}: watch-outs and strengths`, () => {
      const copy = profileCopy[id];
      expect(copy.watchOuts).toEqual(numbered(field("Watch-outs")).map(converted));
      expect(copy.strengths).toEqual(numbered(field("Strengths")).map(converted));
    });

    it(`${name}: next steps`, () => {
      const hrefs = field("Next steps")
        .split("; ")
        .map((s) => NEXT_STEP_HREFS[s.trim()]);
      expect(profileCopy[id].nextSteps.map((s) => s.href)).toEqual(hrefs);
    });
  }

  it("every second-person change maps a line that is in the brief", () => {
    for (const from of Object.keys(PRONOUN_CHANGES)) expect(partB).toContain(from);
    for (const [from] of READ_CHANGES) expect(partB.split(from)).toHaveLength(2);
  });

  it("her reads and the dynamics speak to the reader as you", () => {
    const text = JSON.stringify({ herReads, dynamics });
    expect(text).not.toMatch(/\b(he|him|his|himself)\b/i);
  });

  it("the secure lean lines use the brief's template", () => {
    expect(profileCopy.secure.leans!.anxious).toBe(
      "Broadly secure, with an anxious lean — under breakup stress, the pattern below is the one to watch.",
    );
    expect(partB).toContain(profileCopy.secure.leans!.anxious);
  });
});

describe("Act 1, decodes, dynamics and bridges match the brief", () => {
  it("the caveat block", () => {
    const quoted = /### Caveat block[^\n]*\n\n> (.*)/.exec(partB)![1]!;
    expect(`**${caveat.lead}** ${caveat.body}`).toBe(approved(quoted));
    expect(caveat.body).toContain("it can't label her");
  });

  it("her four reads: paragraphs, means / doesn't mean, since the breakup", () => {
    const reads = sections("## Her reads", "## Since-the-breakup decodes");
    for (const [name, id] of Object.entries(IDS)) {
      const lines = inReads(reads.get(`${name} (as experienced)`)!)
        .split("\n")
        .filter(Boolean);
      const read = herReads[id];
      expect(read.paragraphs).toEqual(lines.filter((l) => !l.startsWith("**")));
      expect(`**Means / doesn't mean:** ${read.means}`).toBe(
        lines.find((l) => l.startsWith("**Means")),
      );
      expect(`**Since the breakup:** ${read.since}`).toBe(
        lines.find((l) => l.startsWith("**Since")),
      );
    }
    expect(resultCopy.herHeadline("Avoidant")).toBe("Her pattern, as you experienced it: Avoidant");
  });

  it("the six decodes, one per selector", () => {
    const brief6 = sections("## Since-the-breakup decodes", "## Dynamic reads");
    expect(Object.keys(decodes)).toEqual(sinceBreakupSelectors.map((s) => s.id));
    for (const [head, body] of brief6) {
      const [id, heading] = head.split(" — ");
      expect(decodes[id!]).toEqual({ heading, body });
    }
    expect(approved(brief)).toContain(`the result shows: "${decodeFallback}"`);
  });

  it("the six dynamic reads", () => {
    const brief6 = sections("## Dynamic reads", "## Act 3 bridges");
    const shipped = Object.values(dynamics);
    expect(shipped).toHaveLength(6);
    for (const [head, body] of brief6) {
      const title = head.split(" — ")[1]!;
      const dynamic = shipped.find((d) => d.title.toLowerCase() === title.toLowerCase())!;
      expect(dynamic.paragraphs).toEqual(inReads(approved(body)).split("\n").filter(Boolean));
    }
    expect(dynamics["secure-involved"].paragraphs[0]).toContain("manufacture a villain");
  });

  it("the four bridges, their tools, and the programme line", () => {
    const body = partB.slice(
      partB.indexOf("## Act 3 bridges"),
      partB.indexOf("\n---", partB.indexOf("## Act 3")),
    );
    for (const [name, id] of Object.entries(IDS)) {
      const line = new RegExp(`- \\*\\*${name}:\\*\\* (.*)`).exec(body)![1]!;
      const [text, tools] = line.split(/ \(Tools: /);
      expect(bridges[id]).toBe(text);
      const expected = tools!
        .replace(/\.?\)$/, "")
        .split(", ")
        .map(
          (t) =>
            ({
              tracker: routes.tracker,
              "decision tool": routes.decision,
              'guide "How Long Does a Breakup Take?"': routes.guideHowLong,
              'guide "Attachment Styles After a Breakup."': routes.guideAfterBreakup,
              'guide "Attachment Styles After a Breakup"': routes.guideAfterBreakup,
            })[t],
        );
      expect(bridgeTools[id].map((s) => s.href)).toEqual(expected);
    }
    expect(body).toContain(`"${programmeLine.replace(/\.$/, ",")}"`);
  });
});

describe("Section 14.2 over the result content", () => {
  const all = JSON.stringify({
    caveat,
    herReads,
    decodes,
    dynamics,
    bridges,
    resultCopy,
    profileCopy,
  });

  it("contains no prohibited term", () => {
    expect(all).not.toMatch(
      /therap|counsell?ing|treatment|diagnos|clinically|mental-health assessment|disorder|\bcure\b|guarantee|get (your ex|her|him|them) back|win (her|him|them) back|regret leaving|make her miss you/i,
    );
  });

  it("takes partner pronouns and nouns from config/copy.ts, never writes them in", () => {
    const source = readFileSync(path.resolve(__dirname, "../../content/quiz-result.ts"), "utf8");
    // The text only: every string and template literal in the file.
    const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    const text = (code.match(/`[^`]*`|"[^"\n]*"/g) ?? []).join("\n");
    expect(text.length).toBeGreaterThan(10_000);
    expect(text).not.toMatch(/\b(she|her|hers|herself|woman|women)\b/i);
  });

  it("resolves every partner token", () => {
    expect(all).not.toMatch(/\$\{|\{(subject|object|possessive|reflexive)\}|undefined/);
  });
});
