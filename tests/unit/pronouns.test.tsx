import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResultView } from "@/components/quiz/ResultView";
import { PRONOUN_IDS, pronounTerms, type PartnerTerms, type PronounId } from "@/config/copy";
import { blockA, blockC, blockD } from "@/content/compliance";
import { formCopy } from "@/content/emails/forms";
import { trackerCopy } from "@/content/tracker";
import { quizFaqs, quizPage, runnerCopy } from "@/content/quiz";
import { endingContentFor } from "@/content/quiz-ending";
import { dynamicLeanLines, plain, resultContentFor, resultCopy } from "@/content/quiz-result";
import { resultEmptyCopy } from "@/content/quiz-result-empty";
import { actionLists } from "@/content/emails/actionLists";
import { resultEmailCopy } from "@/content/emails/result";
import { buildResultEmail, resultFromToken } from "@/lib/email/resultEmail";
import {
  attentionCheck,
  cap,
  completeAttempt,
  dynamicFor,
  emptyProgress,
  encodeShareToken,
  endingQuestions,
  herQuestions,
  profileCopyFor,
  pronounContext,
  questions,
  renderStem,
  sinceBreakupSelectors,
  type Band,
  type PronounChoice,
  type SavedQuiz,
} from "@/lib/quiz";
import { fixture1, herFixtures } from "@/lib/quiz/__tests__/fixtures";

/**
 * Session B — quiz v2 amendment brief, Part 2, section 2.7: the pronoun engine's
 * acceptance tests.
 *
 * - One full result (Persona A with H1) rendered under all nine taker × partner
 *   combinations, checked here. Set PRONOUN_RENDER_DIR to write each render out as text
 *   for reading by eye.
 * - Parity sweeps over every templated line: only the chosen partner's pronouns, only
 *   the two sets' nouns, plural agreement for they/them, singular for he and she.
 * - The result email in three combinations, HTML and text.
 * - No em dashes in the templated quiz and result content (2.6).
 */

const COMBOS = PRONOUN_IDS.flatMap((taker) =>
  PRONOUN_IDS.map((partner): PronounChoice => ({ taker, partner })),
);

const GENDERED = [
  "she",
  "her",
  "hers",
  "herself",
  "he",
  "him",
  "his",
  "himself",
  "woman",
  "women",
  "man",
  "men",
] as const;

/** The gendered words a render for this taker and partner may contain, and no others. */
function allowedWords({ taker, partner }: PronounChoice): Set<string> {
  const t = pronounTerms[taker];
  const p = pronounTerms[partner];
  return new Set([
    p.subject,
    p.object,
    p.possessive,
    p.possessivePronoun,
    p.reflexive,
    p.noun,
    p.nounPlural,
    t.noun,
    t.nounPlural,
  ]);
}

const words = (text: string) => text.toLowerCase().match(/[a-z]+/g) ?? [];

function strayGendered(text: string, choice: PronounChoice): string[] {
  const allowed = allowedWords(choice);
  return [
    ...new Set(
      words(text).filter((w) => (GENDERED as readonly string[]).includes(w) && !allowed.has(w)),
    ),
  ];
}

/** "they was", "they has", "they reaches": a singular verb after a they subject. */
function theyAgreementErrors(text: string): string[] {
  const after = [...text.matchAll(/\b[Tt]hey(?:'s)?\s+(?:still\s+|also\s+)?([a-z']+)/g)];
  const singular = /^(is|was|has|does|isn't|wasn't|hasn't|doesn't|[a-z]+[^s]s)$/;
  const fine = new Set(["always", "process"]);
  return after
    .map((m) => m[0])
    .filter(
      (m, i) => /they's/i.test(m) || (singular.test(after[i]![1]!) && !fine.has(after[i]![1]!)),
    );
}

/** "she were", "he reach": a plural verb after a he or she subject. */
function singularAgreementErrors(text: string, p: PartnerTerms): string[] {
  const plural =
    /^(were|have|are|do|reach|go|act|contact|keep|say|miss|regret|cope|care|weren't|haven't|aren't|don't)$/;
  return [...text.matchAll(new RegExp(`\\b${p.subject}\\s+([a-z']+)`, "gi"))]
    .filter((m) => plural.test(m[1]!))
    .map((m) => m[0]);
}

const decode = (s: string) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

/** Visible text of rendered HTML, one block per line. */
const textOf = (html: string) =>
  decode(html.replace(/<(style|script)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, "\n"))
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");

// ---- One full result: Persona A with H1, every decode selected -------------------

const NOW = new Date("2026-11-04T12:00:00.000Z");

function personaAWithH1(pronouns: PronounChoice): SavedQuiz {
  const progress = emptyProgress(NOW);
  for (const a of [...fixture1.answers, ...herFixtures.h1.answers]) {
    progress.answers[a.questionId] = a.value;
  }
  // "Often" on every selector, so all six decodes render.
  for (const s of sinceBreakupSelectors) progress.answers[s.id] = 3;
  progress.answers[attentionCheck.id] = attentionCheck.expectedValue;
  // The v3 block: she ended it, blindsided, she went quiet, no reason, she went distant.
  progress.context = {
    b1: "partner",
    b2: "blindsided",
    b3: "went-quiet",
    b4: "none",
    b5: "distant",
  };
  progress.pronouns = pronouns;
  return completeAttempt(progress, NOW);
}

/** The result view's own text: compliance blocks are verbatim, site-wide copy. */
function resultText(pronouns: PronounChoice): string {
  const html = renderToStaticMarkup(
    <ResultView saved={personaAWithH1(pronouns)} outdated={false} />,
  );
  return textOf(html);
}

const RENDER_DIR = process.env.PRONOUN_RENDER_DIR;

describe("one full result under all nine pronoun combinations (2.7)", () => {
  it.each(COMBOS)("taker $taker, partner $partner", (choice) => {
    const text = resultText(choice);
    const { t, p } = pronounContext(choice);
    if (RENDER_DIR) {
      mkdirSync(RENDER_DIR, { recursive: true });
      writeFileSync(path.join(RENDER_DIR, `${choice.taker}-${choice.partner}.txt`), text);
    }

    // Part 1's fixtures land the same under every combination.
    expect(text).toContain("Your pattern: Anxious (preoccupied)");
    expect(text).toContain("Attachment anxiety 71/100, high");
    expect(text).toContain("Attachment avoidance 13/100, low");

    // Headlines capitalise the possessive.
    expect(text).toContain(
      `${cap(p.possessive)} pattern, as you experienced it: Avoidant (dismissive)`,
    );
    expect(text).toContain(`Getting over ${p.object}, with your pattern`);
    // The decode headings agree with the subject.
    expect(text).toContain(`${cap(p.subject)} ${p.has} gone completely silent`);
    expect(text).toContain(
      `${cap(p.subject)} ${p.plural ? "say" : "says"} ${p.subject} ${p.plural ? "miss" : "misses"} you, or ${p.plural ? "regret" : "regrets"} how it ended`,
    );
    // Nouns per referent (2.3): the taker side, then the partner side.
    expect(text).toContain(`with the next ${t.noun} who gets close enough`);
    expect(text).toContain(`the part that keeps ${t.nounPlural} hooked`);
    expect(text).toContain(`${p.subject} ${p.was} wired long before this relationship`);

    expect(strayGendered(text, choice)).toEqual([]);
    if (p.plural) expect(theyAgreementErrors(text)).toEqual([]);
    else expect(singularAgreementErrors(text, p)).toEqual([]);
    expect(text).not.toMatch(/\$\{|\{[a-z]+\}|undefined|NaN/);
  });

  it("the default combination reads exactly as the approved copy", () => {
    const text = resultText({ taker: "he", partner: "she" });
    expect(text).toContain("Her pattern, as you experienced it: Avoidant (dismissive)");
    expect(text).toContain(
      "she will run the same programme with the next man who gets close enough",
    );
    expect(text).toContain("this is the part that keeps men hooked");
  });

  it("a they/them partner reads with plural verbs throughout", () => {
    const text = resultText({ taker: "he", partner: "they" });
    for (const line of [
      "They have gone completely silent",
      "They reach out at odd moments, then go quiet",
      "They act like they have already moved on",
      "They contact you late at night, or drinking",
      "They keep a thread of contact: likes, story views, small signals",
      "They say they miss you, or regret how it ended",
      "distance is how they cope, and they are coping",
      'isn\'t "do they feel something?" They may well.',
      "they were wired long before this relationship",
      "how much access they still have to your nervous system",
    ]) {
      expect(text).toContain(line);
    }
  });
});

// ---- Parity sweeps over every templated line --------------------------------------

const BANDS: Band[] = ["low", "moderate", "high"];
const scores = BANDS.flatMap((anxietyBand) =>
  BANDS.map((avoidanceBand) => ({ anxietyBand, avoidanceBand })),
);
const profileOf = (s: { anxietyBand: Band; avoidanceBand: Band }) =>
  s.anxietyBand === "high" && s.avoidanceBand === "high"
    ? ("fearful-avoidant" as const)
    : s.anxietyBand === "high"
      ? ("anxious" as const)
      : s.avoidanceBand === "high"
        ? ("avoidant" as const)
        : ("secure" as const);

/** Every templated line for one combination, as plain text. */
function corpus(choice: PronounChoice): string {
  const ctx = pronounContext(choice);
  const content = resultContentFor(ctx);
  const leanLines = scores.flatMap((you) =>
    scores.flatMap((her) =>
      dynamicLeanLines(
        dynamicFor({ ...you, profileId: profileOf(you) }, { ...her, profileId: profileOf(her) }),
        ctx,
      ),
    ),
  );
  const stems = [...questions, ...herQuestions, ...sinceBreakupSelectors].map((q) =>
    renderStem(q, ctx.p),
  );
  const ending = endingQuestions.flatMap((q) => [
    renderStem(q, ctx.p),
    ...q.options.map((o) => renderStem({ id: q.id, stem: o.label }, ctx.p)),
  ]);
  return [
    JSON.stringify(content),
    JSON.stringify(profileCopyFor(ctx.p)),
    JSON.stringify(endingContentFor(ctx)),
    ...ending,
    ...leanLines,
    ...stems,
    runnerCopy.herIntro(ctx.p),
    resultCopy.acts.after(ctx.p),
    resultCopy.herHeadline(ctx.p, "Secure"),
    resultCopy.share.body(ctx.p),
  ]
    .map(plain)
    .join("\n");
}

describe("parity sweeps over every templated line (2.7)", () => {
  it.each(COMBOS)("taker $taker, partner $partner: only the chosen sets' forms", (choice) => {
    const text = corpus(choice);
    expect(text.length).toBeGreaterThan(20_000);
    expect(strayGendered(text, choice)).toEqual([]);
    expect(text).not.toMatch(/\$\{|\{[A-Za-z]+\}|undefined/);
  });

  it("a she/her partner gets no masculine partner forms, and a he/him partner no feminine ones", () => {
    const she = corpus({ taker: "they", partner: "she" });
    expect(
      words(she).filter((w) => ["he", "him", "his", "himself", "man", "men"].includes(w)),
    ).toEqual([]);
    const he = corpus({ taker: "they", partner: "he" });
    expect(
      words(he).filter((w) => ["she", "her", "hers", "herself", "woman", "women"].includes(w)),
    ).toEqual([]);
  });

  it("a they/them partner gets no gendered partner forms and no singular verbs", () => {
    for (const taker of PRONOUN_IDS) {
      const text = corpus({ taker, partner: "they" });
      const t = pronounTerms[taker];
      const gendered = words(text).filter(
        (w) => (GENDERED as readonly string[]).includes(w) && w !== t.noun && w !== t.nounPlural,
      );
      expect(gendered, taker).toEqual([]);
      expect(theyAgreementErrors(text), taker).toEqual([]);
    }
  });

  it.each(["he", "she"] as PronounId[])("a %s partner keeps singular verbs", (partner) => {
    const p = pronounTerms[partner];
    expect(singularAgreementErrors(corpus({ taker: "he", partner }), p)).toEqual([]);
  });

  it("the detectors catch what they look for", () => {
    expect(theyAgreementErrors("so they was gone, and they reaches out")).toHaveLength(2);
    expect(singularAgreementErrors("then she were gone", pronounTerms.she)).toHaveLength(1);
    expect(strayGendered("they asked him", { taker: "she", partner: "they" })).toEqual(["him"]);
  });
});

// ---- The result email in three combinations (2.7) --------------------------------

describe("the result email in three combinations, HTML and text (2.7)", () => {
  const you = resultFromToken(encodeShareToken(fixture1.expected));
  const her = resultFromToken(
    encodeShareToken({ ...herFixtures.h1.expected, version: fixture1.expected.version }),
  );

  const cases: [PronounChoice, string[]][] = [
    [
      { taker: "he", partner: "she" },
      [
        "Her pattern, as you experienced it: Avoidant (dismissive)",
        "she will run the same programme with the next man who gets close enough",
        "Checking her profiles or status many times a day.",
      ],
    ],
    [
      { taker: "he", partner: "he" },
      [
        "His pattern, as you experienced it: Avoidant (dismissive)",
        "he will run the same programme with the next man who gets close enough",
        "Checking his profiles or status many times a day.",
      ],
    ],
    [
      { taker: "she", partner: "they" },
      [
        "Their pattern, as you experienced it: Avoidant (dismissive)",
        "they will run the same programme with the next woman who gets close enough",
        "they were wired long before this relationship",
        "Checking their profiles or status many times a day.",
      ],
    ],
  ];

  it.each(cases)("%o", (choice, expected) => {
    const email = buildResultEmail(you, her, choice);
    const p = pronounTerms[choice.partner];
    for (const [format, text] of [
      ["html", textOf(email.html).replace(/\n/g, " ")],
      ["text", email.text.replace(/\n/g, " ")],
    ] as const) {
      for (const line of expected) expect(text, `${format}: ${line}`).toContain(line);
      // The verbatim compliance blocks aren't partner copy, and links carry the quiz
      // version ("men-v2"), not words.
      const own = [blockA.text, blockC.text]
        .reduce((acc, b) => acc.split(b).join(""), text)
        .replace(/https?:\/\/\S+/g, "");
      expect(strayGendered(own, choice), format).toEqual([]);
      if (p.plural) expect(theyAgreementErrors(own), format).toEqual([]);
      else expect(singularAgreementErrors(own, p), format).toEqual([]);
      expect(own, format).not.toContain("—");
    }
  });

  it("without pronoun answers it renders the default path", () => {
    expect(buildResultEmail(you, her).text).toBe(
      buildResultEmail(you, her, { taker: "he", partner: "she" }).text,
    );
  });
});

// ---- No em dashes in the templated quiz and result content (2.6) -------------------

const ROOT = path.resolve(__dirname, "../..");

/**
 * The templated quiz-flow and result content (2.6's list: stems, reads, decodes,
 * dynamics, bridges, profiles, caveat, fallback lines, email templates), as files whose
 * code (not comments) must hold no em dash.
 *
 * Founder decision (Session B): two exclusions stay for now, named here so they can't
 * widen silently:
 * - the verbatim compliance blocks in content/compliance.ts (Section 1: verbatim);
 * - the quiz landing page copy in content/quiz.ts (`quizPage`, `quizFaqs`), which the
 *   founder is reviewing separately. The rest of content/quiz.ts, the runner's copy, is
 *   checked below as rendered strings.
 */
const SWEPT_FILES = [
  "lib/quiz/questions.ts",
  "lib/quiz/profiles.ts",
  "config/quiz.ts",
  "content/quiz-result.ts",
  "content/quiz-result-ui.ts",
  "content/quiz-result-empty.ts",
  "content/quiz-ending.ts",
  "content/emails/result.ts",
  "content/emails/actionLists.ts",
  "lib/email/resultEmail.ts",
];
const EXCLUDED = {
  compliance: "content/compliance.ts",
  quizLandingPage: "content/quiz.ts: quizPage, quizFaqs",
} as const;

const withoutComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");

describe("no em dashes in the templated quiz and result content (2.6)", () => {
  it.each(SWEPT_FILES)("%s", (file) => {
    const code = withoutComments(readFileSync(path.join(ROOT, file), "utf8"));
    const lines = code.split("\n").filter((l) => l.includes("—"));
    expect(lines).toEqual([]);
  });

  it("the runner's copy, rendered", () => {
    const strings = [
      runnerCopy.herIntro(pronounTerms.they),
      ...Object.values(runnerCopy.progress).map((f) => f(1, 6)),
      runnerCopy.resume("Question 9 of 18"),
      ...Object.values(runnerCopy.pronouns).flatMap((v) =>
        typeof v === "string" ? [v] : Object.values(v),
      ),
      ...Object.values(runnerCopy).filter((v) => typeof v === "string"),
    ];
    expect(strings.filter((s) => String(s).includes("—"))).toEqual([]);
  });

  it.each(COMBOS)("every rendered line, taker $taker, partner $partner", (choice) => {
    const text = corpus(choice);
    const email = buildResultEmail(
      resultFromToken(encodeShareToken(fixture1.expected)),
      undefined,
      choice,
    );
    const own = [blockA.text, blockC.text].reduce(
      (acc, b) => acc.split(b).join(""),
      `${email.text}\n${textOf(email.html)}`,
    );
    expect(`${text}\n${own}`).not.toContain("—");
  });

  it("covers the email copy, the action lists and the empty results page", () => {
    const text = JSON.stringify([resultEmailCopy, actionLists, resultEmptyCopy]);
    // Block A, in the email copy, is a verbatim compliance block.
    expect(
      text
        .split(blockA.text)
        .join("")
        .replace(/Days \d+–\d+/g, ""),
    ).not.toContain("—");
  });

  /**
   * Founder decision (2026-11-04): the two remaining em dashes the result page rendered
   * from shared copy, now swept. These files serve other pages too, so the check covers
   * the strings the result page renders from them: the email form's copy (forms.ts,
   * `result`) and the tracker offer's day lines (tracker.ts, `streak`).
   */
  it("the result page's lines from content/emails/forms.ts and content/tracker.ts", () => {
    const lines = [
      ...Object.values(formCopy.result).map((v) =>
        typeof v === "function" ? v("reader@example.com") : v,
      ),
      trackerCopy.streak.dayZero,
      trackerCopy.streak.dayOf(12, 60),
      trackerCopy.setup.submit,
    ];
    expect(formCopy.result.alsoJoin).toBe(
      "Also join the free email list: one or two emails a week on getting through this, unsubscribe anytime",
    );
    expect(trackerCopy.streak.dayZero).toBe("Day 0: your first full day starts tomorrow");
    expect(lines.filter((l) => String(l).includes("—"))).toEqual([]);
  });

  it.each(COMBOS)("the rendered result page, taker $taker, partner $partner", (choice) => {
    // Block D, the verbatim crisis block, is the one exclusion on this page.
    const crisis = blockD.map((seg) =>
      typeof seg === "string" ? seg.trim() : "strong" in seg ? seg.strong : seg.link,
    );
    const lines = resultText(choice)
      .split("\n")
      .filter((line) => !crisis.some((c) => c && (line.includes(c) || c.includes(line))));
    expect(lines.filter((l) => l.includes("—"))).toEqual([]);
  });

  it("names exactly the two exclusions, which still hold em dashes", () => {
    expect(Object.keys(EXCLUDED)).toEqual(["compliance", "quizLandingPage"]);
    expect(readFileSync(path.join(ROOT, EXCLUDED.compliance), "utf8")).toContain("—");
    expect(blockC.text).toContain("—");
    expect(JSON.stringify([quizPage, quizFaqs])).toContain("—");
  });
});
