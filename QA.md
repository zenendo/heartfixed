# QA — Section 16.4 acceptance checklist

Recorded in Session 13 on 2026-11-02, and updated in Session 4 (the quiz page and
runner) on 2026-11-02, against branch `session-04-quiz-runner`.

**Status key**

- **Pass:** verified, with the evidence named.
- **Open (Session 5):** blocked until the full result view exists (the quiz page and
  runner shipped in Session 4).
- **Fail:** measured and over budget, with the cause and the proposed fix.
- **Open (founder):** needs an account or a real inbox that the build can't reach.

Every "Pass" below has an automated test behind it, and all of them ran green on
2026-11-02:

| Suite                                                 | Result                                                |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `npm run check` (types, lint, format, unit)           | 495 passed, 5 skipped                                 |
| `npx playwright test` (phone-320, phone-360, desktop) | 855 passed, 3 skipped (the results route, as `fixme`) |

---

## Performance — Section 16.3

**Method**

- Lighthouse 13.5.0, default mobile config: simulated throttling, 4× CPU slowdown,
  slow 4G.
- Run against a production build (`next build` + `next start`) on localhost, with
  analytics switched on (`NEXT_PUBLIC_GA_MEASUREMENT_ID` set).
- Chromium is Playwright's Chrome for Testing build 1248.
- Each figure is the median of 3 runs, re-measured after Session 5 (2026-11-03) on
  every page Session 5 could affect.

| Page                                           | Perf | A11y | Best Pr. | SEO | LCP (budget) | CLS |   TBT |
| ---------------------------------------------- | ---: | ---: | -------: | --: | ------------ | --: | ----: |
| `/attachment-style-quiz/`                      |  100 |  100 |      100 | 100 | 1.89 s (2.0) |   0 | 33 ms |
| `/no-contact-tracker/`                         |  100 |  100 |      100 | 100 | 1.89 s (2.0) |   0 | 34 ms |
| `/should-i-text-my-ex/`                        |  100 |  100 |      100 | 100 | 1.89 s (2.0) |   0 | 34 ms |
| `/attachment-style-quiz/results/` (empty)      |   98 |  100 |      100 |  66 | 2.41 s (2.5) |   0 | 38 ms |
| `/attachment-style-quiz/results/?v=…` (shared) |   98 |  100 |      100 |  66 | 2.33 s (2.5) |   0 | 16 ms |
| `/` (home)                                     |  100 |  100 |      100 | 100 | 1.72 s (1.8) |   0 | 11 ms |
| `/no-contact-rule/`                            |  100 |  100 |      100 | 100 | 1.72 s (1.8) |   0 |  9 ms |
| `/guides/no-contact-day-14/`                   |  100 |  100 |      100 | 100 | 1.72 s (1.8) |   0 |  8 ms |
| `/guides/how-long-does-a-breakup-take/`        |  100 |  100 |      100 | 100 | 1.72 s (1.8) |   0 | 10 ms |
| `/guides/attachment-styles-after-a-breakup/`   |  100 |  100 |      100 | 100 | 1.72 s (1.8) |   0 |  9 ms |
| `/attachment-styles/anxious/`                  |  100 |  100 |      100 | 100 | 1.72 s (1.8) |   0 | 10 ms |
| `/methodology/`                                |  100 |  100 |      100 | 100 | 1.72 s (1.8) |   0 |  9 ms |

**Budgets**

- **The results route: pass against its own 2.5 s LCP budget** (founder decision,
  2026-11-03), at 2.41 s empty and 2.33 s from a shared link.
  - Why its own budget: it's the payoff page, viewed once per result, and Section 6
    makes it a client-rendered shell (its content comes from this browser's storage or
    the share link), so its LCP always follows hydration, unlike every other page.
    Section 16.3's 2.0 s stays the budget for the three tool pages.
  - Optimising it is a post-launch item (`LAUNCH.md`, "After launch"), not a launch
    blocker.
  - Already done to keep it down: the full view (all of Part B) loads on its own; the
    empty view's copy is in its own file; the shared view, which public links land on,
    ships with the page so it needs no second request (lazy-loading it measured 2.93 s
    and a 1.2 CLS).
  - CLS is 0 on both, and an end-to-end test holds the saved-result and shared views to
    ≤ 0.05 (Lighthouse can't seed storage).
  - SEO 66 is Lighthouse penalising `noindex`, which Section 9.6 requires.
- **Session 5 kept the tool pages in budget.**
  - Session 5's new pages made the bundler move `next/dynamic`'s loader into each tool's
    page chunk, putting the decision tool back at 2.04 s. The panels now use React's
    `lazy()` (`components/tools/lazyPanel.tsx`), which needs no loader code.
  - `package.json` now has `"sideEffects": ["*.css"]`, so code a page doesn't use is
    dropped from it. The quiz page had been loading all of the profile copy.
  - Measured against `main` on the same machine before the fix: decision tool 1.89 s on
    `main`, 2.04 s on the branch; after the fix, 1.89 s.
- **LCP on the tracker and decision tool: pass, 1.89 s** (was 2.03 s after Session 4).
  - Session 4 left both pages about 150 bytes over a TCP window boundary in
    Lighthouse's simulated network, which adds a round trip (about 150 ms). Prefetching
    and the zod chunk were ruled out by experiment.
  - Fix: the panels a first visit doesn't show load on their own and are preloaded once
    the browser is idle. Tracker: check-in, calendar, slip flow, reminder and email
    signup. Decision tool: outcome, draft check and urge timer. Page script went from
    8.57 to 6.32 kB (tracker) and 10.6 to 7.78 kB (decision tool).
  - A unit test (`tests/unit/lazy-panels.test.ts`) fails if any of them becomes a static
    import again.

- **Total JS on a tool page:** pass.
  - Next reports 125 kB gzipped first-load JS for the quiz page, 126 kB for the
    tracker, 127 kB for the decision tool and 130 kB for the results route, against a
    180 kB budget.
  - Lighthouse saw 144 kB of script transferred in total. That figure includes the
    other tools' chunks, which Next prefetches after load.
  - Every other page is 106 kB.
- **INP ≤ 200 ms:** pass, measured in the lab.
  - A Lighthouse navigation can't measure INP, so the real interactions were timed
    with the Event Timing API: 360 px viewport, 4× CPU throttle, 3 runs.
  - Tracker (setup, urge level, typing a note, check-in): worst interaction 64 ms.
  - Decision tool (every step, plus typing a draft): worst interaction 40 ms.
  - Field INP gets confirmed from real-user data after launch.
- **CLS ≤ 0.05:** pass. It's 0 on every page.
- **Best Practices = 100** since Session 4: the quiz page exists, so the prefetch 404
  is gone.
- **Quiz page INP:** not yet measured in the lab; the runner is one radio choice and
  one button per screen. Still open after Session 5.

**Fixes made to meet the budgets (Session 13)**

- **Before the fixes,** simulated LCP was about 2.05 s on every page. The home page's
  SEO score was 92.
- **zod moved out of the shared bundle.** The footer form's `checkEmail` had put zod
  (26 kB gzipped) on every page since Session 9; `track()` was a second path in.
  - The browser side now uses `lib/email/rules.ts` and `lib/analytics.ts`, neither of
    which imports zod.
  - The server keeps the full zod schemas, in `lib/email/validate.ts` and
    `lib/analyticsSchema.ts`.
- **The tool pages' storage schemas moved to `zod/mini`.** Zod on those pages went from
  26 kB to 8 kB.
- **The home page's "Read more" links** now say which pattern they lead to, which
  fixes Lighthouse's `link-text` audit.
- **Added `app/favicon.ico`.** It removes a 404 on every page.

---

## Guardrails

| Criterion                                                             | Status                              | Evidence                                                                                                                                                                |
| --------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Block A under every result headline                                   | Pass                                | `result.spec.ts` and `quiz.spec.ts`: Block A is the element straight after the scores, on the full and the shared view; `guardrails.spec.ts` now runs the results route |
| Block B on every tool page                                            | Pass (quiz, tracker, decision tool) | `guardrails.spec.ts` (`tool-disclaimer`)                                                                                                                                |
| Block C in every footer                                               | Pass                                | `guardrails.spec.ts` checks every built route, plus `compliance.test.tsx`                                                                                               |
| Block D on result, decision outcome and tracker                       | Pass                                | `guardrails.spec.ts` (results route seeded), `result.spec.ts`, `tracker.spec.ts`, `decision.spec.ts`                                                                    |
| A quiz completed with the email field untouched gives the full result | Pass                                | `quiz.spec.ts`: the Fixture 1 + H1 run ends on the full Part B view (her read, the dynamic, the decodes) with no email entered; `result.spec.ts` covers every section   |
| No Section 14.2 prohibited terms outside legal-page context           | Pass                                | `source-guards.test.ts` (source code) and `guardrails.spec.ts` (rendered text on every built route)                                                                     |
| No chat UI anywhere                                                   | Pass                                | `source-guards.test.ts` (no AI or chat code paths) and `guardrails.spec.ts` (no `role=log` or chat labels)                                                              |

## Quiz engine

| Criterion                                                             | Status                                   | Evidence                                                                                                                                      |
| --------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| All Section 16.2 quiz fixtures pass                                   | Pass: 1 to 7, plus the brief's H1 and H2 | `scoring.test.ts`, `runner.test.ts`, `share.test.ts`, `dynamics.test.ts`; end to end in `quiz.spec.ts` and `result.spec.ts` (the shared view) |
| Determinism: the same answers scored 100 times give identical results | Pass                                     | `scoring.test.ts`                                                                                                                             |
| Profile matches the Section 9.4 table for all nine band combinations  | Pass                                     | `scoring.test.ts` (`it.each` over the table)                                                                                                  |

## Assessment page

| Criterion                                                                   | Status | Evidence                                                                                                                                                 |
| --------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| In-progress answers restore after a browser restart                         | Pass   | `quiz.spec.ts` "restores after a browser restart" (a new browser context from the saved storage), plus the 7-day discard                                 |
| Context questions don't change scores                                       | Pass   | `scoring.test.ts` "context answers demonstrably do not alter scores"; the selectors and her module are tested the same way                               |
| A shared link shows the right profile, is `noindex`, and exposes no answers | Pass   | `result.spec.ts`: the shared view shows the profile and scores and nothing about the partner; `noindex`; the copied link carries scores and version only |

## Tracker

| Criterion                                                | Status | Evidence                                                                          |
| -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| All tracker fixtures pass                                | Pass   | `lib/tools/__tests__/tracker.test.ts`                                             |
| Clearing data deletes the localStorage key               | Pass   | `tracker.spec.ts` "Clear my data deletes the localStorage key"                    |
| The slip flow has none of the Section 11.1 shaming words | Pass   | `tracker.spec.ts` "asks one question … and never shames" checks the rendered copy |
| Export downloads the visitor's own data correctly        | Pass   | `tracker.spec.ts` (JSON and CSV exports) and `storage.test.ts`                    |

## Decision tool

| Criterion                                        | Status | Evidence                                                                           |
| ------------------------------------------------ | ------ | ---------------------------------------------------------------------------------- |
| All decision fixtures pass                       | Pass   | `lib/tools/__tests__/decision.test.ts`                                             |
| Pasted draft text appears in no outbound request | Pass   | `decision.spec.ts` network assertion, plus the full journey in `analytics.spec.ts` |
| Block E renders above the textarea               | Pass   | `decision.spec.ts` "Block E renders directly above the textarea"                   |
| The timer works with reduced motion on           | Pass   | `decision.spec.ts` "counts down 30 minutes with reduced motion"                    |

## Email flows

| Criterion                                                             | Status                                      | Evidence                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A result send creates no list subscription, confirmed in the provider | Pass in code; provider check Open (founder) | `email.test.tsx` consent-separation tests (memory provider). The Resend check needs the Session 9 setup   |
| A list join works from the footer, result and tracker                 | Pass                                        | `email.spec.ts` (footer, tracker) and `result.spec.ts` (the result form's separate box)                   |
| Reminder opt-in is independent of list membership                     | Pass in code                                | `email.spec.ts` "the tracker list join is its own action" and `email.test.tsx`                            |
| Unsubscribe from any stream works in one click                        | Template Pass; live check Open (founder)    | `email.test.tsx` (one-click unsubscribe link in every marketing email). The live test needs Resend Topics |

The founder's steps for the email items are in `BUILD-LOG.md`, under Session 9, "Not
done — needs the founder".

## SEO

| Criterion                                                            | Status                                                          | Evidence                                                                                   |
| -------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Schema validates, with no prohibited types                           | Pass                                                            | `seo.spec.ts` on every built route, plus `seo.test.ts`                                     |
| The sitemap lists exactly the Section 6 indexable routes             | Pass                                                            | `seo.spec.ts`                                                                              |
| Every page's title, description, canonical and OG match Section 12.2 | Pass                                                            | `seo.spec.ts` on every built route                                                         |
| axe finds zero critical issues on the three tools                    | Pass (quiz page, mid-runner and result; tracker; decision tool) | `seo.spec.ts`, `quiz.spec.ts`. Lighthouse accessibility is also 100 on every measured page |

## Analytics privacy

| Criterion                                                                      | Status                                                              | Evidence                                                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A full journey's payloads contain no answer, note, draft text or email address | Pass for the quiz, tracker, decision tool, footer signup and guides | `analytics.spec.ts`; `quiz.spec.ts` checks every request in a full quiz journey for answer keys and the her-module result |

**What's been checked**

- **`analytics.spec.ts`** drives a full journey with marked private text: a check-in
  note, a pasted draft and an email address. It captures every `/api/collect/` body
  and asserts three things:
  - each body passes the strict allow-list;
  - no body contains any of the marked text or an `@`;
  - the expected events and parameters were sent.
- **Two independent checks before anything reaches GA4.** The browser drops anything
  that isn't a known event with known keys and code-like values. The server then
  re-checks against the exact zod allow-list (`lib/analyticsSchema.ts`).
- **Global Privacy Control** turns analytics off entirely, also tested in
  `analytics.spec.ts`.
- **Mutation checks**, each caught by the tests:
  - a draft leaked into an event;
  - a loosened schema;
  - the browser check with the key allow-list removed;
  - a looser value pattern.

**Still to do: GA4 DebugView (founder)**

1. Set `GA4_API_SECRET` on a preview.
2. Run the same journey.
3. Confirm in DebugView that events arrive with only the allow-listed parameters.

## Resilience

| Criterion                    | Status                                                     | Evidence                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cleared localStorage         | Pass                                                       | Every Playwright test starts with empty storage. "Clear my data" tests in `tracker.spec.ts` and `decision.spec.ts`                                 |
| A corrupted storage value    | Pass                                                       | `tracker.spec.ts` (corrupted, and well-formed but invalid) and `decision.spec.ts` (corrupted unsent list). Both show a plain-English recovery path |
| A tampered share token       | Pass at engine and API level; result page Open (Session 5) | `share.test.ts`, `email.test.tsx`, and `email.spec.ts` "bad input gets a code, never an echo"                                                      |
| A 500-character tracker note | Pass                                                       | `tracker.spec.ts` "a stored 500-character note renders without breaking the page"                                                                  |
| Blocked storage              | Pass                                                       | `tracker.spec.ts` "blocked storage: the tracker still works for the visit and says so"                                                             |

---

## Re-running this checklist

- After Session 5, re-run the full suite and Lighthouse on the result view, and the
  lab INP script on the quiz runner.
- Flip the results route's `fixme` entries.
- Update the Open rows in this file, and the tool-page LCP row once it's fixed.
