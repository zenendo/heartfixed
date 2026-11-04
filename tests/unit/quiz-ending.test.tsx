import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResultView } from "@/components/quiz/ResultView";
import { pronounTerms } from "@/config/copy";
import { runnerCopy } from "@/content/quiz";
import { assembleEnding, endingContentFor, type EndingContent } from "@/content/quiz-ending";
import { buildResultEmail, resultFromToken } from "@/lib/email/resultEmail";
import { emailRequestSchema } from "@/lib/email/validate";
import {
  attentionCheck,
  completeAttempt,
  dynamicFor,
  emptyProgress,
  encodeShareToken,
  endingAnswersFrom,
  endingFitFor,
  endingQuestions,
  pronounContext,
  renderStem,
  sinceBreakupSelectors,
  type EndingAnswers,
  type PronounChoice,
  type QuizAnswer,
  type SavedQuiz,
} from "@/lib/quiz";
import { fixture1, fixture4, herFixtures } from "@/lib/quiz/__tests__/fixtures";

/**
 * Quiz v3 — "How it ended" (heartfixed-quiz-v3-amendment-brief.md, 8, acceptance).
 * The copy source is heartfixed-how-it-ended-copy-draft.md: everything below is checked
 * against the draft's own text, parsed here, on the default rendering (he/him taker,
 * she/her partner), which is the draft's canonical rendering.
 */

const ROOT = path.resolve(__dirname, "../..");
const draft = readFileSync(path.join(ROOT, "heartfixed-how-it-ended-copy-draft.md"), "utf8");
const brief = readFileSync(path.join(ROOT, "heartfixed-quiz-v3-amendment-brief.md"), "utf8");

/** The `**Label.** "text"` blocks under one draft heading, in order. */
function blocks(heading: string): { label: string; text: string }[] {
  const start = draft.indexOf(heading);
  expect(start, heading).toBeGreaterThan(-1);
  const rest = draft.slice(start + heading.length);
  const end = rest.search(/\n#{2,3} /);
  return [...(end === -1 ? rest : rest.slice(0, end)).matchAll(/^\*\*(.+?)\*\* "(.*)"$/gm)].map(
    (m) => ({ label: m[1]!, text: m[2]! }),
  );
}

const quoted = (label: string) => new RegExp(`${label}: "(.+?)"`).exec(draft)?.[1];

const content = endingContentFor(pronounContext());

describe("the questions match the copy draft (v3 brief, 2)", () => {
  const rows = [...draft.matchAll(/^- (b\d)\. (.+?\?) (.+)$/gm)];

  it("five questions, b1 to b5, after the selectors and before the context questions", () => {
    expect(rows.map((r) => r[1])).toEqual(endingQuestions.map((q) => q.id));
    expect(draft).toContain("## The questions (after the selectors, before the context questions)");
  });

  it.each(rows.map((r) => [r[1]!, r[2]!, r[3]!]))(
    "%s: stem and options, in order",
    (id, stem, opts) => {
      const q = endingQuestions.find((x) => x.id === id)!;
      expect(renderStem(q)).toBe(stem);
      expect(q.options.map((o) => renderStem({ id, stem: o.label }))).toEqual(opts.split(" / "));
    },
  );

  it("the intro line and the progress label", () => {
    expect(runnerCopy.endingIntro).toBe(quoted("Intro line"));
    expect(brief).toContain(`Intro line (from the copy draft): "${runnerCopy.endingIntro}"`);
    expect(runnerCopy.progress.ending(3, 5)).toBe("How it ended: 3 of 5");
    expect(brief).toContain('Progress label for the block: "How it ended: N of 5"');
  });
});

describe("the segment copy matches the draft word for word (v3 brief, 4)", () => {
  const sections: [string, keyof EndingContent, string[]][] = [
    ["### Arrival reads (b2)", "arrival", ["blindsided", "distance", "event", "cycles"]],
    ["### Initiator blocks (b1)", "initiator", ["partner", "me", "together", "faded"]],
    [
      "### Delivery notes (b3)",
      "delivery",
      ["in-person", "call-or-message", "went-quiet", "unclear"],
    ],
    ["### Reason lines (b4)", "reason", ["made-sense", "mismatch", "none", "kept-changing"]],
    ["### Trigger blocks (b5)", "trigger", ["closer", "fight", "distant", "on-off"]],
    ["### Fit lines", "fit", ["avoidant", "fearful", "explosion", "anxious"]],
    ["## Act 3 bridge additions", "bridge", ["blindsided", "me"]],
  ];

  it.each(sections)("%s", (heading, field, keys) => {
    const found = blocks(heading);
    expect(found).toHaveLength(keys.length);
    const shipped = content[field] as Record<string, string>;
    expect(Object.keys(shipped)).toEqual(keys);
    keys.forEach((key, i) => expect(shipped[key], `${field}.${key}`).toBe(found[i]!.text));
  });

  it("each option's block is keyed to that option (labels line up with the answers)", () => {
    const labels = blocks("### Arrival reads (b2)").map((b) => b.label);
    expect(labels).toEqual([
      "Blindsided.",
      "Weeks of distance.",
      "One specific argument or event.",
      "Repeated breakups and reconciliations.",
    ]);
    expect(blocks("### Initiator blocks (b1)").map((b) => b.label)).toEqual([
      "She ended it.",
      "I ended it.",
      "We decided together.",
      "It faded out.",
    ]);
  });

  it("the heading, the intro line and the closing caution", () => {
    expect(brief).toContain(`Heading: "${content.heading}"`);
    expect(content.intro).toBe(quoted("Segment intro line"));
    const caution = /### Closing caution[^\n]*\n\n"(.+)"/.exec(draft)![1];
    expect(content.caution).toBe(caution);
  });
});

// ---- Scores are provably unchanged by the b answers (v3 brief, 8) ------------------

const NOW = new Date("2026-11-04T12:00:00.000Z");
const ALL_SELECTORS: QuizAnswer[] = sinceBreakupSelectors.map((s) => ({
  questionId: s.id,
  value: 3,
}));

function saved({
  his = fixture1.answers,
  her = herFixtures.h1.answers,
  ending,
  pronouns = { taker: "he", partner: "she" },
}: {
  his?: readonly QuizAnswer[];
  her?: readonly QuizAnswer[];
  ending?: EndingAnswers;
  pronouns?: PronounChoice;
}): SavedQuiz {
  const progress = emptyProgress(NOW);
  for (const a of [...his, ...her, ...ALL_SELECTORS]) progress.answers[a.questionId] = a.value;
  progress.answers[attentionCheck.id] = attentionCheck.expectedValue;
  progress.context = { ...(ending as Record<string, string>) };
  progress.pronouns = pronouns;
  return completeAttempt(progress, NOW);
}

const ANSWERS_ONE: EndingAnswers = {
  b1: "partner",
  b2: "blindsided",
  b3: "went-quiet",
  b4: "none",
  b5: "distant",
};
const ANSWERS_TWO: EndingAnswers = {
  b1: "me",
  b2: "cycles",
  b3: "in-person",
  b4: "kept-changing",
  b5: "fight",
};

describe("the b answers never change a score (v3 brief, 8)", () => {
  it("Persona A twice, with different b answers: identical scores and profile", () => {
    const one = saved({ ending: ANSWERS_ONE });
    const two = saved({ ending: ANSWERS_TWO });
    const none = saved({});
    expect(one.result).toEqual(two.result);
    expect(one.result).toEqual(none.result);
    expect(one.perceived).toEqual(two.perceived);
    expect(one.result).toMatchObject({ ...fixture1.expected, profileId: "anxious" });
    expect(one.perceived).toEqual(herFixtures.h1.expected);
    // The answers themselves are kept, with the context answers (brief, 2).
    expect(endingAnswersFrom(one.context)).toEqual(ANSWERS_ONE);
    expect(endingAnswersFrom(two.context)).toEqual(ANSWERS_TWO);
  });

  it.each([
    ["Persona B", fixture4.avoidant],
    ["Persona C", fixture4.fearfulAvoidant],
    ["Persona D", fixture4.secure],
  ] as const)("%s still lands exactly, whatever the b answers", (_, persona) => {
    for (const ending of [ANSWERS_ONE, ANSWERS_TWO, undefined]) {
      expect(saved({ his: persona.answers, ending }).result).toMatchObject(persona.expected);
    }
  });

  it("H1 and H2 still land exactly, whatever the b answers", () => {
    for (const ending of [ANSWERS_ONE, ANSWERS_TWO]) {
      expect(saved({ her: herFixtures.h1.answers, ending }).perceived).toEqual(
        herFixtures.h1.expected,
      );
      expect(saved({ her: herFixtures.h2.answers, ending }).perceived).toEqual(
        herFixtures.h2.expected,
      );
    }
  });
});

// ---- Assembly (v3 brief, 4, 5, 8) ----------------------------------------------------

const BASE: Required<EndingAnswers> = {
  b1: "together",
  b2: "event",
  b3: "in-person",
  b4: "made-sense",
  b5: "closer",
};

describe("assembly: fixed order, each option its own block, caution always last", () => {
  const fields = {
    b1: "initiator",
    b2: "arrival",
    b3: "delivery",
    b4: "reason",
    b5: "trigger",
  } as const;

  for (const q of endingQuestions) {
    it.each(q.options.map((o) => o.value))(`${q.id} = %s renders its own block only`, (value) => {
      const out = assembleEnding(content, { ...BASE, [q.id]: value }, null);
      const own = content[fields[q.id]] as Record<string, string>;
      expect(out).toContain(own[value]);
      for (const other of q.options.filter((o) => o.value !== value)) {
        expect(out).not.toContain(own[other.value]);
      }
    });
  }

  it("arrival → initiator → delivery → reason → trigger → fit → caution", () => {
    const out = assembleEnding(content, BASE, "explosion");
    expect(out).toEqual([
      content.arrival.event,
      content.initiator.together,
      content.delivery["in-person"],
      content.reason["made-sense"],
      content.trigger.closer,
      content.fit.explosion,
      content.caution,
    ]);
  });

  it("the closing caution always renders, with or without a fit line", () => {
    for (const fit of [null, "avoidant", "fearful", "explosion", "anxious"] as const) {
      const out = assembleEnding(content, BASE, fit);
      expect(out.at(-1)).toBe(content.caution);
      expect(out).toHaveLength(fit ? 7 : 6);
    }
  });

  it("an unanswered block renders nothing (a result saved before v3)", () => {
    expect(assembleEnding(content, {}, null)).toEqual([]);
    expect(assembleEnding(content, { ...BASE, b5: undefined }, null)).toEqual([]);
  });
});

describe("fit lines: at most one, in priority order (v3 brief, 5)", () => {
  const fit = (
    herProfile: Parameters<typeof endingFitFor>[0]["herProfile"],
    dynamic: Parameters<typeof endingFitFor>[0]["dynamic"],
    answers: EndingAnswers,
  ) => endingFitFor({ herProfile, dynamic, answers: { ...BASE, ...answers } });

  it("1. her avoidant + weeks of distance or blindsided → the avoidant line", () => {
    expect(fit("avoidant", "avoidant-avoidant", { b2: "distance" })).toBe("avoidant");
    expect(fit("avoidant", "avoidant-avoidant", { b2: "blindsided" })).toBe("avoidant");
    expect(fit("avoidant", "avoidant-avoidant", { b2: "cycles" })).toBeNull();
    expect(fit("secure", "secure-involved", { b2: "distance" })).toBeNull();
  });

  it("2. her fearful + repeated breakups or the on-off round → the fearful line", () => {
    expect(fit("fearful-avoidant", "swing", { b2: "cycles" })).toBe("fearful");
    expect(fit("fearful-avoidant", "swing", { b5: "on-off" })).toBe("fearful");
    expect(fit("fearful-avoidant", "swing", { b2: "distance", b5: "fight" })).toBeNull();
    expect(fit("anxious", "anxious-anxious", { b2: "cycles", b1: "me" })).toBeNull();
  });

  it("3. the anxious-avoidant dynamic + one event or a big fight → the explosion line", () => {
    expect(fit("secure", "anxious-avoidant", { b2: "event" })).toBe("explosion");
    expect(fit("secure", "anxious-avoidant", { b2: "cycles", b5: "fight" })).toBe("explosion");
    expect(fit("secure", "anxious-avoidant", { b2: "cycles", b5: "closer" })).toBeNull();
    expect(fit("secure", "avoidant-anxious", { b2: "event" })).toBeNull();
  });

  it("4. her anxious + she ended it → the anxious line", () => {
    expect(fit("anxious", "anxious-anxious", { b1: "partner" })).toBe("anxious");
    expect(fit("anxious", "anxious-anxious", { b1: "me" })).toBeNull();
    expect(fit("avoidant", "avoidant-avoidant", { b1: "partner", b2: "cycles" })).toBeNull();
  });

  it("when two conditions match, the first in priority order wins", () => {
    // Persona A (anxious) with H1 (avoidant): the anxious-avoidant dynamic. Weeks of
    // distance and a big fight match both 1 and 3; the avoidant line wins.
    const you = saved({}).result;
    const her = { ...herFixtures.h1.expected };
    const dynamic = dynamicFor(you, her).id;
    expect(dynamic).toBe("anxious-avoidant");
    const both: EndingAnswers = { ...BASE, b2: "distance", b5: "fight" };
    expect(endingFitFor({ herProfile: her.profileId, dynamic, answers: both })).toBe("avoidant");
    // Without condition 1 (one event, not distance), condition 3 fires.
    expect(
      endingFitFor({ herProfile: her.profileId, dynamic, answers: { ...both, b2: "event" } }),
    ).toBe("explosion");
    // 3 outranks 4, and 2 outranks 3, when the inputs allow both.
    expect(fit("anxious", "anxious-avoidant", { b1: "partner", b5: "fight" })).toBe("explosion");
    expect(fit("fearful-avoidant", "anxious-avoidant", { b2: "cycles", b5: "fight" })).toBe(
      "fearful",
    );
  });
});

// ---- On the result page, under three pronoun combinations (v3 brief, 8) ------------

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, "\n")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");

const segmentOf = (s: SavedQuiz) => {
  const html = renderToStaticMarkup(<ResultView saved={s} outdated={false} />);
  const start = html.indexOf('data-testid="ending"');
  return start === -1 ? null : textOf(html.slice(start, html.indexOf("</div>", start)));
};

const RENDER_DIR = process.env.PRONOUN_RENDER_DIR;

describe("the segment on the result page (v3 brief, 4, 8)", () => {
  it("follows the dynamic, before the since-the-breakup decodes", () => {
    const html = renderToStaticMarkup(
      <ResultView saved={saved({ ending: ANSWERS_ONE })} outdated={false} />,
    );
    const at = (s: string) => html.indexOf(s);
    expect(at('data-testid="dynamic"')).toBeLessThan(at('data-testid="ending"'));
    expect(at('data-testid="ending"')).toBeLessThan(at('data-testid="decodes"'));
    expect(textOf(html)).toContain("How it ended, read plainly");
  });

  it("a result saved before v3 (no b answers) shows no segment and no bridge addition", () => {
    const html = renderToStaticMarkup(<ResultView saved={saved({})} outdated={false} />);
    expect(html).not.toContain('data-testid="ending"');
    expect(html).not.toContain('data-testid="bridge-ending"');
  });

  const combos: [PronounChoice, string[]][] = [
    [
      { taker: "he", partner: "she" },
      [
        "She was the one who said it, or showed it.",
        "You never got the conversation. She went quiet, and the quiet was the message.",
        "It would give you her version. It would not give you certainty, and men who get the conversation",
        "the reason is rarely a sentence she could have said.",
        "in her private accounting of the relationship",
        "Read against her pattern, the shape of this ending fits",
      ],
    ],
    [
      { taker: "she", partner: "he" },
      [
        "He was the one who said it, or showed it.",
        "He went quiet, and the quiet was the message.",
        "It would give you his version. It would not give you certainty, and women who get the conversation",
        "the reason is rarely a sentence he could have said.",
        "in his private accounting of the relationship",
        "Read against his pattern, the shape of this ending fits",
      ],
    ],
    [
      { taker: "they", partner: "they" },
      [
        "They were the one who said it, or showed it.",
        "They went quiet, and the quiet was the message.",
        "It would give you their version. It would not give you certainty, and people who get the conversation",
        "the reason is rarely a sentence they could have said.",
        "in their private accounting of the relationship",
        "Read against their pattern, the shape of this ending fits",
      ],
    ],
  ];

  it.each(combos)("taker $taker, partner $partner", (pronouns, lines) => {
    // Persona A + H1 (the anxious-avoidant dynamic), blindsided: the avoidant fit line.
    const text = segmentOf(saved({ ending: ANSWERS_ONE, pronouns }))!;
    if (RENDER_DIR) {
      mkdirSync(RENDER_DIR, { recursive: true });
      writeFileSync(
        path.join(RENDER_DIR, `ending-${pronouns.taker}-${pronouns.partner}.txt`),
        text,
      );
    }
    for (const line of lines) expect(text).toContain(line);
    expect(text.split("\n").at(-1)).toBe(content.caution);
    expect(text).not.toContain("—");
  });

  it("the bridge additions: blindsided, and I ended it", () => {
    const html = (ending: EndingAnswers) =>
      textOf(renderToStaticMarkup(<ResultView saved={saved({ ending })} outdated={false} />));
    const { bridge } = endingContentFor(pronounContext());
    expect(html(ANSWERS_ONE)).toContain(bridge.blindsided);
    expect(html(ANSWERS_ONE)).not.toContain(bridge.me);
    expect(html(ANSWERS_TWO)).toContain(bridge.me);
    expect(html(ANSWERS_TWO)).not.toContain(bridge.blindsided);
  });
});

// ---- The result email (v3 brief, 6, 8) ---------------------------------------------

describe("the result email's how-it-ended part (v3 brief, 6)", () => {
  const you = resultFromToken(encodeShareToken(fixture1.expected));
  const her = resultFromToken(
    encodeShareToken({ ...herFixtures.h1.expected, version: fixture1.expected.version }),
  );

  it("carries the arrival read and the fit line, in HTML and text, and nothing else of it", () => {
    const email = buildResultEmail(you, her, undefined, {
      b1: "partner",
      b2: "distance",
      b5: "fight",
    });
    const html = textOf(email.html).replace(/\n/g, " ");
    const text = email.text.replace(/\n/g, " ");
    for (const [format, body] of [
      ["html", html],
      ["text", text],
    ] as const) {
      expect(body, format).toContain(content.heading);
      expect(body, format).toContain(content.arrival.distance);
      // Distance + H1 avoidant: rule 1 fires (the fight would also match rule 3).
      expect(body, format).toContain(content.fit.avoidant);
      expect(body, format).not.toContain(content.fit.explosion);
      expect(body, format).not.toContain(content.initiator.partner);
      expect(body, format).not.toContain(content.trigger.fight);
      expect(body, format).not.toContain(content.caution);
    }
    // After the dynamic summary.
    expect(text.indexOf(content.heading)).toBeGreaterThan(text.indexOf("The pursue–withdraw loop"));
  });

  it("with no fit line, just the arrival read; with no answers, nothing", () => {
    const noFit = buildResultEmail(you, her, undefined, { b1: "me", b2: "cycles", b5: "closer" });
    expect(noFit.text).toContain(content.arrival.cycles);
    for (const line of Object.values(content.fit)) expect(noFit.text).not.toContain(line);
    expect(buildResultEmail(you, her).text).not.toContain(content.heading);
  });

  it("renders with the pronoun context: a they/them partner", () => {
    const email = buildResultEmail(
      you,
      her,
      { taker: "he", partner: "they" },
      {
        b1: "partner",
        b2: "blindsided",
        b5: "distant",
      },
    );
    expect(email.text).toContain("Read against their pattern, the shape of this ending fits");
  });

  it("the request carries b1, b2 and b5 as option ids only", () => {
    const base = {
      action: "send_result",
      email: "a@example.com",
      token: "v=men-v2&a=1&v2=1",
      alsoJoinList: false,
    };
    const ok = emailRequestSchema.safeParse({
      ...base,
      ending: { b1: "me", b2: "event", b5: "fight" },
    });
    expect(ok.success).toBe(true);
    const parse = (ending: unknown) => emailRequestSchema.safeParse({ ...base, ending });
    // A value that isn't one of that question's option ids is refused, and so is a gap.
    expect(parse({ b1: "she", b2: "event", b5: "fight" }).success).toBe(false);
    expect(parse({ b1: "me", b2: "event" }).success).toBe(false);
    // Anything beyond b1, b2 and b5 is dropped before the email is built.
    const extra = parse({ b1: "me", b2: "event", b5: "fight", b3: "unclear" });
    expect(extra.success).toBe(true);
    if (extra.success && extra.data.action === "send_result") {
      expect(Object.keys(extra.data.ending!)).toEqual(["b1", "b2", "b5"]);
    }
  });
});

describe("pronoun sets the copy uses", () => {
  it("the taker's nouns stand in for the draft's 'men'", () => {
    const she = endingContentFor(pronounContext({ taker: "she", partner: "he" }));
    expect(she.initiator.me).toContain("Women who do the leaving");
    expect(she.reason["made-sense"]).toContain("many women never get");
    const they = endingContentFor(pronounContext({ taker: "they", partner: "she" }));
    expect(they.reason.none).toContain("the sentence people repeat most");
    expect(pronounTerms.they.noun).toBe("person");
  });
});
