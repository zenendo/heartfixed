# Launch tracker — Section 19.1

Every item must be ticked **on https://heartfixed.com** before the site is announced
anywhere. Session 14 is done when every row reads **Done**.

Last checked: 2026-11-02, on `main` at `ca863ee` (Session 13); rows 3, 4, 5 and 7 updated in Session 4.

**Status key**

- **Done:** verified on the live domain.
- **Ready:** passes in the repo and on the production build. It still has to be re-run
  on the live domain in Session 14.
- **Blocked:** waiting on an input or a step that isn't done yet. The "Waiting on"
  column says which.

**Owners**

- **Founder:** accounts, DNS, content sign-off, real-inbox and real-device checks.
- **Claude:** code, config changes, automated runs, verification on the live domain.

---

## Where things stand

**Domains (checked 2026-11-02)**

| URL                      | What it does now                                                |
| ------------------------ | --------------------------------------------------------------- |
| `http://heartfixed.com`  | 302 to `http://www.heartfixed.com/`, the Namecheap parking page |
| `https://heartfixed.com` | No response                                                     |
| `fixedheart.com`         | On a different parking service. No https response, no redirect  |

**`npm run test:launch`: 0 of 4 pass**

- No contact email in `config/site.ts`.
- No mailing address in `config/site.ts`.
- No international helplines marked as founder-verified.
- Recommended resources without an own-use answer.

**Quiz:** the page, the runner (Session 4) and the full result view (Session 5) are built.

---

## Checklist

| #   | Section 19.1 item                                                                                                                                                             | Status               | Owner                          | Evidence, or what it's waiting on                                                                                                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No `{{` placeholder token anywhere in the production build. Brand and domain come only from `config/site.ts`                                                                  | Ready                | Claude                         | `source-guards.test.ts` (source code, and brand only in config); `seo.spec.ts` (served HTML of every built route). Re-run against the live domain                                                                                                                                                                    |
| 2   | All Section 6 routes live on https://heartfixed.com, with www → apex, http → https, and fixedheart.com 301-redirecting every path                                             | Blocked              | Founder, then Claude           | Waiting on: both domains pointed at Vercel; www → apex and http → https set in Vercel; fixedheart.com 301 on every path; the quiz routes built (Sessions 4–5). Claude then checks every route and redirect                                                                                                           |
| 3   | All Section 16.2 fixtures and the full test suite green on the production build                                                                                               | Blocked              | Claude                         | Fixtures 1–7 and the brief's H1/H2 pass, end to end on the runner and the result view; 543 unit and 933 Playwright tests pass on the production build (Session 5). Waiting on: the production build on the live domain                                                                                               |
| 4   | Lighthouse budgets met on all three tool pages; axe finds zero critical issues                                                                                                | Ready                | Claude                         | All three tool pages pass locally after Session 5: LCP 1.89 s, Performance 100, Accessibility 100 (`QA.md`). axe clean on all three and on the result view. The results route passes its own 2.5 s budget (2.33–2.41 s; founder decision 2026-11-03). Re-run against the live domain at launch                       |
| 5   | Blocks A–E in every specified place; footer crisis line on every page (one page of each type, plus the 404)                                                                   | Blocked              | Claude                         | Pass locally: Block A under the result headline (full and shared views) and on the quiz page; Block D on the result, decision outcome and tracker; Blocks B, C and E and the footer line (`guardrails.spec.ts`, `result.spec.ts`, `decision.spec.ts`, `seo.spec.ts` for the 404). Waiting on: the live-domain re-run |
| 6   | Prohibited-terms sweep clean outside legal-page context; no "get her back" language in the site's own voice                                                                   | Ready                | Claude                         | `source-guards.test.ts`, plus the rendered-text sweeps in `guardrails.spec.ts` and `content-pages.spec.ts`. "Get her/him/them/your ex back" is in every sweep pattern. Re-run on the live domain                                                                                                                     |
| 7   | Full quiz completable, with the whole result visible and no email entered; tracker and decision tool fully usable without email                                               | Blocked              | Claude                         | Pass locally: the quiz completes with no email and ends on the full Part B result (`quiz.spec.ts`, `result.spec.ts`); tracker and decision tool need no email. Waiting on: the live-domain re-run                                                                                                                    |
| 8   | Result email tested end to end from production into a real inbox, figures matching the screen; the transactional send creates no list subscription; list unsubscribe verified | Blocked              | Founder                        | Consent separation and unsubscribe links pass with the memory provider (`email.test.tsx`, `email.spec.ts`). Waiting on: the mailing address; the Resend domain, Topics and keys (`BUILD-LOG.md`, Session 9); the result view (Session 5); a decision on how daily reminders are sent                                 |
| 9   | Analytics payload inspection re-run on production: no answers, notes, draft text or email addresses                                                                           | Blocked              | Claude, then Founder           | The automated journey passes locally (`analytics.spec.ts`). Waiting on: the live domain; `GA4_API_SECRET` in Vercel; the quiz events. The founder confirms in GA4 DebugView                                                                                                                                          |
| 10  | Privacy, Terms, Disclosure, About, Contact, Methodology and Crisis Resources published and linked from the footer; the crisis page's international entries verified           | Blocked              | Founder                        | Pages built and in the footer (`site-config.test.ts`, `home.spec.ts`, `trust-pages.spec.ts`). Waiting on: the public contact email; the founder's verification of the international helplines (`npm run test:launch`)                                                                                                |
| 11  | Sitemap submitted in Search Console; GA4 receiving the Section 16.1 events                                                                                                    | Blocked              | Founder                        | `/sitemap.xml` lists exactly the indexable routes (`seo.spec.ts`). Waiting on: the live domain; the Search Console property; `GA4_API_SECRET`                                                                                                                                                                        |
| 12  | Affiliate slots all disabled, or enabled through config only for approved programmes, with the Section 14.5 disclosure above each and no payout figure anywhere public        | Ready (all disabled) | Founder decides, Claude checks | `site-config.test.ts` ("ships every slot disabled"); `guides-content.test.tsx` (disclosure first when enabled; no payout); `content-pages.spec.ts`. Section 17.5: enable a slot only after every other row is Done. Every resource also needs an own-use answer (`npm run test:launch`)                              |
| 13  | Favicon, OG images and 404 page in place; share links, print views and the urge timer tested from a phone                                                                     | Blocked              | Claude, then Founder           | Favicon, OG cards and the 404 pass (`seo.spec.ts`). Tracker print view (`tracker.spec.ts`). Urge timer on the phone-320 and phone-360 projects (`decision.spec.ts`). Waiting on: share links (Session 5); the founder testing on a real phone                                                                        |

---

## Founder to-do, in order

1. **Quiz content.** Done 2026-11-02 (the quiz build brief). Still to review: the
   Session 4 quiz-page copy, and the Session 5 wording and open questions in
   `BUILD-LOG.md` (Session 5, "For founder review").
2. **Config values** (send them and Claude sets them):
   - the public contact email;
   - the mailing address;
   - verification of the international helplines;
   - an own-use answer for each recommended resource (rows 8, 10 and 12).
3. **DNS:**
   - point `heartfixed.com` and `www` at Vercel;
   - set www → apex in Vercel;
   - make `fixedheart.com` 301-redirect every path to `https://heartfixed.com` (row 2).
4. **Accounts:**
   - Resend sending domain, Topics, contact properties and keys (Session 9 steps);
   - `GA4_API_SECRET` in Vercel;
   - the Search Console property (rows 8, 9 and 11).
5. **Decide how daily reminders are sent** (Session 9 open question).
6. **Real checks on the live site:**
   - a result email into a real inbox;
   - unsubscribe;
   - GA4 DebugView;
   - share links, print and the urge timer on your phone (rows 8, 9 and 13).

## Claude in Session 14 (once the founder steps are done)

1. Verify the Section 1.3 values and the fixedheart.com redirect, then deploy
   production from `main`.
2. Crawl every Section 6 route and redirect on the live domain.
3. Re-run, against the live domain: the full suite, Lighthouse on all three tools and
   on the results route (its own 2.5 s budget), axe, the `{{` and prohibited-terms
   sweeps, and the analytics payload inspection.
4. Mark each row **Done** here, with the date and evidence.
5. Enable affiliate slots only for programmes the founder has approved.

## After launch

- **Results route LCP** (2.33–2.41 s against its own 2.5 s budget; `QA.md`). The page
  can only paint after hydration, so the options are a smaller first script or
  rendering the shared view's headline on the server. Not a launch item (founder,
  2026-11-03).
