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

## Session 3 — Storage and tool primitives (2026-10-31)

**Shipped (logic only — no pages)**

- `lib/storage.ts`:
  - versioned keys (`heartfixed-quiz-v1`, `heartfixed-tracker-v1`, plus reserved keys
    for quiz progress, the unsent vault and the decision re-check);
  - schema-validated `readStored`, which returns `ok` / `empty` / `corrupt` /
    `unavailable` and never throws;
  - `writeStored`; `clearStored` and `clearAllStored`, which really delete the keys;
  - `exportStored` (JSON).
- `lib/tools/tracker.ts`:
  - the Section 11.1 model with a Zod schema;
  - DST-safe calendar-day maths; setup;
  - streak, longest and total calculations;
  - check-ins (one per day, back-fill, 500-character notes); slips; calendar with
    visible gaps;
  - goal progress, extension, and a completion state that fires once;
  - CSV export (with spreadsheet-formula defusing).
- `lib/tools/decision.ts`:
  - input schema and bands/purposes;
  - local draft check (length, question marks, pressure phrases, ultimatums, stacked
    apologies, night-send);
  - the ordered rule table (forced wait → logistics eligibility → default);
  - `decide`, which returns flags and counts only, never draft text.
- `config/content.ts`: the draft-check thresholds and the pressure/ultimatum phrase
  lists (founder-maintained).
- **All Section 16.2 tracker and decision fixtures pass:**
  - month boundaries, including leap years;
  - both 2026 US DST changes;
  - slip preservation;
  - back-fill can't inflate the streak;
  - 30/60/90 completion fires once;
  - the alcohol and intensity property tests across the full 14,256-combination input
    space;
  - logistics_ok has one path only;
  - two pressure phrases block logistics_ok;
  - 01:30 sets night-send.
- Mutation check: elapsed-millisecond day maths (the DST bug), deleting the alcohol rule,
  and a slip that forgets the longest streak are each caught.
- Tests: 204 unit tests pass, plus 3 `todo`s carried from Session 2. The 30 Playwright
  smoke tests pass.

**Decisions and ambiguities (resolved with spec defaults)**

- **Streak model.** The spec calls `startDate` "Day 1" and says a slip "starts today".
  Both read consistently as: the streak is the number of calendar days since the last
  contact.
  - The contact day is Day 0; the next day is Day 1.
  - `startDate` = last contact + 1, as the model says.
  - A slip sets `restartedOn` to the slip day, the new Day 0.
  - Setting up on the day of contact (the default) shows Day 0, and check-ins start
    the next day.
- **A slip credits full days only.** If the tracker reads "Day 18" on the day he slips,
  the reset says "You did 17 days", because the slip day had contact.
  - Invariant (tested): total = calendar days since Day 1 that had no contact.
  - Copy note for Session 6: say "17 full days" so the drop from 18 reads as intended.
- **Back-fill.** The streak is time-based, so check-ins confirm days but never change it.
  - A missed day shows as a gap.
  - Back-filling marks the day but leaves the streak unchanged.
  - Check-ins dated in the future, or before the current streak's Day 1, are rejected.
- **`TrackerState` gains an optional `goalReachedOn`** so completion fires exactly once.
  A slip or a goal extension clears it.
- **Slip type** ("what happened") is defined (`SLIP_TYPES`) but not stored: the Section
  11.1 model has no field for it. The page uses it once, to show the guide link and to
  send the analytics category.
- **Decision rules where the spec says "weights strongly toward waiting":**
  - A recent breakup or contact turns a clean closure/apology draft into "don't send"
    instead of "wait 24h".
  - Logistics ignores timing; belongings and bills don't wait.
  - Logistics without a draft, with any flag, or "drafted and deleted more than once"
    → wait 24h.
- **Night-send** is part of the draft check, so a 1:30am logistics draft can't be
  `logistics_ok`.
- **Questions.** More than two question marks is a flag (`maxQuestionMarks: 2`, in
  config).
- **Phrase lists.** Beyond the spec's three examples, the pressure and ultimatum lists
  are drafts for founder review.
- **Brand guard.** The Session 1 guard now matches `HeartFixed` case-sensitively and the
  domain in any case. A second check allows lowercase brand text only as a
  `heartfixed-…-vN` storage key.

**Deferred**

- Quiz save/progress shapes → Session 4. Unsent vault and re-check shapes, plus the
  urge-timer prompt cards → Session 7. Analytics `day_band` → Session 13.
- Purpose and slip-type labels (which use partner terms from `config/copy.ts`) → the
  sessions that build those screens.

**For founder review now:** the pressure and ultimatum phrase lists in
`config/content.ts`, and the streak/slip counting rules above.

## Session 6 — No-contact tracker (2026-10-31)

Built on top of the Session 3 branch: PR #2 was still open when this session started,
so this branch is stacked on `session-03-storage-tools` and needs #2 merged first.

**Shipped**

- `/no-contact-tracker/`: statically generated, with the tool hydrating on the client.
  The explainer, goal guidance (30/60/90), the "what counts as contact" list (with the
  story-view strictness note and the soft-contact note), the FAQ, and the links to
  `/no-contact-rule/` and the decision tool are all in the server-rendered HTML.
- Tool (`components/tools/`), all logic from `lib/tools/tracker.ts`:
  - `TrackerSetup`: one screen; last contact defaults to today, goal to 30 days; no
    name, no account; inline error for a future date.
  - Streak view:
    - the day count as the hero number, with "Day N of goal" or "Day N — past your
      30-day goal";
    - days remaining to the goal;
    - a persistent "I'm about to break it" link to `/should-i-text-my-ex/?from=tracker`;
    - longest streak and total days;
    - goal completion shown once, with the option to extend to 60 or 90 days.
  - `StreakCalendar`: the last 14 days as filled or outlined cells, each labelled by
    date and status for screen readers; contact days dashed; no flames, no loss
    animations.
  - `CheckInForm`: "Still no contact", an optional urge rating, a private note
    (500-character cap, with counter and privacy line), back-filling missed days in the
    current streak, and editing today's check-in.
  - `SlipFlow`: one question, then a reset screen ("You did N full days…", total,
    longest, "starts today"). "Reached out and I replied" links the guide.
  - "Your data": JSON and CSV export, Print / Save PDF, and Clear my data (with an
    on-page confirmation; really deletes the key); "Start over" uses the same
    confirmation.
  - Resilience: a corrupted value shows a recovery panel (download what's there, then
    start fresh). Blocked storage still runs for the visit, with a notice. Focus moves
    to each new view's heading.
- Compliance: Block B (brand from config) and Block D added to `content/compliance.ts`,
  rendered verbatim by `CrisisBlock` and `ToolDisclaimer`. Block C stays in the footer.
- New shared pieces:
  - `Breadcrumbs` (with BreadcrumbList schema), `Faq` (FAQPage schema from
    `content/faqs.ts`, the same data as the visible FAQ), `JsonLd`;
  - `lib/seo/schema.ts` (with a prohibited-types list);
  - `Button` / `RadioCard` (real radio inputs) / `Callout`, and `lib/download.ts`.
- Print: only the H1, the streak summary, Block B and the footer crisis line print.
- Copy lives in `content/tracker.ts` and `content/faqs.ts`. Partner references resolve
  through `config/copy.ts`.
- Metadata: title "No-Contact Tracker: Free, No Account Needed | HeartFixed" (56
  characters), plus description and canonical.
- Tests:
  - 221 unit tests pass (3 `todo`s), including Blocks B and D verbatim, copy rules (no
    shaming words, no Section 14.2 terms, never asks for a name), and JSON-LD builders.
  - 108 Playwright tests pass: 26 tracker acceptance tests × 3 viewports, plus the
    existing smoke tests.
  - Covered: clearing deletes the key (asserted); the slip-flow shaming-word grep on the
    rendered text of every slip state; JSON and CSV export contents; the note never
    appearing in any network request; back-fill not moving the streak; completion
    showing once; print output; corrupted and blocked storage; 320px with no
    horizontal scroll; 44px targets.
  - Mutation check: a clear that doesn't delete, and "Streak lost" in the reset copy,
    are both caught.
- Size: the tracker route ships 139 kB first-load JS (budget 180 kB).

**Decisions and ambiguities (resolved with spec defaults)**

- Blocks B and D were scheduled for Sessions 11 and 5, but Section 14.1/16.4 require
  them on the tracker page, so they ship now.
- Block D's crisis-page reference is a link labelled "Crisis Resources" (the page's name
  in the footer), rather than the raw path `/crisis-resources/`. The rest is word for
  word.
- The reset screen says "full days" (see Session 3): on the day of a slip the counter
  read one higher than the full days credited.
- No check-in is possible on Day 0, the contact day; the first check-in is on Day 1.
  Back-fill is limited to missed days in the current streak (last 14).
- An unchosen urge rating saves as 0 ("None"), since the Section 11.1 model requires a
  value.
- The `{{` source guard tripped on JSX in `JsonLd.tsx`. The component now avoids the
  double brace rather than the guard being loosened.

**Deferred**

- Reminder opt-in (Section 13.1(c)) → Session 9. Analytics events (`tracker_created`,
  `tracker_checkin`, `tracker_slip_recorded`) → Session 13.
- Affiliate slot `tracker-after-explainer` → Session 10.
- Lighthouse budgets and the axe pass on this page → Session 13. These were not run in
  this session.
- Linked pages that don't exist yet (they 404 until built): `/should-i-text-my-ex/`
  (Session 7), `/no-contact-rule/` and the guide (Session 10), `/crisis-resources/`
  (Session 11).

**For founder review now:** the tracker copy in `content/tracker.ts` and the six FAQ
answers in `content/faqs.ts`. In particular, the FAQ says a reply to genuine logistics
doesn't need to reset the counter.
