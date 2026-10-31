# Build log

## Session 1 — Scaffold (2026-10-29)

**Shipped**

- Next.js 15.5.28 + React 19.1 + TypeScript 5.9 + Tailwind 3.4, with the Section 7.2 folder
  structure. Folders reserved for later sessions hold `.gitkeep` files.
- Section 8.2 design tokens in `tailwind.config.ts`. The colour, font-size and shadow
  scales **replace** Tailwind's defaults, so only token values exist. That also removes
  Tailwind's 12px `text-xs`, keeping the 13px small-print minimum.
- System font stack (no web-font request), global visible focus ring, and
  `prefers-reduced-motion` handling.
- Layout: skip-to-content link, `header`/`main`/`footer` landmarks, header with the wordmark
  and three tool links, and a footer carrying every Section 6 footer link, the short
  affiliate-disclosure line, and **Block C** rendered verbatim at body size on the crisis
  panel.
- Homepage skeleton: the positioning line as H1 and three tool cards.
- Config: `site.ts` (HeartFixed / heartfixed.com, the Section 6 route map, nav), `copy.ts`
  (partner dictionary), `quiz.ts` (men-v1, band edges), `affiliates.ts` (types plus the full
  12-slot inventory, all disabled), `content.ts` (stub), `redirects.ts` (empty, wired into
  `next.config.ts`).
- `lib/seo/metadata.ts` with homepage metadata and canonical. `.env.example` lists all
  Section 17.2 variables. README, CI workflow, and Vitest + Playwright setup.
- Tests: 50 unit tests (config, tokens and WCAG contrast, Block C verbatim, metadata
  limits, source guards) and 30 Playwright smoke tests (10 checks × 320px / 360px /
  desktop).

**Deferred (TODOs in code)**

- Footer email signup → Session 9. Blocks A/D → Session 5, E → Session 7, B → Session 11.
- Remaining route metadata, OG images, JSON-LD, favicon, sitemap/robots, 404 → Session 12.
- Analytics → Session 13. Print stylesheets → Sessions 5–6. Breadcrumbs → with the first
  non-home pages.
- Footer and homepage links point at routes that later sessions build, so they 404 for now.

**Decisions and ambiguities (resolved with spec defaults)**

- Tailwind 3.4 rather than 4: theme values live in a typed config that the tests import.
- Accent amber `#D98E32` is only ~2.7:1 on white. Under the spec's "CTAs only" rule it is
  used only as a button fill, with ink text (~6:1) and an ink border so the boundary passes
  3:1. A unit test records that accent must never be a text colour on white.
- Homepage copy containing a partner pronoun ("without texting her") resolves through
  `config/copy.ts`, per Section 2.3.
- `site.url` is fixed at `https://heartfixed.com`. `baseUrl` honours
  `NEXT_PUBLIC_SITE_URL` for metadata.
- Next 15 bundles a postcss version with a build-time advisory. The only fix npm offers
  (upgrading to Next 16) breaks the locked stack, so `package.json` `overrides` pins
  postcss 8.5.29 instead. `npm audit` now reports 0 vulnerabilities.
- All dependency versions are pinned exactly and are at least two weeks old.
- Committed as `session-01: scaffold` after the founder reviewed the session.
- The preview-URL deploy needs the founder's Vercel account (Section 17.3). Until then, the
  production build is verified locally. See the README.

## Session 2 — Quiz engine (2026-10-31)

**Shipped**

- `lib/quiz/` complete per Section 9:
  - `types.ts`: the Section 9.1 model, plus Zod schemas for questions and answers.
  - `scoring.ts`: pure `scoreQuiz`, `effectiveValue`, `maxRawFor`, `normalize`,
    `bandFor`, `profileFor`, `leanFor`.
  - `questions.ts`: four sample questions, the attention check, `renderStem`, and
    `checkQuestionBank`.
  - `profiles.ts`: profile names/labels/routes, the `ProfileCopy` structure, and
    `checkProfileCopy`.
  - `share.ts`: encode/decode with Zod validation.
  - `index.ts`: the public API.
- `config/quiz.ts`: the Likert scale and labels, launch bank rules, and the two context
  questions with their on-screen note.
- Fixtures 2, 3, 5 and 6 pass against a temporary 24-item test bank
  (`lib/quiz/__tests__/fixtures.ts`). The Fixture 2 hand-verification comment is there,
  along with hand computations for Fixtures 3 and 5.
- Also passing ahead of schedule:
  - the Section 16.4 engine acceptance checks (determinism ×100, all nine band
    combinations, context answers can't move scores);
  - Fixture 7's unit-level share round-trip and tamper rejection;
  - attention-flag behaviour.
- Mutation check: deliberately ignoring reversal, or shifting the low band edge by one,
  makes Fixtures 3 and 5 fail, as they should.
- Housekeeping: CI actions bumped to `@v5` (clears GitHub's Node 20 deprecation warning).
  `vitest.config.ts` → `.mts` (clears Vite's CommonJS config warning).
- Tests: 125 unit tests pass, plus 3 `todo`s (Fixture 1, Fixture 4, and the launch bank
  check), which are Session 4 work. The 30 Playwright smoke tests still pass.

**Flagged for the founder: Persona A can't be produced by a weight-1 bank**

- With 12 items at weight 1, a dimension's normalized score moves in steps of about 2:
  …71, 73… and …17, 19…. **Neither 72 nor 18 is reachable**, so Persona A's expected
  result (anxiety 72, avoidance 18) can't come from an all-weight-1 launch bank.
- Section 10.4 says that when this happens, the bank or the weights are wrong, not the
  fixture. The founder decides the weights when reviewing the bank before Session 4.
- Example only, not a decision: one weight-0.5 item per dimension makes the max raw 46,
  so raw 33 → 72 and raw 8.5 → 18 both become reachable.
- The spec also never states Persona A's 24-answer pattern (Section 10.4 says it is
  "fully specified", but no pattern is given). The founder needs to supply it with the
  final bank.

**Decisions and ambiguities (resolved with spec defaults)**

- Section 18 asks for a Fixture 2 hand-verification comment; Section 16.2 asks for
  Fixture 1. Fixture 1 needs the launch bank, so Fixture 2 is hand-verified now. Fixture
  1's verification comment is due in Session 4.
- `scoreQuiz(answers, questions, options)` takes a third argument carrying `completedAt`,
  so scoring never reads the clock and stays pure. The same argument carries the optional
  attention check.
- `QuizResult` gains `attentionFlag`, which Section 9.2 places on the result.
  `QuizQuestion` gains an optional `partnerTerms`, the per-question override from
  Section 2.3.
- Partner references in stems are tokens (`{subject}`, `{object}`, `{possessive}`),
  resolved from `config/copy.ts` by `renderStem`.
- Fixture 5 uses a separate weighted bank: with weight-1 items, 34 and 66 can't occur.
- Share tokens use the spec's example keys (`v`, `a`, `v2`).
  - Bands and profile are recomputed from the scores on decode.
  - "Tampered" means malformed, out of range, or repeated. A valid in-range score that
    someone edited can't be detected without a server secret, and the MVP has no server.
  - Tokens from an older question set decode with `isCurrentVersion: false` and aren't
    rejected.
- Missing attention-check answer counts as a fail (flag set). The result is still
  complete.
- Bank-shape rules (24 items, 12/12, 2 reversed per dimension) live in `checkQuestionBank`
  and `config/quiz.ts`, not in `scoreQuiz`, so future assessments can reuse the engine.
- Context-question wording and option bands are drafts for founder review.

**Deferred**

- The founder-reviewed 24-item bank; Fixtures 1 and 4; the end-to-end part of Fixture 7;
  and the runner making Fixture 6's incomplete state unreachable → Session 4.
- Profile copy (`ProfileCopy` for all four profiles, including lean paragraphs) → Session 5.

**For founder review now:** the four sample stems in `lib/quiz/questions.ts` and the
context questions in `config/quiz.ts`.
