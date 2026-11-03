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

## Session 7 — "Should I text my ex?" decision tool (2026-11-01)

**Shipped**

- `/should-i-text-my-ex/`: statically generated; the flow hydrates on the client. "How
  this works", the three outcomes, the tracker link block and the FAQ are
  server-rendered, with FAQPage and BreadcrumbList schema. Block B is in the footer area.
- The five-step flow (`components/tools/DecisionTool.tsx`), all logic from
  `lib/tools/decision.ts`:
  1. Timing bands (since breakup, since contact).
  2. Purpose (six options; partner terms from `config/copy.ts`).
  3. State check: alcohol, a 0–10 intensity slider with visible value and
     `aria-valuetext`, and drafted-and-deleted.
  4. The optional draft check (`DraftCheck`): **Block E verbatim directly above the
     textarea**, and live, local observations (length, question marks, pressure
     phrases, ultimatums, stacked apologies, night-send) shown as notes.
  5. The outcome (`DecisionOutcome`):
     - one of three outcomes, with the reason named per rule (the forced-wait rules use
       the spec's "Nothing good gets sent drunk or at a 9…" line);
     - the "takes no side / doesn't predict" line;
     - next actions: save unsent, the 30-minute timer, the tracker;
     - for wait-24h, a concrete re-check time ("Monday at 2:00 PM") with an optional
       on-device reminder;
     - for logistics_ok, guidance for a short, factual version he edits himself;
     - **Block D on every outcome**.
- Flow mechanics: "Step N of 5" with a progress bar; Back preserves every answer; inline
  `aria-live` errors; focus moves to each step heading; "Start over".
- `UrgeTimer`:
  - a 30-minute numeric countdown computed from a fixed end time (no drift, no
    animation, so identical with reduced motion), with a full-screen button where
    supported;
  - three config-driven prompt cards rotating every 60 seconds, plus "Next prompt"; the
    Day N card uses the tracker's day count, with a fallback when there's no tracker;
  - on completion: a check-in link if a tracker exists, otherwise the tracker setup
    offer;
  - start points: the outcome, or "Just start the 30-minute urge timer" on step 1.
- `UnsentVault`:
  - messages saved only by explicit choice, newest first, each deletable;
  - a "Your data" panel whose Clear my data (with on-page confirmation) deletes the
    unsent list and the reminder.
- `lib/tools/unsent.ts`: vault and re-check schemas and pure helpers (5,000-character
  messages, up to 100 entries; the re-check stores a time only, never the draft).
- `from=tracker`: the tracker's "I'm about to break it" link now lands here and shows
  "From your tracker: Day N of no contact."
- Copy lives in `content/decision.ts` and `content/faqs.ts`; Block E is in
  `content/compliance.ts`; the urge-timer prompts are in `config/content.ts`.
- Tests:
  - 238 unit tests pass (3 `todo`s): Block E verbatim; copy rules (no AI/person/chat
    claims, no promises or Section 14.2 terms, the rule line, the no-position line);
    prompt cards; vault and re-check helpers; plus all Session 3 decision fixtures.
  - 171 Playwright tests pass. The 21 new decision tests × 3 viewports cover:
    - **the network assertion**: a marked draft appears in no request URL, body or
      header, and in no local/session storage or cookie;
    - the draft gone after leaving the page;
    - **Block E directly above the textarea** (DOM and geometry), with spellcheck off;
    - every outcome path, including 01:30 night-send;
    - re-check time, reminder and banner;
    - the unsent list save, reload, delete and clear;
    - **the timer under reduced motion**, with prompt rotation and the completion
      actions with and without a tracker;
    - 320px with no overflow, and 44px targets.
- Mutation check: a draft that leaks to the server as he types, and Block E moved below
  the textarea, are each caught by their own test.
- Size: the decision route ships 145 kB first-load JS (budget 180 kB).

**Decisions and ambiguities (resolved with spec defaults)**

- **Nothing is saved automatically.** Block E promises the draft is "not stored after
  you leave this page", so the flow and draft live in memory only. This is unlike the
  Section 8.3 default of persisting tool state. The only stored items are the ones he
  explicitly saves: the unsent list and the re-check time.
- **Spellcheck, autocorrect and Grammarly are off** on every draft textarea. Chrome's
  enhanced spellcheck can send typed text to a server, which would break Block E.
- **Block D** shows on every outcome, not just "don't send". Section 14.1 says "the
  decision tool outcome view".
- **The Day N prompt card** falls back to "Every day of no contact is worth more than
  this draft." when there's no tracker, or on Day 0.
- **Timer `from`:** `tracker` when he arrived via `?from=tracker`, otherwise `decision`
  or `direct` by where he started it. This is recorded for the Session 13 analytics
  event.
- **The intensity slider starts at 5** (a slider must hold a value). 0 would understate
  by default.
- **"Wait 24 hours" for logistics** lists the specific reasons: no draft to check, drafted
  and deleted more than once, or draft flags.
- **Copy-rule test.** It ignores questions ("Can it tell me how she'll respond?"), since
  a question isn't a promise. Answers and statements are all checked.
- **Source guards.** The `{{` and gendered-literal guards caught a `style={{…}}` and a
  "he chooses" comment in `DecisionTool.tsx`. Both were fixed in the code; neither guard
  was loosened.

**Deferred**

- Analytics (`decision_started`, `decision_completed`, `urge_timer_completed`) →
  Session 13, never with draft text.
- Affiliate slot `decision-dont-send` → Session 10.
- Lighthouse and axe on this page → Session 13; not run in this session.

**For founder review now:**

- Outcome reasons, step wording and FAQ in `content/decision.ts` and `content/faqs.ts`.
- The extra pressure and ultimatum phrases in `config/content.ts` (from Session 3).
- The logistics template pattern.

## Session 8 — Profile pages and attachment hub (2026-11-01)

**Shipped**

- `/attachment-styles/`, the hub. It has:
  - four profile cards;
  - "Two scores, not four boxes", with a table showing which pattern each band
    combination lands in;
  - the anxious–avoidant trap;
  - "Patterns, not labels";
  - a quiz block;
  - "Where to read more", naming _Attached_ and _Anxiously Attached_ with no links;
  - a methodology link and a 4-question FAQ.
- `/attachment-styles/[profile]/`, statically generated for `secure`, `anxious`,
  `avoidant` and `fearful-avoidant`. Any other slug is a 404. Each page has:
  - the band combinations that land on it;
  - a "Check your own scores" quiz block;
  - what the pattern is (with all three lean paragraphs on the secure page);
  - how it shows up in a relationship;
  - after a breakup, and the no-contact risk with a tracker link;
  - watch-outs and strengths;
  - what helps, and "patterns can shift";
  - two next steps and the methodology link;
  - the other three profiles, and a 3-question FAQ.
- **Profile copy for all four profiles** is in `lib/quiz/profiles.ts` as `profileCopy`,
  so the Session 5 result view can reuse it. Each profile has a headline, a description
  (145–152 words), after-a-breakup, no-contact risk, three watch-outs, three strengths,
  two next steps, and the leans for secure. It is gender-neutral by rule.
- Long-form page copy is in `content/attachment-styles.ts`; the FAQs are in
  `content/faqs.ts` (`attachmentStyles`, `profiles`).
- **Band combinations are computed with `profileFor` from `lib/quiz`.** The hub table
  and each profile's list can't disagree with scoring.
- `validateJsonLd` in `lib/seo/schema.ts` structurally checks FAQPage and
  BreadcrumbList. It also rejects Section 12.2 prohibited types and any type not on the
  allow-list.
- Metadata for the five routes is in `lib/seo/metadata.ts`.
- Tests:
  - 269 unit tests pass (3 `todo`s). They cover:
    - `checkProfileCopy` on all four profiles;
    - the Section 9.4 risk wording (message-checking, reconciliation fantasies, delayed
      grief, rebound dating, oscillation);
    - gender-neutral profile copy;
    - next steps on Section 6 routes;
    - the Section 14.2 terms over every page string (including "disorder" and
      "guarantee"), identity claims and timeline promises;
    - the quiz framing phrase;
    - FAQ and breadcrumb schema validity, and that the validator rejects bad schema.
  - 303 Playwright tests pass. The 44 new tests × 3 viewports check:
    - on each page: one h1, the canonical, the JSON-LD validating, the FAQ schema
      matching the visible FAQ, no prohibited term in the rendered body or `<head>`,
      the quiz and methodology links, no horizontal scroll, and 44px standalone links;
    - the hub's four profile links, and the band table matching the engine and fitting
      320px in the default and a wide font;
    - the other-profile and tracker links on each profile page;
    - the secure leans;
    - the 404 for an unknown slug.
- Mutation check: a prohibited term in an FAQ answer, a `Person` author in the FAQ
  schema, and a missing other-profile link are each caught.
- Size: 106 kB first-load JS on all five pages (static, no client components).

**Decisions and ambiguities (resolved with spec defaults)**

- **Profile copy written now, not in Session 5.** Section 18 says Session 8 reuses
  "profile data extended with long-form content", but that data was still a Session 5
  TODO. I drafted it in `lib/quiz/profiles.ts`, where Section 9.4 puts it. It still
  needs the founder's word-by-word review before Session 5's result view ships.
- **No Block A on profile pages.** Section 14.3 places Block A on the quiz page, the
  result and methodology. It contains "therapy" and "diagnosis", which would break this
  session's done-when (no prohibited term on these pages). The pages instead use the
  Section 14.2 framing phrase ("a self-reflection assessment informed by attachment
  research") and link to methodology.
- **FAQ on the hub.** Section 12.2 lists FAQPage for the profile pages, not the hub. I
  added one anyway because it is visible content, not schema-only.
- **Band table at 320px.** The corner header is read only by screen readers; the caption
  explains the rows and columns. The table uses a fixed layout, 13px text below the `sm`
  breakpoint, and regular-weight band labels. Cells may wrap rather than clip.
  - CI caught the first version: on Linux's wider fonts, bold "moderate" clipped by a
    few pixels. The e2e test now also runs with a forced wide font (DejaVu Sans, or
    Verdana on macOS), and fails if the table overflows or any word breaks mid-word.
- **Two links point at pages not built yet.** `/attachment-style-quiz/` (Session 4) and
  `/methodology/` (Session 11) return 404 until then. So do the guides
  `/guides/attachment-styles-after-a-breakup/` and
  `/guides/how-long-does-a-breakup-take/` (Session 10).
- **The production server logs `NoFallbackError` for an unknown slug.** This is Next
  15's normal `dynamicParams = false` path, and the response is a correct 404.

**Deferred**

- Linking the hub from the homepage → Session 10, the homepage hub. Until then the hub is
  reachable only from the profile pages' breadcrumbs.
- WebSite, Organization and Article schema, and OG images → Session 12.
- Lighthouse and axe on these pages → Session 13.

**For founder review now:**

- All four profiles' copy in `lib/quiz/profiles.ts`. This is the product's voice at its
  most exposed (Section 18, Week 2).
- The page copy in `content/attachment-styles.ts`, in particular the claim that secure is
  "the most common pattern in the research".
- The profile and hub FAQs in `content/faqs.ts`.

## Session 10 — Homepage, guides, and resources (2026-11-01)

**Shipped**

- **Homepage hub (`/`).** It now has:
  - the three tools;
  - "Understand your pattern": four profile cards plus a link to `/attachment-styles/`;
  - "Guides for the hard moments": all five guide cards;
  - a resources block;
  - "How this site works" (free in full, stays on your device, rules not a chatbot),
    linking Methodology and About.
- **Guide template.** One `GuidePage` renders both kinds of guide:
  - breadcrumbs, the H1, a visible "Last reviewed" date from content metadata, the
    intro and the sections;
  - then the tool block (`ToolBlock`) and one sibling guide (Section 6);
  - FAQ only where a guide has one;
  - no byline anywhere (Section 12.5);
  - Article and BreadcrumbList schema, plus FAQPage when there are FAQs.
- **Guide content is typed data, not MDX.** The five guides are files in
  `content/guides/`, with block types for paragraphs, lists, bold-lead lists, callouts,
  links and affiliate slots. Their metadata is in `config/content.ts` (`guides`): route,
  kind, tool, sibling and both dates.
- **All Section 12.3 launch content:**
  - `/no-contact-rule/` (Guide 1, the cluster hub, with 4 FAQs). Its "What counts as
    contact" and 30/60/90 sections reuse the tracker's own definitions, so the two pages
    can't disagree.
  - `/guides/attachment-styles-after-a-breakup/` (Guide 2). Each profile section starts
    from `profileCopy`, plus the anxious–avoidant trap; the tool block is the quiz.
  - `/guides/how-long-does-a-breakup-take/` (Guide 3):
    - honest ranges and what makes it longer;
    - the first 90 days, plus the 30-day-stretches framing for the later programme;
    - what helps, with the disabled in-content slot;
    - "When it's more than a breakup", linking Crisis Resources.
  - `/guides/no-contact-day-14/` and `/guides/she-texted-me-during-no-contact/`, the two
    situational instances.
- **Situational template.** The section order is in `config/content.ts`
  (`situationalTemplate`): why it spikes, what's normal, the three mistakes, the next 24
  hours. A page may override a heading for its moment.
  - Adding a situational page means three things: a content file, a `guides` entry and a
    metadata entry. No component changes.
- **`/recommended-resources/`.** Organised by moment:
  - **For the first two weeks:** the site's own tools and the no-contact rule.
  - **For understanding your pattern:** _Attached_ and _Anxiously Attached_.
  - **Programmes that go deeper:** Personal Development School and Chris Seiter's Ex
    Recovery Program, with the Section 13.4 honest-framing line above them.
  - One slot per resource, all four disabled. There are no URLs, prices or payouts on
    the page.
- **Affiliate infrastructure.**
  - `lib/affiliates.ts`: `renderableSlot`, which throws on an unknown id and returns
    nothing for disabled or incomplete slots; plus `checkSlotCopy` and `slotLimitFor`.
  - `components/content/AffiliateSlot.tsx`: the Section 14.5 disclosure directly above
    the slot in body-size text, in the same container, with `rel="sponsored nofollow
noopener"`.
  - Wired, still disabled, into the tracker (`tracker-after-explainer`), the decision
    tool's don't-send outcome (`decision-dont-send`), Guide 3 and the resources page.
  - The Section 14.5 disclosure and the Section 13.4 honest-framing line are verbatim in
    `content/compliance.ts`.
- **`FounderNote`** is defined and tested, with an optional `media` slot that renders
  nothing when empty. It is used on zero pages.
- `ProfileCard` and `GuideCard` are shared components; the attachment hub now uses
  `ProfileCard`.
- Metadata for the six new routes is in `lib/seo/metadata.ts`. `validateJsonLd` now also
  checks Article: headline length, ISO dates, modified not before published, and
  Organization author and publisher.
- Tests:
  - 316 unit tests pass (3 `todo`s). The new ones cover:
    - the guide registry, tools and siblings;
    - links and dates;
    - the situational template and both instances;
    - Section 14.2 terms, timeline promises and bylines over all new copy;
    - no hardcoded partner pronouns in the new content source;
    - no URL or price on the resources page;
    - both verbatim lines;
    - the slot rules (all disabled, per-page limits, ids exist, disabled and incomplete
      slots render nothing, an enabled slot puts the disclosure first with the sponsored
      rel, copy rules);
    - `FounderNote` rendering, and that it is unused;
    - Article and FAQ schema.
  - 411 Playwright tests pass.
    - **No orphan routes:** a crawl from `/` reaches every indexable Section 6 route
      within two clicks. Every internal link on every built page is a Section 6 route.
      The tracker and the decision tool link each other.
    - **Homepage:** it links the tools, the hub, all profiles, all guides and the
      resources page.
    - **Each guide:**
      - its H1 and last-reviewed `<time>`;
      - the tool block, then exactly one sibling;
      - the JSON-LD validating, with dates matching config;
      - no prohibited term, no byline and no slot;
      - no overflow, and 44px links.
    - **Situational pages:** headings in template order, and three mistakes.
    - **Resources:**
      - it is organised by moment, with 4 resources and no slot;
      - the framing line sits above the programmes;
      - there are no outbound links;
      - the breadcrumb validates.
- Mutation check: each of these is caught by its own test:
  - removing the homepage resources link (orphans the page);
  - a link to a non-Section-6 `/guides/`;
  - enabling a slot.
- Size: 106 kB first-load JS on every content page.

**Decisions and ambiguities (resolved with spec defaults)**

- **Typed TypeScript content instead of MDX or Markdown.** Section 7.2 allows "MDX or
  Markdown". Typed data needs no new dependency and is checked by the compiler and
  tests. A new guide is still a content-only task.
- **Guide breadcrumbs are Home › Guide.** Section 6 has no `/guides/` index route, so
  there is no middle crumb.
- **Article schema now, not in Session 12.** It came with the guide template. Author and
  publisher are the site as an Organization, never a Person.
- **The resources page allows four slots.** Section 13.4 says "never more than two per
  page" but also "up to 4, one per resource" on this page. The page-specific rule wins
  (`slotLimitFor`).
- **No outbound links on the resources page** while every slot is disabled, because
  URLs may live only in config. The entries name each resource so it can be found.
- **The homepage "How this site works" block avoids Block B's wording.** The homepage
  isn't a tool page, and Block B contains Section 14.2 terms.
- **Guide dates are 2026-11-01** for both published and last reviewed. Change
  `lastReviewed` in `config/content.ts` only when the content changes.

**Deferred**

- The footer email signup → Session 9.
- WebSite and sitewide Organization schema, sitemap and robots, OG images → Session 12.
- Analytics (`guide_tool_click`, `affiliate_slot_view`, `affiliate_click`) → Session 13.
- Lighthouse and axe on these pages → Session 13.

**For founder review now (required before this session closes, per Section 12.3):**

- **All five guides** in `content/guides/`, for accuracy and voice. In particular:
  - the first-month texture in the no-contact rule;
  - the 90-day ranges in Guide 3;
  - the co-parenting lines.
- **`content/resources.ts`.** Confirm that each resource is one you've used, and check
  each description, before any slot is enabled. In particular, check the programme
  name "Ex Recovery Program" and how it is described.
- **The homepage copy** in `content/home.ts`.
- **Your choice of byline line.** None is used now. "Reviewed by HeartFixed editors"
  can be added only if you approve that exact line (Section 12.5).
- **One Session 6 line to fix.** The tracker FAQ in `content/faqs.ts` still says "She
  reaching out doesn't reset your counter". I left it as it is, since it is outside this
  session. The guides now say "When she reaches out…".

## Session 11 — Legal and trust pages (2026-11-01)

**Shipped**

- **Seven pages.** Privacy, Terms and Affiliate Disclosure share a `LegalPage` template
  (visible "Last updated", the guide block renderer). About, Contact, Methodology and
  Crisis Resources are their own pages. Each has breadcrumbs, a BreadcrumbList and
  metadata.
- **`/privacy-policy/`** covers every Section 14.4 item:
  - what stays in the browser, and that clearing it erases it unrecoverably;
  - the three separate email choices;
  - what's never collected;
  - cookies and analytics in plain terms;
  - one-click unsubscribe;
  - sharing, by provider category (email, analytics, hosting); no sale; no sharing of
    self-reflection content, affiliates included;
  - what an affiliate click shares;
  - share links;
  - retention (the list inactivity purge comes from `config/legal.ts`);
  - requests via Contact;
  - adults only;
  - changes.
- **`/terms/`** covers:
  - educational purpose;
  - no professional relationship, with Block B quoted verbatim;
  - results are self-reflection, not diagnosis;
  - not an emergency service;
  - 18+ and acceptable use;
  - your data;
  - intellectual property;
  - third-party links;
  - no warranties and limitation of liability;
  - changes and contact.
- **`/affiliate-disclosure/`** covers:
  - what an affiliate link is;
  - the Section 14.5 sentence quoted;
  - what money never changes (results, recommendation order, tool behaviour);
  - how recommendations are chosen;
  - what a click shares.
  - A **live status line** computed from `config/affiliates.ts`: "Right now, no links on
    this site are affiliate links."
- **`/about/`** — faceless. It covers what the site is and who it's for: "For adults
  (18+)" (Section 14.1 item 8), plus how it works and how it's funded. It carries Block B
  (Section 14.3) and links Crisis Resources (Section 14.1 item 5), Methodology,
  Disclosure, Privacy and Contact.
- **`/contact/`** — the email comes from `config/site.ts`. While that's empty the page
  shows "The contact address will be listed here before launch", never an empty
  `mailto:`. It uses the Section 14.4 line "Replies within a few days; this site cannot
  help with emergencies — see Crisis Resources." It also explains that browser data
  can't be seen or deleted by us.
- **`/methodology/`** — Block A sits directly under the H1, followed by the Section 14.2
  framing. It covers:
  - the two dimensions;
  - the questions, with counts, reversed items and context questions all read from
    `config/quiz.ts`;
  - the Likert labels from config;
  - scoring and bands from config, with the shared `BandTable` computed by
    `profileFor`;
  - "same answers, same result", and that scoring runs in the browser;
  - the limits ("not a clinical instrument");
  - sources.
  - The attention check is deliberately not mentioned (Section 9.2).
- **`/crisis-resources/`** — Block D is first under the H1. Then:
  - the US lines: 988 (call/text), the Crisis Text Line (text HOME to 741741) and 911,
    each with `tel:`/`sms:` links;
  - "Outside the US" with the emergency-number guidance;
  - "If you're worried about someone else";
  - "not a crisis service".
- **Block A** is verbatim in `content/compliance.ts`, with a `SelfReflectionDisclaimer`
  component (it was a Session 5 TODO). The Section 14.5 and 13.4 lines were added in
  Session 10.
- **International crisis lines are gated.** `InternationalLine` needs `sourceUrl`
  (https, the provider's own page) and `verifiedOn`, and
  `verifiedInternationalLines` renders only complete entries. The list ships empty: no
  number from memory.
- **`npm run test:launch`** (`tests/unit/launch-readiness.test.ts`) is skipped in normal
  runs. It fails until the founder supplies:
  - the contact email;
  - the mailing address;
  - at least one verified international line;
  - an explicit `ownUse` on every resource.
  - It fails all 4 today, as intended.
- `BandTable` is now shared by the hub and Methodology.
- Tests:
  - 356 unit tests pass (4 launch checks skipped, 3 `todo`s). The new ones cover:
    - Block A verbatim and in body-size text;
    - Privacy, Terms and Disclosure topic coverage and required statements;
    - About 18+ and the crisis link; the Contact expectations line;
    - Methodology numbers from config, its framing, no attention check;
    - the crisis US lines and the international gate;
    - no Section 14.2 terms in trust and crisis copy;
    - no subscription/trial/membership language;
    - no partner pronouns.
  - 546 Playwright tests pass. 6 are marked `fixme`: the quiz and results routes.
    - **The guardrail sweep** (`guardrails.spec.ts`) runs over every Section 6 route.
      It checks:
      - Block C and the crisis link in every footer;
      - Blocks B, D and A where required;
      - no chat UI;
      - no prohibited term outside the verbatim Blocks A/B and the three legal pages.
      - Unbuilt routes are listed as `fixme`, so the gap stays visible.
    - **The trust-page suite** (`trust-pages.spec.ts`) checks the H1, canonical and
      breadcrumb schema, layout, the last-updated dates, and the per-page placement and
      copy checks.
- Mutation check: each of these is caught by its own test:
  - Block D moved below the intro on the crisis page;
  - Block B removed from About;
  - "therapy" added to the methodology copy.

**Decisions and ambiguities (resolved with spec defaults)**

- **The guardrail sweep is "fully green" except for the Section 16.4 items that need the
  quiz.** Block A on the quiz page and under the result headline, Block D on the result
  view, and "full completion with the email field untouched" all wait for Sessions 4–5.
  They're `fixme`, not passing.
- **The prohibited-terms exemption** is the three legal pages plus the verbatim Blocks A
  and B wherever they render, which Section 14.3 requires on Methodology and About.
- **List inactivity purge defaults to 24 months** (`config/legal.ts`). Set the same value
  in the email provider, or change both.
- **Terms leave out a legal entity name and governing law.** Both need the lawyer review
  Section 14 asks for.
- **Crisis copy says only what the spec states.** I removed "free and confidential",
  "trained people" and "24/7 by text" claims I couldn't source from the spec.
- **"Privacy policy describes analytics"** that Session 13 wires up. The policy's
  wording matches the Section 16.1 event rules.

**Deferred**

- `crisis_link_click` analytics → Session 13.
- Email-footer mailing address, and the result-email Block A short form → Session 9.

**For founder review now (blocking launch, not this merge):**

- **The contact email and mailing address** (`config/site.ts`).
- **International crisis lines.** Add entries to `crisisPage.international.lines` in
  `content/crisis.ts`, each with the provider page you checked and the date.
- **`ownUse`** on each resource in `content/resources.ts`. Set `true` only where you've
  used it; the disclosure page then says so.
- **The About facts** in `content/trust.ts`.
- **A lawyer's review** of Privacy and Terms before any paid promotion (Section 14).

## Session 12 — SEO infrastructure (2026-11-01)

**Shipped**

- **Metadata audit (Section 12.2).** Every Section 6 route now has an entry in
  `lib/seo/metadata.ts`, including the quiz and results routes, ready for Sessions 4–5.
  Each entry has:
  - a unique title (≤ 60 characters, keyword first, brand last) and a unique
    description (≤ 155);
  - the free / no-signup fact on the three tool pages;
  - a canonical URL from config;
  - OG and Twitter cards (`summary_large_image`) with an image.
  - Only the results shell is `noindex`.
- **Per-tool OG images.** `site`, `quiz`, `tracker` and `decision` cards render with
  `next/og` (its bundled font, no network font) at `/og/<key>/`. They are statically
  generated, and their copy is in `content/og.ts`. The tracker, decision tool and quiz
  each get their own card; every other page uses the site card.
- **Icons:** `app/icon.svg` (the favicon) and a 180px touch icon at
  `/apple-touch-icon/`, which is also the Organization logo.
- **Sitewide JSON-LD.** WebSite and Organization are in the root layout. They are
  faceless (no Person), and `sameAs` comes from `site.social` and is omitted while
  empty. `validateJsonLd` now covers WebSite and Organization as well.
- **`/sitemap.xml`** lists exactly the Section 6 indexable routes, as absolute URLs.
  Guides and legal pages carry their real `lastModified`; other routes omit it rather
  than guess.
- **`/robots.txt`** allows all, disallows `/api/` and the results shell, and names the
  sitemap.
- **A real 404** (`app/not-found.tsx`). It returns 404 with Next's `noindex`, has its
  own title, links the three tools and Crisis Resources, and keeps the footer crisis
  line.
- **Redirect rules.** `config/redirects.ts` is checked by `checkRedirects`:
  - sources are lowercase, slash-ended paths;
  - a source never shadows a live route;
  - destinations are Section 6 routes;
  - no duplicates and no chains.
  - The list is empty at launch.
  - www → apex, http → https and the defensive domain stay at the host (Section 17.5).
- **Planning notes.** `docs/planning/keyword-pull.md` holds the founder's table for the
  five unverified strings (Section 3.1).
- **New dev dependency:** `@axe-core/playwright` 4.14.0, pinned exactly. It was
  published 2026-10-15; `axe-core` 4.14.0 was published 2026-10-05.
- Tests:
  - 374 unit tests pass (4 launch checks skipped, 3 `todo`s). The new ones cover:
    - metadata for every route, unique titles and descriptions, the tool free/no-signup
      fact;
    - canonical, OG and Twitter per route; card mapping; noindex only on the results
      shell;
    - the OG copy language;
    - sitemap equals the indexable routes, with real dates;
    - the robots rules;
    - the redirect checker, plus 5 rejection cases;
    - WebSite and Organization validity.
  - 756 Playwright tests pass. 6 are marked `fixme` (the quiz routes).
    `seo.spec.ts` covers:
    - **Every built page:** title, description, canonical, og:title, og:description,
      og:url, og:image, twitter:card and twitter:image match `lib/seo/metadata.ts`, with
      no robots tag.
    - **Every built page's JSON-LD:** exactly one WebSite and one Organization, every
      block valid, no prohibited type.
    - **Axe:** zero critical violations on every built page, the 404, a running tracker
      streak, and the decision tool's outcome view.
    - **No `{{`** in any page's HTML (Section 19.1).
    - **Images:** every OG card and the touch icon return 200 PNG with no redirect.
    - **Sitemap and robots:** the live `sitemap.xml` and `robots.txt`.
- Mutation check: each of these is caught by both unit and Playwright tests, except the
  404 button, which only Playwright's axe check can see:
  - the results shell added to the sitemap;
  - an unlabelled button on the 404 (a critical axe violation);
  - a `Person` in the Organization schema.

**Decisions and ambiguities (resolved with spec defaults)**

- **OG images come from a route handler, not the `opengraph-image` file convention.**
  Next emits those URLs without a trailing slash (`/opengraph-image?hash`), and
  `trailingSlash: true` then 308-redirects them. The route handler is served at
  `/og/<key>/` with a 200, and metadata references that exact URL. The touch icon works
  the same way.
- **Page metadata always sets `og:image` explicitly.** A page-level `openGraph` object
  replaces the inherited root image, so guide pages had none until this was done.
- **No web app manifest.** Section 5.2 rules out a PWA install prompt, and a manifest
  can make the site installable.
- **The sitemap includes the quiz route, which 404s until Session 4.** The spec says
  "exactly the Section 6 indexable routes". It is submitted to Search Console only at
  launch.
- **Earlier specs check page-level schema only.** The attachment, content and trust
  specs asserted each page's exact JSON-LD types. They now set aside the sitewide
  WebSite and Organization, which `seo.spec.ts` checks on every page instead.
- **The axe gate is critical-only,** per Section 16.4's wording. Session 13 runs the
  full axe and Lighthouse pass.

**Deferred**

- Lighthouse budgets, analytics, and the full Section 16.4 QA record → Session 13.
- The quiz and results pages' SEO checks → Sessions 4–5. Their metadata and the quiz
  card already exist.
- Host redirects (www → apex, http → https, fixedheart.com) and the Search Console
  sitemap submission → Session 14.

**For founder:**

- **Keyword pull.** Fill in `docs/planning/keyword-pull.md` from a paid Semrush or
  Ahrefs session before planning month two.
- **Review** the OG card copy in `content/og.ts` and the 404 copy in
  `content/notFound.ts`.

## Session 9 — Email flows (2026-11-01)

**Shipped**

- **`POST /api/email/`** (`app/api/email/route.ts`), the site's only server route. Logic
  lives in `lib/email/handler.ts` so every path is unit-tested. Order: per-IP rate limit
  (`EMAIL_RATE_LIMIT`, default 5/hour) → shared Zod validation → honeypot → provider →
  exactly one action. Other guards:
  - bodies over 4 KB are rejected;
  - responses are `{ ok }` or an error code only, never the address, and `no-store`;
  - nothing in `lib/email/` or `app/api/` logs.
- **Consent separation (Section 13.1)** is built into the shape of the code, not
  enforced only by UI:
  - **(a) `send_result`:** one transactional send that never subscribes. The list join
    happens only when the separate, unchecked box is ticked, as its own provider call.
    If that join fails after the send, the form says so honestly.
  - **(b) `join_list`:** list only, with a placement of footer, result or tracker.
  - **(c) `reminders_on`:** reminders only, with their own consent.
- **Provider interface** (`lib/email/provider.ts`): `send`, `joinList` and
  `enableReminders`.
  - **Resend over REST with `fetch`** — no SDK, endpoints checked against Resend's
    current docs:
    - `POST /emails` with auth and a category tag;
    - contacts upserted via `POST /contacts`, falling back to
      `PATCH /contacts/{email}` and `/contacts/{email}/topics`;
    - auth, quota and rate errors fail instead of falling through.
  - **Topics carry the consent.** The list and reminders are two Resend Topics, so each
    unsubscribes independently. Reminders also store `hf_start_date`, `hf_goal_days`,
    `hf_reminder_hour` and `hf_time_zone`.
  - **A memory provider** records actions for tests and local QA.
  - **No configuration means `not_configured`,** never a pretend success.
- **The quiz result email** (`lib/email/resultEmail.ts`) is built on the server from the
  Section 9.6 share token alone, so bands and profile come from the engine
  (`decodeShareToken`); tampered or outdated tokens are refused. It contains:
  - the Section 13.2 subject;
  - both scores with bands;
  - the lean paragraph where it applies, then the description and watch-outs;
  - "Your first 14 days", per profile (`content/emails/actionLists.ts`);
  - the tracker link, the reading list and the resources page;
  - the share link;
  - Block A, the Block A short form and the requested-on-site note (Section 14.4);
  - Block C;
  - a clearly separate list-join link.
- **The welcome sequence** (`content/emails/welcome.ts`) is five emails on days 0, 2, 4,
  7 and 10, linking what Section 13.2 names. Email 5 carries the honest-framing line
  and the `email-welcome-5` slot. While the slot is disabled, it links the resources
  page instead; when enabled, the Section 14.5 disclosure sits directly above it,
  inside the email.
- **Reminder templates** (`content/emails/reminders.ts`): "Day N. Still going." with
  "If you've already checked in today, ignore this.", plus a goal-reached email that
  stops reminders.
- **`renderMarketingEmail`** puts Resend's `{{{RESEND_UNSUBSCRIBE_URL}}}` one-click
  link, the config mailing address and Block C in every list and reminder email. It
  **refuses to render without a mailing address**, except in preview mode.
- **`npm run emails:export`** writes every template to `emails-out/` (git-ignored) for
  loading into Resend automations. It fails until the mailing address is set.
- **Forms**, each with one email field, a honeypot, inline errors via `aria-live`,
  inline success and no redirect:
  - **The footer** (Section 13.3, verbatim microcopy) on every page. It's the only
    pre-value form.
  - **The tracker** shows reminders (with an hour picker) and its own list join, only
    once a streak exists. Reminders send Day 1, the goal, the hour and the time zone —
    never notes, urges or slips. Success sets `reminderOptIn` in the tracker state; the
    address is never stored in the browser.
  - **`components/quiz/EmailResultForm.tsx`** is built and unit-tested (the verbatim,
    unchecked-by-default list box; a print fallback on failure). Session 5 places it on
    the result view.
- **Privacy Policy** now says exactly what reminders store and how long it's kept.
- **`.env.example`** adds `EMAIL_REMINDER_TOPIC_ID` and the test-only `EMAIL_PROVIDER`.
  Playwright runs the server with the memory provider.
- Tests:
  - 414 unit tests pass (5 skipped: launch checks and export; 3 `todo`s). The new ones
    cover:
    - consent separation for every action;
    - disposable addresses accepted;
    - honeypot, rate limit and sliding window;
    - token tampering, no provider, provider failure, no echo;
    - reminder setting validation, and unknown fields stripped;
    - no logging;
    - every required part of the result email;
    - the marketing footer (unsubscribe, address, crisis line);
    - the welcome-sequence schedule and links;
    - the disclosure above an enabled email slot;
    - copy rules (no urgency, nothing person-like, no subscription or prohibited
      terms);
    - the Resend adapter against a fake `fetch`;
    - provider selection;
    - the verbatim form copy.
  - 783 Playwright tests pass. 6 are marked `fixme` (the quiz routes). They check:
    - the footer form on every page type;
    - inline validation, then a join with the **exact request body** (action,
      address, placement and the empty honeypot only);
    - no tracker form before a streak;
    - reminders sending only what they need, and staying on after reload, with the
      address not in `localStorage`;
    - the tracker list join leaving reminders off;
    - the API's codes, `no-store`, the 400/413/405 cases, and robots/sitemap
      exclusion.
- Mutation check: each of these is caught:
  - a result send that always joins the list;
  - reminders that also join the list;
  - a marketing email without unsubscribe;
  - the footer sending an extra field.
- Size: tracker 145 kB and decision tool 146 kB first-load JS (budget 180 kB); other
  pages 106 kB.

**Not done — needs the founder (the session's done-when)**

Section 18 says Session 9 is done when the Section 16.4 email criteria pass **on a
preview with a real inbox**. That needs Resend set up, so it is **not yet verified**:

1. In Resend:
   - verify the sending domain (SPF, DKIM, DMARC);
   - create two Topics with default "Opt-out": the email list and tracker reminders;
   - create the four `hf_*` contact properties (types in `.env.example`).
2. In Vercel: set `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_LIST_ID` (the
   list Topic) and `EMAIL_REMINDER_TOPIC_ID`.
3. Set `mailingAddress` in `config/site.ts`, run `npm run emails:export`, and load the
   welcome sequence into a Resend automation for list joins.
4. On the preview, check:
   - footer, tracker and result joins land on the list Topic;
   - a result send with the box unticked creates **no** list subscription;
   - reminders land on the reminder Topic, independent of the list;
   - one-click unsubscribe works for each Topic.

Two adapter details the docs left ambiguous are confirmed by step 4:

- the status Resend returns for an existing contact;
- whether `PATCH /contacts/{email}/topics` takes `{ topics: [...] }` or a bare array.

**Decisions and ambiguities (resolved with spec defaults)**

- **Topics, not one list.** Section 13.1 needs reminders as "their own consent flag,
  unsubscribable independently". In Resend that is a Topic, so `EMAIL_LIST_ID` holds
  the list Topic id and `EMAIL_REMINDER_TOPIC_ID` is added.
- **Reminder sending isn't built.** Section 18 says "sending configured in the
  provider". The daily "Day N" email needs a per-contact daily schedule that skips days
  with a check-in. Whether a Resend automation can compute Day N from
  `hf_start_date` + time zone is unconfirmed. If it can't, the smallest fix is a daily
  scheduled job that reads the reminder Topic from Resend: no database, but it is new
  server code. **Open question for the founder before reminders go live.**
- **The rate limit is in-memory, per server instance** (no database in the MVP).
  Accepted for launch, with the honeypot as a second guard.
- **No tracker summary email.** Section 13.1(a) mentions "my tracker summary", but
  nothing in Sections 11.1, 13.2 or 16.4 specifies or tests one. The tracker already
  exports its data.
- **Result email transport:** the share token, not raw scores. It's the same data,
  validated by the engine's own decoder.
- **The result email carries both the Block A short form (Section 14.4) and full Block
  A (Section 13.2).**
- **Endpoint path is `/api/email/`** with a trailing slash; without it,
  `trailingSlash: true` 308-redirects the POST.

**Deferred**

- Placing `EmailResultForm` on the result view → Session 5.
- `email_result_*`, `newsletter_signup` and `reminder_optin` analytics → Session 13,
  with codes, placements and goal days only.

**For founder review now:**

- The 14-day action lists (`content/emails/actionLists.ts`), as Section 13.2 asks for
  Session 9.
- The welcome sequence and reminder copy (`content/emails/`).
- The form copy (`content/emails/forms.ts`).

## Session 13 — Analytics and full QA (2026-11-01 → 2026-11-02)

**Shipped**

- **First-party analytics (Section 16.1).** Every Section 16.1 event, plus `page_view`,
  is sent by the browser to our own `POST /api/collect/`. The route then forwards it to
  GA4 with the Measurement Protocol.
  - **Why no Google script:** `gtag.js` alone is about 157 kB gzipped, which would break
    the 180 kB tool-page budget on its own.
  - **No cookies.** A random client id and a 30-minute session id are kept under
    `heartfixed-analytics-v1`. "Clear my data" removes them too.
  - **Global Privacy Control turns analytics off entirely.**
  - **The Privacy Policy's "Cookies and analytics" section** now describes exactly
    this.
- **Two checks before anything reaches GA4:**
  - **In the browser** (`lib/analytics.ts`, no zod): a known event name, known
    parameter keys, and only booleans, small integers or short lowercase codes as
    values. Free text never leaves the browser, even from a call site that gets it
    wrong. In development, a bad event throws.
  - **On the server** (`lib/analyticsSchema.ts`): the exact allow-list, as strict zod
    schemas. The route also:
    - rejects any body containing `@`;
    - caps bodies at 8 kB;
    - rate-limits per IP (`ANALYTICS_RATE_LIMIT`, default 600 an hour);
    - always answers 204 or 400/429, with no body;
    - never logs.
  - Unit tests keep the browser's name and key lists in step with the schemas.
- **Wiring:**
  - The tracker sends created, check-in (a day band, never the day), slip type and
    reminder opt-in.
  - The decision tool sends started, completed (outcome and whether the draft check
    was used) and the urge timer's source.
  - The email forms send codes and placements.
  - A delegated listener sends page views (flagging 404s), crisis-link clicks by
    placement, guide tool-block clicks, and affiliate slot views and clicks.
- **New environment variables:** `GA4_API_SECRET` (server-only) and
  `ANALYTICS_RATE_LIMIT`, both in `.env.example`. Without the secret, events are
  validated and then dropped.
- **Performance fixes found by Lighthouse:**
  - **zod is out of the shared bundle.** Since Session 9, the footer form's
    `checkEmail` had put zod (26 kB gzipped) on every page; Session 13's `track()` was a
    second path in.
    - New `lib/email/rules.ts` holds the address rule and placements, without zod. Its
      regex is zod's own, checked by a test against `z.regexes.email`, plus a parity
      test against the server schema.
    - The server schema in `lib/email/validate.ts` is built from the same values.
  - **The tool pages' storage schemas now use `zod/mini`** (`lib/tools/tracker.ts`,
    `decision.ts`, `unsent.ts`, `lib/storage.ts`). Zod on those pages went from 26 kB
    to 8 kB. The validation rules are unchanged, and all tool tests pass unedited.
  - **Home page profile cards** now say "More on the … pattern" instead of "Read
    more", for Lighthouse SEO `link-text`.
  - **`app/favicon.ico`** (32 px, from the touch icon) removes a 404 on every page.
- **`QA.md`** records the full Section 16.4 checklist: Pass or Open for each item, with
  the test that proves it, plus the Lighthouse and INP results.
- **Lighthouse 13.5.0, mobile, median of 3 runs:**

  | Pages           | Perf | A11y | Best Pr. | SEO | LCP (budget)      | CLS |
  | --------------- | ---- | ---- | -------- | --- | ----------------- | --- |
  | Both tools      | 100  | 100  | 96       | 100 | 1.88–1.89 s (2.0) | 0   |
  | Home and guides | 100  | 100  | 96       | 100 | 1.72–1.73 s (1.8) | 0   |
  - Before the fixes, LCP was about 2.05 s everywhere and home SEO was 92.
  - Lab INP, measured with the Event Timing API at 4× CPU: 64 ms worst on the tracker,
    40 ms on the decision tool.
  - Tool-page JS is 127–129 kB gzipped (Next first-load), against 180 kB.

- **Tests:**
  - 429 unit tests pass (5 skipped, 3 todo).
  - 795 Playwright tests pass (6 `fixme`: the quiz routes).
  - New unit tests:
    - the allow-list matches Section 16.1 exactly;
    - sensitive and extra parameters are rejected;
    - day bands;
    - the Measurement Protocol transform and URL;
    - config from the environment;
    - no `gtag`, GTM or `dataLayer` in the source;
    - the browser check and its drift tests;
    - email-rule parity.
  - New Playwright tests:
    - a full journey with marked private text (a note, a draft, an address) that
      inspects every `/api/collect/` body;
    - Global Privacy Control means no requests;
    - the API's 204 and 400 cases.
- **Mutation checks, each caught:**
  - a draft leaked into an event (with client validation off);
  - a loosened server schema;
  - the browser check without the key allow-list;
  - the browser check with a permissive value pattern;
  - a changed email regex.

**Not done — needs the founder**

- **GA4 DebugView.** Set `GA4_API_SECRET` on a preview, run a journey, and confirm that
  only allow-listed parameters arrive. The network-log half of the criterion is
  automated.
- **The Session 9 real-inbox email checks.** These are still open; see the Session 9
  entry.

**Open until Sessions 4–5**

- Quiz events (`quiz_view`, `quiz_started`, `quiz_completed`, `quiz_result_shared`).
  They're defined and validated, but not yet sent.
- Lighthouse on the quiz page.
- The quiz rows of `QA.md`.

**Decisions and ambiguities (resolved with spec defaults)**

- **The Measurement Protocol instead of `gtag.js`.** Section 16.3's JS budget is an
  acceptance criterion, and `gtag.js` alone would break it. The Measurement Protocol
  also means no Google script, and no Google cookies, in the browser.
- **`fetch` with `keepalive` instead of `sendBeacon`.** It behaves the same on unload,
  and Playwright can read its body for the payload inspection.
- **`page_view` added** to the Section 16.1 events, with a path only (no query or
  fragment) and a `not_found` flag.
- **"All three tools" in Section 18 is two for now.** The quiz isn't built; it's
  measured in Session 5.
- **The INP budget is checked in the lab with Event Timing,** because a Lighthouse
  navigation can't measure INP. Real-user data confirms it after launch.
- **Best Practices is 96, not 100,** because of the 404 when the quiz link is
  prefetched. It meets the ≥ 95 budget and clears once the quiz exists.

## Session 14 — Production launch: blocked, tracker added (2026-11-02)

**Shipped**

- **`LAUNCH.md`** tracks every Section 19.1 item, with its status (Done, Ready or
  Blocked), its owner and its evidence. It also lists the founder's steps in order and
  what Claude does once they're done.

**Not done: the launch itself**

Session 14 is done only when Section 19.1 is fully ticked on the live domain. As of
this entry, none of it can be ticked:

- **`npm run test:launch` fails 0/4.** The contact email, mailing address,
  helpline verification and resource own-use answers are all missing.
- **Both domains are still on registrar parking pages.**
- **The quiz isn't built (Sessions 4–5).**
- **The Resend, GA4 and Search Console steps aren't done.**

No production deploy, DNS change or affiliate change was made.

**Noted**

- The "get her back" part of Section 19.1 isn't in the automated prohibited-terms
  pattern. A manual grep of the source is clean, and it's recorded in `LAUNCH.md` for
  a re-check on the live domain.

## Session 4 — Attachment-style quiz page and runner (2026-11-02)

**Shipped**

- **The founder-approved question data**, from `heartfixed-quiz-build-brief.md` (Part A),
  now committed in the repo root as the content source:
  - his 24 (`men-v1`), with q19, q20, q23 and q24 reversed and q23/q24 at weight 0.5,
    so max raw is 46 per dimension;
  - her 12 (the perceived-pattern module), 6 per dimension, none reversed;
  - the 6 since-the-breakup selectors (unscored);
  - the attention check at runner position 13, unnumbered;
  - the instruction line, and the 2 context questions last.
  - Every stem uses partner tokens from `config/copy.ts`. `renderStem` gained
    `{Subject}` for a sentence-initial "She".
  - **`tests/unit/quiz-brief.test.ts` parses the brief's own tables** and checks every
    rendered stem, dimension, reversal and weight against them word for word. On its
    first run it caught a dropped word in my q08; the data was fixed, not the test.
- **Engine additions, all in `lib/quiz/`:**
  - `scorePerceived` scores her module through the same `scoreQuiz` path (same
    normalization, bands and profile table).
  - `selectedDecodes` picks the selectors answered "Sometimes" or higher, for
    Session 5's decode sections.
  - `lib/quiz/runner.ts` (pure, unit-tested): the screen order, the 7-day expiry, and
    `completeAttempt`, which scores a finished attempt into what saves.
  - Storage schemas for the saved result (`heartfixed-quiz-v1`: his result, her
    perceived pattern, every answer, context) and the in-progress attempt
    (`heartfixed-quiz-progress-v1`).
  - `lib/quiz` now uses `zod/mini`, like the tools, and sticks to the zod features
    the tools already load, so it adds nothing to their shared zod chunk.
- **`/attachment-style-quiz/`** (Section 10.1):
  - Above the fold: the H1, a two-sentence promise, Block A, then the start button.
  - Server-rendered below: the four profile cards, how it works, who it's for and not
    for (with the Block C crisis line), a FAQ with schema, a trust block, and Block B.
  - No email field and no affiliate slot.
- **`QuizRunner`** (Section 10.2; brief, Part A):
  - One item per screen, with real radio inputs in a form: arrows choose, Enter
    advances.
  - Section labels: "Question N of 24"; the attention check unnumbered; "About her — N
    of 12"; "Since the breakup — N of 6"; "About where you are now — N of 2", with the
    context note. Context questions can be skipped.
  - Back keeps answers. "Choose an answer to continue" is inline and announced.
  - Progress saves on every answer. A return visit offers "Continue where you left off
    — question N of 24" or a restart. Attempts untouched for 7 days are discarded.
  - A saved result offers "See your result", or a retake after "Taking it again will
    replace your saved result."
  - "Start over" and "Clear my data on this device" are always visible. A corrupted
    stored value is cleared with a plain-English note.
  - On the last answer it scores in the browser, saves, and routes to the result view
    without a reload.
- **Analytics:** `quiz_view` (organic, internal or email), `quiz_started`, and
  `quiz_completed` with his profile and bands only. No answers and nothing from her
  module are ever sent, which an e2e test checks on every request in a full journey.
- **`/attachment-style-quiz/results/`, Session 4 minimum:** "Your pattern: …", both
  scores, Block A directly under them, a link to the profile page, and Block D. With
  nothing saved, it shows the generic "take the quiz" shell. The full Part B view is
  Session 5.
- **Time estimate:** "about 3 minutes" became "about 5 minutes" in all 7 places (44 answer
  screens). A unit test keeps every estimate equal to `QUIZ_MINUTES`.

**Tests**

- 500 unit tests pass (5 skipped; no `todo`s left).
  - Fixtures 1 and 4 run on the launch bank; Fixture 1 has the per-item hand
    verification Section 16.2 asks for.
  - The brief's H1 (avoidant 83/13) and H2 (anxious 88/13) pass; both pin "round half
    up" on exact halves.
  - Also covered: her and his answers never move each other's scores; the selector
    threshold and its fallback; the runner's screen order; finishing an attempt; the
    7-day expiry; stored-shape validation; brief parity; time estimates.
- 855 Playwright tests pass (3 skipped: the results route, `fixme` until Session 5). The
  new `quiz.spec.ts` drives the real runner through all 45 screens, checking each
  question against the data:
  - **Fixture 1 + H1:** anxious 72/18, her pattern avoidant 83/13, the result view,
    the stored data, and analytics. **Persona A + H2:** her pattern anxious 88/13,
    context skipped.
  - **Fixture 4:** avoidant (with a wrong attention answer flagged and never shown)
    and fearful-avoidant.
  - **Fixture 7:** a tampered token shows the shell, not an error.
  - **The runner:** section labels, the unnumbered attention check, blocked advance
    (Fixture 6), Back, keyboard-only use, restore after a browser restart, the 7-day
    discard, the return-visit and retake flow, clearing, corrupted storage, axe and
    44 px targets.
- **Mutation checks, each caught:**
  - weights ignored: 9 unit failures;
  - reversal ignored: 11 unit failures;
  - the runner quietly recording "4" as "3": the Fixture 1 and Fixture 4 e2e journeys
    fail.

**Lighthouse** (mobile, median of 3)

- **Quiz page:** Performance 100, Accessibility 100, Best Practices 100, SEO 100, LCP
  1.89 s, CLS 0.
- **Home and guides:** unchanged at 1.72–1.73 s. Best Practices is now 100 everywhere,
  because the quiz prefetch no longer 404s.
- **Regression: the tracker and decision tool are at 2.03 s against the 2.0 s LCP budget.**
  - Their initial script is within about 150 bytes of Session 13's 1.88–1.89 s runs.
    Lighthouse's simulated network adds a round trip once the scripts cross a TCP
    window boundary, and these pages sit on it.
  - Prefetching and the zod chunk were ruled out by experiment.
  - Proposed fix, not made: lazy-load what those tools don't show on first load. It
    changes Session 6–7 behaviour, so it's the founder's call. Details in `QA.md`.

**Founder review of the preview (2026-11-02)**

- **Approved as-is:** the two progress labels ("Since the breakup — N of 6", "About
  where you are now — N of 2") and "about 5 minutes".
- **Answer labels:** her 12 and the selectors now show "Never … Almost always"
  (`quizConfig.likert.partnerLabels`); his 24 and the attention check keep "like me".
  Values are unchanged, so no fixture moves.
- **Framing line** before her first question, founder wording: "Now think about her in
  the same relationship — how she showed up, as you experienced it."
- **Methodology page:** "can't tell you anything about your ex" is replaced by the
  founder's paragraph on the partner read. **One word differs:** the founder's "they
  can't diagnose her" ships as "they can't label her", because "diagnose" is a Section
  14.2 prohibited term and the source guard and launch sweep block it outside legal copy.
  Founder to confirm or supply another verb.
- **Follow-on wording (mine, small):** the methodology scale section and the quiz page's
  "how it works" now say the "like me" scale is for questions about you, and the
  methodology page lists the partner labels.

**Still open for the founder**

1. **Quiz-page copy** in `content/quiz.ts` — founder reviewing separately.
2. **The methodology page** still counts only the 24 scored and 2 context questions; it
   doesn't describe her 12 or the 6 selectors.
3. **q21's "a male friend"** is audience-specific wording that the partner dictionary
   can't swap. It's fine for `men-v1`; it needs a variant if the audience changes.
4. **For Session 5 (from the brief):** whether the result email carries her content. The
   brief's default is the share-link privacy rule.
5. **Tracker and decision-tool LCP** (above): founder approved the lazy-load fix as its
   own PR after this one merges.

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

## Session 7 — "Should I text my ex?" decision tool (2026-11-01)

**Shipped**

- `/should-i-text-my-ex/`: statically generated; the flow hydrates on the client. "How
  this works", the three outcomes, the tracker link block and the FAQ are
  server-rendered, with FAQPage and BreadcrumbList schema. Block B is in the footer area.
- The five-step flow (`components/tools/DecisionTool.tsx`), all logic from
  `lib/tools/decision.ts`:
  1. Timing bands (since breakup, since contact).
  2. Purpose (six options; partner terms from `config/copy.ts`).
  3. State check: alcohol, a 0–10 intensity slider with visible value and
     `aria-valuetext`, and drafted-and-deleted.
  4. The optional draft check (`DraftCheck`): **Block E verbatim directly above the
     textarea**, and live, local observations (length, question marks, pressure
     phrases, ultimatums, stacked apologies, night-send) shown as notes.
  5. The outcome (`DecisionOutcome`):
     - one of three outcomes, with the reason named per rule (the forced-wait rules use
       the spec's "Nothing good gets sent drunk or at a 9…" line);
     - the "takes no side / doesn't predict" line;
     - next actions: save unsent, the 30-minute timer, the tracker;
     - for wait-24h, a concrete re-check time ("Monday at 2:00 PM") with an optional
       on-device reminder;
     - for logistics_ok, guidance for a short, factual version he edits himself;
     - **Block D on every outcome**.
- Flow mechanics: "Step N of 5" with a progress bar; Back preserves every answer; inline
  `aria-live` errors; focus moves to each step heading; "Start over".
- `UrgeTimer`:
  - a 30-minute numeric countdown computed from a fixed end time (no drift, no
    animation, so identical with reduced motion), with a full-screen button where
    supported;
  - three config-driven prompt cards rotating every 60 seconds, plus "Next prompt"; the
    Day N card uses the tracker's day count, with a fallback when there's no tracker;
  - on completion: a check-in link if a tracker exists, otherwise the tracker setup
    offer;
  - start points: the outcome, or "Just start the 30-minute urge timer" on step 1.
- `UnsentVault`:
  - messages saved only by explicit choice, newest first, each deletable;
  - a "Your data" panel whose Clear my data (with on-page confirmation) deletes the
    unsent list and the reminder.
- `lib/tools/unsent.ts`: vault and re-check schemas and pure helpers (5,000-character
  messages, up to 100 entries; the re-check stores a time only, never the draft).
- `from=tracker`: the tracker's "I'm about to break it" link now lands here and shows
  "From your tracker: Day N of no contact."
- Copy lives in `content/decision.ts` and `content/faqs.ts`; Block E is in
  `content/compliance.ts`; the urge-timer prompts are in `config/content.ts`.
- Tests:
  - 238 unit tests pass (3 `todo`s): Block E verbatim; copy rules (no AI/person/chat
    claims, no promises or Section 14.2 terms, the rule line, the no-position line);
    prompt cards; vault and re-check helpers; plus all Session 3 decision fixtures.
  - 171 Playwright tests pass. The 21 new decision tests × 3 viewports cover:
    - **the network assertion**: a marked draft appears in no request URL, body or
      header, and in no local/session storage or cookie;
    - the draft gone after leaving the page;
    - **Block E directly above the textarea** (DOM and geometry), with spellcheck off;
    - every outcome path, including 01:30 night-send;
    - re-check time, reminder and banner;
    - the unsent list save, reload, delete and clear;
    - **the timer under reduced motion**, with prompt rotation and the completion
      actions with and without a tracker;
    - 320px with no overflow, and 44px targets.
- Mutation check: a draft that leaks to the server as he types, and Block E moved below
  the textarea, are each caught by their own test.
- Size: the decision route ships 145 kB first-load JS (budget 180 kB).

**Decisions and ambiguities (resolved with spec defaults)**

- **Nothing is saved automatically.** Block E promises the draft is "not stored after
  you leave this page", so the flow and draft live in memory only. This is unlike the
  Section 8.3 default of persisting tool state. The only stored items are the ones he
  explicitly saves: the unsent list and the re-check time.
- **Spellcheck, autocorrect and Grammarly are off** on every draft textarea. Chrome's
  enhanced spellcheck can send typed text to a server, which would break Block E.
- **Block D** shows on every outcome, not just "don't send". Section 14.1 says "the
  decision tool outcome view".
- **The Day N prompt card** falls back to "Every day of no contact is worth more than
  this draft." when there's no tracker, or on Day 0.
- **Timer `from`:** `tracker` when he arrived via `?from=tracker`, otherwise `decision`
  or `direct` by where he started it. This is recorded for the Session 13 analytics
  event.
- **The intensity slider starts at 5** (a slider must hold a value). 0 would understate
  by default.
- **"Wait 24 hours" for logistics** lists the specific reasons: no draft to check, drafted
  and deleted more than once, or draft flags.
- **Copy-rule test.** It ignores questions ("Can it tell me how she'll respond?"), since
  a question isn't a promise. Answers and statements are all checked.
- **Source guards.** The `{{` and gendered-literal guards caught a `style={{…}}` and a
  "he chooses" comment in `DecisionTool.tsx`. Both were fixed in the code; neither guard
  was loosened.

**Deferred**

- Analytics (`decision_started`, `decision_completed`, `urge_timer_completed`) →
  Session 13, never with draft text.
- Affiliate slot `decision-dont-send` → Session 10.
- Lighthouse and axe on this page → Session 13; not run in this session.

**For founder review now:**

- Outcome reasons, step wording and FAQ in `content/decision.ts` and `content/faqs.ts`.
- The extra pressure and ultimatum phrases in `config/content.ts` (from Session 3).
- The logistics template pattern.

## Session 8 — Profile pages and attachment hub (2026-11-01)

**Shipped**

- `/attachment-styles/`, the hub. It has:
  - four profile cards;
  - "Two scores, not four boxes", with a table showing which pattern each band
    combination lands in;
  - the anxious–avoidant trap;
  - "Patterns, not labels";
  - a quiz block;
  - "Where to read more", naming _Attached_ and _Anxiously Attached_ with no links;
  - a methodology link and a 4-question FAQ.
- `/attachment-styles/[profile]/`, statically generated for `secure`, `anxious`,
  `avoidant` and `fearful-avoidant`. Any other slug is a 404. Each page has:
  - the band combinations that land on it;
  - a "Check your own scores" quiz block;
  - what the pattern is (with all three lean paragraphs on the secure page);
  - how it shows up in a relationship;
  - after a breakup, and the no-contact risk with a tracker link;
  - watch-outs and strengths;
  - what helps, and "patterns can shift";
  - two next steps and the methodology link;
  - the other three profiles, and a 3-question FAQ.
- **Profile copy for all four profiles** is in `lib/quiz/profiles.ts` as `profileCopy`,
  so the Session 5 result view can reuse it. Each profile has a headline, a description
  (145–152 words), after-a-breakup, no-contact risk, three watch-outs, three strengths,
  two next steps, and the leans for secure. It is gender-neutral by rule.
- Long-form page copy is in `content/attachment-styles.ts`; the FAQs are in
  `content/faqs.ts` (`attachmentStyles`, `profiles`).
- **Band combinations are computed with `profileFor` from `lib/quiz`.** The hub table
  and each profile's list can't disagree with scoring.
- `validateJsonLd` in `lib/seo/schema.ts` structurally checks FAQPage and
  BreadcrumbList. It also rejects Section 12.2 prohibited types and any type not on the
  allow-list.
- Metadata for the five routes is in `lib/seo/metadata.ts`.
- Tests:
  - 269 unit tests pass (3 `todo`s). They cover:
    - `checkProfileCopy` on all four profiles;
    - the Section 9.4 risk wording (message-checking, reconciliation fantasies, delayed
      grief, rebound dating, oscillation);
    - gender-neutral profile copy;
    - next steps on Section 6 routes;
    - the Section 14.2 terms over every page string (including "disorder" and
      "guarantee"), identity claims and timeline promises;
    - the quiz framing phrase;
    - FAQ and breadcrumb schema validity, and that the validator rejects bad schema.
  - 303 Playwright tests pass. The 44 new tests × 3 viewports check:
    - on each page: one h1, the canonical, the JSON-LD validating, the FAQ schema
      matching the visible FAQ, no prohibited term in the rendered body or `<head>`,
      the quiz and methodology links, no horizontal scroll, and 44px standalone links;
    - the hub's four profile links, and the band table matching the engine and fitting
      320px in the default and a wide font;
    - the other-profile and tracker links on each profile page;
    - the secure leans;
    - the 404 for an unknown slug.
- Mutation check: a prohibited term in an FAQ answer, a `Person` author in the FAQ
  schema, and a missing other-profile link are each caught.
- Size: 106 kB first-load JS on all five pages (static, no client components).

**Decisions and ambiguities (resolved with spec defaults)**

- **Profile copy written now, not in Session 5.** Section 18 says Session 8 reuses
  "profile data extended with long-form content", but that data was still a Session 5
  TODO. I drafted it in `lib/quiz/profiles.ts`, where Section 9.4 puts it. It still
  needs the founder's word-by-word review before Session 5's result view ships.
- **No Block A on profile pages.** Section 14.3 places Block A on the quiz page, the
  result and methodology. It contains "therapy" and "diagnosis", which would break this
  session's done-when (no prohibited term on these pages). The pages instead use the
  Section 14.2 framing phrase ("a self-reflection assessment informed by attachment
  research") and link to methodology.
- **FAQ on the hub.** Section 12.2 lists FAQPage for the profile pages, not the hub. I
  added one anyway because it is visible content, not schema-only.
- **Band table at 320px.** The corner header is read only by screen readers; the caption
  explains the rows and columns. The table uses a fixed layout, 13px text below the `sm`
  breakpoint, and regular-weight band labels. Cells may wrap rather than clip.
  - CI caught the first version: on Linux's wider fonts, bold "moderate" clipped by a
    few pixels. The e2e test now also runs with a forced wide font (DejaVu Sans, or
    Verdana on macOS), and fails if the table overflows or any word breaks mid-word.
- **Two links point at pages not built yet.** `/attachment-style-quiz/` (Session 4) and
  `/methodology/` (Session 11) return 404 until then. So do the guides
  `/guides/attachment-styles-after-a-breakup/` and
  `/guides/how-long-does-a-breakup-take/` (Session 10).
- **The production server logs `NoFallbackError` for an unknown slug.** This is Next
  15's normal `dynamicParams = false` path, and the response is a correct 404.

**Deferred**

- Linking the hub from the homepage → Session 10, the homepage hub. Until then the hub is
  reachable only from the profile pages' breadcrumbs.
- WebSite, Organization and Article schema, and OG images → Session 12.
- Lighthouse and axe on these pages → Session 13.

**For founder review now:**

- All four profiles' copy in `lib/quiz/profiles.ts`. This is the product's voice at its
  most exposed (Section 18, Week 2).
- The page copy in `content/attachment-styles.ts`, in particular the claim that secure is
  "the most common pattern in the research".
- The profile and hub FAQs in `content/faqs.ts`.

## Session 10 — Homepage, guides, and resources (2026-11-01)

**Shipped**

- **Homepage hub (`/`).** It now has:
  - the three tools;
  - "Understand your pattern": four profile cards plus a link to `/attachment-styles/`;
  - "Guides for the hard moments": all five guide cards;
  - a resources block;
  - "How this site works" (free in full, stays on your device, rules not a chatbot),
    linking Methodology and About.
- **Guide template.** One `GuidePage` renders both kinds of guide:
  - breadcrumbs, the H1, a visible "Last reviewed" date from content metadata, the
    intro and the sections;
  - then the tool block (`ToolBlock`) and one sibling guide (Section 6);
  - FAQ only where a guide has one;
  - no byline anywhere (Section 12.5);
  - Article and BreadcrumbList schema, plus FAQPage when there are FAQs.
- **Guide content is typed data, not MDX.** The five guides are files in
  `content/guides/`, with block types for paragraphs, lists, bold-lead lists, callouts,
  links and affiliate slots. Their metadata is in `config/content.ts` (`guides`): route,
  kind, tool, sibling and both dates.
- **All Section 12.3 launch content:**
  - `/no-contact-rule/` (Guide 1, the cluster hub, with 4 FAQs). Its "What counts as
    contact" and 30/60/90 sections reuse the tracker's own definitions, so the two pages
    can't disagree.
  - `/guides/attachment-styles-after-a-breakup/` (Guide 2). Each profile section starts
    from `profileCopy`, plus the anxious–avoidant trap; the tool block is the quiz.
  - `/guides/how-long-does-a-breakup-take/` (Guide 3):
    - honest ranges and what makes it longer;
    - the first 90 days, plus the 30-day-stretches framing for the later programme;
    - what helps, with the disabled in-content slot;
    - "When it's more than a breakup", linking Crisis Resources.
  - `/guides/no-contact-day-14/` and `/guides/she-texted-me-during-no-contact/`, the two
    situational instances.
- **Situational template.** The section order is in `config/content.ts`
  (`situationalTemplate`): why it spikes, what's normal, the three mistakes, the next 24
  hours. A page may override a heading for its moment.
  - Adding a situational page means three things: a content file, a `guides` entry and a
    metadata entry. No component changes.
- **`/recommended-resources/`.** Organised by moment:
  - **For the first two weeks:** the site's own tools and the no-contact rule.
  - **For understanding your pattern:** _Attached_ and _Anxiously Attached_.
  - **Programmes that go deeper:** Personal Development School and Chris Seiter's Ex
    Recovery Program, with the Section 13.4 honest-framing line above them.
  - One slot per resource, all four disabled. There are no URLs, prices or payouts on
    the page.
- **Affiliate infrastructure.**
  - `lib/affiliates.ts`: `renderableSlot`, which throws on an unknown id and returns
    nothing for disabled or incomplete slots; plus `checkSlotCopy` and `slotLimitFor`.
  - `components/content/AffiliateSlot.tsx`: the Section 14.5 disclosure directly above
    the slot in body-size text, in the same container, with `rel="sponsored nofollow
noopener"`.
  - Wired, still disabled, into the tracker (`tracker-after-explainer`), the decision
    tool's don't-send outcome (`decision-dont-send`), Guide 3 and the resources page.
  - The Section 14.5 disclosure and the Section 13.4 honest-framing line are verbatim in
    `content/compliance.ts`.
- **`FounderNote`** is defined and tested, with an optional `media` slot that renders
  nothing when empty. It is used on zero pages.
- `ProfileCard` and `GuideCard` are shared components; the attachment hub now uses
  `ProfileCard`.
- Metadata for the six new routes is in `lib/seo/metadata.ts`. `validateJsonLd` now also
  checks Article: headline length, ISO dates, modified not before published, and
  Organization author and publisher.
- Tests:
  - 316 unit tests pass (3 `todo`s). The new ones cover:
    - the guide registry, tools and siblings;
    - links and dates;
    - the situational template and both instances;
    - Section 14.2 terms, timeline promises and bylines over all new copy;
    - no hardcoded partner pronouns in the new content source;
    - no URL or price on the resources page;
    - both verbatim lines;
    - the slot rules (all disabled, per-page limits, ids exist, disabled and incomplete
      slots render nothing, an enabled slot puts the disclosure first with the sponsored
      rel, copy rules);
    - `FounderNote` rendering, and that it is unused;
    - Article and FAQ schema.
  - 411 Playwright tests pass.
    - **No orphan routes:** a crawl from `/` reaches every indexable Section 6 route
      within two clicks. Every internal link on every built page is a Section 6 route.
      The tracker and the decision tool link each other.
    - **Homepage:** it links the tools, the hub, all profiles, all guides and the
      resources page.
    - **Each guide:**
      - its H1 and last-reviewed `<time>`;
      - the tool block, then exactly one sibling;
      - the JSON-LD validating, with dates matching config;
      - no prohibited term, no byline and no slot;
      - no overflow, and 44px links.
    - **Situational pages:** headings in template order, and three mistakes.
    - **Resources:**
      - it is organised by moment, with 4 resources and no slot;
      - the framing line sits above the programmes;
      - there are no outbound links;
      - the breadcrumb validates.
- Mutation check: each of these is caught by its own test:
  - removing the homepage resources link (orphans the page);
  - a link to a non-Section-6 `/guides/`;
  - enabling a slot.
- Size: 106 kB first-load JS on every content page.

**Decisions and ambiguities (resolved with spec defaults)**

- **Typed TypeScript content instead of MDX or Markdown.** Section 7.2 allows "MDX or
  Markdown". Typed data needs no new dependency and is checked by the compiler and
  tests. A new guide is still a content-only task.
- **Guide breadcrumbs are Home › Guide.** Section 6 has no `/guides/` index route, so
  there is no middle crumb.
- **Article schema now, not in Session 12.** It came with the guide template. Author and
  publisher are the site as an Organization, never a Person.
- **The resources page allows four slots.** Section 13.4 says "never more than two per
  page" but also "up to 4, one per resource" on this page. The page-specific rule wins
  (`slotLimitFor`).
- **No outbound links on the resources page** while every slot is disabled, because
  URLs may live only in config. The entries name each resource so it can be found.
- **The homepage "How this site works" block avoids Block B's wording.** The homepage
  isn't a tool page, and Block B contains Section 14.2 terms.
- **Guide dates are 2026-11-01** for both published and last reviewed. Change
  `lastReviewed` in `config/content.ts` only when the content changes.

**Deferred**

- The footer email signup → Session 9.
- WebSite and sitewide Organization schema, sitemap and robots, OG images → Session 12.
- Analytics (`guide_tool_click`, `affiliate_slot_view`, `affiliate_click`) → Session 13.
- Lighthouse and axe on these pages → Session 13.

**For founder review now (required before this session closes, per Section 12.3):**

- **All five guides** in `content/guides/`, for accuracy and voice. In particular:
  - the first-month texture in the no-contact rule;
  - the 90-day ranges in Guide 3;
  - the co-parenting lines.
- **`content/resources.ts`.** Confirm that each resource is one you've used, and check
  each description, before any slot is enabled. In particular, check the programme
  name "Ex Recovery Program" and how it is described.
- **The homepage copy** in `content/home.ts`.
- **Your choice of byline line.** None is used now. "Reviewed by HeartFixed editors"
  can be added only if you approve that exact line (Section 12.5).
- **One Session 6 line to fix.** The tracker FAQ in `content/faqs.ts` still says "She
  reaching out doesn't reset your counter". I left it as it is, since it is outside this
  session. The guides now say "When she reaches out…".

## Session 11 — Legal and trust pages (2026-11-01)

**Shipped**

- **Seven pages.** Privacy, Terms and Affiliate Disclosure share a `LegalPage` template
  (visible "Last updated", the guide block renderer). About, Contact, Methodology and
  Crisis Resources are their own pages. Each has breadcrumbs, a BreadcrumbList and
  metadata.
- **`/privacy-policy/`** covers every Section 14.4 item:
  - what stays in the browser, and that clearing it erases it unrecoverably;
  - the three separate email choices;
  - what's never collected;
  - cookies and analytics in plain terms;
  - one-click unsubscribe;
  - sharing, by provider category (email, analytics, hosting); no sale; no sharing of
    self-reflection content, affiliates included;
  - what an affiliate click shares;
  - share links;
  - retention (the list inactivity purge comes from `config/legal.ts`);
  - requests via Contact;
  - adults only;
  - changes.
- **`/terms/`** covers:
  - educational purpose;
  - no professional relationship, with Block B quoted verbatim;
  - results are self-reflection, not diagnosis;
  - not an emergency service;
  - 18+ and acceptable use;
  - your data;
  - intellectual property;
  - third-party links;
  - no warranties and limitation of liability;
  - changes and contact.
- **`/affiliate-disclosure/`** covers:
  - what an affiliate link is;
  - the Section 14.5 sentence quoted;
  - what money never changes (results, recommendation order, tool behaviour);
  - how recommendations are chosen;
  - what a click shares.
  - A **live status line** computed from `config/affiliates.ts`: "Right now, no links on
    this site are affiliate links."
- **`/about/`** — faceless. It covers what the site is and who it's for: "For adults
  (18+)" (Section 14.1 item 8), plus how it works and how it's funded. It carries Block B
  (Section 14.3) and links Crisis Resources (Section 14.1 item 5), Methodology,
  Disclosure, Privacy and Contact.
- **`/contact/`** — the email comes from `config/site.ts`. While that's empty the page
  shows "The contact address will be listed here before launch", never an empty
  `mailto:`. It uses the Section 14.4 line "Replies within a few days; this site cannot
  help with emergencies — see Crisis Resources." It also explains that browser data
  can't be seen or deleted by us.
- **`/methodology/`** — Block A sits directly under the H1, followed by the Section 14.2
  framing. It covers:
  - the two dimensions;
  - the questions, with counts, reversed items and context questions all read from
    `config/quiz.ts`;
  - the Likert labels from config;
  - scoring and bands from config, with the shared `BandTable` computed by
    `profileFor`;
  - "same answers, same result", and that scoring runs in the browser;
  - the limits ("not a clinical instrument");
  - sources.
  - The attention check is deliberately not mentioned (Section 9.2).
- **`/crisis-resources/`** — Block D is first under the H1. Then:
  - the US lines: 988 (call/text), the Crisis Text Line (text HOME to 741741) and 911,
    each with `tel:`/`sms:` links;
  - "Outside the US" with the emergency-number guidance;
  - "If you're worried about someone else";
  - "not a crisis service".
- **Block A** is verbatim in `content/compliance.ts`, with a `SelfReflectionDisclaimer`
  component (it was a Session 5 TODO). The Section 14.5 and 13.4 lines were added in
  Session 10.
- **International crisis lines are gated.** `InternationalLine` needs `sourceUrl`
  (https, the provider's own page) and `verifiedOn`, and
  `verifiedInternationalLines` renders only complete entries. The list ships empty: no
  number from memory.
- **`npm run test:launch`** (`tests/unit/launch-readiness.test.ts`) is skipped in normal
  runs. It fails until the founder supplies:
  - the contact email;
  - the mailing address;
  - at least one verified international line;
  - an explicit `ownUse` on every resource.
  - It fails all 4 today, as intended.
- `BandTable` is now shared by the hub and Methodology.
- Tests:
  - 356 unit tests pass (4 launch checks skipped, 3 `todo`s). The new ones cover:
    - Block A verbatim and in body-size text;
    - Privacy, Terms and Disclosure topic coverage and required statements;
    - About 18+ and the crisis link; the Contact expectations line;
    - Methodology numbers from config, its framing, no attention check;
    - the crisis US lines and the international gate;
    - no Section 14.2 terms in trust and crisis copy;
    - no subscription/trial/membership language;
    - no partner pronouns.
  - 546 Playwright tests pass. 6 are marked `fixme`: the quiz and results routes.
    - **The guardrail sweep** (`guardrails.spec.ts`) runs over every Section 6 route.
      It checks:
      - Block C and the crisis link in every footer;
      - Blocks B, D and A where required;
      - no chat UI;
      - no prohibited term outside the verbatim Blocks A/B and the three legal pages.
      - Unbuilt routes are listed as `fixme`, so the gap stays visible.
    - **The trust-page suite** (`trust-pages.spec.ts`) checks the H1, canonical and
      breadcrumb schema, layout, the last-updated dates, and the per-page placement and
      copy checks.
- Mutation check: each of these is caught by its own test:
  - Block D moved below the intro on the crisis page;
  - Block B removed from About;
  - "therapy" added to the methodology copy.

**Decisions and ambiguities (resolved with spec defaults)**

- **The guardrail sweep is "fully green" except for the Section 16.4 items that need the
  quiz.** Block A on the quiz page and under the result headline, Block D on the result
  view, and "full completion with the email field untouched" all wait for Sessions 4–5.
  They're `fixme`, not passing.
- **The prohibited-terms exemption** is the three legal pages plus the verbatim Blocks A
  and B wherever they render, which Section 14.3 requires on Methodology and About.
- **List inactivity purge defaults to 24 months** (`config/legal.ts`). Set the same value
  in the email provider, or change both.
- **Terms leave out a legal entity name and governing law.** Both need the lawyer review
  Section 14 asks for.
- **Crisis copy says only what the spec states.** I removed "free and confidential",
  "trained people" and "24/7 by text" claims I couldn't source from the spec.
- **"Privacy policy describes analytics"** that Session 13 wires up. The policy's
  wording matches the Section 16.1 event rules.

**Deferred**

- `crisis_link_click` analytics → Session 13.
- Email-footer mailing address, and the result-email Block A short form → Session 9.

**For founder review now (blocking launch, not this merge):**

- **The contact email and mailing address** (`config/site.ts`).
- **International crisis lines.** Add entries to `crisisPage.international.lines` in
  `content/crisis.ts`, each with the provider page you checked and the date.
- **`ownUse`** on each resource in `content/resources.ts`. Set `true` only where you've
  used it; the disclosure page then says so.
- **The About facts** in `content/trust.ts`.
- **A lawyer's review** of Privacy and Terms before any paid promotion (Section 14).

## Session 12 — SEO infrastructure (2026-11-01)

**Shipped**

- **Metadata audit (Section 12.2).** Every Section 6 route now has an entry in
  `lib/seo/metadata.ts`, including the quiz and results routes, ready for Sessions 4–5.
  Each entry has:
  - a unique title (≤ 60 characters, keyword first, brand last) and a unique
    description (≤ 155);
  - the free / no-signup fact on the three tool pages;
  - a canonical URL from config;
  - OG and Twitter cards (`summary_large_image`) with an image.
  - Only the results shell is `noindex`.
- **Per-tool OG images.** `site`, `quiz`, `tracker` and `decision` cards render with
  `next/og` (its bundled font, no network font) at `/og/<key>/`. They are statically
  generated, and their copy is in `content/og.ts`. The tracker, decision tool and quiz
  each get their own card; every other page uses the site card.
- **Icons:** `app/icon.svg` (the favicon) and a 180px touch icon at
  `/apple-touch-icon/`, which is also the Organization logo.
- **Sitewide JSON-LD.** WebSite and Organization are in the root layout. They are
  faceless (no Person), and `sameAs` comes from `site.social` and is omitted while
  empty. `validateJsonLd` now covers WebSite and Organization as well.
- **`/sitemap.xml`** lists exactly the Section 6 indexable routes, as absolute URLs.
  Guides and legal pages carry their real `lastModified`; other routes omit it rather
  than guess.
- **`/robots.txt`** allows all, disallows `/api/` and the results shell, and names the
  sitemap.
- **A real 404** (`app/not-found.tsx`). It returns 404 with Next's `noindex`, has its
  own title, links the three tools and Crisis Resources, and keeps the footer crisis
  line.
- **Redirect rules.** `config/redirects.ts` is checked by `checkRedirects`:
  - sources are lowercase, slash-ended paths;
  - a source never shadows a live route;
  - destinations are Section 6 routes;
  - no duplicates and no chains.
  - The list is empty at launch.
  - www → apex, http → https and the defensive domain stay at the host (Section 17.5).
- **Planning notes.** `docs/planning/keyword-pull.md` holds the founder's table for the
  five unverified strings (Section 3.1).
- **New dev dependency:** `@axe-core/playwright` 4.14.0, pinned exactly. It was
  published 2026-10-15; `axe-core` 4.14.0 was published 2026-10-05.
- Tests:
  - 374 unit tests pass (4 launch checks skipped, 3 `todo`s). The new ones cover:
    - metadata for every route, unique titles and descriptions, the tool free/no-signup
      fact;
    - canonical, OG and Twitter per route; card mapping; noindex only on the results
      shell;
    - the OG copy language;
    - sitemap equals the indexable routes, with real dates;
    - the robots rules;
    - the redirect checker, plus 5 rejection cases;
    - WebSite and Organization validity.
  - 756 Playwright tests pass. 6 are marked `fixme` (the quiz routes).
    `seo.spec.ts` covers:
    - **Every built page:** title, description, canonical, og:title, og:description,
      og:url, og:image, twitter:card and twitter:image match `lib/seo/metadata.ts`, with
      no robots tag.
    - **Every built page's JSON-LD:** exactly one WebSite and one Organization, every
      block valid, no prohibited type.
    - **Axe:** zero critical violations on every built page, the 404, a running tracker
      streak, and the decision tool's outcome view.
    - **No `{{`** in any page's HTML (Section 19.1).
    - **Images:** every OG card and the touch icon return 200 PNG with no redirect.
    - **Sitemap and robots:** the live `sitemap.xml` and `robots.txt`.
- Mutation check: each of these is caught by both unit and Playwright tests, except the
  404 button, which only Playwright's axe check can see:
  - the results shell added to the sitemap;
  - an unlabelled button on the 404 (a critical axe violation);
  - a `Person` in the Organization schema.

**Decisions and ambiguities (resolved with spec defaults)**

- **OG images come from a route handler, not the `opengraph-image` file convention.**
  Next emits those URLs without a trailing slash (`/opengraph-image?hash`), and
  `trailingSlash: true` then 308-redirects them. The route handler is served at
  `/og/<key>/` with a 200, and metadata references that exact URL. The touch icon works
  the same way.
- **Page metadata always sets `og:image` explicitly.** A page-level `openGraph` object
  replaces the inherited root image, so guide pages had none until this was done.
- **No web app manifest.** Section 5.2 rules out a PWA install prompt, and a manifest
  can make the site installable.
- **The sitemap includes the quiz route, which 404s until Session 4.** The spec says
  "exactly the Section 6 indexable routes". It is submitted to Search Console only at
  launch.
- **Earlier specs check page-level schema only.** The attachment, content and trust
  specs asserted each page's exact JSON-LD types. They now set aside the sitewide
  WebSite and Organization, which `seo.spec.ts` checks on every page instead.
- **The axe gate is critical-only,** per Section 16.4's wording. Session 13 runs the
  full axe and Lighthouse pass.

**Deferred**

- Lighthouse budgets, analytics, and the full Section 16.4 QA record → Session 13.
- The quiz and results pages' SEO checks → Sessions 4–5. Their metadata and the quiz
  card already exist.
- Host redirects (www → apex, http → https, fixedheart.com) and the Search Console
  sitemap submission → Session 14.

**For founder:**

- **Keyword pull.** Fill in `docs/planning/keyword-pull.md` from a paid Semrush or
  Ahrefs session before planning month two.
- **Review** the OG card copy in `content/og.ts` and the 404 copy in
  `content/notFound.ts`.

## Session 9 — Email flows (2026-11-01)

**Shipped**

- **`POST /api/email/`** (`app/api/email/route.ts`), the site's only server route. Logic
  lives in `lib/email/handler.ts` so every path is unit-tested. Order: per-IP rate limit
  (`EMAIL_RATE_LIMIT`, default 5/hour) → shared Zod validation → honeypot → provider →
  exactly one action. Other guards:
  - bodies over 4 KB are rejected;
  - responses are `{ ok }` or an error code only, never the address, and `no-store`;
  - nothing in `lib/email/` or `app/api/` logs.
- **Consent separation (Section 13.1)** is built into the shape of the code, not
  enforced only by UI:
  - **(a) `send_result`:** one transactional send that never subscribes. The list join
    happens only when the separate, unchecked box is ticked, as its own provider call.
    If that join fails after the send, the form says so honestly.
  - **(b) `join_list`:** list only, with a placement of footer, result or tracker.
  - **(c) `reminders_on`:** reminders only, with their own consent.
- **Provider interface** (`lib/email/provider.ts`): `send`, `joinList` and
  `enableReminders`.
  - **Resend over REST with `fetch`** — no SDK, endpoints checked against Resend's
    current docs:
    - `POST /emails` with auth and a category tag;
    - contacts upserted via `POST /contacts`, falling back to
      `PATCH /contacts/{email}` and `/contacts/{email}/topics`;
    - auth, quota and rate errors fail instead of falling through.
  - **Topics carry the consent.** The list and reminders are two Resend Topics, so each
    unsubscribes independently. Reminders also store `hf_start_date`, `hf_goal_days`,
    `hf_reminder_hour` and `hf_time_zone`.
  - **A memory provider** records actions for tests and local QA.
  - **No configuration means `not_configured`,** never a pretend success.
- **The quiz result email** (`lib/email/resultEmail.ts`) is built on the server from the
  Section 9.6 share token alone, so bands and profile come from the engine
  (`decodeShareToken`); tampered or outdated tokens are refused. It contains:
  - the Section 13.2 subject;
  - both scores with bands;
  - the lean paragraph where it applies, then the description and watch-outs;
  - "Your first 14 days", per profile (`content/emails/actionLists.ts`);
  - the tracker link, the reading list and the resources page;
  - the share link;
  - Block A, the Block A short form and the requested-on-site note (Section 14.4);
  - Block C;
  - a clearly separate list-join link.
- **The welcome sequence** (`content/emails/welcome.ts`) is five emails on days 0, 2, 4,
  7 and 10, linking what Section 13.2 names. Email 5 carries the honest-framing line
  and the `email-welcome-5` slot. While the slot is disabled, it links the resources
  page instead; when enabled, the Section 14.5 disclosure sits directly above it,
  inside the email.
- **Reminder templates** (`content/emails/reminders.ts`): "Day N. Still going." with
  "If you've already checked in today, ignore this.", plus a goal-reached email that
  stops reminders.
- **`renderMarketingEmail`** puts Resend's `{{{RESEND_UNSUBSCRIBE_URL}}}` one-click
  link, the config mailing address and Block C in every list and reminder email. It
  **refuses to render without a mailing address**, except in preview mode.
- **`npm run emails:export`** writes every template to `emails-out/` (git-ignored) for
  loading into Resend automations. It fails until the mailing address is set.
- **Forms**, each with one email field, a honeypot, inline errors via `aria-live`,
  inline success and no redirect:
  - **The footer** (Section 13.3, verbatim microcopy) on every page. It's the only
    pre-value form.
  - **The tracker** shows reminders (with an hour picker) and its own list join, only
    once a streak exists. Reminders send Day 1, the goal, the hour and the time zone —
    never notes, urges or slips. Success sets `reminderOptIn` in the tracker state; the
    address is never stored in the browser.
  - **`components/quiz/EmailResultForm.tsx`** is built and unit-tested (the verbatim,
    unchecked-by-default list box; a print fallback on failure). Session 5 places it on
    the result view.
- **Privacy Policy** now says exactly what reminders store and how long it's kept.
- **`.env.example`** adds `EMAIL_REMINDER_TOPIC_ID` and the test-only `EMAIL_PROVIDER`.
  Playwright runs the server with the memory provider.
- Tests:
  - 414 unit tests pass (5 skipped: launch checks and export; 3 `todo`s). The new ones
    cover:
    - consent separation for every action;
    - disposable addresses accepted;
    - honeypot, rate limit and sliding window;
    - token tampering, no provider, provider failure, no echo;
    - reminder setting validation, and unknown fields stripped;
    - no logging;
    - every required part of the result email;
    - the marketing footer (unsubscribe, address, crisis line);
    - the welcome-sequence schedule and links;
    - the disclosure above an enabled email slot;
    - copy rules (no urgency, nothing person-like, no subscription or prohibited
      terms);
    - the Resend adapter against a fake `fetch`;
    - provider selection;
    - the verbatim form copy.
  - 783 Playwright tests pass. 6 are marked `fixme` (the quiz routes). They check:
    - the footer form on every page type;
    - inline validation, then a join with the **exact request body** (action,
      address, placement and the empty honeypot only);
    - no tracker form before a streak;
    - reminders sending only what they need, and staying on after reload, with the
      address not in `localStorage`;
    - the tracker list join leaving reminders off;
    - the API's codes, `no-store`, the 400/413/405 cases, and robots/sitemap
      exclusion.
- Mutation check: each of these is caught:
  - a result send that always joins the list;
  - reminders that also join the list;
  - a marketing email without unsubscribe;
  - the footer sending an extra field.
- Size: tracker 145 kB and decision tool 146 kB first-load JS (budget 180 kB); other
  pages 106 kB.

**Not done — needs the founder (the session's done-when)**

Section 18 says Session 9 is done when the Section 16.4 email criteria pass **on a
preview with a real inbox**. That needs Resend set up, so it is **not yet verified**:

1. In Resend:
   - verify the sending domain (SPF, DKIM, DMARC);
   - create two Topics with default "Opt-out": the email list and tracker reminders;
   - create the four `hf_*` contact properties (types in `.env.example`).
2. In Vercel: set `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_LIST_ID` (the
   list Topic) and `EMAIL_REMINDER_TOPIC_ID`.
3. Set `mailingAddress` in `config/site.ts`, run `npm run emails:export`, and load the
   welcome sequence into a Resend automation for list joins.
4. On the preview, check:
   - footer, tracker and result joins land on the list Topic;
   - a result send with the box unticked creates **no** list subscription;
   - reminders land on the reminder Topic, independent of the list;
   - one-click unsubscribe works for each Topic.

Two adapter details the docs left ambiguous are confirmed by step 4:

- the status Resend returns for an existing contact;
- whether `PATCH /contacts/{email}/topics` takes `{ topics: [...] }` or a bare array.

**Decisions and ambiguities (resolved with spec defaults)**

- **Topics, not one list.** Section 13.1 needs reminders as "their own consent flag,
  unsubscribable independently". In Resend that is a Topic, so `EMAIL_LIST_ID` holds
  the list Topic id and `EMAIL_REMINDER_TOPIC_ID` is added.
- **Reminder sending isn't built.** Section 18 says "sending configured in the
  provider". The daily "Day N" email needs a per-contact daily schedule that skips days
  with a check-in. Whether a Resend automation can compute Day N from
  `hf_start_date` + time zone is unconfirmed. If it can't, the smallest fix is a daily
  scheduled job that reads the reminder Topic from Resend: no database, but it is new
  server code. **Open question for the founder before reminders go live.**
- **The rate limit is in-memory, per server instance** (no database in the MVP).
  Accepted for launch, with the honeypot as a second guard.
- **No tracker summary email.** Section 13.1(a) mentions "my tracker summary", but
  nothing in Sections 11.1, 13.2 or 16.4 specifies or tests one. The tracker already
  exports its data.
- **Result email transport:** the share token, not raw scores. It's the same data,
  validated by the engine's own decoder.
- **The result email carries both the Block A short form (Section 14.4) and full Block
  A (Section 13.2).**
- **Endpoint path is `/api/email/`** with a trailing slash; without it,
  `trailingSlash: true` 308-redirects the POST.

**Deferred**

- Placing `EmailResultForm` on the result view → Session 5.
- `email_result_*`, `newsletter_signup` and `reminder_optin` analytics → Session 13,
  with codes, placements and goal days only.

**For founder review now:**

- The 14-day action lists (`content/emails/actionLists.ts`), as Section 13.2 asks for
  Session 9.
- The welcome sequence and reminder copy (`content/emails/`).
- The form copy (`content/emails/forms.ts`).

## Session 13 — Analytics and full QA (2026-11-01 → 2026-11-02)

**Shipped**

- **First-party analytics (Section 16.1).** Every Section 16.1 event, plus `page_view`,
  is sent by the browser to our own `POST /api/collect/`. The route then forwards it to
  GA4 with the Measurement Protocol.
  - **Why no Google script:** `gtag.js` alone is about 157 kB gzipped, which would break
    the 180 kB tool-page budget on its own.
  - **No cookies.** A random client id and a 30-minute session id are kept under
    `heartfixed-analytics-v1`. "Clear my data" removes them too.
  - **Global Privacy Control turns analytics off entirely.**
  - **The Privacy Policy's "Cookies and analytics" section** now describes exactly
    this.
- **Two checks before anything reaches GA4:**
  - **In the browser** (`lib/analytics.ts`, no zod): a known event name, known
    parameter keys, and only booleans, small integers or short lowercase codes as
    values. Free text never leaves the browser, even from a call site that gets it
    wrong. In development, a bad event throws.
  - **On the server** (`lib/analyticsSchema.ts`): the exact allow-list, as strict zod
    schemas. The route also:
    - rejects any body containing `@`;
    - caps bodies at 8 kB;
    - rate-limits per IP (`ANALYTICS_RATE_LIMIT`, default 600 an hour);
    - always answers 204 or 400/429, with no body;
    - never logs.
  - Unit tests keep the browser's name and key lists in step with the schemas.
- **Wiring:**
  - The tracker sends created, check-in (a day band, never the day), slip type and
    reminder opt-in.
  - The decision tool sends started, completed (outcome and whether the draft check
    was used) and the urge timer's source.
  - The email forms send codes and placements.
  - A delegated listener sends page views (flagging 404s), crisis-link clicks by
    placement, guide tool-block clicks, and affiliate slot views and clicks.
- **New environment variables:** `GA4_API_SECRET` (server-only) and
  `ANALYTICS_RATE_LIMIT`, both in `.env.example`. Without the secret, events are
  validated and then dropped.
- **Performance fixes found by Lighthouse:**
  - **zod is out of the shared bundle.** Since Session 9, the footer form's
    `checkEmail` had put zod (26 kB gzipped) on every page; Session 13's `track()` was a
    second path in.
    - New `lib/email/rules.ts` holds the address rule and placements, without zod. Its
      regex is zod's own, checked by a test against `z.regexes.email`, plus a parity
      test against the server schema.
    - The server schema in `lib/email/validate.ts` is built from the same values.
  - **The tool pages' storage schemas now use `zod/mini`** (`lib/tools/tracker.ts`,
    `decision.ts`, `unsent.ts`, `lib/storage.ts`). Zod on those pages went from 26 kB
    to 8 kB. The validation rules are unchanged, and all tool tests pass unedited.
  - **Home page profile cards** now say "More on the … pattern" instead of "Read
    more", for Lighthouse SEO `link-text`.
  - **`app/favicon.ico`** (32 px, from the touch icon) removes a 404 on every page.
- **`QA.md`** records the full Section 16.4 checklist: Pass or Open for each item, with
  the test that proves it, plus the Lighthouse and INP results.
- **Lighthouse 13.5.0, mobile, median of 3 runs:**

  | Pages           | Perf | A11y | Best Pr. | SEO | LCP (budget)      | CLS |
  | --------------- | ---- | ---- | -------- | --- | ----------------- | --- |
  | Both tools      | 100  | 100  | 96       | 100 | 1.88–1.89 s (2.0) | 0   |
  | Home and guides | 100  | 100  | 96       | 100 | 1.72–1.73 s (1.8) | 0   |
  - Before the fixes, LCP was about 2.05 s everywhere and home SEO was 92.
  - Lab INP, measured with the Event Timing API at 4× CPU: 64 ms worst on the tracker,
    40 ms on the decision tool.
  - Tool-page JS is 127–129 kB gzipped (Next first-load), against 180 kB.

- **Tests:**
  - 429 unit tests pass (5 skipped, 3 todo).
  - 795 Playwright tests pass (6 `fixme`: the quiz routes).
  - New unit tests:
    - the allow-list matches Section 16.1 exactly;
    - sensitive and extra parameters are rejected;
    - day bands;
    - the Measurement Protocol transform and URL;
    - config from the environment;
    - no `gtag`, GTM or `dataLayer` in the source;
    - the browser check and its drift tests;
    - email-rule parity.
  - New Playwright tests:
    - a full journey with marked private text (a note, a draft, an address) that
      inspects every `/api/collect/` body;
    - Global Privacy Control means no requests;
    - the API's 204 and 400 cases.
- **Mutation checks, each caught:**
  - a draft leaked into an event (with client validation off);
  - a loosened server schema;
  - the browser check without the key allow-list;
  - the browser check with a permissive value pattern;
  - a changed email regex.

**Not done — needs the founder**

- **GA4 DebugView.** Set `GA4_API_SECRET` on a preview, run a journey, and confirm that
  only allow-listed parameters arrive. The network-log half of the criterion is
  automated.
- **The Session 9 real-inbox email checks.** These are still open; see the Session 9
  entry.

**Open until Sessions 4–5**

- Quiz events (`quiz_view`, `quiz_started`, `quiz_completed`, `quiz_result_shared`).
  They're defined and validated, but not yet sent.
- Lighthouse on the quiz page.
- The quiz rows of `QA.md`.

**Decisions and ambiguities (resolved with spec defaults)**

- **The Measurement Protocol instead of `gtag.js`.** Section 16.3's JS budget is an
  acceptance criterion, and `gtag.js` alone would break it. The Measurement Protocol
  also means no Google script, and no Google cookies, in the browser.
- **`fetch` with `keepalive` instead of `sendBeacon`.** It behaves the same on unload,
  and Playwright can read its body for the payload inspection.
- **`page_view` added** to the Section 16.1 events, with a path only (no query or
  fragment) and a `not_found` flag.
- **"All three tools" in Section 18 is two for now.** The quiz isn't built; it's
  measured in Session 5.
- **The INP budget is checked in the lab with Event Timing,** because a Lighthouse
  navigation can't measure INP. Real-user data confirms it after launch.
- **Best Practices is 96, not 100,** because of the 404 when the quiz link is
  prefetched. It meets the ≥ 95 budget and clears once the quiz exists.

## Session 14 — Production launch: blocked, tracker added (2026-11-02)

**Shipped**

- **`LAUNCH.md`** tracks every Section 19.1 item, with its status (Done, Ready or
  Blocked), its owner and its evidence. It also lists the founder's steps in order and
  what Claude does once they're done.

**Not done: the launch itself**

Session 14 is done only when Section 19.1 is fully ticked on the live domain. As of
this entry, none of it can be ticked:

- **`npm run test:launch` fails 0/4.** The contact email, mailing address,
  helpline verification and resource own-use answers are all missing.
- **Both domains are still on registrar parking pages.**
- **The quiz isn't built (Sessions 4–5).**
- **The Resend, GA4 and Search Console steps aren't done.**

No production deploy, DNS change or affiliate change was made.

**Noted**

- The "get her back" part of Section 19.1 isn't in the automated prohibited-terms
  pattern. A manual grep of the source is clean, and it's recorded in `LAUNCH.md` for
  a re-check on the live domain.

## Session 4 — Attachment-style quiz page and runner (2026-11-02)

**Shipped**

- **The founder-approved question data**, from `heartfixed-quiz-build-brief.md` (Part A),
  now committed in the repo root as the content source:
  - his 24 (`men-v1`), with q19, q20, q23 and q24 reversed and q23/q24 at weight 0.5,
    so max raw is 46 per dimension;
  - her 12 (the perceived-pattern module), 6 per dimension, none reversed;
  - the 6 since-the-breakup selectors (unscored);
  - the attention check at runner position 13, unnumbered;
  - the instruction line, and the 2 context questions last.
  - Every stem uses partner tokens from `config/copy.ts`. `renderStem` gained
    `{Subject}` for a sentence-initial "She".
  - **`tests/unit/quiz-brief.test.ts` parses the brief's own tables** and checks every
    rendered stem, dimension, reversal and weight against them word for word. On its
    first run it caught a dropped word in my q08; the data was fixed, not the test.
- **Engine additions, all in `lib/quiz/`:**
  - `scorePerceived` scores her module through the same `scoreQuiz` path (same
    normalization, bands and profile table).
  - `selectedDecodes` picks the selectors answered "Sometimes" or higher, for
    Session 5's decode sections.
  - `lib/quiz/runner.ts` (pure, unit-tested): the screen order, the 7-day expiry, and
    `completeAttempt`, which scores a finished attempt into what saves.
  - Storage schemas for the saved result (`heartfixed-quiz-v1`: his result, her
    perceived pattern, every answer, context) and the in-progress attempt
    (`heartfixed-quiz-progress-v1`).
  - `lib/quiz` now uses `zod/mini`, like the tools, and sticks to the zod features
    the tools already load, so it adds nothing to their shared zod chunk.
- **`/attachment-style-quiz/`** (Section 10.1):
  - Above the fold: the H1, a two-sentence promise, Block A, then the start button.
  - Server-rendered below: the four profile cards, how it works, who it's for and not
    for (with the Block C crisis line), a FAQ with schema, a trust block, and Block B.
  - No email field and no affiliate slot.
- **`QuizRunner`** (Section 10.2; brief, Part A):
  - One item per screen, with real radio inputs in a form: arrows choose, Enter
    advances.
  - Section labels: "Question N of 24"; the attention check unnumbered; "About her — N
    of 12"; "Since the breakup — N of 6"; "About where you are now — N of 2", with the
    context note. Context questions can be skipped.
  - Back keeps answers. "Choose an answer to continue" is inline and announced.
  - Progress saves on every answer. A return visit offers "Continue where you left off
    — question N of 24" or a restart. Attempts untouched for 7 days are discarded.
  - A saved result offers "See your result", or a retake after "Taking it again will
    replace your saved result."
  - "Start over" and "Clear my data on this device" are always visible. A corrupted
    stored value is cleared with a plain-English note.
  - On the last answer it scores in the browser, saves, and routes to the result view
    without a reload.
- **Analytics:** `quiz_view` (organic, internal or email), `quiz_started`, and
  `quiz_completed` with his profile and bands only. No answers and nothing from her
  module are ever sent, which an e2e test checks on every request in a full journey.
- **`/attachment-style-quiz/results/`, Session 4 minimum:** "Your pattern: …", both
  scores, Block A directly under them, a link to the profile page, and Block D. With
  nothing saved, it shows the generic "take the quiz" shell. The full Part B view is
  Session 5.
- **Time estimate:** "about 3 minutes" became "about 5 minutes" in all 7 places (44 answer
  screens). A unit test keeps every estimate equal to `QUIZ_MINUTES`.

**Tests**

- 495 unit tests pass (5 skipped; no `todo`s left).
  - Fixtures 1 and 4 run on the launch bank; Fixture 1 has the per-item hand
    verification Section 16.2 asks for.
  - The brief's H1 (avoidant 83/13) and H2 (anxious 88/13) pass; both pin "round half
    up" on exact halves.
  - Also covered: her and his answers never move each other's scores; the selector
    threshold and its fallback; the runner's screen order; finishing an attempt; the
    7-day expiry; stored-shape validation; brief parity; time estimates.
- 855 Playwright tests pass (3 skipped: the results route, `fixme` until Session 5). The
  new `quiz.spec.ts` drives the real runner through all 45 screens, checking each
  question against the data:
  - **Fixture 1 + H1:** anxious 72/18, her pattern avoidant 83/13, the result view,
    the stored data, and analytics. **Persona A + H2:** her pattern anxious 88/13,
    context skipped.
  - **Fixture 4:** avoidant (with a wrong attention answer flagged and never shown)
    and fearful-avoidant.
  - **Fixture 7:** a tampered token shows the shell, not an error.
  - **The runner:** section labels, the unnumbered attention check, blocked advance
    (Fixture 6), Back, keyboard-only use, restore after a browser restart, the 7-day
    discard, the return-visit and retake flow, clearing, corrupted storage, axe and
    44 px targets.
- **Mutation checks, each caught:**
  - weights ignored: 9 unit failures;
  - reversal ignored: 11 unit failures;
  - the runner quietly recording "4" as "3": the Fixture 1 and Fixture 4 e2e journeys
    fail.

**Lighthouse** (mobile, median of 3)

- **Quiz page:** Performance 100, Accessibility 100, Best Practices 100, SEO 100, LCP
  1.89 s, CLS 0.
- **Home and guides:** unchanged at 1.72–1.73 s. Best Practices is now 100 everywhere,
  because the quiz prefetch no longer 404s.
- **Regression: the tracker and decision tool are at 2.03 s against the 2.0 s LCP budget.**
  - Their initial script is within about 150 bytes of Session 13's 1.88–1.89 s runs.
    Lighthouse's simulated network adds a round trip once the scripts cross a TCP
    window boundary, and these pages sit on it.
  - Prefetching and the zod chunk were ruled out by experiment.
  - Proposed fix, not made: lazy-load what those tools don't show on first load. It
    changes Session 6–7 behaviour, so it's the founder's call. Details in `QA.md`.

**For founder review (flagged, not improvised)**

1. **Quiz-page copy** in `content/quiz.ts` is Session 4 drafting from spec and brief
   facts: the promise, "how it works", who it's for and not for, the FAQ, the trust
   block, and the runner's button and notice copy.
2. **Answer labels on her 12 and the selectors.** The brief says "same 0–4 scale", so
   they show "Never like me … Almost always like me". For items about her ("she has gone
   completely silent") a frequency wording such as "Never … Almost always" may read
   better. The values wouldn't change.
3. **No intro before her module.** The brief gives only the "About her — N of 12" label,
   so the switch from his questions to hers has no framing line.
4. **Two progress labels are mine:** "Since the breakup — N of 6" and "About where you
   are now — N of 2".
5. **q21's "a male friend"** is audience-specific wording that the partner dictionary
   can't swap. It's fine for `men-v1`; it needs a variant if the audience changes.
6. **The methodology page** still describes 24 questions plus 2 context questions, and
   says the quiz "can't tell you anything about your ex". It needs founder copy for the
   her module and the selectors.
7. **"About 5 minutes"** replaces "about 3 minutes" everywhere, because the runner is now
   44 screens.
8. **For Session 5 (from the brief):** whether the result email carries her content. The
   brief's default is the share-link privacy rule.

**Decisions and ambiguities (resolved with spec defaults)**

- **Fixture 4's answer patterns are constructed.** The spec fixes only the outcomes
  (profile and bands); the patterns and their hand computation are in `fixtures.ts`.
- **Required screens:** the scored items, her items and the selectors need an answer.
  The context questions are optional (Section 10.2).
- **"Older than 7 days"** is measured from the last answer, not the start.
- **The results route is a minimum view** so the runner has somewhere to land. Session 5
  replaces it. It stays `fixme` in the guardrail and SEO sweeps until then.
- **`quiz_view` source "share"** waits for Session 5's shared-result view.
- **Fixture 7** is half done: the token round trip (Session 2) and the tampered-token
  shell. The shared view is Session 5.
- **The brief is excluded from Prettier**, like the spec: it's founder content, and the
  parity test reads it as written.
