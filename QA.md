# QA — Section 16.4 acceptance checklist

Recorded in Session 13 on 2026-11-02, against branch `session-13-analytics-qa`.

**Status key**

- **Pass:** verified, with the evidence named.
- **Open (Sessions 4–5):** blocked until the quiz page and result view exist. Those
  sessions are waiting on the founder's question bank and Persona A's answers.
- **Open (founder):** needs an account or a real inbox that the build can't reach.

Every "Pass" below has an automated test behind it, and all of them ran green on
2026-11-02:

| Suite                                                 | Result                                              |
| ----------------------------------------------------- | --------------------------------------------------- |
| `npm run check` (types, lint, format, unit)           | 429 passed, 5 skipped, 3 todo                       |
| `npx playwright test` (phone-320, phone-360, desktop) | 795 passed, 6 skipped (the quiz routes, as `fixme`) |

---

## Performance — Section 16.3

**Method**

- Lighthouse 13.5.0, default mobile config: simulated throttling, 4× CPU slowdown,
  slow 4G.
- Run against a production build (`next build` + `next start`) on localhost, with
  analytics switched on (`NEXT_PUBLIC_GA_MEASUREMENT_ID` set).
- Chromium is Playwright's Chrome for Testing build 1248.
- Each figure is the median of 3 runs.

| Page                                    | Perf | A11y | Best Pr. | SEO | LCP (budget) | CLS |   TBT |
| --------------------------------------- | ---: | ---: | -------: | --: | ------------ | --: | ----: |
| `/no-contact-tracker/`                  |  100 |  100 |       96 | 100 | 1.88 s (2.0) |   0 | 15 ms |
| `/should-i-text-my-ex/`                 |  100 |  100 |       96 | 100 | 1.89 s (2.0) |   0 | 35 ms |
| `/` (home)                              |  100 |  100 |       96 | 100 | 1.73 s (1.8) |   0 | 12 ms |
| `/no-contact-rule/`                     |  100 |  100 |       96 | 100 | 1.72 s (1.8) |   0 |  8 ms |
| `/guides/no-contact-day-14/`            |  100 |  100 |       96 | 100 | 1.72 s (1.8) |   0 | 10 ms |
| `/guides/how-long-does-a-breakup-take/` |  100 |  100 |       96 | 100 | 1.72 s (1.8) |   0 |  8 ms |

**Budgets**

- **Total JS on a tool page:** pass.
  - Next reports 127 kB gzipped first-load JS for the tracker and 129 kB for the
    decision tool, against a 180 kB budget.
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
- **Best Practices = 96:** pass. The one deduction is a console error from prefetching
  `/attachment-style-quiz/`, which returns 404 until Session 4 builds it. It clears
  itself then.
- **Quiz page:** Open (Sessions 4–5). It gets measured once it exists.

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

| Criterion                                                             | Status                           | Evidence                                                                                                                              |
| --------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Block A under every result headline                                   | Open (Sessions 4–5)              | No result view yet. `guardrails.spec.ts` lists it as `fixme`                                                                          |
| Block B on every tool page                                            | Pass (tracker, decision tool)    | `guardrails.spec.ts` (`tool-disclaimer`). Quiz page: Open (Session 4)                                                                 |
| Block C in every footer                                               | Pass                             | `guardrails.spec.ts` checks every built route, plus `compliance.test.tsx`                                                             |
| Block D on result, decision outcome and tracker                       | Pass (tracker, decision outcome) | `guardrails.spec.ts`, `tracker.spec.ts`, `decision.spec.ts` ("alcohol forces don't send … and Block D"). Result: Open (Session 5)     |
| A quiz completed with the email field untouched gives the full result | Open (Sessions 4–5)              | Engine side: `scoreQuiz` takes the answers only, so nothing about email can gate the result. The page-level test comes with Session 5 |
| No Section 14.2 prohibited terms outside legal-page context           | Pass                             | `source-guards.test.ts` (source code) and `guardrails.spec.ts` (rendered text on every built route)                                   |
| No chat UI anywhere                                                   | Pass                             | `source-guards.test.ts` (no AI or chat code paths) and `guardrails.spec.ts` (no `role=log` or chat labels)                            |

## Quiz engine

| Criterion                                                             | Status                                                        | Evidence                                                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| All Section 16.2 quiz fixtures pass                                   | Partly: fixtures 2, 3, 5 and 6 pass; 1 and 4 Open (Session 4) | `scoring.test.ts`. Fixtures 1 and 4 need the launch question bank and Persona A's answers, so they're `it.todo` |
| Determinism: the same answers scored 100 times give identical results | Pass                                                          | `scoring.test.ts`                                                                                               |
| Profile matches the Section 9.4 table for all nine band combinations  | Pass                                                          | `scoring.test.ts` (`it.each` over the table)                                                                    |

## Assessment page

| Criterion                                                                   | Status                                      | Evidence                                                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| In-progress answers restore after a browser restart                         | Open (Session 4)                            | The storage key and schema exist (`lib/storage.ts`). No page yet                                                             |
| Context questions don't change scores                                       | Pass at engine level; page Open (Session 4) | `scoring.test.ts` "context answers demonstrably do not alter scores"                                                         |
| A shared link shows the right profile, is `noindex`, and exposes no answers | Partly                                      | Token: `share.test.ts` (scores and version only). `noindex`: `seo.spec.ts` and the sitemap test. Rendering: Open (Session 5) |

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

| Criterion                                                             | Status                                         | Evidence                                                                                                  |
| --------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A result send creates no list subscription, confirmed in the provider | Pass in code; provider check Open (founder)    | `email.test.tsx` consent-separation tests (memory provider). The Resend check needs the Session 9 setup   |
| A list join works from the footer, result and tracker                 | Pass for footer and tracker; result form built | `email.spec.ts` (exact request bodies). `EmailResultForm` gets placed on the result view in Session 5     |
| Reminder opt-in is independent of list membership                     | Pass in code                                   | `email.spec.ts` "the tracker list join is its own action" and `email.test.tsx`                            |
| Unsubscribe from any stream works in one click                        | Template Pass; live check Open (founder)       | `email.test.tsx` (one-click unsubscribe link in every marketing email). The live test needs Resend Topics |

The founder's steps for the email items are in `BUILD-LOG.md`, under Session 9, "Not
done — needs the founder".

## SEO

| Criterion                                                            | Status                                                                                        | Evidence                                                                   |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Schema validates, with no prohibited types                           | Pass                                                                                          | `seo.spec.ts` on every built route, plus `seo.test.ts`                     |
| The sitemap lists exactly the Section 6 indexable routes             | Pass                                                                                          | `seo.spec.ts`                                                              |
| Every page's title, description, canonical and OG match Section 12.2 | Pass                                                                                          | `seo.spec.ts` on every built route                                         |
| axe finds zero critical issues on the three tools                    | Pass for tracker and decision tool (on load and in interactive states); quiz Open (Session 4) | `seo.spec.ts`. Lighthouse accessibility is also 100 on every measured page |

## Analytics privacy

| Criterion                                                                      | Status                                                                              | Evidence  |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------- |
| A full journey's payloads contain no answer, note, draft text or email address | Pass for tracker, decision tool, footer signup and guides; quiz Open (Sessions 4–5) | See below |

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

- After Sessions 4–5, re-run the full suite and Lighthouse on `/attachment-style-quiz/`
  and the result view.
- Flip the `fixme` and `it.todo` entries listed above.
- Update the Open rows in this file.
