# HeartFixed — Quiz build brief (Sessions 4–5)

Status: FOUNDER-APPROVED content, 2026-11-02. This file is the single content source for Sessions 4 and 5.
It implements the build spec (`relationship-tools-build-spec.md`, especially §9 scoring, §10 flagship, §14 language rules, §16 fixtures, §18 sessions). Where the spec left content open, this brief is the decision. Do not improvise content beyond it; flag gaps instead.

Contents: Part A — Session 4 data (his 24, her 12, selectors, fixtures). Part B — Session 5 result content (page structure, his profiles, her reads, decodes, dynamics, bridges). Part C — build notes.

---

# Part A — Question data

## Framing and scale

- Instruction line shown before question 1: **"Answer thinking about your most recent relationship."**
- Both modules describe the SAME relationship. Result copy always says "your pattern **in this relationship**" — never a fixed trait label.
- Scale for every scored item: Never like me (0), Rarely (1), Sometimes (2), Often (3), Almost always like me (4). Reversed items score as 4 − value.
- Flow order: his 24 (progress shown as "Question N of 24") → her 12 (separate progress label, e.g. "About her — N of 12") → the 6 since-the-breakup selectors → the 2 context questions last.
- Attention check: inserted at runner position 13 within his 24, shown UNNUMBERED (not counted in "Question N of 24"): "To show you're reading, choose 'Rarely' for this one." Failing it never blocks results; it only flags the completion for exclusion from future aggregate analysis and is never mentioned to the visitor.
- Context questions (last, labelled as not changing scores): (1) time since the breakup; (2) whether he is currently in no contact. They select supporting copy only, never scores.

## His 24 (men-v1 final)

Weights: q23 and q24 are 0.5; all others 1. Max raw per dimension = 46. Bands (after normalising raw/46 × 100, rounded): low 0–33, moderate 34–66, high 67–100. Profile per spec §9.4.

| ID | Dim | Rev | Wt | Stem |
|----|-----|-----|----|------|
| q01 | anxiety | no | 1 | When she took a while to reply, I checked my phone regularly instead of focusing on my own life. |
| q02 | avoidance | no | 1 | When she asked to talk about our relationship, I avoided the conversation instead of being present. |
| q03 | anxiety | no | 1 | After an argument, I sent several messages in a row to try to fix things that same day. |
| q04 | avoidance | no | 1 | When she wanted to stay the night, I found a reason for her to go home. |
| q05 | anxiety | no | 1 | When she said she needed space, I texted her anyway to check if we were okay. |
| q06 | avoidance | no | 1 | When she told me how she felt about me, I changed the subject or made a joke of it. |
| q07 | anxiety | no | 1 | In the days immediately after our breakup, I checked her social media accounts multiple times a day. |
| q08 | avoidance | no | 1 | When a relationship started to feel serious, I found myself noticing her flaws more and pulling back. |
| q09 | anxiety | no | 1 | When she went quiet and pulled away, I chased her with texts to see if everything was okay. |
| q10 | avoidance | no | 1 | When she reached out for my attention, I spent more time focusing on my own life. |
| q11 | anxiety | no | 1 | When she pulled away, I changed my plans to chase her. |
| q12 | avoidance | no | 1 | After an argument, I went quiet for days rather than talk through what happened. |
| q13 | anxiety | no | 1 | When she wouldn't say what had hurt her, I tried to figure it out on my own and apologized for what I guessed she was upset about. |
| q14 | avoidance | no | 1 | When something was bothering me, I kept it to myself rather than tell her. |
| q15 | anxiety | no | 1 | When I felt insecure about our relationship, I asked her for reassurance. |
| q16 | avoidance | no | 1 | When she wanted to meet my friends or family, I put it off again and again. |
| q17 | anxiety | no | 1 | If she hadn't replied by the time I was supposed to sleep, I stayed awake checking my phone for a reply. |
| q18 | avoidance | no | 1 | When things were going well, I felt bored and trapped, and tried to get away from her. |
| q19 | anxiety | yes | 1 | When she took a full day to reply, I was able to go about my day and focus on my own life without checking my phone. |
| q20 | avoidance | yes | 1 | When she made bids to connect with me, I stayed present and talked with her even when it felt uncomfortable. |
| q21 | anxiety | no | 1 | When she spent time with a male friend, I felt suspicious and worried. |
| q22 | avoidance | no | 1 | After a breakup, I told myself I felt nothing and moved on without looking back. |
| q23 | anxiety | yes | 0.5 | After an argument, I waited until we were both calm before I brought it up again. |
| q24 | avoidance | yes | 0.5 | When I was upset, I told her plainly what was bothering me instead of keeping it to myself and working through it alone. |

### Fixture 1 — Persona A (spec §10.4 / §16.2; must verify end-to-end)

Answers: q01 2, q03 4, q05 3, q07 4, q09 2, q11 2, q13 2, q15 2, q17 4, q19(R) 1, q21 3, q23(R) 0 → anxiety raw 33.0 / 46 → **72 (high)**.
q02 0, q04 1, q06 0, q08 1, q10 1, q12 1, q14 1, q16 0, q18 0, q20(R) 3, q22 1, q24(R) 1 → avoidance raw 8.5 / 46 → **18 (low)**.
Expected profile: **anxious**.

## Her 12 (perceived pattern module)

Framing: the pattern he **experienced from her** in the same relationship — never a diagnosis of her (see caveat block, Part B). Same 0–4 scale. No reversed items, all weights 1. Per-dimension raw 0–24, normalised raw/24 × 100 (rounded), same bands (low 0–33, moderate 34–66, high 67–100). Her experienced pattern uses the same four-pattern naming as his, always qualified "as you experienced her."

| ID | Dim | Stem |
|----|-----|------|
| h1 | her-anxiety | When I didn't reply for a few hours, she sent several messages or called until I answered. |
| h2 | her-avoidance | When I tried to talk about our relationship, she changed the subject or shut down. |
| h3 | her-anxiety | When I needed time alone, she kept pushing to talk until I gave in. |
| h4 | her-avoidance | After an argument, she went quiet for a period of time rather than trying to talk through it and resolve it right away. |
| h5 | her-anxiety | She often asked whether I still loved her or whether we were okay. |
| h6 | her-avoidance | When I was upset or needed support, she became uncomfortable or distant. |
| h7 | her-anxiety | When I spent time with friends without her, she checked up on me or got nervous. |
| h8 | her-avoidance | When I tried to get her to talk to me about something, she pulled back or said she needed space. |
| h9 | her-anxiety | When I pulled away or seemed distant, she tried harder to get close — more messages, more affection, more plans. |
| h10 | her-avoidance | When our relationship started to feel serious, she found faults in me or reasons it wouldn't work. |
| h11 | her-anxiety | When we argued, she needed to settle it right away, even if it was late at night. |
| h12 | her-avoidance | She kept parts of her life separate from me — friends, plans, or feelings she didn't share. |

### Her-module fixtures (hand-computed; verify like Fixture 1)

- **H1 (avoidant as experienced):** h2 4, h4 3, h6 4, h8 3, h10 4, h12 2 → her-avoidance raw 20/24 → **83 (high)**. h1 0, h3 1, h5 0, h7 1, h9 0, h11 1 → her-anxiety raw 3/24 → **13 (low)**. Expected: **avoidant**.
- **H2 (anxious as experienced):** h1 4, h3 4, h5 3, h7 3, h9 4, h11 3 → her-anxiety raw 21/24 → **88 (high)**. h2 1, h4 0, h6 1, h8 0, h10 1, h12 0 → her-avoidance raw 3/24 → **13 (low)**. Expected: **anxious**.

## Since-the-breakup selectors (unscored)

Same 0–4 scale, presented as "Since the breakup…". An a-item answered Sometimes (2) or higher selects its decode section on the result page (Part B). If none reach 2, the result shows: "Nothing she's done since the breakup changes the read below — and that's information too."

| ID | Stem |
|----|------|
| a1 | Since the breakup, she has gone completely silent — no messages, no check-ins, nothing. |
| a2 | Since the breakup, she has reached out at odd moments — a random meme, a "hey" — then gone quiet again. |
| a3 | From what I can see, she acts like she has already moved on — out with friends, posting, unbothered. |
| a4 | Since the breakup, she has contacted me when she's been drinking or late at night. |
| a5 | Since the breakup, she has kept a thread of contact going — liking posts, watching every story, small signals. |
| a6 | Since the breakup, she has said or hinted that she misses me or regrets how things ended. |

---

# Part B — Result page content (Session 5)

## Page structure

1. **Headline:** his profile + both scores; spec Block A disclaimer directly beneath (per §14.3).
2. **Act 1 — Why it happened:** her experienced-pattern read (caveat block at its top), then the dynamic read for his × her pairing.
3. **Act 2 — Your pattern in this relationship:** his profile content (below).
4. **Since the breakup:** the decode sections selected by a1–a6 (or the single fallback line).
5. **Act 3 — Getting over her, with your pattern:** bridge copy keyed to his profile, then tool next-steps and email capture (existing Session 5/9 behaviour).
- **Sharing rule:** shareable result links carry ONLY his profile and his two scores (spec §9). Her read, the decodes, and the dynamic never travel in a shared link — they exist only in the on-page view and the result email.

### Caveat block (top of her read, verbatim)

> **A note on this read.** It's built from your answers about her behaviour, so it's the pattern *you experienced* — it can't diagnose her. Only she could describe her own pattern, and people under breakup stress don't always act the way they did inside the relationship. Use it to understand what you lived through, not to label her.

## His profiles (Act 2)

### Secure
- **Description:** Your pattern is steady. You tend to trust that closeness and space can both exist in a relationship, and you usually say what you need without chasing or shutting down. That does not mean breakups do not hurt you — they do — but you are more likely to look at what happened honestly, keep your daily life going, and let feelings pass without turning every bad day into proof that something is wrong with you. Under stress you may still check for news about her or want one more talk, and that is normal, not a failure of the pattern. Your work after a breakup is mostly about grief and patience: feeling it, keeping your boundaries, and not rushing into a new relationship to skip the hard part.
- **Lean paragraphs:** if one dimension is moderate, add a lean paragraph naming that dimension's watch-outs ("Broadly secure, with an anxious lean — under breakup stress, the pattern below is the one to watch."); if both moderate, a mixed-lean paragraph covering both watch-out sets.
- **After a breakup:** Grief comes in waves rather than as a constant alarm. He can usually name what he misses, keep routines going, and talk to friends without turning every conversation into a case for getting back together.
- **No-contact risk:** Lower than the other profiles, but not zero. The risk window is a bad day or a lonely evening — one message sent to "check in" that restarts the whole cycle.
- **Watch-outs:** (1) Rushing into someone new to skip grief. (2) Treating a calm week as proof he is "done" and dropping his boundaries early. (3) One "friendly" check-in that reopens contact.
- **Strengths:** (1) Can name what he feels without acting on every feeling. (2) Keeps daily routines going under stress. (3) Can end contact cleanly and mean it.
- **Next steps:** No-contact tracker; guide "Attachment Styles After a Breakup."

### Anxious
- **Description:** Your pattern is to hold on tight when closeness feels uncertain. When a reply is slow or a partner pulls back, your mind fills the gap fast, and you act on that worry — checking, texting, asking for reassurance, trying to fix things in the same hour. That comes from caring a lot, not from being weak, but it can push the other person further away and leave you exhausted. After a breakup, the same pattern can keep you checking her profiles, replaying talks, and hoping one message will change the outcome. Your work is learning to pause between the urge and the action: notice the spike, wait, and choose a response that protects your own steadiness instead of seeking proof in the moment.
- **After a breakup:** The days are organized around her: checking, rereading old messages, rehearsing what to say, and reading meaning into silence. Relief comes briefly after contact, then the worry returns stronger.
- **No-contact risk:** High. Message-checking and reconciliation fantasies: the urge to text is frequent, and each check feels like it might settle things, when it usually restarts them.
- **Watch-outs:** (1) Checking her profiles or status many times a day. (2) Sending a long message late at night to "get closure." (3) Treating any reply from her as a sign the relationship is back on.
- **Strengths:** (1) Notices his own feelings quickly. (2) Willing to talk honestly when he feels safe. (3) Cares deeply and shows up when it counts.
- **Next steps:** "Should I text my ex?" decision tool; guide "The No Contact Rule."

### Avoidant
- **Description:** Your pattern is to create space when closeness feels like too much. When a partner wants more time, more talk, or more feeling, you may go quiet, get busy, or find a fault that justifies stepping back. That protects your independence, but it can leave the other person feeling shut out and leave you alone with feelings you have not yet faced. After a breakup, you may feel fine at first, then find the grief arriving weeks later, or jump into someone new before you have looked at what ended. Your work is staying with the uncomfortable part a little longer: naming what you feel, answering the hard talk, and letting closeness last long enough to learn from it. That is a skill, not a personality change.
- **After a breakup:** Relief first, then a delayed hit. He may say he is fine, stay busy, and date again quickly — then find the old feelings surfacing weeks later, often aimed at the wrong person.
- **No-contact risk:** Delayed grief and rebound dating. Less a 1 a.m. text, more a slow drift: new dating before the last relationship has been looked at, or contact months later when the delayed feelings arrive.
- **Watch-outs:** (1) Saying "I'm fine" and believing it too early. (2) Starting something new to avoid sitting with the ending. (3) Going quiet instead of answering a hard conversation.
- **Strengths:** (1) Can stay calm under pressure. (2) Values independence and can hold boundaries. (3) Practical about daily life even in a hard week.
- **Next steps:** No-contact tracker; guide "How Long Does a Breakup Take?"

### Fearful-Avoidant
- **Description:** Your pattern pulls in both directions at once. You want closeness, and you fear it. So you may chase reassurance one day and shut down the next, want her back and want space in the same week, or feel sure about a relationship until it gets close and then look for a way out. That swing is exhausting, for you and for the other person, and it can make a breakup feel especially chaotic. After a breakup, the risk is living in the swing: texting, then regretting it, then texting again. Your work is noticing which pull is running the moment — the urge to chase or the urge to withdraw — and choosing one steady action instead of following the swing wherever it goes.
- **After a breakup:** Hot and cold in the same week: a long message, then silence, then regret, then another message. Friends hear two different stories depending on the day.
- **No-contact risk:** Oscillation: chasing and withdrawing in turn, so a streak breaks not from one big decision but from a swing between "I need her" and "I need space."
- **Watch-outs:** (1) Texting, regretting it, then texting again to undo it. (2) Reading a single reply as both proof she cares and proof she does not. (3) Making big relationship decisions on the worst day of the week.
- **Strengths:** (1) Sees both sides of a situation quickly. (2) Can be deeply honest once he slows down. (3) Knows what closeness costs — and what it is worth.
- **Next steps:** "Should I text my ex?" decision tool; guide "Attachment Styles After a Breakup."

## Her reads (Act 1; headline form: "Her pattern, as you experienced it: X")

### Secure (as experienced)
In this relationship, she was steady. She could ask for closeness without games and take space without punishment. Arguments stayed arguments — she said what was wrong, heard his side, and didn't disappear or detonate. When he was upset, she could be near it without flinching or fixing. That steadiness is worth naming plainly, because it changes what the breakup means: this probably wasn't a pattern malfunction. Secure people also end relationships — when the fit is wrong, the timing is wrong, or the life they want isn't this one.
**Means / doesn't mean:** the explanation may not be hiding in her behaviour. It does not mean she didn't care, or that the ending cost her nothing — she likely grieved it too, privately and without spectacle.
**Since the breakup:** clean, kind distance. Little contact, no mixed signals, boundaries that stay where she put them. Her silence isn't a code. It is the decision, being kept.

### Anxious (as experienced)
In this relationship, the connection felt fragile to her, and she worked hard to hold it. Slow replies landed on her like bad news. She needed arguments settled *now*, checked up when he was out, asked whether he still loved her, and when she felt him pull away she reached harder — more messages, more affection, more plans. Underneath the intensity was a fear that the bond was always about to break. Most of that behaviour was panic, not manipulation: when she escalated, she was usually trying to feel safe, the only way her pattern knows how.
**Means / doesn't mean:** the relationship mattered enormously to her — her pattern doesn't fight like that for things it doesn't care about. It does not mean the relationship was working, or that love at that temperature is sustainable. A bond can be real and still be unliveable.
**Since the breakup:** waves. Urges to reach out arrive in spikes — late nights, bad days, a song, a date on the calendar — so contact attempts, profile-checking, and "accidental" run-ins are common early on, followed by shame and retreat. Her silence in a given week doesn't mean she's moved on; her reaching out doesn't mean the relationship should restart. Both are the wave, doing what waves do.

### Avoidant (as experienced)
In this relationship, closeness cost her something. She deflected the big talks, went quiet after arguments instead of resolving them, and pulled back or asked for space when he tried to get her to open up. When things started feeling serious, faults appeared — in him, in the fit, in the timing. His vulnerability made her uncomfortable; parts of her life stayed in compartments he wasn't invited into. Read plainly: when love got close, her pattern reached for distance the way you'd reach for a door.
That distance was regulation, not verdict. In her pattern, a partner's pursuit registers as pressure, and withdrawal registers as keeping the peace. Her shutdowns predated him — they're how she was wired long before this relationship, and she will run the same programme with the next man who gets close enough to trigger it.
**Means / doesn't mean:** it does not mean she felt nothing. This pattern often suppresses first and processes later, in private, on a delay. It also does not mean a calmer, less-needy version of him would have fixed it — the loop needs her wiring to change, and that's work only she can do, on her own timeline, not something a partner can love her into.
**Since the breakup:** relief first. Freedom feels good; the pressure is off; she may seem genuinely fine — because suppression works, for a while. Processing tends to arrive late and quietly. Some people with this pattern do reach out months later, when the pressure is long gone and the feelings finally surface; many never do. Either way: a late message would not mean the pattern has changed. Contact is an event. Change is a track record.

### Fearful-Avoidant (as experienced)
In this relationship, she wanted closeness and feared it, sometimes in the same day. She could pursue him hard — needing the argument settled tonight, needing to know he still loved her — and then panic at the very closeness she'd demanded, and vanish into silence or fault-finding. The relationship felt like weather: warmth you couldn't trust, distance you couldn't predict. That wasn't two different women. It was one pattern with two alarms wired to the same bell — terrified of being left, terrified of being trapped — and almost any move he made rang one of them.
**Means / doesn't mean:** the chaos wasn't a puzzle he failed to solve; consistency is the one thing this pattern cannot produce, no matter who the partner is. It does not mean the hot phases were the "real" relationship and the cold ones an aberration. The intensity was real *and* the instability was real. Intensity is not compatibility.
**Since the breakup:** the swing, continuing without the relationship. A reach-out full of feeling, then regret, then silence, then another reach-out. Each swing will feel like a message about him — it isn't. It's her pattern running its loop in an empty room, and every round of it restarts his own clock.

## Since-the-breakup decodes (shown when that a-item ≥ 2)

### a1 — She has gone completely silent
Total silence is the hardest behaviour to live next to, because it gives the mind nothing to work with — so the mind invents. Here's the plainer read. If her pattern leaned avoidant, silence is regulation plus a decision being kept: distance is how she copes, and she is coping. If her pattern leaned anxious, silence is costing her — it's willpower, collapse, or friends holding her phone — and it still isn't a coded message. Silence has no hidden payload in either pattern. What it means for you: the condition your recovery needs is, for once, being provided. The breakup is real, the channel is closed, and every quiet day is a day your own streak can grow in peace.

### a2 — She reaches out at odd moments, then goes quiet
A meme. A "hey." Then nothing. This is the pressure-release valve of more than one pattern: contact enough to soothe the urge, never enough to restart anything. With an anxious lean, it's a spike of panic followed by embarrassment at having spiked. With an avoidant lean, it's feeling surfacing at the safest possible distance — real feeling, minimal demand. Notice what it never is: an opening to the serious conversation. If she wanted that, she'd be having it. What it means for you: each breadcrumb costs you days of re-living. You don't have to be rude, and you don't have to be available. The "Should I text my ex?" check exists for exactly this moment.

### a3 — She acts like she has already moved on
Her feed is not a window into her heart; it's a broadcast, and broadcasts are edited. Two honest possibilities sit side by side: she may be performing fine — for you, for friends, for herself — or, if her pattern leans avoidant, she may genuinely feel fine right now, because suppression works until it doesn't, usually weeks later and off-camera. Neither version is a scoreboard of the relationship's value, and neither is information you can use. What it means for you: watching her perform recovery while you're doing the real thing is the worst trade on the internet. Mute or unfollow — not as a message to her, but as a decision about what gets into your head before breakfast.

### a4 — She contacts you late at night, or drinking
Night lowers every defence, and alcohol lowers them further. What you get at 1 a.m. is her pattern with the brakes off: feelings that are real and governance that isn't. Anxious patterns spike; avoidant patterns finally feel the thing they've been out-running all day. Believe that she felt something. Do not believe that a 1 a.m. message is a plan — by morning, the brakes are back on, and the retreat usually follows. What it means for you: 1 a.m. honesty is not a foundation, and you are not obliged to be anyone's night-time regulation. Let the decision tool answer the "should I reply" question in daylight.

### a5 — She keeps a thread of contact: likes, story views, small signals
A story view is the cheapest unit of contact in existence: zero risk, zero commitment, and — this is the part that keeps men hooked — zero information. She may be checking compulsively (her anxiety, mirroring your own profile-checking), monitoring at a distance she can afford (her avoidance), or simply scrolling like everyone alive. No pattern turns a view into a verdict, and no frequency of views adds up to one. What it means for you: if a view from her can ruin your afternoon, that's not a sign about her — it's a measurement of how much access she still has to your nervous system. Closing that access is a recovery step, not a punishment.

### a6 — She says she misses you, or regrets how it ended
Take the words at face value — and no further. Missing someone is a feeling, not a plan; regret about how things ended is not the same as the capacity to do them differently. Both can be completely sincere and completely compatible with the relationship still being wrong for both of you. The question that actually protects you isn't "does she feel something?" — she may well — it's "what has changed?" Feelings aren't change. Patterns are only beaten by track records, built slowly, in the open. What it means for you: it's allowed to feel good to hear. You're not a machine, and being missed is not nothing. It just isn't a reason. Let it be a kind moment you didn't build a decision on.

## Dynamic reads (his × her pairing)

Six reads below cover the archetypal pairings. Remaining combinations compose by dimension using the same frames (e.g., a moderate dimension borrows the lean language from his profile rules); Session 5 implements the composition and tests every pairing renders coherently.

### Anxious × Avoidant — the pursue–withdraw loop
This is the classic trap, and if it felt crazy-making, that's because it is engineered to be. His pattern treats distance as danger, so when she went quiet, his alarm fired and he pursued — more texts, more fixing, more closeness. Her pattern treats pursuit as pressure, so the more he chased, the more overwhelmed she felt, and the further she withdrew. Her withdrawal was his alarm's loudest possible input. Each person's way of coping was the other person's trigger, running in a loop neither of them chose and neither could stop from inside it.
Why it ended the way it did: loops like this usually end by exhaustion or by her final withdrawal — and her silence now is the loop's last move, still ringing his alarm every day it continues. What protects him specifically in this pairing: her distance is not a puzzle to solve with one perfect message. There is no message. The loop only stops when one side steps out of it, and he's the only side he controls.

### Avoidant × Anxious — the mirror loop
The same machine, with him in the other seat. Her pattern needed contact to feel safe, so she asked, checked, escalated. His pattern needed room to feel safe, so he deflected, went quiet, found reasons. Her escalation confirmed his belief that closeness means pressure; his distance confirmed her belief that she was about to be left. Both were, from inside their own wiring, being reasonable.
Two things he deserves to hear plainly. First: his withdrawal was a pattern, not cruelty — he'll be tempted to cast himself as the cold villain of this story, and that rewrite is its own distortion. Second: she probably left more times in her head than she ever said out loud — anxious patterns often rehearse the exit for months before using it — so her leaving, if she left, wasn't as sudden as it looked. His recovery risk in this pairing is the delayed wave: it may hit weeks late, aimed at a woman who's no longer there to receive it. That's grief arriving, not a mistake to fix.

### Anxious × Anxious — two alarms, no regulator
When both patterns treat distance as danger, a relationship gets loud: constant contact, arguments that must be settled tonight, reconciliation as intense as the rupture. It can feel like extraordinary closeness — nobody was hiding — and it burns enormous fuel. Ruptures came fast and repairs came fast, and the cycle itself became the bond.
The post-breakup danger here is structural: both people want contact, so the loop restarts on almost any pretext, and "one last talk" is never the last. His no-contact can't run on willpower in this pairing; it has to run on setup — blocked, muted, friction added before the 1 a.m. version of him makes choices. That's not weakness. That's engineering.

### Avoidant × Avoidant — the quiet starvation
Nothing dramatic happened, and that's the story. Two people who both cope by withdrawing can run a relationship with almost no fighting and almost no feeding: needs unspoken, bids unanswered, distance mistaken for peace. It likely ended the way it lived — gradually, then in a single calm conversation, possibly one neither of them fully fought.
The risk for him now isn't contact; it's numbness. Two avoidant patterns can produce a breakup that feels suspiciously easy, and the processing he skips will collect its debt later — in the next relationship, usually, aimed at the wrong person. Feeling fine is allowed. Believing "fine" this fast is worth one honest question.

### Fearful-Avoidant involved (either side) — the swing
If either pattern was fearful-avoidant, the defining feature was unpredictability: pursuit and withdrawal from the same person, sometimes the same day. If it was her: her signals were not a code he failed to crack — they were genuinely contradictory, because the wants behind them were. Decoding her was an unwinnable assignment, and he can hand it back. If it was him: his work starts with learning to notice, in real time, *which pull is running* — the urge to chase or the urge to vanish — because a man who can name the pull can choose one steady action instead of obeying the swing. Either way: the relationship's chaos was structural, not a character verdict on either person.

### Secure involved — when there is no villain pattern
Sometimes the honest read is that one side of this relationship was fairly steady — and it ended anyway. That possibility matters, because the mind would rather manufacture a diagnosis than accept that a decent person can leave, or be left, for reasons of fit, timing, and life. If he leaned secure and she didn't, his profile section holds his (smaller) share of the loop. If she leaned secure and he didn't, his pattern did real damage — and the useful response to that is the repair work in his own read, not self-punishment. Either way, this pairing's recovery is mostly grief, honestly felt, without a villain to organise it around. That's slower-feeling work. It's also the kind that actually ends.

## Act 3 bridges (keyed to his profile)

- **Anxious:** Your pattern's hardest hour is the urge spike — the moment her silence or a breadcrumb convinces you one message could fix the feeling. So your recovery is built around the pause: the tracker to make days visible, the text-check to slow the 1 a.m. decisions, and a structure for the first ninety days, when the spikes are loudest and least trustworthy. (Tools: tracker, decision tool.)
- **Avoidant:** Your pattern's trap is skipping the grief and calling it recovery. Your ninety days aren't about resisting contact — they're about not out-running what this meant: naming it, on paper, on a schedule your feelings can't negotiate with. The tracker still matters for you, differently: it counts the days you're tempted to spend *not* thinking about her. (Tools: tracker, guide "How Long Does a Breakup Take?")
- **Fearful-Avoidant:** Your pattern's risk is the swing — a chasing day undoing a withdrawing week. Your recovery needs one steady action repeated: the daily check-in, the same small ritual, so the streak belongs to the calm version of you and not to whichever pull woke up strongest. (Tools: tracker, decision tool.)
- **Secure:** Your pattern gives you the steadiest starting position — your work is grief and patience, not repair. Keep the routines, keep the boundaries when the bad evening arrives, and don't rush a new relationship to skip the hard part. (Tools: tracker, guide "Attachment Styles After a Breakup.")
- **Programme line (the furthest this goes until phase-2 gates clear):** "The full 90-day programme is in development — the list hears first," attached to the existing email capture.

---

# Part C — Build notes

- **Session 4** builds the quiz page and runner from Part A only (framing, his 24 + attention check, her 12, selectors, context questions), on the Session 2 engine. Verify Fixture 1 and both her fixtures end-to-end before marking done. Analytics events follow §16.1 and the existing privacy rules: answers themselves are never sent; her-module data gets the same treatment as his.
- **Session 5** builds the result view from Part B: structure, his profiles, her reads, decodes (selector-gated), dynamics (with the composition rule tested across all pairings), bridges, caveat block, Block A position, score-only share links, and the result email whose figures must match the on-screen result (its her-content follows the same privacy rule as share links unless the founder decides otherwise — flag, don't improvise).
- Anything not specified here or in the spec gets flagged to the founder, not invented.
