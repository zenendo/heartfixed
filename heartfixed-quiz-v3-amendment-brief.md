# HeartFixed: Quiz v3 amendment brief ("How it ended")

Status: FOUNDER-APPROVED content, Nov 3, 2026. Zen approved the full copy draft in chat ("I approve it all"). The approved copy lives in `heartfixed-how-it-ended-copy-draft.md`, which is the content source for this brief; this brief is the build instruction. It amends the Nov 2 quiz build brief as amended by the v2 amendment brief (cuts and dynamic pronouns, both live). Where documents disagree, this brief wins. Working rule, as before: deltas against the live codebase, live wording is the base, do not improvise content, flag gaps instead.

Build shape: one session. No scoring changes anywhere in this brief.

---

## 1. What is being added

A block of five unscored, single-choice questions about how the breakup happened (IDs b1 to b5), and a new result segment, "How it ended, read plainly," assembled from the answers. The full question wording and every block of segment copy are in the approved copy draft; implement them verbatim (subject to pronoun templating, §3).

## 2. The questions

- Placement: after the since-the-breakup selectors and before the 2 context questions. Progress label for the block: "How it ended: N of 5".
- Intro line (from the copy draft): "A few questions about the ending itself. These do not change your scores; they change how the result explains what happened."
- Single tap advances, same interaction pattern as the selectors. The answers are stored with the in-progress attempt and the finished result, in the same place the selector and context answers live.
- The five questions and their four options each are in the copy draft (§ "The questions"). Option order is as written there.

## 3. Pronoun templating

Every partner reference in the five stems and in all segment copy templates through the v2 pronoun sets, exactly like the existing content. The copy draft is written in the canonical she/her rendering. Agreement tokens apply where a templated subject carries a verb. The taker stays first or second person throughout this content, as written.

## 4. The result segment

- Position: in Act 1, immediately after the dynamic read and before the "Since the breakup" decodes section.
- Heading: "How it ended, read plainly". Intro line as written in the copy draft.
- Assembly order is fixed: arrival read (b2) → initiator block (b1) → delivery note (b3) → reason line (b4) → trigger block (b5) → fit line (if a condition in §5 matches) → closing caution (always).
- All block texts are verbatim from the copy draft. If a block cannot be templated cleanly for a pronoun set, flag it in the PR rather than rewriting its meaning.

## 5. Fit lines

At most one fit line shows. Conditions, in priority order (first match wins):

1. Her experienced pattern is avoidant, and b2 is "weeks of distance" or "blindsided" → the avoidant fit line.
2. Her experienced pattern is fearful, and (b2 is "repeated breakups" or b5 is "on-off round") → the fearful fit line.
3. The dynamic is the anxious-avoidant pairing, and (b2 is "one specific argument or event" or b5 is "big fight") → the explosion fit line.
4. Her experienced pattern is anxious, and b1 is "she ended it" → the anxious fit line.

"Her experienced pattern" means the existing four-pattern classification of her module scores, same as the reads use.

## 6. Email, sharing, analytics, privacy

- Result email: after the dynamic summary, add a short "How it ended" part containing the arrival read and the fit line (if one fired), rendered with the same pronoun context. Nothing else from the segment goes in the email.
- Share links: unchanged. Nothing from the b block travels in a link.
- Analytics: the b answers never leave the browser as data, and no analytics event carries them as a key or a value, consistent with the selector rules. A completion flag is fine if the existing flow already uses one.
- Email request data: the b selections may travel with the send request as enum values (like the pronoun choices) solely so the server can render the email, and are not stored. Check the privacy policy's Email section: if its current wording does not cover selections of this kind, draft the additional sentence in the PR for founder approval, following the PR #20 pattern, and do not present it as final until approved.

## 7. Counts and version

- Counted questions rise from 38 to 43 (18 + 12 + 6 selectors + 5 ending + 2 context), matching the existing convention that every answered question counts. Update every surface that states the count: homepage quiz card, quiz landing copy, methodology page, FAQ and guide citations, and the share image.
- Meta description: replace with this exact text (135 characters, inside the 155 cap): "A free attachment style quiz for men: 43 questions about what you did, what your ex did, and how it ended. Full result free, no signup."
- Quiz version: the flow gains five screens mid-journey, so apply the codebase's existing versioning rule for flow-shape changes (the men-v2 precedent): in-progress attempts saved before this change are not resumed, and saved results behave as they did for the v2 bump. Report the version decision in the PR summary.
- The em dash test's scope extends to the new content: the new copy contains no em dashes, and a test should fail if one appears in it.

## 8. Acceptance

- All existing fixtures still land exactly (Personas A to D and her H1/H2), and scores are provably unchanged by the b answers: run one persona twice with different b answers and show identical scores and profile.
- Assembly tests: each b option renders its own block; the four fit conditions fire and suppress correctly, including the priority rule when two conditions match; the closing caution always renders.
- Render the segment under at least three pronoun combinations, including a They/Them partner, and check agreement by reading the output.
- Email test: the email contains the arrival read and fit line for a fixture result, in HTML and text.
- Full unit and browser suites pass. PR summary lists: files changed, test counts, the version decision, the privacy wording status, and anything flagged.
