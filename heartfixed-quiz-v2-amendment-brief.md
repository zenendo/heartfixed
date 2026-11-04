# HeartFixed: Quiz v2 amendment brief (cuts and dynamic pronouns)

Status: FOUNDER-DECIDED, Nov 3, 2026. Zen approved both changes from his quiz feedback: cutting questions from the main bank, and full dynamic pronouns (the taker's pronouns and the partner's pronouns asked up front, with all questions and write-ups adapting). Analysis source: `heartfixed-quiz-feedback-workup.md`. This brief amends the founder-approved Nov 2, 2026 quiz build brief (`heartfixed-quiz-build-brief.md`). Where this brief and the earlier brief disagree, this brief wins. Everything not mentioned here stays exactly as built.

Working rule, same as before: these are deltas against the live codebase content, not a retype from old documents. Where live copy has moved on since Nov 2 (for example "label" replacing a banned word in the caveat block), the live wording is the base. Do not improvise content beyond this brief; flag gaps instead.

Build shape: two sessions. Session A: bank, scoring, fixtures, and count copy (Part 1). Session B: pronoun engine and templating (Part 2). Session A ships and verifies on its own; Session B builds on it.

---

# Part 1: The shorter bank (Session A)

## 1.1 The cuts

Cut six items from his 24, three per dimension, leaving 18 (nine anxiety, nine avoidance):

- Anxiety: **q11** (changed plans to chase her; near-duplicate trigger with q09), **q17** (stayed awake checking phone; third phone-checking item), **q21** (jealousy about a male friend; weakest item, and its gendered trigger disappears with it, which Part 2 would otherwise have had to rewrite).
- Avoidance: **q04** (found a reason for her to go home; narrowest scenario in the bank), **q10** (vague orientation stem, also flagged in the audit), **q24** (nearest mirror of q14; already the lowest-weight item).

Nothing else is cut. Her 12, the 6 selectors, the 2 context questions, and the attention check all stay. Counted questions drop from 44 to **38** (18 + 12 + 6 + 2). The attention check still sits unnumbered inside his section; keep it at a similar relative position (after roughly the first third of his items) and keep its behaviour unchanged.

Accepted losses, recorded so they are not relitigated mid-build: cutting q17 removes the strongest severity marker in the anxiety set; cutting q11 removes the low-cost versus high-cost chasing distinction; cutting q04 removes the only in-person physical avoidance item.

## 1.2 Weights and scoring

Cutting q24 removes one of the two 0.5-weight reversed anchors. To keep the dimensions symmetric, **the 0.5 weight moves to q20** (the remaining reversed avoidance item). Final v2 weights:

- Anxiety: q23 (reversed) at 0.5; the other eight items at 1.
- Avoidance: q20 (reversed) at 0.5; the other eight items at 1.
- **Max raw per dimension: 34** (eight items at up to 4 points, plus one anchor at up to 2).
- Bands unchanged: normalise raw / 34 × 100, rounded; low 0 to 33, moderate 34 to 66, high 67 to 100. Profile classification per spec §9.4, unchanged.
- Her module unchanged: weights all 1, max raw 24 per dimension, same bands.

## 1.3 Rewordings (from the answer-fit audit)

Apply these stem edits exactly. None changes an item's dimension, reversed status, or weight.

His items:

- **q07:** "In the days immediately after our breakup, I kept checking her social media accounts." (Removes the baked-in "multiple times a day".)
- **q08:** "When our relationship started to feel serious, I found reasons in her flaws to pull back." (Single behaviour; tied to this relationship.)
- **q13:** "When she wouldn't say what had hurt her, I apologized for things I only guessed she was upset about." (Removes the double barrel.)
- **q16:** "When she wanted to meet my friends or family, I put it off." (Removes "again and again".)
- **q18:** "When things were going well, I looked for ways to get away from her." (Behaviour only; drops the bored-and-trapped feelings.)
- **q22:** "After our breakup, I told myself I felt nothing about it." (Single behaviour; tied to this breakup.)

Her items:

- **h4:** "After an argument, she went quiet instead of talking through what happened."
- **h5:** "She asked whether I still loved her or whether we were okay." (One word deleted.)
- **h12:** "When I asked about her friends, plans, or feelings, she kept them to herself."

Selectors:

- **a1:** "Since the breakup, there have been long stretches with no messages or check-ins from her."
- **a3:** "Since the breakup, I have seen her out with friends or posting as if she has already moved on."
- **a5:** "Since the breakup, she has kept contact going in small ways, such as liking my posts or watching my stories."
- **a6:** "Since the breakup, she has expressed missing me or regret about how things ended."

The stems above are written in the canonical she/her rendering. In Session B they become templates (Part 2); Session A lands them as plain text exactly as written here.

## 1.4 V2 fixtures (hand-computed, then machine-checked twice)

Verify all four end to end like Fixture 1 was verified in Session 4. Answer vectors list every kept item.

**Persona A (anxious).** Anxiety answers: q01 2, q03 4, q05 3, q07 4, q09 2, q13 2, q15 2, q19(R) 1, q23(R) 0. Raw: 2+4+3+4+2+2+2+3+2 = 24.0 / 34 → **71 (high)**. Avoidance answers: q02 0, q06 0, q08 1, q12 1, q14 1, q16 0, q18 0, q20(R) 3, q22 1. Raw: 0+0+1+1+1+0+0+0.5+1 = 4.5 / 34 → **13 (low)**. Expected profile: **anxious**.

**Persona B (avoidant; the mirror of A, every answer 4 minus Persona A's).** Anxiety: q01 2, q03 0, q05 1, q07 0, q09 2, q13 2, q15 2, q19(R) 3, q23(R) 4. Raw 10.0 / 34 → **29 (low)**. Avoidance: q02 4, q06 4, q08 3, q12 3, q14 3, q16 4, q18 4, q20(R) 1, q22 3. Raw 29.5 / 34 → **87 (high)**. Expected profile: **avoidant**.

**Persona C (fearful-avoidant; every non-reversed item 3, every reversed item 0).** Anxiety raw 27.0 / 34 → **79 (high)**. Avoidance raw 26.0 / 34 → **76 (high)**. Expected profile: **fearful-avoidant**.

**Persona D (secure; every non-reversed item 1, every reversed item 4).** Anxiety raw 7.0 / 34 → **21 (low)**. Avoidance raw 8.0 / 34 → **24 (low)**. Expected profile: **secure**.

Her fixtures are unchanged from the Nov 2 brief (H1: her-avoidance 83, her-anxiety 13, avoidant as experienced; H2: her-anxiety 88, her-avoidance 13, anxious as experienced) and must still verify.

## 1.5 Count-dependent copy

Every surface that states the old count moves from 44 to 38, including: the homepage quiz card, the quiz landing copy, the methodology page, and any FAQ or guide copy that cites the count. Progress labels inside the quiz: his section now reads "Question N of 18"; the partner section label becomes "About your ex: N of 12" (the old "About her" label is retired in Session B at the latest; Session A may do it now since the wording is decided here).

Meta description: replace with this exact text (148 characters, inside the 155 cap):
"A free attachment style quiz for men: 38 questions about what you did, and what your ex did, in your last relationship. Full result free, no signup."
Note it drops the old "what she did" phrasing and contains no em dash; see Part 2, §2.6 for the standing no-em-dash rule.

Session A acceptance: all four v2 fixtures and both her fixtures land exactly; full unit and browser suites pass; the count is consistent everywhere it appears; no other content changed.

---

# Part 2: Dynamic pronouns (Session B)

## 2.1 The two questions

Before the framing line and question 1, the quiz asks two single-tap questions on their own screens. They are not counted in the 38 and show no progress numbering.

Intro line at the top of the first screen: "Two quick questions so the quiz talks about the right people."

- Screen 1: **"Your pronouns"** with options **He/Him**, **She/Her**, **They/Them**.
- Screen 2: **"Your ex's pronouns"** with the same three options.

Both are required (one tap each advances). The selections are stored with the in-browser result state, the same place answers live. Nothing about them is sent anywhere except as described in §2.5.

## 2.2 Pronoun token sets

All quiz and result content renders through a pronoun context with two token sets, one for the taker (t) and one for the partner (p):

| Token | He/Him | She/Her | They/Them |
|---|---|---|---|
| subject | he | she | they |
| object | him | her | them |
| possessive adjective | his | her | their |
| possessive pronoun | his | hers | theirs |
| reflexive | himself | herself | themselves |
| was/were | was | was | were |
| has/have | has | has | have |
| is/are | is | is | are |
| does/do | does | does | do |

Verb agreement is the known trap: singular "they" takes plural verb forms. Any sentence whose verb agrees with a templated subject must use the agreement tokens rather than a hard-coded verb. Where a live sentence cannot be templated cleanly with these tokens, flag it in the PR for founder review instead of silently rewriting its meaning.

Capitalisation: headline forms capitalise the possessive ("His pattern, as you experienced it", "Her pattern...", "Their pattern...").

## 2.3 What gets templated

- **His 18 stems:** partner references only (they are first person; the taker has no pronouns in stems). Example, q09 canonical: "When she went quiet and pulled away, I chased her with texts to see if everything was okay" becomes, for a He/Him partner, "When he went quiet and pulled away, I chased him with texts...", and for They/Them, "When they went quiet and pulled away, I chased them with texts...".
- **Partner module framing line:** "Now think about {p-object} in the same relationship: how {p-subject} showed up, as you experienced it." The module's headline concept is "your ex's pattern, as you experienced it"; the old "her pattern" phrasing is retired everywhere in quiz flow.
- **Her 12 stems:** partner subject and object forms throughout; the taker stays "I" and "me".
- **Selectors a1 to a6:** partner forms throughout. The fallback line when no selector reaches 2 becomes: "Nothing your ex has done since the breakup changes the read below. And that is information too." (Neutral by construction, so no agreement problem.)
- **Result narrative:** her four reads become the partner reads, the six dynamics, the six decodes, and the Act 3 bridges all render with both token sets. His four profiles render with taker tokens wherever they use third person (notably the "After a breakup" and "No-contact risk" passages); second-person passages stay second person.
- **Gendered nouns:** replace per referent using this mapping: man → man / woman / person; men → men / women / people; woman → woman / man / person; women → women / men / people. Known instances in the approved narrative (find every one in the live content files; this list is a starting set, not a guarantee of completeness): "the next man who gets close enough" (partner referent), "that wasn't two different women" (partner referent), "keeps men hooked" in the a5 decode (taker-side referent: men who take the quiz; under full templating use the taker's noun), "a man with his pattern" in the Act 3 framing (taker referent), "aimed at a woman who's no longer there" (partner referent).
- **Caveat block:** keep the live wording and structure; template the partner references only.

## 2.4 What does not change

- Site framing stays men-first: the homepage, hub pages, guides, and the /attachment-styles/ pages are not retemplated and keep their current voice. The only site-wide copy changes are the Part 1 count updates. (Neutral framing site-wide was considered and explicitly not chosen; it is a separate business decision.)
- The static /attachment-styles/ profile pages are not per-taker and do not template. Only the quiz result view (which draws on the same profile source) renders with the visitor's selections. If the shared profile source makes this separation awkward, flag it; do not template the public pages.
- Scoring, bands, fixtures, privacy properties: answers and pronoun selections never leave the browser during the quiz; analytics events unchanged.

## 2.5 Email and sharing

- **Result email:** the email includes the partner read and the dynamic summary, so it renders with the same pronoun context. The selections travel with the send request as data (two enum values, nothing else), are used to render, and are not stored, matching the current no-persistence design. HTML and plain text versions both template.
- **Share links:** pronoun selections do **not** travel in share links. The link payload stays exactly as today (his profile and his two scores only). The shared view renders the second-person profile description and the scores; any third-person profile lines shown in the shared view render with neutral They/Them forms. This preserves the existing rule that nothing about the partner travels in a link.

## 2.6 Standing writing rule: no em dashes

Founder rule, Nov 3, 2026: no em dashes in HeartFixed writing, ever. Session B includes a sweep of all quiz-flow and result content (stems, reads, decodes, dynamics, bridges, profiles, caveat, fallback lines, email templates) replacing em dashes with commas, periods, or colons as the sentence requires. Mechanical replacements only; if a sentence needs real rewriting to survive the change, flag it in the PR. A test should fail if an em dash character appears in these content files, the same way the banned-terms sweeps work.

## 2.7 Testing (Session B acceptance)

- Render one full result (Persona A answers with H1 partner answers) under all **nine** taker-by-partner pronoun combinations and verify by test and by eye: no leftover "she" or "her" when the partner is He/Him or They/Them, no agreement errors of the "they was" kind, headlines capitalised correctly.
- Parity tests in the style of the existing pronoun sweeps: content rendered for a She/Her partner contains no masculine partner forms, and vice versa; the They/Them render contains no gendered partner forms and no singular-agreement verbs in templated sentences.
- The result email renders correctly in at least three combinations: (He/Him taker, She/Her partner), (He/Him, He/Him), (She/Her, They/Them). Check both HTML and text.
- Full unit and browser suites pass; the four fixtures from Part 1 still land exactly under the default rendering path.

---

# Part 3: Sequence and handoff notes

1. Session A first (Part 1), verified against §1.4 fixtures, merged before Session B starts. Do not stack Session B on an unverified Session A merge.
2. Session B (Part 2) second, with §2.7 as its acceptance bar.
3. After both merge: founder live-checks the quiz under two pronoun combinations (including one They/Them partner) and one result email, the same live-test pattern used for the email launch.
4. Out of scope for v2, do not build: a selector-specific answer set; graphics and visual presentation upgrades (founder has deferred these explicitly); site-wide neutral framing; anything in the welcome email sequence or the tracker.
