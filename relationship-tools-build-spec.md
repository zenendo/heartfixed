# HeartFixed — Build Spec for Claude Code

**Site:** heartfixed.com — brand settled as **HeartFixed** (see Section 1.3); fixedheart.com redirects to it
**Product:** A relationship-tools website for men: an attachment-style assessment, a no-contact tracker, a "should I text my ex?" decision tool, and a breakup-recovery content hub, with an email list
**Flagship tool:** The attachment-style assessment for men, framed by behaviour
**Build window:** 4 weeks, heavy founder time in month one
**Revenue model:** Affiliate-first in Phase 1; a finite, one-off AI-assisted recovery programme in Phase 2 (specified in Section 15, not built in the MVP month)
**Audience for this document:** Claude Code (primary builder) and the founder (reviewer and decision-maker)
**Status:** Ready to build — self-contained, no follow-up questions required

---

## 1. How to use this spec with Claude Code

Do not paste this entire document into one session and ask for the whole site. Build it in the ordered sessions in Section 18. Each session is small, ends with tests passing, and can be reviewed on a preview URL before the next one starts.

Rules to give Claude Code at the start of every session:

- Work only on the session's scope. If a feature belongs to a later session or to Phase 2, add a `TODO(session-n)` or `TODO(phase-2)` comment instead of building it.
- The quiz engine (Section 9) is shared. Never duplicate scoring logic inside a page or component — import from `lib/quiz/`.
- Every scoring change must keep all unit tests in Section 16 passing, including the scoring fixtures. If a fixture and the code disagree, stop and flag it — do not edit the expected value to make the test pass.
- Affiliate links, program names, prices, and commission claims come only from `config/affiliates.ts` and `config/site.ts`. Never hardcode an affiliate URL, a payout figure, or a program price in a component, a content file, or metadata.
- Compliance copy in Section 14 is verbatim. Do not paraphrase, shorten, move, or "improve" it.
- The guardrails in Section 14.1 are hard build requirements. A feature that cannot meet them does not ship; it is cut or redesigned until it does.
- Performance budgets in Section 16 are acceptance criteria, not aspirations. A page that misses its budget is not done.
- Analytics must never receive sensitive content (Section 16.1). If an event design would require sending quiz answers, journal text, a draft message to an ex, or an email address as an event parameter, the event design is wrong — change the event, not the rule.
- Commit at the end of each session with the session number in the message, for example `session-04: attachment assessment results`.

Founder's job during the build: review each session's preview, run the acceptance checklist for that tool (Section 16.4), point heartfixed.com (and its fixedheart.com redirect) at the host and create the accounts listed in Section 17.3 when that week's session needs them, and supply the factual inputs listed in Section 19.2 (contact email, mailing address, affiliate approvals). Everything else is buildable without further decisions — every open choice in this spec carries a recommended default, and Claude Code should use the default rather than asking.

### 1.1 What "done" means for the MVP

The MVP is done when a man who has just been dumped can arrive from a search, take the assessment, get a full and useful result for free, start a no-contact streak without creating an account, get talked through the urge to text his ex by a structured decision tool, and join an email list that will actually help him — on a fast, accessible, mobile-first site that makes its first affiliate revenue possible without making a single therapy claim. Section 19.4 defines day-30 success in full.

### 1.2 Decisions already locked — do not relitigate during the build

- **Brand:** **HeartFixed** — heartfixed.com is the brand and primary domain; fixedheart.com is owned and 301-redirects to it (Section 1.3). Settled 29 October 2026.
- **Audience:** men first, as a deliberate beachhead. The data model, design tokens, and content system are architected so the site can expand to women and everyone later without a rebuild (Section 2.3). Copy at launch speaks to men; code never assumes it always will.
- **DecodeDebt is closed.** No part of this build references, links to, or shares infrastructure decisions with the debt-calculator project beyond the stack defaults it happens to share.
- **Revenue order:** affiliates first, own product second. No checkout, payment processing, or paywall is built in the MVP month.
- **Own-product pricing shape (Phase 2):** one-off payment for the full programme. No subscription is designed, built, or hinted at anywhere in the MVP, including in email copy and FAQ answers about "what's coming."
- **No AI therapist. No AI companion.** This is an explicit founder decision, not a default. Section 5.2 lists what this excludes, and Section 15 specifies the bounded form AI is allowed to take in Phase 2.
- **Faceless at launch.** No page, template, schema block, or email in the MVP requires founder photography, video, voice, or a personal byline. Section 12.5 structures content so founder-led material can be added later without rework.

### 1.3 Brand and domain — settled, read this before Session 1

The brand is settled: **HeartFixed**, on **heartfixed.com**. The founder also owns **fixedheart.com**, which exists only as a defensive redirect — every path on fixedheart.com 301-redirects to the matching path on heartfixed.com. No page, email, or piece of copy is ever published under fixedheart.com.

| Value | Settled value | Where it lives in code |
|---|---|---|
| Brand name | `HeartFixed` | `config/site.ts` only (`site.name`) |
| Primary domain | `heartfixed.com` — canonical URL `https://heartfixed.com` | `config/site.ts` only (`site.domain`, `site.url`) |
| Defensive domain | `fixedheart.com` → 301 to heartfixed.com | Host/registrar redirect only — never in site code or content |

Rules:

- Claude Code must never hardcode the brand name or domain inside a component, content file, or metadata literal. All rendering reads from `config/site.ts`, which ships with the values `"HeartFixed"` and `"https://heartfixed.com"`. Changing the brand later, if it ever happens, is a config change, not a codebase hunt.
- The launch checklist (Section 19.1) includes a grep for `{{` across the production build. Any leftover placeholder token from earlier drafts blocks launch.
- Wordmark, logo text, email sender name, schema `name` fields, Open Graph titles, and legal-page party names all derive from the same two config values.
- Development and preview work runs on the hosting provider's preview URLs. Only Session 14 (production launch) requires the live domain and the fixedheart.com redirect to be in place.

---

## 2. Product vision and positioning

HeartFixed sells relief and progress, not dependency. A visitor arrives in a specific, miserable moment — usually in the first weeks after a breakup, often late at night, often with his phone in his hand and a draft message already written — and leaves with three things he did not have an hour earlier: a name for the pattern he keeps repeating, a streak he does not want to break, and a plan for the next 24 hours. No account. No diagnosis. No one pretending to be his therapist, his friend, or his girlfriend.

Positioning line for the homepage hero:

> Find out why you attach the way you do — and get through the breakup without texting her.

What HeartFixed is:

- A tool site first and a content site second. The tools are the product; articles exist to bring searchers to the tools, explain the results, and answer the situational questions the tools cannot.
- An education and self-reflection product. It helps a man understand his own behaviour — in past relationships, in this breakup, in the urge he is feeling right now — using the attachment framework that the audience is already reading about in books like *Attached* and *Anxiously Attached*.
- A funnel with an honest shape: free tools → email list → affiliate recommendations for the courses and books that genuinely go deeper → (Phase 2) the founder's own finite recovery programme.
- Faceless and durable. The brand is the tool quality and the voice of the copy, not a personality. It should be possible to run this site at a few hours a week once the build month is over.

What HeartFixed is not (do not build toward these):

- Not therapy, counselling, coaching, or medical advice, in copy, in product design, or in implication. See Section 14.
- Not an AI companion, AI friend, or AI girlfriend/boyfriend product, and not an open-ended chat product of any kind in the MVP. There is no chat interface in the MVP at all.
- Not a "get your ex back" guarantee machine. Some affiliate products in this niche are ex-back programmes (Section 13); the site may recommend them with honest framing, but its own voice never promises that a technique will make a specific person return.
- Not a community, forum, or social product in the MVP. Community is a moderation staffing line that scales with users; it is explicitly out of scope (Section 5.2).
- Not a subscription. Nothing on the site charges, renews, or trials in Phase 1.

### 2.1 The voice

Direct, male-literate, and free of both clinical coldness and pickup-artist sleaze. The reader is an adult in pain, not a patient and not a mark. Copy talks about behaviour ("you checked her profile four times today") more than feelings-labels ("you are anxiously attached"), because behaviour is what the flagship assessment measures and what the reader can change. The site never mocks the reader's ex, never encourages manipulation of her, and never treats "winning her back" and "getting over her" as the same goal — the tools help him decide which one he is actually pursuing, honestly.

### 2.2 Why this founder, stated once and then used as a build filter

The founder has lived the customer journey: he has bought the attachment books, worked through the major creators' catalogues (Thais Gibson's Personal Development School material; Chris Seiter's Ex Boyfriend Recovery material), and paid for an AI therapist product (Ash) that was not good enough to keep. That history is the affiliate list's starting point (Section 13.4), the content map's reading list (Section 12.4), and a standing quality bar: **if a tool on this site would have felt useless or exploitative to the founder in week two of his own breakup, it does not ship.** This is a copy-review and product-review filter, not a request for personal disclosure anywhere on the site.

### 2.3 Architected to expand beyond men

The beachhead is men; the architecture is not male-only.

- The question bank (Section 9.2) stores a `audience` field per question version. The MVP ships the `men-v1` set. A future `all-v1` or `women-v1` set is new content and config, not new code.
- No gendered term is hardcoded in a component. Partner references in questions, results, and tools resolve through a small copy dictionary in `config/copy.ts` (defaults at launch: partner pronouns she/her in question stems where a partner is referenced, because the beachhead reader's ex is usually a woman — implemented as data, changeable per question, never as string literals scattered through components).
- Result profiles (Section 9.4) are written gender-neutrally at the data layer; the men-specific framing lives in the page copy around them, which is content, not code.
- The tracker and decision tool contain no gendered logic at all. Their expansion cost later is copy review only.

### 2.4 How the product works — the full picture in plain English

This is the section to read if you want to know, without the build detail, what HeartFixed actually *does* for a person and for you. Everything after this section is the precise version of what is summarised here.

**For the visitor — one visit, step by step:**

1. **He arrives in a moment, not browsing.** He searches "attachment style quiz", "no contact rule", or something specific like "she texted me during no contact" — usually on his phone, often at night, in the first weeks after a breakup. A guide or tool page answers that exact moment and puts a tool in front of him, not just an article.
2. **He takes the flagship assessment (about 3 minutes).** 24 behaviour-framed questions — what he *does* when she doesn't reply, after an argument, when someone gets close — on a simple 0–4 scale. No account, no email asked up front. The engine (Section 9) scores two dimensions separately: attachment anxiety and attachment avoidance, each 0–100.
3. **He gets the full result, free.** Not a single label and not a teaser. He sees both scores, his profile — Secure, Anxious, Avoidant, or Fearful-Avoidant — what that pattern looks like after a breakup, his specific watch-outs and strengths, and what his likely no-contact risk is. Nothing is blurred or paywalled. That honesty is the product's main competitive advantage.
4. **He is offered two useful next steps, in the moment.** Start a no-contact streak, and/or have the full result emailed to him (with a 14-day action list for his profile). Emailing the result is a one-off send — it does *not* subscribe him. Joining the email list is a separate, clearly labelled choice.
5. **The tracker holds his streak.** He sets the date of last contact and a goal (30 days by default, 60/90 available). Each day is one tap: "Still no contact", plus an optional urge rating and a private note. Everything lives only in his browser — no account, nothing on a server. If he slips, the tool does not shame him: it preserves his longest streak, shows his total days, and restarts the counter today. A big "I'm about to break it" button is always there.
6. **The decision tool intervenes at the worst moment.** When he is about to text her, he works through five short steps: how long since the breakup/contact, what the message is really for, an honest state check (drinking? how intense, 0–10?), and optionally pasting his actual draft for local, rule-based checks (length, pressure phrases, 1am-send risk — the draft never leaves his browser). He gets one of three clear outcomes — *Don't send this*, *Wait 24 hours and re-run this*, or, for genuine logistics only, *Sending a short logistics version can be reasonable* — plus a 30-minute urge timer and a place to save the message unsent instead of sending it.
7. **Email keeps him going without an app.** If he joined the list, he gets a 5-email welcome sequence over 10 days: his starting point, the no-contact rules that hold, attachment after a breakup, the day it gets harder, and — only in email 5 — programmes and books that go deeper. If he opted into tracker reminders, he gets at most one functional reminder a day, and only on days he hasn't checked in. No character writes to him. No one pretends to miss him.

**How you make money — in order:**

- **Phase 1 (launch): affiliates.** The tools are free. Revenue comes downstream when a reader who trusts the tools buys a deeper programme or book through a clearly disclosed affiliate link: Thais Gibson's Personal Development School, Chris Seiter's programmes, ClickBank breakup programmes, and the books you actually read (*Attached*, *Anxiously Attached*). Slots are built into the result page, tracker page, decision-tool outcome, resources page, and welcome email 5 — all shipped switched off and turned on one by one in config once you are approved for each programme (Section 13.4). You never need to touch code to change a recommendation.
- **Phase 2 (later, gated — Section 15): your own product.** A finite recovery programme — 30, 60, or 90 days, chosen at purchase — sold for **one payment of $49–79 (recommended $59)**. No subscription. Inside it: a personalised plan assembled from his profile, one structured journaling exercise per day with bounded AI reflection (capped exchanges, no open chat, no persona), an extended version of the decision tool, and a weekly progress summary from his own check-ins. It ends. At the end he gets a graduation view, a full export of his data, and a prompt to delete his journal — the product succeeding means he leaves. Phase 2 does not start until the site has been live 60+ days, affiliates have produced real sales, and you have had a legal review (Section 15.1).

**What runs automatically vs. what is your job:**

| Runs itself once built | Your job |
|---|---|
| Quiz scoring and results, tracker streaks, decision-tool outcomes, urge timer — all in the visitor's browser | Month 1: review each Claude Code session's preview, approve the question bank, profile write-ups, and guides (Sections 12, 18) |
| Result emails, welcome sequence, tracker reminders — sent by the email provider from templates in this spec | After launch (~2–5 hrs/week): check analytics, publish one new situational guide at a time, check affiliate links, reply to contact email |
| Affiliate tracking — clicks and sales are tracked by each programme's network; payouts are their job | Turn affiliate slots on in config as approvals arrive; decide if/when Phase 2's gate is met |
| Hosting, HTTPS, and the fixedheart.com redirect — set once at launch | Supply the inputs only you can supply: contact email, mailing address for email footers, affiliate approvals (Section 19.2) |

**What you are *not* building:** no AI therapist, no AI companion or friend, no open-ended chat, no accounts in the MVP, no community or comments, no app, no subscription, and no paywalled quiz results. Those exclusions are deliberate — they are what keep this at a few hours a week to run, keep it on the right side of the companion-app laws detailed in Section 3.5, and keep the promise honest: HeartFixed sells relief and progress, not dependency.

---

## 3. The market and the evidence

Research basis: validation research carried out 29–30 October 2026 (Semrush US keyword and domain data for September 2026, incumbent pricing read from incumbents' own pages, affiliate terms from vendor affiliate pages, and current US/EU regulatory sources). Figures below are from that research. Where the research could not verify a figure, this spec says so and the build must not invent one. Re-check volumes before any post-launch content expansion, because search data ages.

### 3.1 Demand is real, large, and owned at the top

| Search term (US) | Volume / mo | CPC | Who ranks / notes |
|---|---:|---:|---|
| attachment styles | 135,000 | $0.24 | The Attachment Project ranks #1 |
| attachment style quiz | 49,500 | $0.72–0.76 | The Attachment Project ranks #1 in both the July and September 2026 cuts |
| attachment style | 27,100 | $0.23 | July 2026 cut; The Attachment Project #1 |
| dumped | 8,100 | $4.06 | Ex Boyfriend Recovery ranks #2 — high CPC signals commercial, ex-back intent |
| signs an avoidant loves you but is scared | 2,900 | $0.10 | Ex Boyfriend Recovery #2 — the situational long-tail pattern this site targets |
| ex boyfriend recovery (branded) | 170 | $6.43 | What an incumbent will pay for a buyer, not a traffic target |

Two readings of this table drive the whole build:

- **Attachment traffic is plentiful but weakly commercial directly.** CPCs of $0.24–0.76 say advertisers do not make money on the quiz click itself. The incumbents make it downstream — email list, courses, books — which is exactly the funnel in Section 2. A build that tries to monetize the quiz page itself (paywalled results, aggressive ads) is fighting the economics of the niche.
- **Ex-back intent is where advertisers bid.** A $4.06 CPC on "dumped" and $6.43 on a branded term mean the breakup-moment visitor is worth money to programme sellers. That is why the tracker and decision tool — the two tools that meet him inside the breakup, not just inside his curiosity about attachment — carry the affiliate and email strategy (Sections 11 and 13).

**Could not verify — do not quote or build targets on these:** the research found no clean, citable US volume or difficulty for "attachment style test", "attachment style test for men", "no contact rule", "breakup recovery", or "should I text my ex" as exact strings, and live Google/Bing SERP checks were blocked during the research window. The directional conclusion (a large attachment pool; commercial breakup intent; winnable situational long-tails) is supported. The per-string numbers are not. Session 12 (Section 18) includes a founder task to pull these five strings in a paid Semrush or Ahrefs session before month-two content is planned.

### 3.2 The zero-click reality — why this is a tool site, not a blog

- 68.01% of US Google searches ended without a click in January–April 2026 (SparkToro / Similarweb), up from 60.45% in 2024.
- When an AI Overview is present, the #1 organic result's click-through rate is roughly 58% lower (Ahrefs, February 2026 rerun of its 300,000-keyword study).

The implication is a format decision, and this spec treats it as settled: an article answering "what is the no contact rule" can be fully satisfied inside an AI Overview, and the site earns nothing. A quiz that scores *this visitor*, a tracker holding *his* streak, and a decision tool that ingests *his actual draft message* cannot be satisfied by a summary. Every page plan in Sections 6 and 12 therefore leads with an interactive tool or embeds one above the article content. Articles support tools; they do not substitute for them.

### 3.3 Who the incumbents are, and what each one proves

- **The Attachment Project** — roughly 1.02 million visits in September 2026, 51% US, 52% from Google organic, ranking #1 for both head attachment terms, with the quiz subdomain taking the majority of pageviews. Its quiz and report are free; monetization is downstream (books, courses, workshops). It proves the free, high-quality quiz funnel works at scale. Its revenue is not public and must not be quoted. Its weakness, for this build's purposes: it is written for a general, largely female-skewing audience and frames questions around feelings.
- **Personal Development School (Thais Gibson)** — 287,000 visits in September 2026, but 65.57% direct traffic and only about 7–9% from Google. This is a YouTube-and-email business that uses a free attachment quiz as a lead magnet; it is not an SEO model a faceless solo founder can copy. Pricing verified from its own pages: All-Access Pass $67/month ($49 promo; $299/year on one offer page), 70+ courses, and the REWIRED bootcamp at $297 on-demand / $397 live early-bird ($699/$799 standard). A $2–5M/year revenue estimate exists in a single low-authority newsletter — **unverified; never quote it on the site or in planning math.**
- **Ex Boyfriend Recovery (Chris Seiter)** — 113,510 visits in September 2026, Authority Score 35, 68.62% Google organic, and declining (201,940 visits in June 2026). It proves a mid-authority, male-focused content site in this niche is a 100,000–200,000 visit/month asset, not a million-visit one — and that even incumbents are losing search traffic in 2026. Pricing verified from its own pages: Ex Recovery Program $47 one-time; Reconnection Room $97 one-time.
- **MalePsychology** — a new men-specific entrant whose "Attachment Style Quiz for Men" (16 real situations; behaviour-framed — "asks what you *do*") was live by October 2026. This validates the flagship gap and warns that it is already being filled. Speed and depth are the remaining edge, not the idea.
- **Institutional publishers** — Psychology Today, Verywell Mind, Simply Psychology, and Cleveland Clinic recur on informational attachment queries. A new, uncredentialled site will not outrank them with generic "what is anxious attachment" explainers, and Section 12 does not try.
- **After Us (middle-path proof)** — a no-contact tracker app with mood logging, guided journaling, and AI chat, launched August 2025, reached roughly 40,000 installs and a 4.8-star rating from 4,548 ratings in about 14 months. It proves the tracker-plus-support bundle has real demand. The web version of that bundle, with no app-store gate, is one of this build's open slots (Section 11.1).

### 3.4 The affiliate economics that fund Phase 1

Verified from vendor affiliate pages in the October 2026 research; all figures are vendor-claimed and are stored in config at activation time, never in this spec's code paths:

- **The Ex Factor Guide (ClickBank, LoveLearnings):** 75% front-end commission, vendor-claimed average affiliate payout of $58.69 per sale.
- **Beat The Breakup (ClickBank, LoveLearnings):** vendor-claimed payout of $44.20+ and $1.04 EPC.
- **Text Your Ex Back:** 75% commission; a vendor claim of "up to $5 a click" is a marketing ceiling, not an expectation, and must never appear in planning or on the site.
- **His Secret Obsession:** 90% front and back per a 2026 marketplace listing — a relationship product aimed at women; relevant to the later expansion, not to the men's beachhead launch.
- **Books:** *Attached* and *Anxiously Attached* are the audience's canon and the founder's own reading. Book affiliate revenue per sale is small; their role is trust, email content, and reading-list authority, not income.

The research's worked illustration — explicitly not a forecast — is that a site reaching 10,000 visits/month, converting quiz-takers to email at a healthy rate and a small percentage of buyer-ready breakup traffic to a $47–79 programme at a roughly $45–59 affiliate payout, lands in the low hundreds to roughly $2–3K/month after a 9–18 month SEO ramp. The incumbents' larger money comes from live coaching and live delivery, which this founder will not do. Plan month one against Section 19.4 (a live site, a growing list, first affiliate clicks), not against revenue.

### 3.5 Why there is no companion or AI therapist in this plan — the short version the build must respect

The validation compared this concept against an AI companion product and a finite middle path. The companion was rejected on economics, law, and operations, not taste: Character.AI, with roughly 12 million monthly users at about 120 minutes/day, filed Chapter 11 on 12 October 2026 losing $8–9 million/month, with compute of $56.1M across January–August 2026 against monthly revenue that never exceeded $5.3M. California SB 243 (in force 1 January 2026) carries a private right of action at $1,000 per violation; New York's companion law (in force 5 November 2025) carries penalties up to $15,000/day; further state laws and California's Adam's Law duties arrive through 2027. Running a companion properly was estimated at 15–40+ hours/week plus on-call crisis responsibility. Those facts are background, not build scope — but they are why Sections 5.2 and 14.1 are written as prohibitions with acceptance tests, and why the Phase 2 programme in Section 15 is bounded, finite, and persona-free by design.

---

## 4. How this site is better — concrete advantages

Every advantage below maps to a named gap in Section 3. Each one is a build requirement, not marketing copy. If a later session proposes cutting one, it needs a founder decision, not a silent omission.

| # | Advantage | Gap it answers | Where it is specified |
|---|---|---|---|
| 1 | Behaviour-framed assessment for men — questions ask what he does, not how he feels | Incumbent quizzes are general-audience and feelings-framed; the one men-specific entrant is new and shallow | Sections 9–10 |
| 2 | Full results, free, always — no paywall, no email wall, no blurred report | Quiz-farm competitors gate or blur results; incumbents prove free reports build the list better | Sections 9.5, 14.1 |
| 3 | A dimensional result, not a single label — anxiety and avoidance scores with a plain-English profile | Single-label quizzes mislead the large group who score high on both; dimensional scoring is the credible model | Section 9.4 |
| 4 | A web no-contact tracker with no app-store gate and no account | Tracker products live in app stores; content incumbents write *about* no contact but offer no tracker | Section 11.1 |
| 5 | A decision tool that works on his actual draft message | No incumbent tool ingests the draft text he is about to send; articles cannot intervene in the moment | Section 11.2 |
| 6 | Situational pages for moments, not concepts — day counts, birthdays, "she texted first" | Incumbent rankings show situational long-tails outperform head terms for smaller sites | Section 12.3 |
| 7 | Recommendations from a reader, not a marketer — the books and programmes the founder actually used, honestly labelled | Affiliate content in this niche is dominated by commission-first listicles | Sections 12.4, 13.4 |
| 8 | Privacy as a feature — tracker and journal-adjacent data stay in his browser by default | Comparable apps headline local-only storage because users fear this data leaking | Sections 11.1, 14.4 |

---

## 5. Scope — what the one-month MVP is, and is not

### 5.1 In scope for launch (all of this ships within the 4 weeks)

- The attachment-style assessment for men (Section 10): 24 scored questions, dimensional scoring, full free results, shareable result link, and an email-capture flow offering the extended result by email.
- The no-contact tracker (Section 11.1): streak counter, daily check-in, slip/reset handling, localStorage-first with no account, and an optional email reminder opt-in.
- The "should I text my ex?" decision tool (Section 11.2): structured decision flow plus an optional paste-a-draft step, ending in a clear recommendation and a 30-minute urge-interrupt timer.
- The breakup-recovery content hub (Section 12): homepage hub, the launch guides listed in Section 12.3, four attachment-profile pages, and the situational long-tail template proven on two launch pages.
- Email list infrastructure (Section 13): quiz-result email, tracker reminder opt-in, footer signup, and a 5-email welcome sequence (copy supplied as content files; sending configured in the provider).
- Affiliate slot infrastructure (Section 13.4): config-driven slots on the specified pages, all shipping disabled, enabled per programme only after the founder is approved and has pasted the approved link and copy into config.
- Trust and compliance pages (Section 14): Privacy, Terms, Affiliate Disclosure, About, Crisis Resources, and the verbatim disclaimer blocks wired into every tool page.
- SEO infrastructure (Section 12.2), analytics with the no-sensitive-content rule (Section 16.1), and the accessibility and performance gates (Section 16).

### 5.2 Explicitly out of scope for the MVP

- **No paid product, checkout, or payment processing.** Phase 2 is specified in Section 15 only.
- **No AI features at all in the MVP.** No chat, no AI journaling, no generated advice, no "AI coach." The decision tool is deterministic logic (Section 11.2), and its copy must never imply otherwise. AI arrives only in Phase 2, in the bounded form Section 15 specifies, with the crisis protocol built first.
- **No AI therapist, AI companion, AI friend, or persona of any kind — in the MVP or at any later phase.** No named character, no romantic or friendship framing, no proactive "I missed you / checking on you" emotional messaging, no memory-based relationship marketing. Email reminders from the tracker are functional (Section 11.1), user-opted-in, and written as product notifications, never as a person missing him.
- **No accounts or login system.** The tracker is local-first precisely so no account is needed. Email subscribers are list records in the email provider, not site accounts.
- **No community, comments, forum, or user-generated public content.** Nothing on the MVP accepts text from one visitor and shows it to another.
- **No native app or PWA install prompt.** The site is a responsive web product. An app decision, if ever, is post-MVP and separate.
- **No subscription, trial, or membership language anywhere**, including placeholder copy for Phase 2.
- **No founder media.** No video embeds of the founder, no podcast feed, no personal social profiles in schema or footer at launch (Section 12.5).
- **No diagnosis, screening, or mental-health assessment framing** for the quiz or any future tool, in copy, metadata, or schema (Section 14.2).

### 5.3 Post-MVP backlog (do not build in month one)

In rough priority order, for month two onward: the five-string keyword pull and a situational-page expansion batch (Section 12.3); additional assessments (a breakup-readiness / "should you try to get her back, or move on?" decision assessment built on the same engine; an avoidant-pattern deep-dive quiz reusing Section 9); an expanded unsent-letter writing space (local-only, growing the decision tool's unsent vault); email sequence expansion beyond the welcome five; the audience-expansion question set (Section 2.3); and Phase 2 (Section 15), which has its own gate criteria and is not started until they are met.

---

## 6. Information architecture and URL map

All routes are statically generated except the email API route. Slugs are final at Session 1 — changing a slug after launch requires a redirect entry in `config/redirects.ts`, never a silent rename.

| Route | Page | Primary intent it serves |
|---|---|---|
| `/` | Homepage / hub | Brand + all three tools; "attachment style quiz" cluster support |
| `/attachment-style-quiz/` | Flagship assessment | attachment style quiz (49,500/mo cluster) |
| `/attachment-style-quiz/results/` | Result shell (client-rendered from state/share token) | Branded / shared traffic; `noindex` |
| `/attachment-styles/` | Explainer hub linking all four profiles + quiz | attachment styles (135,000/mo) — hub, no day-one ranking expectation |
| `/attachment-styles/secure/` | Profile page: secure | Style-specific variants |
| `/attachment-styles/anxious/` | Profile page: anxious (preoccupied) | Style-specific variants |
| `/attachment-styles/avoidant/` | Profile page: avoidant (dismissive) | Style-specific variants |
| `/attachment-styles/fearful-avoidant/` | Profile page: fearful-avoidant (disorganized) | Style-specific variants |
| `/no-contact-tracker/` | Tracker tool + supporting content | No-contact intent; lead magnet |
| `/should-i-text-my-ex/` | Decision tool + supporting content | Breakup-moment intent |
| `/no-contact-rule/` | Guide: the rule, the exceptions, day-by-day | Situational cluster head |
| `/guides/how-long-does-a-breakup-take/` | Guide | Situational long-tail |
| `/guides/no-contact-day-14/` | Guide (situational template instance 1) | Situational long-tail |
| `/guides/she-texted-me-during-no-contact/` | Guide (situational template instance 2) | Situational long-tail |
| `/guides/attachment-styles-after-a-breakup/` | Guide | Founder-canon explainer |
| `/recommended-resources/` | Books + programmes page (affiliate slots) | Buyer-ready intent; affiliate review target |
| `/crisis-resources/` | Crisis resources page | Trust / safety; linked sitewide |
| `/about/` | About | Affiliate-reviewer and trust target |
| `/methodology/` | How the assessment works + scoring basis | Trust; YMYL support |
| `/privacy-policy/` | Privacy Policy | Legal |
| `/terms/` | Terms of Use | Legal |
| `/affiliate-disclosure/` | Affiliate Disclosure | Legal |
| `/contact/` | Contact | Trust |

Internal linking rules:

- Every guide ends with a tool block linking the most relevant tool (quiz, tracker, or decision tool) and one sibling guide. No orphan pages: every route above is reachable from the homepage, a hub, or the footer within two clicks.
- Every profile page links the quiz ("check your own scores"), the methodology page, and the other three profiles.
- The tracker and decision tool pages cross-link each other in both directions with moment-appropriate copy ("If the urge is right now, use this first").
- Breadcrumbs render on all non-home pages with matching `BreadcrumbList` schema (Section 12.2).
- The footer on every page carries: the three tools, Crisis Resources, About, Methodology, Privacy, Terms, Affiliate Disclosure, Contact, and the short crisis line specified in Section 14.3.

---

## 7. Tech stack and repository structure

### 7.1 Recommended stack (use this unless a session proves it cannot work)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router), TypeScript, static generation (SSG) for all public pages | Best SEO control, fast static pages, first-class metadata and sitemap support, and the stack Claude Code generates most reliably |
| Styling | Tailwind CSS with a small custom design-token layer (Section 8) | Fast to build, no runtime CSS-in-JS cost, consistent components |
| Forms / validation | Native controlled inputs + Zod schemas shared between UI and engine tests | One validation source of truth |
| Quiz / tracker state | Client-side React state + versioned `localStorage` (Sections 9.6, 11.1) | No database, no accounts, privacy by architecture |
| Email provider | Resend (default) behind a `lib/email/` interface | Transactional result emails and list management in one provider at this scale; code must not depend on its SDK inside components |
| Hosting | Vercel (default) | Preview deploys per branch, custom domain + HTTPS, generous free tier at MVP traffic |
| Analytics | Google Analytics 4 + Google Search Console | Section 16.1 event spec is vendor-neutral; a privacy-friendly analytics tool may be added later behind the same interface |
| Testing | Vitest (unit, quiz engine) + Playwright (smoke / end-to-end for the three tools) | Scoring correctness is the product's credibility |
| Lint / format | ESLint + Prettier, `tsc --noEmit` in CI | Keep generated code reviewable |

Hard rules: no database in the MVP. No server storage of quiz answers, tracker entries, check-in notes, or draft messages — the only server calls are the email-capture endpoint and analytics, and neither receives that content (Sections 13, 16.1). Pages must be statically generated; tool interactivity is client hydration on an otherwise complete, crawlable page (supporting content, FAQ, and methodology summaries must be in the server-rendered HTML, not injected after interaction).

### 7.2 Repository and folder structure

```text
heartfixed/
  app/
    layout.tsx                  # global layout, header, footer, metadata defaults
    page.tsx                    # / hub
    attachment-style-quiz/page.tsx
    attachment-style-quiz/results/page.tsx
    attachment-styles/page.tsx  # explainer hub
    attachment-styles/[profile]/page.tsx
    no-contact-tracker/page.tsx
    should-i-text-my-ex/page.tsx
    no-contact-rule/page.tsx
    guides/[slug]/page.tsx      # guides, content in content/guides/
    recommended-resources/page.tsx
    crisis-resources/page.tsx
    about/page.tsx
    methodology/page.tsx
    contact/page.tsx
    privacy-policy/page.tsx
    terms/page.tsx
    affiliate-disclosure/page.tsx
    sitemap.ts                  # generated sitemap.xml
    robots.ts
    api/email/route.ts          # POST: validate, send result email and/or subscribe
  components/
    layout/  (Header, Footer, Breadcrumbs, CrisisFooterLine)
    quiz/    (QuizRunner, QuestionCard, ProgressBar, ResultProfile,
              DimensionBars, ShareResultButton, EmailResultForm)
    tools/   (Tracker, StreakCalendar, CheckInForm, DecisionTool,
              DraftCheck, UrgeTimer, UnsentVaultLink)
    content/ (Faq, ToolBlock, DisclosureBanner, AffiliateSlot, GuideCard,
              ProfileCard)
    ui/      (Button, Input, RadioCard, Slider, Card, Callout)
  lib/
    quiz/    (types.ts, questions.ts, scoring.ts, profiles.ts,
              share.ts, index.ts)
    quiz/__tests__/ (scoring.test.ts, fixtures.ts)
    tools/   (tracker.ts, decision.ts)
    tools/__tests__/ (tracker.test.ts, decision.test.ts)
    email/   (provider.ts, resultEmail.ts, validate.ts)
    seo/     (metadata.ts, schema.ts)
    analytics.ts
    storage.ts                  # versioned localStorage helpers
  config/
    site.ts                     # HeartFixed, heartfixed.com, contact email placeholder
    copy.ts                     # gendered-term / partner-reference dictionary (Section 2.3)
    affiliates.ts               # slots only — ids, page, position, enabled flag
    quiz.ts                     # question-set version, limits, result thresholds pointer
    content.ts                  # guide metadata, situational template data
  content/
    guides/                     # MDX or Markdown source for launch guides
    emails/                     # welcome sequence + result email source copy
    faqs.ts                     # FAQ copy per tool page
    legal/                      # privacy, terms, disclosure source copy
  public/ (favicon set, og-image.png, manifest)
  tests/e2e/                    # Playwright smoke tests
  .env.example                  # every variable in Section 17.2, no real values
  README.md                     # setup, scripts, deploy steps (written in Session 1)
```

`heartfixed` above is only the local repository folder name (lowercase, no dots); it is not a site token and never renders. Naming: routes use the exact slugs in Section 6. Components are PascalCase, library files camelCase, and config values are the only place URLs, emails, program names, and provider keys are referenced.

---

## 8. Design and UX requirements

### 8.1 Principles

- Mobile-first. Most search traffic in this niche is mobile, and the decision tool's peak use is a phone in a hand at night. Design at 360px wide first; desktop is the enhancement. Every tool, its first result, and its primary call to action must be usable without horizontal scrolling at 320px.
- Speed is a feature. No hero video, no stock-photo hero, no carousel, no third-party chat widget, no cookie-consent library that blocks rendering. See performance budgets in Section 16.3.
- Calm under distress. The reader is often at his lowest point of the week when he uses these tools. No red-alert styling, no countdown-pressure tactics, no shaming copy ("don't be weak"), no hype. Urgency, where it exists, is his, not manufactured by the design.
- Show, don't gate. Full quiz results, the full tracker, and the full decision flow are usable with no email, no account, and no click on an affiliate offer. Email is offered as a convenience and a continuation, never as a toll.
- Faceless by design. No author photo, avatar, or signature appears in any template. Trust is carried by methodology transparency, honest disclosures, and tool quality. A `FounderNote` content component is defined (Section 12.5) but ships unused; adding founder-led content later must not require template changes.

### 8.2 Design tokens (defaults — implement as Tailwind theme values)

- Colors: primary deep slate blue `#1F3A4D`; accent warm amber `#D98E32` for calls to action only; ink `#1A2027`; muted text `#5B6770`; background `#FFFFFF`; soft panel `#F3F6F8`; success green `#1E7A34`; warning amber background `#FFF4E0`; crisis-resource panel background `#EEF4FB` with a left border in primary (distinct, calm, never red). Contrast: all body text at least 4.5:1, large text and UI controls at least 3:1 (WCAG AA).
- Type: system font stack or one self-hosted variable font (Inter or Source Sans). No Google Fonts network request if it costs the performance budget. Scale: H1 32/40 mobile, 44/52 desktop; body 17/27; small print minimum 13px — disclaimers and disclosures must be readable, not hidden in 10px grey text.
- Radius and elevation: 12px card radius, one soft shadow level. No glassmorphism, no gradients on results.
- Dimension bars (quiz results): anxiety series in amber, avoidance series in slate blue, each directly labelled with its name and band in text. Never rely on color alone.
- Streak display (tracker): a numeric day count as the hero element, with a calendar strip showing checked days as filled cells labelled by date for screen readers. No flame icons, no loss-streak shaming animation on reset.

### 8.3 Interaction rules for every tool

- One question / one step per screen in the quiz and decision tool, with a visible progress indicator ("Question 7 of 24", "Step 2 of 5") and a working back action that preserves answers.
- No submit-button dead ends: advancing is the primary action; results render immediately on completion with no page reload.
- State persists in `localStorage` under versioned keys (Section 9.6), restores on return visits, and every tool exposes a visible "Start over" and "Clear my data on this device" control. Clearing must actually delete the stored state, not merely hide it.
- Errors are inline, specific, and in plain English ("Choose an answer to continue"), announced to screen readers with `aria-live`, and never shown as a generic toast.
- Keyboard: full operation without a mouse; visible focus rings; logical tab order. Touch targets at least 44×44px. Radio-card answers in the quiz are real radio inputs under the styling.
- Print: the quiz result and the tracker summary each have a print stylesheet producing the profile/streak summary plus the Section 14 disclaimer. "Print / Save PDF" is a browser print action — no PDF library in the MVP.
- Reduced motion: respect `prefers-reduced-motion`; progress and timer animations off by default when it is set. The urge timer (Section 11.2) must remain fully functional as a numeric countdown with motion disabled.

### 8.4 Accessibility checklist (acceptance, not aspiration)

Semantic landmarks (`header`, `main`, `footer`, one `h1` per page), labels on every input (`label` element, not placeholder-only), `aria-describedby` linking inputs to help and error text, dimension bars accompanied by a data table or text equivalent, skip-to-content link, focus management that moves focus to the result heading when results render, and a Playwright + axe pass with zero critical violations on all three tool pages before launch.

---

## 9. Quiz engine — shared requirements

All assessments on the site — the flagship at launch, and every future assessment in Section 5.3 — run on the single engine in `lib/quiz/`. This section is normative: the question model, scoring, and result computation are decided here so Claude Code does not improvise them per assessment.

### 9.1 Data model

```ts
type Dimension = "anxiety" | "avoidance";

interface QuizQuestion {
  id: string;                 // stable, e.g. "q07" — never reused for different text
  version: string;            // question-set version, e.g. "men-v1"
  audience: string;           // "men" at launch; see Section 2.3
  stem: string;               // the situation, behaviour-framed
  dimension: Dimension;       // which dimension a high answer loads on
  reversed: boolean;          // true when agreement indicates LOW loading
  weight: number;             // default 1; allowed 0.5–1.5, set only in data review
}

interface QuizAnswer { questionId: string; value: number }  // value: 0–4 Likert

interface QuizResult {
  version: string;
  anxietyRaw: number;  avoidanceRaw: number;      // summed weighted scores
  anxietyNorm: number; avoidanceNorm: number;     // 0–100 normalized (Section 9.3)
  anxietyBand: Band;   avoidanceBand: Band;       // "low" | "moderate" | "high"
  profileId: ProfileId;                           // Section 9.4
  completedAt: string;                            // ISO date, client-side only
}
type Band = "low" | "moderate" | "high";
type ProfileId = "secure" | "anxious" | "avoidant" | "fearful-avoidant";
```

Questions and profiles are data files (`lib/quiz/questions.ts`, `lib/quiz/profiles.ts`), never literals inside components. Changing a question's text without changing its `id` is prohibited after launch; a substantively new question gets a new `id`, and the question-set `version` increments whenever any scored item changes, so stored results and share tokens from older versions can be detected and handled (Section 9.6).

### 9.2 The question model

- **Count and balance:** 24 scored questions at launch — 12 loading on anxiety, 12 on avoidance — plus 2 unscored context questions (time since the breakup; whether he is currently in no contact) used only to select result-page supporting copy, never to alter scores. Context answers are labelled on screen as "these don't change your scores — they help us show you the right next step."
- **Format:** a 5-point Likert scale for every scored question: "Never like me" (0), "Rarely" (1), "Sometimes" (2), "Often" (3), "Almost always like me" (4). One scale, everywhere; no per-question scale variation.
- **Framing rule (the flagship's differentiator):** every stem describes an observable behaviour in a concrete situation, in the recent past — what he *did* in his last relationship or is doing now — not a feeling identity. Approved pattern: "In the first days after an argument, I checked my phone for her reply more times than I can count." Prohibited pattern: "I am an anxious person who needs reassurance." At least 8 of the 12 anxiety items and 8 of the 12 avoidance items must reference a specific trigger situation (an unanswered message, an argument, a partner asking for closeness, a partner asking for space, a breakup or the threat of one).
- **Reversed items:** exactly 4 of the 24 (2 per dimension) are reversed, to catch straight-line answering. Reversal is a data flag (Section 9.1), handled only inside `scoring.ts`.
- **Reading level and length:** stems at or below a grade-8 reading level, maximum 28 words. No clinical terms ("hyperactivation", "deactivation", "protest behaviour") appear in stems; plain terms are defined on the result page instead.
- **Source discipline:** questions are original items written for this product, informed by the dimensions that established attachment measures use (anxiety about abandonment; avoidance of closeness). Do not copy items from any published scale (including the ECR or ECR-R) or from any incumbent quiz. The methodology page (Section 12) states this plainly: an original self-reflection assessment informed by attachment research, not a clinical instrument.
- **Attention check:** one unscored instructional item at position 13 ("To show you're reading, choose 'Rarely' for this one"). Failing it does not block results; it sets an `attentionFlag` on the result used only to exclude the completion from any future aggregate analysis. It is never mentioned to the visitor.

### 9.3 Scoring computation

Scoring is a pure function `scoreQuiz(answers, questions): QuizResult` in `lib/quiz/scoring.ts`, with no I/O and no randomness.

1. Validate: every scored question has exactly one answer with a value in 0–4. Missing answers are a UI bug, not a scoring case — the runner (Section 10.2) prevents completion with unanswered items, and `scoreQuiz` throws on incomplete input rather than imputing.
2. For each question, the effective value is `reversed ? 4 - value : value`, multiplied by the question's `weight`.
3. Sum effective values per dimension: `anxietyRaw`, `avoidanceRaw`. With the launch set (12 items × max 4 × weight 1), each raw range is 0–48.
4. Normalize each dimension to 0–100: `norm = round(raw / maxRawForDimension × 100)`, where `maxRawForDimension` is computed from the question data (sum of `4 × weight`), never hardcoded — so a future weighted set scores correctly without code changes.
5. Band each dimension: `low` 0–33, `moderate` 34–66, `high` 67–100. Band edges live in `config/quiz.ts`, so a threshold change is a config change with a test update, not a code hunt.
6. Compute the profile from the two bands (Section 9.4). Return the full `QuizResult`.

Rounding: normalized scores are integers (round half up). Raw sums may be fractional only when weights are fractional; display never shows raw sums or decimals.

### 9.4 Result profiles

The profile is a function of both bands — this is what makes the result dimensional rather than a single forced label:

| Anxiety band | Avoidance band | Profile |
|---|---|---|
| low or moderate | low or moderate, with neither high | `secure` — unless one dimension is moderate and the other low, still `secure` with a named lean (see below) |
| high | low or moderate | `anxious` |
| low or moderate | high | `avoidant` |
| high | high | `fearful-avoidant` |

Nuance rule: when the profile is `secure` but one dimension is `moderate`, the result page names the lean in its first paragraph ("broadly secure, with an anxious lean — under breakup stress, the pattern below is the one to watch"). When both dimensions are `moderate`, the profile is `secure` with a "mixed lean" paragraph covering both watch-outs. Profile data in `profiles.ts` therefore carries, per profile: a headline, a 120–180 word plain-English description, a "how this tends to show up after a breakup" section, a "your likely no-contact risk" paragraph (feeds the tracker cross-promotion), three concrete watch-outs, three concrete strengths, and two next-step links chosen from the site's tools and guides. The anxious profile's risk paragraph names message-checking and reconciliation fantasies; the avoidant profile's names delayed grief and rebound dating; the fearful-avoidant profile's names oscillation between the two. Copy is founder-reviewed (Session 4), written to Section 2.1's voice, and passes Section 14.2's language rules.

### 9.5 Result computation integrity

- The same answers always produce the same result: no time-of-day, referrer, or A/B variation in scoring, ever. Presentation experiments may vary layout, never thresholds or profile assignment.
- Results are computed entirely client-side. Nothing about an individual's answers or scores is sent to a server by the act of taking the quiz. (Emailing the result is a separate, explicit visitor action — Section 13.1.)
- The result page states its limits in the Section 14.3 Block A disclaimer, directly under the profile headline — not at the foot of the page.

### 9.6 Shareable results and local save

- **Share token:** the two normalized scores and the question-set version encode into a compact, URL-safe token (for example `v=men-v1&a=72&v2=18` parameters on `/attachment-style-quiz/results/`). The token contains scores only — never answers, never context responses, never any identifier. Opening a shared link renders the matching profile page view with a banner: "This is a shared result. Take the assessment to get your own." Shared-result pages are `noindex` and carry no email form pre-filled with anything.
- **Local save:** the full `QuizResult` plus the visitor's answers save to `localStorage` under `heartfixed-quiz-v1` on completion, so a return visit to the quiz page offers "See your result" instead of forcing a retake. A version mismatch (stored version ≠ current question-set version) triggers a polite notice that the assessment has been updated and the old result may not be comparable, with retake and keep-old-result options. "Clear my data" (Section 8.3) deletes this key.
- **Retakes** overwrite the saved result after an explicit confirmation ("Taking it again will replace your saved result"). Completion count is not tracked server-side.

---

## 10. Flagship tool — the attachment-style assessment for men

Route: `/attachment-style-quiz/`. This page carries the site's largest verified demand cluster (Section 3.1) and is the primary email-list engine. Build it to be the best free assessment experience in this niche for a male reader: fast, behaviour-framed, dimensional, and honest about what it is.

### 10.1 The pre-quiz page (server-rendered)

Above the fold: H1 ("Attachment Style Quiz for Men"), a two-sentence promise (what he will learn; roughly 3 minutes; 24 questions), the Section 14.3 Block A disclaimer in readable type, and the start button. Below the fold, all server-rendered for crawlability: what the four profiles are (summary cards linking the four profile pages), how the assessment works (three short paragraphs mirroring the methodology page), who it is for and not for (men after a breakup or in a relationship pattern they want to understand; not a diagnosis and not for crisis — with the crisis line from Section 14.3), an FAQ block (Section 12.2 schema), and one affiliate-free trust block. No email field appears before the quiz. No slot renders above the start button.

### 10.2 The runner

`QuizRunner` implements Section 8.3's rules with the Section 9 question set: one question per screen, Likert radio-cards, progress bar with "Question N of 24" text, back navigation preserving answers, and context questions asked last (after Q24) and visually distinguished as optional context. The runner is fully keyboard-operable, restores an in-progress attempt from `localStorage` on return ("Continue where you left off — question 9 of 24", with a restart option), and discards an in-progress attempt older than 7 days. On final answer, it computes the result via `scoreQuiz`, saves it (Section 9.6), and routes to the result view without a reload.

### 10.3 The result experience (the hero moment)

The result view is a page, not a popup, in this order:

1. **Profile headline and scores.** "Your pattern: Anxious (preoccupied)" with both dimension bars (Section 8.2) and numeric scores ("Attachment anxiety 72/100 — high; Attachment avoidance 18/100 — low").
2. **The disclaimer line** (Section 14.3, Block A), directly under the headline.
3. **What this means** — the profile description (Section 9.4), including the lean paragraph where applicable.
4. **How this tends to show up after a breakup** — profile-specific, concrete, behaviour-level.
5. **Your no-contact risk + the tracker offer.** The profile's risk paragraph, then the tracker block: "Your risk window is the urge, not the decision. Start your no-contact streak now — it takes ten seconds and lives only in this browser." One click creates the streak with today's date (Section 11.1) without leaving a half-state if he declines.
6. **Watch-outs and strengths** (three each, from profile data).
7. **Email the full result** — the Section 13.1 capture form, offering the extended result (profile description, both scores, a "your first 14 days" action list matched to the profile, and the reading list) as an emailed copy. The on-page result is already complete without it; the email adds the action list and a printable copy, and the copy says exactly that.
8. **Share your result** — copies the Section 9.6 share link. The share text contains the profile name and the site name only.
9. **Go deeper** — exactly two curated next steps per profile (a guide and, where a config-enabled affiliate slot exists for this profile, one recommendation rendered under Section 13.4's rules). This is the only affiliate position on the result view, and it never appears above item 7.
10. **Crisis footer line** — the standard Section 14.3 Block C, as on every page.

Test for tone in Session 4 review: a man reading his result at his worst moment should feel recognised and steadied, not labelled, sold to, or scared. Any result copy that reads as a horoscope (vague enough to fit anyone) or as a verdict ("you are the problem in your relationships") fails review and is rewritten for behavioural specificity.

### 10.4 Worked example (pre-launch test persona)

The engine fixtures in Section 16.2 include a fully specified 24-answer persona ("Persona A") whose expected output — anxiety 72/100 high, avoidance 18/100 low, profile `anxious` — Claude Code must reproduce exactly from the launch question data before the page is considered wired. If the assembled question bank cannot produce Persona A's expected result from its specified answer pattern, the bank or the weights are wrong, not the fixture; stop and flag it.

---

## 11. The other tools

### 11.1 No-contact tracker — `/no-contact-tracker/`

The lead magnet for breakup-moment intent, and the web answer to the app-store trackers the research validated (Section 3.3, After Us). Its promise, in the hero: "Count the days. Protect the streak. No account, nothing leaves this browser unless you ask for reminders."

Data model (client-side, `lib/tools/tracker.ts`):

```ts
interface TrackerState {
  version: 1;
  startDate: string;            // ISO date of day 1 (local)
  goalDays: 30 | 60 | 90;       // chosen at setup; 30 default
  checkIns: { date: string; urgeLevel: 0|1|2|3; note?: string }[];
  slips: { date: string; restartedOn: string }[];
  longestStreak: number;
  reminderOptIn: boolean;       // mirrors email provider state; set only via Section 13 flow
}
```

Behaviour requirements:

- **Setup in under ten seconds:** one screen — the date he last had contact (default today), a goal choice (30/60/90 days, default 30, with one line on why 30 is the standard starting goal), done. No name, no ex's name (the site never asks for her name anywhere — a deliberate privacy and tone rule), no account.
- **Streak math:** current streak = whole days from `startDate` (or the latest slip's `restartedOn`) to today, local time. Day 1 is the first full day. The tracker displays "Day N of [goal]" and, past the goal, "Day N — past your 30-day goal" with an option to extend to 60 or 90 that preserves history.
- **Daily check-in:** one tap per day ("Still no contact"), an optional urge rating (None / Mild / Strong / I nearly slipped), and an optional private note field (maximum 500 characters; stored locally only; the UI states "Notes stay in this browser and are never sent anywhere"). Checking in on a missed day back-fills honestly: the calendar shows the gap, the streak counts continuous days only.
- **Slip handling — the moment this tool is judged by:** a visible "I broke no contact" action that asks one question (what happened — called / texted / saw her / she reached out and I replied / other), records the slip, and responds with a non-shaming reset screen: the previous streak is preserved as `longestStreak`, total no-contact days are shown alongside the new streak ("You did 17 days. That progress is real, and the counter restarting doesn't erase it"), and the new streak starts today. Copy must never use the words "failed", "relapse", "clean", or "streak lost". If the slip type is "she reached out and I replied", the screen links the `/guides/she-texted-me-during-no-contact/` guide.
- **Urge shortcut:** a persistent "I'm about to break it" button on the tracker view routes to the decision tool (Section 11.2) with context set to `from=tracker`. This cross-link is a product requirement, not a design suggestion.
- **Storage:** `localStorage` key `heartfixed-tracker-v1` via `lib/storage.ts`. Export (download a JSON/CSV of his own data) and Clear-my-data controls live in a "Your data" panel on the tracker page. Nothing syncs; the page states plainly that clearing browser data erases the tracker, and offers the email-reminder opt-in (Section 13) as the only continuity mechanism, without overselling it.
- **Page content (server-rendered):** below the tool, the no-contact explainer summary, goal guidance (30 vs 60 vs 90), what counts as contact (a defined list: calls, texts, DMs, social-media interaction including story views by configurable strictness note, in-person meetups, asking friends about her — with "checking her profiles" addressed as a soft-contact most men count when honest), FAQ with schema, and the link block to `/no-contact-rule/`.

### 11.2 "Should I text my ex?" decision tool — `/should-i-text-my-ex/`

A deterministic, structured decision flow — no AI, no chat interface, and copy that never claims otherwise. It exists for the single highest-intent moment in the niche: he has a draft and a thumb hovering over send.

Flow (five steps, one per screen, back always available):

1. **How long since the breakup, and how long since last contact?** (bands, not dates). Contact within the last 7 days, or a breakup under 14 days old, weights strongly toward waiting.
2. **What is the message actually for?** — logistics (belongings, money, housing, a shared obligation) / apology or closure / I miss her / I want her back / she did something that upset me / no reason, I just want contact. Logistics is the only category that can end in a "sending may be reasonable" outcome, and only via step 4's checks.
3. **State check:** three honest self-ratings — alcohol tonight (yes/no), emotional intensity right now (0–10 slider), and "have you already drafted and deleted this more than once?" (yes/no). Alcohol = yes, or intensity ≥ 8, forces the waiting outcome regardless of other answers, with copy that names the rule ("Nothing good gets sent drunk or at a 9. It can be true at 10am; it can't be sent at 1am like this.").
4. **The draft check (optional but promoted):** he may paste the draft. The tool runs only local, rule-based checks and shows them as observations, never as AI judgement: length over ~600 characters, question marks count, presence of phrases from a config-maintained list of pressure patterns ("you owe me", "after everything", "just reply", ultimatums, apologies stacked more than twice), and sending-hour (local time between 23:00 and 05:00 flags "night-send risk"). Nothing pasted is stored, logged, transmitted, or retained after the session view closes — stated on screen before the textarea, and enforced by the Section 16.1 analytics rule and a Playwright test that asserts no network payload contains draft text.
5. **Outcome — one of three, always with a next action:**
   - **Don't send this.** (The default for all non-logistics, all forced-wait, and most mixed cases.) Next actions: save it to the unsent vault (a local-only list in the same storage layer — write it, keep it, don't send it), start the 30-minute urge timer, or open the tracker.
   - **Wait 24 hours, then re-run this tool.** (Genuine but mistimed cases: closure/apology drafts that pass the draft checks, outside forced-wait conditions.) The tool offers a concrete re-check time and the timer set to 24 hours conceptually — implemented as a "come back tomorrow" local reminder state, not a push notification.
   - **Sending can be reasonable — send the logistics version.** (Logistics purpose, state checks passed, draft checks clean.) The tool shows a trimmed-template suggestion pattern (one or two sentences, one question, no emotional content) as guidance text he edits himself — it does not rewrite his message for him.

The **urge timer** is a full-screen-capable 30-minute countdown with three rotating, config-driven prompt cards ("What do you actually want to happen after she reads it?" / "How will you feel at breakfast if she doesn't reply?" / "Day [N] of no contact is worth more than this draft.") — the tracker day count substitutes when tracker state exists. Completing the timer ends on the check-in action if he has a tracker, or the tracker setup offer if he does not.

Scoring/decision logic lives in `lib/tools/decision.ts` as an explicit, ordered rule table (forced-wait rules first, then logistics eligibility, then default), unit-tested per Section 16.2. No outcome may ever be "yes, send it, this will get her back"; the tool takes no position on reconciliation outcomes and its copy says so.

---

## 12. Content and SEO infrastructure

### 12.1 Strategy in one paragraph

Tool-first, article-second (Section 3.2). The ranking plan does not pretend the head term is winnable on day one: `/attachment-styles/` and the quiz are built correctly for the 135,000/month and 49,500/month clusters and then left to compound, while the active month-two-and-beyond effort goes to situational long-tails (Section 12.3) where smaller sites demonstrably win and where purchase intent is highest. Judge SEO progress in months 1–3 on indexing, impressions on long-tails, and quiz-completion and email rates — not on head-term positions.

### 12.2 Per-page SEO and technical requirements

- **Metadata:** every route in Section 6 has a unique title (≤ 60 characters, tool/keyword first, brand name last), meta description (≤ 155 characters, states the free/no-signup fact for tool pages), canonical URL from `config/site.ts`, and Open Graph + Twitter card tags with a per-tool OG image. All values live in `lib/seo/metadata.ts` keyed by route — no metadata literals inside page components.
- **Schema (JSON-LD, generated in `lib/seo/schema.ts`):** `WebSite` + `Organization` sitewide (Organization carries no founder `Person` entity at launch — faceless rule); `FAQPage` on the quiz, tracker, decision tool, no-contact-rule, and profile pages from the same `content/faqs.ts` data that renders the visible FAQ (never schema-only questions); `BreadcrumbList` per Section 6; `Article` on guides with `datePublished`/`dateModified` from content metadata. **Prohibited:** `MedicalCondition`, `MedicalWebPage`, health-claim review schema, `Person` author schema naming the founder, and any star-rating or review markup the site has not earned from a real review system.
- **Technical:** `sitemap.ts` generates exactly the Section 6 routes (results shell excluded); `robots.ts` allows all, disallows `/api/` and the results shell, and references the sitemap; www → apex and http → https redirects at the host; trailing-slash consistency matching Section 6; a real 404 page that links the three tools and the crisis page; all pages pass the Section 16.3 budgets with content server-rendered (tool interactivity hydrates; supporting copy, FAQs, and methodology summaries are in the initial HTML).
- **Content freshness:** guides carry visible "last reviewed" dates from content metadata; a date may only change when the content actually changed.

### 12.3 Launch content (briefs, not full drafts)

The content below ships at launch: the no-contact hub, three guides, and the two situational instances that prove the template. Founder reviews every piece for accuracy and voice before Session 10 closes; Claude Code may draft from these briefs, and the founder's canon knowledge (Section 12.4) is the standard.

1. **The No Contact Rule (`/no-contact-rule/`)** — what counts as contact (reuse Section 11.1's defined list), how long (30/60/90 guidance), the legitimate exceptions (shared children, shared housing/finances, emergencies — handled plainly, with co-parenting kept factual and brief), what to do when she breaks it, and the tracker as the page's tool block. This is the situational cluster's hub.
2. **Attachment Styles After a Breakup (`/guides/attachment-styles-after-a-breakup/`)** — how each profile behaves post-breakup (adapted from Section 9.4 profile data, expanded), why the anxious–avoidant pairing is the common trap, and the quiz as the tool block.
3. **How Long Does a Breakup Take? (`/guides/how-long-does-a-breakup-take/`)** — honest ranges, the factors that lengthen recovery, week-by-week texture for the first 90 days, no promised timeline, and the tracker as the tool block. This guide is also the Phase 2 programme's conceptual seed (Section 15) — write it so a 30/60/90-day structure feels like a natural next step later, without selling anything not yet built.
4. **No Contact, Day 14 (`/guides/no-contact-day-14/`)** and **She Texted Me During No Contact (`/guides/she-texted-me-during-no-contact/`)** — the situational template: a specific moment, why it spikes, what is normal that week, the three mistakes, the exact next 24 hours, and the relevant tool block (tracker for the first, decision tool for the second). The template (structure in `config/content.ts`, components in `components/content/`) must make a new situational page a content-only task of under an hour, because month two's growth plan is a batch of these (day 3, day 7, day 21, day 30, her birthday, I saw her with someone, I dreamed about her, and similar moments).

### 12.4 The canon and the reading list

Site content, result-page reading lists, and email recommendations draw first from the material the founder has actually read and used: *Attached*, *Anxiously Attached*, Thais Gibson's Personal Development School curriculum themes, and Chris Seiter's Ex Boyfriend Recovery material. Rules: concepts are explained in the site's own words with the book/course named as the source to go deeper; no text is copied from any book, course, or video; creator views the founder would not endorse (manipulation tactics, guaranteed ex-back claims) are not laundered through the site's voice. `/recommended-resources/` organises this canon by moment ("for the first two weeks", "for understanding your pattern", "programmes that go deeper") rather than by commission.

### 12.5 Faceless now, founder-ready later

- Templates contain no byline, author box, or author schema at launch; guides are published with no byline at all ("By the HeartFixed team" is prohibited — or "Reviewed by HeartFixed editors" only if the founder approves that exact line in Session 10).
- A `FounderNote` component (optional intro block: props for heading and body, no photo slot required, an optional media slot that renders nothing when empty) is defined and unit-tested but used on zero pages at launch. When founder-led content is added later — written, voice, or on-camera — it drops into existing templates without structural rework, and adding it is a content decision, not a rebuild.
- Social profiles: none linked at launch. The footer and schema must tolerate handles being added later via `config/site.ts` only.

---

## 13. Email capture, affiliate slots, and monetization wiring

### 13.1 Capture flows — consent separation is a hard rule

Three distinct actions exist. They are never conflated, in UI copy, in code, or in the provider:

- **(a) Send my result / my tracker summary** — a one-off transactional email containing the visitor's own output, sent once to the address he enters. It does **not** subscribe him to any list.
- **(b) Join the email list** — a separate, explicit subscription action (its own form or its own unchecked-by-default checkbox beside a transactional form, labelled in plain words: "Also join the free email list — one or two emails a week on getting through this, unsubscribe anytime"). Only this action creates a list record with marketing consent.
- **(c) Tracker reminders** — a separate opt-in for functional streak reminders (Section 11.1), stored as its own consent flag, unsubscribable independently of the marketing list. Reminder copy is product copy ("Day 12. Still going."), never written as if from a person, a friend, or the brand "missing" him.

Shared rules for every form: single email field (plus nothing else — no name field in the MVP; personalization uses tool context, not names); client + server validation with the same Zod schema; disposable addresses accepted; endpoint rate-limited (default 5 requests / IP / hour) with a honeypot field and no CAPTCHA in the MVP unless abuse appears; inline success state with no redirect ("Your result is on its way to [email]"); inline failure state with a fallback (for the quiz: print/save the result). No form appears before the value exists: the quiz form appears on the result view, the tracker reminder opt-in appears after a streak exists, and the footer signup (Section 13.3) is the only pre-value form on the site, labelled as a subscription.

### 13.2 What the emails contain

- **Quiz result email** (transactional, from `lib/email/resultEmail.ts`): subject "Your attachment result from HeartFixed: [Profile name]"; body — both scores with bands, the full profile description, the profile's three watch-outs, the 14-day action list for that profile (content files per profile, founder-reviewed in Session 9), the share link (Section 9.6), the tracker link, Block A (Section 14.3) in readable type, and a clearly separated, optional list-join link (joining happens by clicking through and confirming — the transactional send itself never subscribes him).
- **Welcome sequence** (list, 5 emails over 10 days, source copy in `content/emails/`): (1) his result or starting point recapped + the single most useful tool for week one; (2) the no-contact rules that actually hold, linking Guide 1; (3) attachment after a breakup, linking Guide 2 + the reading-list page; (4) the situational email — "the day it gets harder, not easier", linking the situational guides; (5) programmes that go deeper — the first affiliate-bearing email, rendered under Section 13.4's rules, with disclosure inside the email itself. Every marketing email carries one-click unsubscribe and the config mailing address.
- **Tracker reminder** (only while opted in): at most one per day, only on a day with no check-in recorded by the chosen reminder hour — noting that the site cannot know about check-ins stored in another browser, so copy must tolerate being wrong ("If you've already checked in today, ignore this"). Reminders stop automatically at goal completion, with one completion email offering the goal extension.

### 13.3 Footer email signup

A single email field in the footer ("One or two emails a week on getting through a breakup. Free, unsubscribe anytime.") that performs action (b) only, with the same validation and an inline success state. It is labelled as a subscription in the microcopy, unlike a transactional send.

### 13.4 Affiliate placement slots (infrastructure only — no programs hardcoded)

Build slots, not offers. `config/affiliates.ts` defines slots; a slot with `enabled: false` renders nothing at all (no empty box, no placeholder).

```ts
interface AffiliateSlot {
  id: string;              // e.g. "quiz-result-anxious"
  page: string;            // route or result-profile the slot belongs to
  position: string;        // named anchor, e.g. "after-next-steps"
  enabled: boolean;
  programKey?: string;     // key into the programs table below
  heading?: string;        // approved program copy, set in config only
  body?: string;
  ctaLabel?: string;
  url?: string;            // affiliate link, rel="sponsored nofollow"
  disclosureId: string;
}
interface AffiliateProgram {
  key: string;             // e.g. "pds-all-access"
  name: string;            // display name, set at activation
  network: string;         // e.g. "direct" | "clickbank" | "amazon"
  termsUrl?: string;       // program terms, for founder reference
  // Commission/payout figures, if recorded at all, live in a founder-only
  // note field and are NEVER rendered to the page.
  founderNote?: string;
}
```

Slot inventory to build: quiz result view (1 per profile, 4 total, only the visitor's own profile renders), tracker page after the explainer (1), decision tool outcome view (1, "don't send" outcome only), `/recommended-resources/` (up to 4, one per resource), welcome email 5 (1, email-template slot), and one in-content slot in Guide 3 (1). Maximum one affiliate slot visible per page section and never more than two per page.

**Activation list (founder activates post-launch, per programme, after approval — this spec builds none of them active):**

| Programme (from validation research) | What the research verified | Status flag for the founder |
|---|---|---|
| Personal Development School — All-Access / REWIRED | Own-page pricing $67/mo (promo $49; $299/yr); REWIRED $297–$799 | Pricing verified Oct 2026; commission terms **check current affiliate terms at signup — not verified in research** |
| Chris Seiter — Ex Recovery Program / Reconnection Room | Own-page pricing $47 / $97 one-time | Pricing verified Oct 2026; affiliate availability/terms **check at signup — not verified in research** |
| The Ex Factor Guide (ClickBank / LoveLearnings) | Vendor-claimed 75% commission, $58.69 avg payout per sale | **Vendor-claimed — unverified.** Never render the payout figure anywhere public |
| Beat The Breakup (ClickBank / LoveLearnings) | Vendor-claimed $44.20+ payout, $1.04 EPC | **Vendor-claimed — unverified** |
| Text Your Ex Back | Vendor-claimed 75%; "up to $5/click" claim | **Vendor-claimed — unverified**; the per-click claim must never be used in planning or copy |
| Books — *Attached*, *Anxiously Attached* (book affiliate programme of founder's choice) | Titles verified as the founder's own reading | Commission is small by nature; role is trust (Section 3.4) |

Rules for every rendered slot: the Section 14.5 disclosure sentence renders directly above the slot inside the same container; links carry `rel="sponsored nofollow noopener"`; click events fire the Section 16.1 affiliate event with the slot id only; slot copy may not promise an outcome ("get her back", "make her regret it", any guaranteed result), may not quote a commission or payout, and may not present an ex-back programme as the site's own recommendation without the honest-framing line from the resources page ("Some men want to try to reconcile; some want to move on. These are different goals — pick the resource for the goal you actually have."). The build is complete with all slots disabled; which programmes fill them, and when, is a post-launch business decision recorded in config, not code.

---

## 14. Compliance and guardrails — hard requirements and exact copy

This section specifies content, placement, and product behaviour. It is a build checklist, not legal advice; the founder should have the final pages and the Phase 2 design reviewed by a qualified lawyer before running paid promotion, signing affiliate terms that require review, or shipping any AI feature.

### 14.1 The guardrails — non-negotiable build requirements

Each guardrail below has an acceptance test in Section 16.4. A build that fails one is not done, however well everything else works.

1. **No AI therapist. No AI companion.** No feature in any phase presents as, is named as, or is marketed as a therapist, counsellor, friend, companion, partner, or person. No persona name, avatar personification, romantic framing, or "I'm here for you whenever you need me" language anywhere — code, copy, metadata, emails, or store listings if any ever exist.
2. **No therapy or medical claims, anywhere** (Section 14.2 lists prohibited language). The product is education and self-reflection tools for breakup recovery. It does not diagnose, treat, screen, or assess mental-health conditions, and no page may imply that it does.
3. **Quiz results are never paywalled.** Full results render free with no email, account, payment, blur, partial reveal, or "unlock your full report" mechanic, in the MVP and permanently. Monetization lives downstream (Section 13), never on the result itself. The same rule binds the tracker (full streak features free) and the decision tool (full outcome free).
4. **The own product, when it exists, is finite.** The Phase 2 programme has a defined arc (30/60/90 days), a completion state, and a graduation off-ramp (Section 15). No feature may be designed to extend use past completion for its own sake: no infinite feed, no streak mechanic inside the programme that punishes completion, no retention dark patterns.
5. **Crisis resources are structural, not decorative.** The crisis line (Section 14.3) renders in the footer of every page, the full crisis block renders on the quiz result view, the decision tool outcome view, and the tracker page, and the standalone `/crisis-resources/` page is linked from the footer, the About page, and every AI or journaling surface in Phase 2. Removing or visually burying any of these in a redesign is a launch-blocking regression.
6. **Data minimization for sensitive content.** Journal-adjacent and self-reflection content (quiz answers, tracker notes, draft messages, Phase 2 journal entries) is local-first by default, never used for advertising, never sold or shared, never used to train any model, and never sent to an AI provider in the MVP (there are no AI calls in the MVP) or without the Phase 2 consent and vendor rules in Section 15.5.
7. **No engagement-maximizing mechanics.** No push notifications in the MVP; no variable-reward loops; no manufactured urgency in emails; no copy designed to make a user feel the product is emotionally attached to him. Reminders exist only where Section 13.1(c) allows them, are functional in tone, and stop on completion or unsubscribe.
8. **Age positioning.** The site is written for adults. Do not market it to minors, do not build features aimed at minors, and state "for adults (18+)" on the About page. This is positioning, not an age-verification system; no age gate is built in the MVP, and no claim of age verification may appear anywhere.

### 14.2 Language rules — what the site may and may not say

Prohibited anywhere on the site, in emails, in metadata/schema, and in affiliate slot copy rendered on the site:

- "Therapy", "therapist", "counselling", "treatment", "diagnosis", "diagnose your attachment style", "clinically proven", "mental-health assessment", or any claim to treat anxiety, depression, PTSD, or any other condition.
- Outcome guarantees about another person: "get your ex back", "she'll regret leaving", "make her miss you", or equivalents, in the site's own voice. (An affiliate programme's name may be quoted on `/recommended-resources/` only inside its honest-framing context, Section 13.4.)
- Recovery-timeline promises: "over her in 30 days", "guaranteed to heal", or equivalents. Timelines may be described as programme structures, never as promised outcomes.
- Clinical identity claims about the reader: "you have anxious attachment disorder" or equivalents. Attachment profiles are described as patterns and tendencies, never as conditions.

Required framing, used consistently:

- The assessment is "a self-reflection assessment informed by attachment research" — this phrase, or the Section 14.3 verbatim disclaimer, appears wherever the quiz is described at length (quiz page, methodology page, result email).
- Programmes and books are "programmes", "courses", and "books" — never "treatments".
- The site's help is "tools", "guides", and (Phase 2) "a programme" — never "support from someone who understands you" or any phrasing implying a relationship with the product.

A launch sweep (Section 19.1) greps the built site for the prohibited terms; any hit outside the legal pages' explanatory context blocks launch.

### 14.3 Exact copy — verbatim blocks

**Block A — self-reflection disclaimer (renders under the quiz result headline, on the quiz page, and on the methodology page; verbatim):**

> This assessment is a self-reflection tool informed by attachment research. It is not a medical or psychological diagnosis, it is not therapy, and it is not a substitute for professional support. Only a qualified professional who knows your full situation can assess your mental health. If you are struggling, please consider talking to a licensed professional.

**Block B — general not-therapy disclaimer (renders in the footer area of every tool page and on the About page; verbatim):**

> HeartFixed provides educational tools and information about attachment patterns and breakup recovery. It does not provide therapy, counselling, medical, or mental-health advice, and using this site does not create a therapist, counsellor, or clinician relationship of any kind.

Note: Block B contains the brand name as settled in Section 1.3. It is verbatim; Claude Code must not alter a word.

**Block C — crisis line (renders in the footer of every page, in body-size text, never in reduced-size small print; verbatim):**

> If you are in crisis or thinking about harming yourself, call or text **988** (US Suicide and Crisis Lifeline, 24/7) or call your local emergency number. You deserve support from a person, right now — not a website.

**Block D — crisis block (renders on the quiz result view, the decision-tool outcome view, the tracker page, and at the top of `/crisis-resources/`; verbatim):**

> **If things feel heavier than a breakup:** heartbreak can bring up thoughts of harming yourself, and there is no shame in that — but a website is not the right help for it. In the US, call or text **988** any time, day or night, to reach the Suicide and Crisis Lifeline. If you are outside the US, the `/crisis-resources/` page lists international helplines, and your local emergency number always works. Please reach out to a person today.

Implementation note on Block D: the reference to the crisis page inside the block renders as a link to `/crisis-resources/`; the words are otherwise unchanged. The crisis-resources page itself lists 988 (call/text, US), the Crisis Text Line (text HOME to 741741, US), emergency numbers guidance, and a short, sourced international section — international entries must be verified by the founder at Session 11 against the providers' own pages before publication, and no international number may be published from memory.

**Block E — draft-privacy notice (renders directly above the decision tool's paste-a-draft textarea; verbatim):**

> Your draft stays in this browser. It is not sent anywhere, not stored after you leave this page, not used to train anything, and never seen by a person. The checks below run on your device.

### 14.4 Forms, privacy, and data rules

- The MVP collects exactly one personal data item: an email address, and only via the Section 13 flows. No names, no phone numbers, no dates of birth, no ex-partner information of any kind (see the never-ask-her-name rule, Section 11.1).
- Data stored only in the visitor's browser: quiz answers and results, tracker state and notes, unsent-vault drafts, in-progress quiz attempts. The Privacy Policy must say this in plain terms, including the consequence (clearing browser data erases it; the site cannot recover it).
- Privacy Policy page must cover: what is collected (email if provided, analytics per Section 16.1), what is never collected (the browser-local content above, financial data, health data), cookies/analytics in plain terms, email use and one-click unsubscribe, data sharing (email provider and analytics named by category; no sale of data; no sharing of self-reflection content with anyone, including affiliate programmes — affiliate clicks are outbound link clicks, and the policy says what a click shares: the destination site learns he arrived from this site via its affiliate parameters, nothing about his results), retention (list data until unsubscribe or a stated inactivity purge the founder sets in the provider), and a contact route for access/deletion requests.
- Terms of Use page must cover: educational purpose, no professional relationship (mirroring Block B), results are self-reflection not diagnosis, acceptable use, intellectual property, limitation of liability, and contact.
- Every marketing email includes a working one-click unsubscribe and the config mailing address (founder-supplied PO Box or business address — never a home address by default). Transactional emails include Block A's short form ("This is a self-reflection result, not a diagnosis or therapy.") and a note that the email was requested on the site.
- Contact page: a working contact email from config (never a personal address the founder has not chosen for public use) and honest response expectations for a solo operator ("Replies within a few days; this site cannot help with emergencies — see Crisis Resources").

### 14.5 Affiliate disclosure (proximity rule)

Wherever an affiliate slot renders, this sentence renders directly above it, in body-size text, inside the same visual container — never footer-only, never behind a link alone (verbatim):

> We may earn a commission if you buy through links on this page. It doesn't change what we recommend first or what you'll pay.

Sitewide: a short disclosure line in the footer linking to `/affiliate-disclosure/`, plus the full disclosure page covering what affiliate links are, that compensation never changes quiz results, recommendations order, or tool behaviour, how the founder chose the launch recommendations (from his own use — stated only where true, per resource), and how to contact the site with questions. Email 5 of the welcome sequence carries the same sentence inside the email, above its recommendation.

---

## 15. Phase 2 specification — the finite AI-assisted recovery programme (do not build in the MVP month)

This section specifies the own product so that the MVP's architecture does not foreclose it, and so its boundaries are fixed *before* revenue pressure exists to blur them. **No part of this section is built in Sessions 1–14.** The MVP may contain only: the data-model reservations in Section 15.7 and the guide copy seed in Section 12.3 (Guide 3). Starting Phase 2 requires the gate in Section 15.1 to be met and a fresh founder decision.

### 15.1 The gate — all must be true before Phase 2 build starts

- The MVP has been live for at least 60 days, with analytics (Section 16.1) showing sustained organic traffic and an email list the founder judges large enough to launch to (his call, recorded in the build log — this spec deliberately sets no vanity threshold).
- At least one affiliate slot has produced real sales, proving the list buys.
- The founder has had the Phase 2 design (this section) reviewed by a qualified lawyer for the jurisdictions he sells into, including a state-by-state scope assessment of the kind Section 15.6 requires. This review is a budget line in Section 17.4, not an optional extra.
- The crisis protocol in Section 15.4 is implemented and tested *before* any AI feature is enabled for any user, including beta users.

### 15.2 Product shape

- **Name (working title only):** "The 90-Day Programme" — with 30-day and 60-day arc lengths selectable at start; the arc is the product. Marketing may never call it an app companion, coach, friend, or therapist (Section 14.1 applies in full).
- **Price:** one-off payment in the $49–79 range — a single price set by the founder at Phase 2 launch within that band and recorded in config; the default this spec recommends is **$59**. One payment, full programme, no tiers that gate core content, no upsell funnel inside the programme, no subscription, no auto-renewal of anything. Payment processing (Stripe or equivalent) is introduced only in Phase 2; the MVP contains no payment code.
- **Access:** delivered on the web, behind an account created *for the programme purchase only* (email + password or magic link). This is the first and only account system on the site; MVP tools remain account-free forever.
- **Cohort model:** a buyer starts on purchase and progresses day-by-day through his chosen arc. Content unlocks by programme day, not all at once — the pacing is the pedagogy, and it is also the usage cap that makes the economics work (Section 15.3).

### 15.3 The programme's bounded AI features (the complete list — anything not listed is not built)

1. **Personalised plan assembly.** At intake (his quiz result if he has one, imported with consent from the share token — never silently; a short intake questionnaire otherwise), the system assembles his arc: which modules, in which order, weighted by attachment profile and breakup stage. Assembly may use templated logic with AI-assisted selection; the plan itself is structured content written by the founder, not free-generated text.
2. **AI journaling with structured prompts.** Each programme day offers one journaling exercise: a fixed prompt (founder-written, matched to the day and his profile), a free-text entry, and an AI response constrained to a defined reflective pattern — summarise what he wrote in his own terms, reflect one observation drawn from the entry, and ask at most one follow-up question from the day's approved question set, then close with the day's next action. Sessions are capped (default: one journaling session per programme day, maximum 6 AI exchanges per session, maximum ~10 minutes). The AI does not initiate; there is no blank "chat with…" box anywhere in the programme.
3. **Urge-moment support.** Inside the programme, the Section 11.2 decision flow is extended with an AI-assisted draft review that applies the same rule-based checks plus a tone read of the draft — still bounded to that single task, still ending in one of the same three outcomes, still never sending anything, and still under Block E's privacy promise extended by Section 15.5's vendor rule.
4. **Weekly progress reflection.** Once per programme week, an AI-generated summary of *his own recorded data* (check-ins, streak, journaling themes he tagged — not inferred emotions) showing progress against his own start point, ending with the coming week's focus. One generation per week, not on demand.

Hard bounds applying to all four: no persona (the AI is referred to only as "the programme" or "today's exercise"); no memory beyond the programme's own structured state and journal entries; no proactive outbound AI messages (programme reminder emails are templated product emails under Section 13.1(c)'s rules, never AI-generated personal messages); no romantic, friendship, or dependency language in any prompt, system instruction, or output template; session caps are enforced server-side and framed in copy as programme structure ("That's today's exercise complete") rather than scarcity; and total AI cost per buyer is modelled before launch against the one-off price using mini-class models by default, with any frontier-model use costed explicitly — the validation's cost lesson (frontier-model heavy use can consume the entire margin) is a launch input, not a surprise to discover.

### 15.4 Crisis and self-harm protocol — Phase 2 v1 requirements

Build this *first* within Phase 2, before features 1–4, and treat it as live infrastructure thereafter:

- **Detection:** every user text input to an AI feature (journal entries, draft reviews) passes a self-harm/suicidal-ideation classifier before the AI response is generated. In the MVP there are no such inputs server-side; in Phase 2 this classifier is a server-side, logged component — a static disclaimer is explicitly not a substitute.
- **Response flow:** on detection, the AI exercise pauses; the user sees Block D plus a direct 988 call/text action and the crisis page link; no programme content, upsell, or engagement prompt appears in that flow (the research record includes products that pitched subscriptions immediately after suicidal disclosures — that failure mode is named here so it is designed out and tested for). The user may resume the programme later; the programme never comments on the crisis content itself beyond the referral.
- **Published protocol:** a public page (extending `/crisis-resources/`) documents the protocol in plain language: what is detected, what happens, what is logged, and what the product does *not* do (it does not monitor in real time, does not contact emergency services, and is not a crisis service).
- **Logging that cannot be retrofitted:** timestamped counts of protocol activations and referrals (no journal or message content in the log), retained and reviewable from day one, because reporting duties in this category cannot be reconstructed after the fact.
- **Review duty:** the founder reviews activation counts and any user reports weekly during Phase 2's first quarter (a standing ~30-minute task recorded in the operations notes), and any model, prompt, or feature change re-triggers a protocol regression test (Section 16.2, Phase 2 tests).

### 15.5 Phase 2 data rules (in addition to Section 14.4)

- Journal entries are the most sensitive data the business will ever hold. Default storage: encrypted at rest, exportable by the user in full, deletable by the user in full (deletion is real deletion within a stated window, not deactivation), and never used to train any model — the founder's own or a vendor's.
- AI vendor rule: journal or draft text may be sent only to an AI provider under terms that prohibit training on it and minimise retention (zero-retention or shortest-available setting), with that provider and purpose named in an updated Privacy Policy *before* the feature ships. Consent for AI processing is a separate, explicit opt-in at programme intake — bundled terms acceptance is not sufficient — because routing intimate chat text to third-party vendors without adequate consent is an active litigation theory in this category.
- Programme state minimisation: store the plan, day, check-ins, and entries; do not build a free-form long-term memory store, an emotion history, or inferred-trait profiles of buyers. What Section 15.3(4) summarises is his recorded data, not a model of him.
- **Graduation and deletion:** at arc completion the user gets a graduation view (his progress, his plan for the next 90 days *without* the programme), a full export, and a prompt to delete his journal from the service — presented as the healthy default the product was designed for. Accounts of completed buyers with no activity are purged of journal content on a stated schedule (default: 12 months after completion) after two email warnings.

### 15.6 Regulatory posture the design must maintain

The Phase 2 design deliberately stays outside the companion category's functional definitions: New York's and California's laws turn on design features — retaining memory to sustain a relationship, asking unprompted emotion-based questions, and sustaining personal conversation across interactions. The mitigations are structural and already specified above: user-initiated, programme-bound sessions; prompts that come from the curriculum, not from a persona's curiosity; memory limited to programme state; finite arcs; no relationship language. These reduce but do not eliminate classification risk, which is why Section 15.1 requires the legal review and a documented scope assessment per state before sale, and why any future feature that adds a persistent persona, open-ended chat, or proactive emotional messaging is prohibited by Section 14.1 rather than merely discouraged. If the legal review concludes a feature cannot be sold compliantly at solo scale, the feature is cut — the programme's bounded core (plan, curriculum, tracking) works with no AI at all, and that fallback is an acceptable Phase 2 outcome.

### 15.7 What the MVP builds now to keep Phase 2 possible

Only three things: quiz results are importable by share token with consent (Section 9.6 already provides the token); the email list is the programme's launch audience (Section 13 already builds it); and Guide 3 (Section 12.3) establishes the 30/60/90-day frame in readers' minds. **No** programme schema, account system, payment code, AI endpoint, or "coming soon" marketing is built or published in the MVP. The site never promises a launch date for the programme.

---

## 16. Analytics, performance, testing, and acceptance criteria

### 16.1 Analytics events to instrument

Implement in `lib/analytics.ts` as typed events; send to GA4. **The no-sensitive-content rule (absolute): never send quiz answers, item-level responses, journal or note text, draft message text, slip details, urge notes, or email addresses as event parameters — and never set any of them as user properties.** Allowed parameters are tool names, counts, bands, categories, and outcome codes only, as tabled below. This rule exists because analytics pipelines are third-party stores; a pipeline that quietly accumulates vulnerable men's private breakup writing is a breach and a scandal waiting for a timestamp. A launch test (Section 16.4) inspects live network payloads to prove compliance.

| Event | Trigger | Parameters (allowed) |
|---|---|---|
| `quiz_view` | Quiz page loaded | `source` (organic / internal / share / email) |
| `quiz_started` | First answer given | — |
| `quiz_completed` | Result rendered | `profile` (profile id), `anxiety_band`, `avoidance_band` |
| `quiz_result_shared` | Share link copied | `profile` |
| `tracker_created` | Streak created | `goal_days` (30/60/90) |
| `tracker_checkin` | Daily check-in saved | `day_band` (1–7 / 8–30 / 31+) |
| `tracker_slip_recorded` | Slip flow completed | `slip_type` (category only) |
| `decision_started` / `decision_completed` | Decision tool lifecycle | `outcome` (dont_send / wait_24h / logistics_ok), `draft_check_used` (bool) |
| `urge_timer_completed` | Timer reaches zero | `from` (tracker / decision / direct) |
| `email_result_submit` / `email_result_success` / `email_result_error` | Result-email form lifecycle | error = error code only |
| `newsletter_signup` | List join succeeds | `placement` (footer / result / tracker) |
| `reminder_optin` | Tracker reminders enabled | `goal_days` |
| `affiliate_slot_view` / `affiliate_click` | Slot enters viewport / is clicked | `slot_id` only |
| `guide_tool_click` | Guide tool-block CTA clicked | `guide`, `tool` |
| `crisis_link_click` | Any crisis resource link clicked | `placement` (footer / result / decision / tracker) — counts only, for the founder's own awareness; never joined to any user content |

Search Console: verify `heartfixed.com` (domain property), submit the sitemap at launch, and check coverage plus the Section 3.1 cluster queries weekly from month two (founder task, noted in the launch checklist).

### 16.2 Test cases — scoring and tool logic (must pass exactly)

Build fixtures in `lib/quiz/__tests__/fixtures.ts` and `lib/tools/__tests__/`. When Claude Code first implements scoring, it hand-verifies Fixture 1's arithmetic in a test comment (per-item effective values, both raw sums, both normalizations) so a systematic error cannot bake itself into the fixtures.

- **Fixture 1 — Persona A (anxious):** the specified 24-answer pattern from Section 10.4 produces anxiety 72/100 (high), avoidance 18/100 (low), profile `anxious`.
- **Fixture 2 — All-neutral:** all answers "Sometimes" (2) produce both raw sums at exactly half of maximum, both normalized scores at 50 (moderate/moderate), profile `secure` with the mixed-lean paragraph selected.
- **Fixture 3 — Straight-line maximum:** all answers "Almost always" (4) with reversal applied produce the data-defined result — assert the four reversed items contribute 0 each and the profile matches a hand-computed expectation recorded in the fixture; this fixture exists to catch reversal bugs.
- **Fixture 4 — Mirror personas:** two further specified patterns produce `avoidant` (avoidance high, anxiety low) and `fearful-avoidant` (both high) respectively, with bands asserted per dimension.
- **Fixture 5 — Band edges:** constructed answer sets landing exactly on normalized 33/34 and 66/67 assert the Section 9.3 band boundaries on both dimensions.
- **Fixture 6 — Incomplete input:** 23 of 24 answers causes `scoreQuiz` to throw, and the runner UI makes the state unreachable.
- **Fixture 7 — Share token round-trip:** a result encodes to a token and decodes to the identical profile, scores, and version; a token with a tampered score fails validation and renders the generic results shell with a "take the assessment" prompt, never an error page.
- **Tracker fixtures:** streak math across a month boundary and a daylight-saving change; a slip preserves `longestStreak` and total-days while restarting the current streak on the restart date; a missed-day back-fill does not inflate the current streak; goal completion at exactly day 30/60/90 fires the completion state once.
- **Decision fixtures:** alcohol = yes forces `dont_send` for every combination of other inputs (property test across the input space); intensity ≥ 8 forces `dont_send`; logistics purpose + clean state + clean draft is the *only* path to `logistics_ok`; a draft containing two listed pressure patterns cannot produce `logistics_ok`; a 01:30 local timestamp sets the night-send flag.
- **Phase 2 tests (specified now, written in Phase 2):** classifier activation pauses the exercise and renders the referral with no programme upsell present; session caps enforced server-side; graduation purge schedule honoured.

### 16.3 Performance budgets (Lighthouse, mobile, median of 3 runs)

| Metric | Budget |
|---|---|
| Largest Contentful Paint | ≤ 2.0s on tool pages, ≤ 1.8s on homepage/guides |
| Interaction to Next Paint | ≤ 200ms (quiz/tracker interactions must never jank) |
| Cumulative Layout Shift | ≤ 0.05 (reserve result and streak space; no late jumps) |
| Total JS on a tool page | ≤ 180KB gzipped |
| Lighthouse scores | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100 |

### 16.4 Acceptance criteria per feature (all must be true to call it done)

- **Guardrails:** Block A under every result headline; Block B on every tool page; Block C in every footer; Block D on result, decision-outcome, and tracker pages; a full quiz completion with email field untouched yields the complete result (tested); grep for Section 14.2's prohibited terms returns no hits outside legal-page explanatory context; no chat UI exists anywhere in the build.
- **Quiz engine:** all Section 16.2 quiz fixtures pass; determinism property test — the same answer set scored 100 times returns identical results; profile assignment matches the Section 9.4 table for all nine band combinations.
- **Assessment page:** in-progress restore works after a browser restart; context questions demonstrably do not alter scores (same scored answers ± different context answers → identical result); shared link renders the correct profile view, `noindex`, with no answers exposed in the URL beyond scores and version.
- **Tracker:** all tracker fixtures pass; clearing data deletes the localStorage key (asserted); the slip flow contains none of the prohibited shaming words (Section 11.1) — grep the rendered copy; export downloads the visitor's own data correctly.
- **Decision tool:** all decision fixtures pass; a Playwright network assertion proves pasted draft text appears in **no** outbound request; Block E renders above the textarea; the timer functions with reduced-motion enabled.
- **Email flows:** a transactional result send creates **no** list subscription (verified in the provider during QA); a list join works from footer, result, and tracker placements; reminder opt-in is independent of list membership; unsubscribe from any stream works in one click.
- **SEO:** schema validates with no prohibited types (Section 12.2); sitemap lists exactly the Section 6 indexable routes; every page's title/description/canonical/OG match Section 12.2; axe reports zero critical issues on the three tools.
- **Analytics privacy:** manual inspection of GA4 DebugView (or network log) for a full quiz + tracker + decision journey shows no answer text, note text, draft text, or email address in any payload.
- **Resilience:** cleared localStorage, a corrupted storage value, a tampered share token, and a 500-character tracker note each leave every page functional with a plain-English recovery path.

---

## 17. Environment, configuration, deployment, and budget

### 17.1 Configuration discipline

Everything environment- or business-specific lives in `config/` or environment variables — never in components. `config/site.ts`: site name `"HeartFixed"`, domain `"https://heartfixed.com"`, tagline, contact email (founder-supplied), mailing address for email footers (founder-supplied), social handles (empty by default). `config/copy.ts`: the partner-reference dictionary (Section 2.3). `config/quiz.ts`: question-set version (`men-v1`), band thresholds (Section 9.3), context-question definitions. `config/affiliates.ts`: slots and programmes per Section 13.4, all `enabled: false` in the initial commit. `config/content.ts`: guide metadata, situational template data, decision-tool phrase list and prompt cards. Note for the founder: the brand was settled on 29 October 2026 — HeartFixed on heartfixed.com as the primary domain, with fixedheart.com (also owned) set up only as a 301 redirect to it (Section 1.3).

### 17.2 Environment variables (`.env.example` lists all; no real values in the repo)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL (`https://heartfixed.com` in production) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 property |
| `EMAIL_PROVIDER_API_KEY` | Server-only key for the email provider |
| `EMAIL_FROM_ADDRESS` | Verified sender, e.g. results@heartfixed.com (founder configures DNS — below) |
| `EMAIL_LIST_ID` | List/audience id for opt-in subscriptions |
| `EMAIL_RATE_LIMIT` | Requests per IP per hour, default `5` |

Secrets are set in the host's dashboard, never committed; `.env*` is git-ignored except `.env.example`. There are deliberately no AI, payment, or database variables in the MVP — their absence is the scope boundary made visible.

### 17.3 Accounts and DNS the founder sets up (Week 1, in parallel with Sessions 1–2)

GitHub (repo), Vercel (hosting), the registrar/DNS for `heartfixed.com` and `fixedheart.com` (both already owned — DNS and redirect setup only), an email provider account (Resend default), sending-domain authentication (SPF, DKIM, DMARC — allow up to 24h propagation; plan emails that land in spam are a failed launch), Google Analytics 4 and Search Console properties. Recommended default if any choice stalls: Vercel + Resend + GA4.

### 17.4 Budget — the $5,000 first quarter, and expected running costs

The founder's budget is up to $5,000 for the first quarter. This stack is chosen to use a small fraction of it in the MVP quarter, reserving the majority for the two things the research says actually move the outcome after launch: content expansion and the Phase 2 legal review.

| Item | Expected cost in Q1 | Notes |
|---|---:|---|
| Domains `heartfixed.com` + `fixedheart.com` | Already owned; renewal ~$12–15/yr each at standard pricing | Both domains are already owned — Q1 cost is renewal only, if it falls due |
| Hosting (Vercel) | $0 at MVP traffic (free tier); ~$20/mo if a paid tier is ever needed | Static site; no database costs |
| Email (Resend) | $0 free tier at launch volumes; ~$20/mo as the list grows | The main variable cost; scales with list size, which is the success case |
| Analytics (GA4 + Search Console) | $0 | — |
| Testing/CI (GitHub) | $0 at this scale | — |
| **Expected MVP running total** | **~$0–25/month** in Q1, i.e. under ~$100 for the quarter including domains | State this plainly wherever the plan is summarised: the MVP is near-free to run |
| Reserve: paid keyword pull (Semrush/Ahrefs short subscription) | ~$100–140 for one month, month 2 | For the Section 3.1 unverified strings |
| Reserve: Phase 2 legal review | Founder to quote; budget a four-figure sum from the $5,000 | Required by the Section 15.1 gate; do not start Phase 2 without it |
| Reserve: content/design help, stock-free illustration, tools | Remainder | Spent only against Section 19.4's signals |

Hard rule: no paid acquisition (ads) is budgeted in Q1. The model's acquisition is search + email; paid traffic is a post-validation decision with its own budget conversation.

### 17.5 Deployment notes

- Production branch `main` auto-deploys; every session branch gets a preview URL — the founder reviews previews, never production, during the build.
- DNS: point the apex and `www` at the host per its instructions; enforce www → apex and http → https at the host level and verify with a redirect checker before launch. fixedheart.com 301-redirects every path to the matching path on `heartfixed.com` at the registrar/host level — a config task at launch, not a code feature.
- Launch sequence (Session 14): verify the Section 1.3 HeartFixed / heartfixed.com values in config and the fixedheart.com redirect → production deploy → verify all Section 6 routes live → submit sitemap in Search Console → test the result email end-to-end on production with a real inbox → verify analytics payloads against Section 16.4 → only then enable any affiliate slot the founder has approved programmes for (slots ship disabled).
- Rollback: the host's one-click rollback to the previous deploy is the rollback plan; the quiz engine's git history plus fixtures are the safety net for scoring changes — never edit scoring code directly on `main` without the test suite running in CI.

---

## 18. One-month build sequence and Claude Code sessions

Sized for a founder spending heavy time in month one (roughly 15–25 hours/week of review, content, and decisions alongside Claude Code's build time). Each week ends with something live on a preview URL. If a week slips, cut from the bottom of that week's list — never cut scoring tests, the guardrail blocks, or the email consent separation. Founder content review is on the critical path in Weeks 2–3; sessions assume the founder reviews within a day.

### Week 1 — Foundation and the quiz engine

- **Session 1 — Scaffold.** Repo per Section 7.2, Next.js + TypeScript + Tailwind, design tokens (Section 8.2), layout/header/footer with Block C wired into the footer, config files with the settled HeartFixed / heartfixed.com values from Section 1.3, `.env.example`, README with run/deploy commands. Done when: the homepage skeleton deploys to a preview URL and the footer crisis line renders on it.
- **Session 2 — Quiz engine.** `lib/quiz/` complete per Section 9 (types, question data structure with two reviewed sample questions per dimension as schema proof, `scoring.ts`, profiles data structure, share encode/decode), with Fixtures 2, 3, 5, and 6 passing against a temporary full test bank. Done when: `npm test` is green and the Fixture 2 hand-verification comment exists. Note: the final 24-question bank is founder-reviewed copy (Session 4 input) — this session proves the engine against fixtures, not the final wording.
- **Session 3 — Storage and tool primitives.** `lib/storage.ts` (versioned keys, clear/export), tracker state logic `lib/tools/tracker.ts` with its fixtures passing, and decision rule table `lib/tools/decision.ts` with its fixtures passing — logic only, no pages yet. Done when: all Section 16.2 tracker and decision fixtures are green.
- Founder in parallel: point `heartfixed.com` at the host and set up the `fixedheart.com` redirect (Section 17.3 accounts and DNS started); begin drafting the 24-question bank against Section 9.2's framing rules; first read of the guide briefs (Section 12.3).

### Week 2 — The flagship and the tracker

- **Session 4 — Assessment page and runner.** `/attachment-style-quiz/` per Section 10.1–10.2, with the founder-reviewed final question bank loaded as data and Persona A (Fixture 1) plus Fixtures 4 and 7 passing end-to-end. Done when: a complete run is possible on a phone-sized preview with progress restore working.
- **Session 5 — Result experience.** The Section 10.3 result view in full: dimension bars, profile content (founder-reviewed), tracker cross-offer, share link, print stylesheet, Blocks A and D in place. Done when: the Section 16.4 quiz and guardrail acceptance criteria pass for the result view.
- **Session 6 — No-contact tracker.** `/no-contact-tracker/` per Section 11.1: setup, streak view, check-in, slip flow, urge shortcut, data panel, and the server-rendered explainer content. Done when: tracker acceptance criteria (Section 16.4) pass, including the shaming-words grep.
- Founder in parallel: review all four profile write-ups word by word (this is the product's voice at its most exposed); draft Guide 2 using the profile data.

### Week 3 — Decision tool, email, and content

- **Session 7 — Decision tool.** `/should-i-text-my-ex/` per Section 11.2: five-step flow, draft check with Block E, three outcomes, urge timer, unsent vault (local). Done when: decision acceptance criteria pass, including the no-network-payload Playwright assertion.
- **Session 8 — Profile pages and attachment hub.** `/attachment-styles/` plus the four profile pages (Section 6), reusing profile data extended with long-form content, each with quiz and methodology links and FAQ schema. Done when: schema validates and no page contains a Section 14.2 prohibited term.
- **Session 9 — Email flows.** API route, provider integration, result email (Section 13.2), consent separation (Section 13.1), footer signup, tracker reminder opt-in plumbing (sending configured in the provider), welcome-sequence templates loaded from `content/emails/`. Done when: the Section 16.4 email acceptance criteria pass on a preview with a real inbox, including the no-subscription-on-transactional-send check.
- **Session 10 — Homepage, guides, and resources.** Homepage hub per Section 6; guide template plus all Section 12.3 launch content published (founder-reviewed); situational template proven on both instances; `/recommended-resources/` built with all slots disabled; `FounderNote` component defined and unused (Section 12.5). Done when: internal-linking rules (Section 6) verify — no orphan routes.
- Founder in parallel: apply to the affiliate programmes in Section 13.4 he wants live first (approval timelines are outside the build's control — another reason slots ship disabled); write the About page facts.

### Week 4 — Compliance, SEO hardening, QA, and launch

- **Session 11 — Legal and trust pages.** Privacy, Terms, Affiliate Disclosure, About, Contact, Methodology, and Crisis Resources per Section 14, with Blocks A–E verified in place wherever specified, and international crisis entries verified by the founder against provider pages before publication. Done when: the guardrail acceptance sweep (Section 16.4) is fully green.
- **Session 12 — SEO infrastructure.** Metadata audit against Section 12.2, all JSON-LD, sitemap/robots, OG images, 404 page, redirect rules. Founder task in this session: pull the five unverified keyword strings (Section 3.1) in a paid tool session and record the results in the repo's planning notes for month two. Done when: SEO acceptance criteria pass.
- **Session 13 — Analytics and full QA.** All Section 16.1 events firing, the analytics-privacy payload inspection executed, axe pass, Lighthouse runs against Section 16.3 on all three tools, Playwright smoke suite green, and the full Section 16.4 checklist executed and recorded in the repo as `QA.md`.
- **Session 14 — Production launch.** Verify the HeartFixed / heartfixed.com config values and the fixedheart.com redirect, then run the Section 17.5 launch sequence on `heartfixed.com`. Done when: the launch checklist in Section 19.1 is fully ticked on the live domain.

### Session prompt pattern

Start each session with: "Read the HeartFixed build spec, Section(s) [X]. Implement Session [N]: [name]. Follow the rules in Section 1. Show me the test results and a preview before marking it done." End each session by updating the repo's `BUILD-LOG.md` with what shipped, what was cut or deferred, and any spec ambiguity encountered — ambiguities are resolved using the spec's stated defaults, and logged, rather than escalated as questions.

---

## 19. Launch checklist, defaults, and risks

### 19.1 Launch checklist (every item required before the site is announced anywhere)

- [ ] No `{{` placeholder token remains anywhere in the production build (grep); brand and domain resolve from `config/site.ts` only
- [ ] All Section 6 routes live on https://heartfixed.com with correct redirects (www → apex, http → https; fixedheart.com 301-redirecting every path to heartfixed.com)
- [ ] All Section 16.2 fixtures and the full test suite green on the production build
- [ ] Lighthouse budgets (Section 16.3) met on all three tool pages; axe: zero critical issues
- [ ] Blocks A–E (Section 14.3) verified in every specified location; footer crisis line on every page (spot-check one page of each type plus the 404)
- [ ] Prohibited-terms sweep (Section 14.2) clean outside legal-page explanatory context; "get her back" language appears nowhere in the site's own voice
- [ ] Full quiz completable with the complete result visible and no email entered; tracker fully usable with no email; decision tool fully usable with no email
- [ ] Result email tested end-to-end from production into a real inbox, figures matching the on-screen result; transactional send created no list subscription; unsubscribe verified on the list
- [ ] Analytics payload inspection (Section 16.4) re-run on production: no answers, notes, draft text, or email addresses in any event
- [ ] Privacy, Terms, Disclosure, About, Contact, Methodology, Crisis Resources pages published and linked from the footer; crisis page's international entries verified during Session 11
- [ ] Sitemap submitted in Search Console; GA4 receiving the Section 16.1 events
- [ ] All affiliate slots confirmed disabled, or — for any the founder has been approved for — enabled via config only, with the Section 14.5 disclosure rendering above each and no vendor payout figure anywhere public
- [ ] Favicon, OG images, and 404 page in place; share links, print views, and the urge timer tested from a phone

### 19.2 Decisions with defaults (Claude Code uses the default; founder may override in config)

| Decision | Default in this spec |
|---|---|
| Brand name and domain | Settled — HeartFixed on heartfixed.com; fixedheart.com redirects to it (Section 1.3) |
| Hosting | Vercel |
| Email provider | Resend, behind the `lib/email/` interface |
| Analytics | GA4 + Search Console |
| Contact email and mailing address | Founder supplies before Session 11; build proceeds with config placeholders until then |
| Question bank final wording | Founder-reviewed before Session 4 loads it; engine work is never blocked on it |
| Goal lengths for the tracker | 30 days default; 60 and 90 offered |
| Affiliate programmes at launch | None active; slots ship disabled and are enabled per programme after approval, outside this build |
| Phase 2 price (when gated in) | $59 one-off, within the locked $49–79 band; founder confirms at Phase 2 launch |
| Founder presence | None at launch; `FounderNote` exists for a later content decision |

### 19.3 Risks the build plan already accounts for

- **Scoring credibility is the existential risk.** A quiz that feels arbitrary — or that a screenshot shows contradicting itself — destroys trust and any affiliate relationship. Mitigation: the single engine, dimensional model, hand-verified fixtures, and the rule that no session merges with red tests.
- **The head term will not rank at launch — by design.** The launch targets are the quiz cluster's long tail and the situational pages (Sections 3, 12). Judge month one on tools live and correct, pages indexed, first long-tail impressions, and completion/email rates — not on "attachment style quiz" position or revenue.
- **The men's-behaviour gap is already being entered** (Section 3.3). The defence is depth and speed: a better bank of questions, the tracker and decision tool the entrant does not have, and situational pages shipped in month two without pause.
- **Guardrail drift is the strategic risk.** Every later temptation — paywall the full report "like competitors do", add a friendly chat "just for engagement", let the programme run indefinitely "for retention" — converts this business into the category the validation rejected, with its law, costs, and hours. Sections 14–15 exist so those decisions are already made, in writing, before the temptation arrives.
- **Sensitive-data shame risk.** This audience's data is the kind people most fear leaking. The local-first architecture, the no-sensitive-analytics rule, and Block E's promise are the mitigation; a single analytics payload containing draft text would break the promise and the brand, which is why it is a tested acceptance criterion rather than a policy hope.
- **Email deliverability** can silently fail without SPF/DKIM/DMARC (Section 17.3); the Week 4 end-to-end inbox tests exist for this reason.
- **Founder review is the schedule risk**, not code. Profile copy, the question bank, and the guides need the founder's niche judgement; the session plan puts those reviews in parallel, early, so Claude Code is never idle waiting for them.

### 19.4 What success looks like at day 30

A live site on heartfixed.com with the best behaviour-framed attachment assessment for men on the web — dimensional, free in full, and honest about what it is; a no-contact tracker men actually keep open in a phone tab; a decision tool that can plausibly stop a 1am text; six pieces of content feeding the tools instead of competing with summaries; an email list growing from all three tools with consent handled cleanly; affiliate infrastructure ready to switch on programme by programme; and guardrails built in rather than bolted on. Expected running cost: under roughly $25/month. Maintenance after the build month, on the validation's estimate for this concept: roughly 2–5 hours a week — content refresh, one situational page at a time, email care, and affiliate-link checks. And from week five onward, analytics that can answer the only question that matters next — which tool, which search term, and which profile earned the subscriber — so month two is spent expanding what is already working, and Phase 2, when its gate is met, launches to a list that already trusts the tools.

---

*End of spec. Companion research: the validation report (keyword, SERP, affiliate, middle-path, and regulatory findings dated 29–30 October 2026) is the evidence base for Sections 3, 13, and 15; where this spec and that research differ on scope, this spec governs — the MVP is the tools site, and the finite AI-assisted programme is Phase 2, gated by Section 15.1.*
