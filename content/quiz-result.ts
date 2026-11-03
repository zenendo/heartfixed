import { copy } from "@/config/copy";
import { routes } from "@/config/site";
import { resultCopy } from "./quiz-result-ui";

export { resultCopy };
import type { DynamicId, DynamicPick, NextStep, ProfileId } from "@/lib/quiz";

/**
 * The quiz result view's content — the founder-approved quiz build brief, Part B
 * (Session 5). Every read below is the brief's text word for word, checked by
 * tests/unit/quiz-result-brief.test.ts, with two founder-approved substitutions for
 * Section 14.2 (2026-11-02): the caveat's "can't label her", and the Secure-involved
 * dynamic's "manufacture a villain". Partner pronouns resolve through config/copy.ts
 * (Section 2.3); *asterisks* mark the brief's emphasis.
 *
 * The view's headings and short UI lines are in content/quiz-result-ui.ts.
 */

const p = copy.partner;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface HerRead {
  paragraphs: string[];
  means: string;
  since: string;
}

export interface Decode {
  heading: string;
  body: string;
}

export interface Dynamic {
  title: string;
  paragraphs: string[];
}

export const caveat = {
  lead: `A note on this read.`,
  body: `It's built from your answers about ${p.possessive} behaviour, so it's the pattern *you experienced* — it can't label ${p.object}. Only ${p.subject} could describe ${p.possessive} own pattern, and people under breakup stress don't always act the way they did inside the relationship. Use it to understand what you lived through, not to label ${p.object}.`,
};

export const herReads: Record<ProfileId, HerRead> = {
  secure: {
    paragraphs: [
      `In this relationship, ${p.subject} was steady. ${cap(p.subject)} could ask for closeness without games and take space without punishment. Arguments stayed arguments — ${p.subject} said what was wrong, heard his side, and didn't disappear or detonate. When he was upset, ${p.subject} could be near it without flinching or fixing. That steadiness is worth naming plainly, because it changes what the breakup means: this probably wasn't a pattern malfunction. Secure people also end relationships — when the fit is wrong, the timing is wrong, or the life they want isn't this one.`,
    ],
    means: `the explanation may not be hiding in ${p.possessive} behaviour. It does not mean ${p.subject} didn't care, or that the ending cost ${p.object} nothing — ${p.subject} likely grieved it too, privately and without spectacle.`,
    since: `clean, kind distance. Little contact, no mixed signals, boundaries that stay where ${p.subject} put them. ${cap(p.possessive)} silence isn't a code. It is the decision, being kept.`,
  },
  anxious: {
    paragraphs: [
      `In this relationship, the connection felt fragile to ${p.object}, and ${p.subject} worked hard to hold it. Slow replies landed on ${p.object} like bad news. ${cap(p.subject)} needed arguments settled *now*, checked up when he was out, asked whether he still loved ${p.object}, and when ${p.subject} felt him pull away ${p.subject} reached harder — more messages, more affection, more plans. Underneath the intensity was a fear that the bond was always about to break. Most of that behaviour was panic, not manipulation: when ${p.subject} escalated, ${p.subject} was usually trying to feel safe, the only way ${p.possessive} pattern knows how.`,
    ],
    means: `the relationship mattered enormously to ${p.object} — ${p.possessive} pattern doesn't fight like that for things it doesn't care about. It does not mean the relationship was working, or that love at that temperature is sustainable. A bond can be real and still be unliveable.`,
    since: `waves. Urges to reach out arrive in spikes — late nights, bad days, a song, a date on the calendar — so contact attempts, profile-checking, and "accidental" run-ins are common early on, followed by shame and retreat. ${cap(p.possessive)} silence in a given week doesn't mean ${p.subject}'s moved on; ${p.possessive} reaching out doesn't mean the relationship should restart. Both are the wave, doing what waves do.`,
  },
  avoidant: {
    paragraphs: [
      `In this relationship, closeness cost ${p.object} something. ${cap(p.subject)} deflected the big talks, went quiet after arguments instead of resolving them, and pulled back or asked for space when he tried to get ${p.object} to open up. When things started feeling serious, faults appeared — in him, in the fit, in the timing. His vulnerability made ${p.object} uncomfortable; parts of ${p.possessive} life stayed in compartments he wasn't invited into. Read plainly: when love got close, ${p.possessive} pattern reached for distance the way you'd reach for a door.`,
      `That distance was regulation, not verdict. In ${p.possessive} pattern, a partner's pursuit registers as pressure, and withdrawal registers as keeping the peace. ${cap(p.possessive)} shutdowns predated him — they're how ${p.subject} was wired long before this relationship, and ${p.subject} will run the same programme with the next man who gets close enough to trigger it.`,
    ],
    means: `it does not mean ${p.subject} felt nothing. This pattern often suppresses first and processes later, in private, on a delay. It also does not mean a calmer, less-needy version of him would have fixed it — the loop needs ${p.possessive} wiring to change, and that's work only ${p.subject} can do, on ${p.possessive} own timeline, not something a partner can love ${p.object} into.`,
    since: `relief first. Freedom feels good; the pressure is off; ${p.subject} may seem genuinely fine — because suppression works, for a while. Processing tends to arrive late and quietly. Some people with this pattern do reach out months later, when the pressure is long gone and the feelings finally surface; many never do. Either way: a late message would not mean the pattern has changed. Contact is an event. Change is a track record.`,
  },
  "fearful-avoidant": {
    paragraphs: [
      `In this relationship, ${p.subject} wanted closeness and feared it, sometimes in the same day. ${cap(p.subject)} could pursue him hard — needing the argument settled tonight, needing to know he still loved ${p.object} — and then panic at the very closeness ${p.subject}'d demanded, and vanish into silence or fault-finding. The relationship felt like weather: warmth you couldn't trust, distance you couldn't predict. That wasn't two different women. It was one pattern with two alarms wired to the same bell — terrified of being left, terrified of being trapped — and almost any move he made rang one of them.`,
    ],
    means: `the chaos wasn't a puzzle he failed to solve; consistency is the one thing this pattern cannot produce, no matter who the partner is. It does not mean the hot phases were the "real" relationship and the cold ones an aberration. The intensity was real *and* the instability was real. Intensity is not compatibility.`,
    since: `the swing, continuing without the relationship. A reach-out full of feeling, then regret, then silence, then another reach-out. Each swing will feel like a message about him — it isn't. It's ${p.possessive} pattern running its loop in an empty room, and every round of it restarts his own clock.`,
  },
};

export const decodes: Record<string, Decode> = {
  a1: {
    heading: `${cap(p.subject)} has gone completely silent`,
    body: `Total silence is the hardest behaviour to live next to, because it gives the mind nothing to work with — so the mind invents. Here's the plainer read. If ${p.possessive} pattern leaned avoidant, silence is regulation plus a decision being kept: distance is how ${p.subject} copes, and ${p.subject} is coping. If ${p.possessive} pattern leaned anxious, silence is costing ${p.object} — it's willpower, collapse, or friends holding ${p.possessive} phone — and it still isn't a coded message. Silence has no hidden payload in either pattern. What it means for you: the condition your recovery needs is, for once, being provided. The breakup is real, the channel is closed, and every quiet day is a day your own streak can grow in peace.`,
  },
  a2: {
    heading: `${cap(p.subject)} reaches out at odd moments, then goes quiet`,
    body: `A meme. A "hey." Then nothing. This is the pressure-release valve of more than one pattern: contact enough to soothe the urge, never enough to restart anything. With an anxious lean, it's a spike of panic followed by embarrassment at having spiked. With an avoidant lean, it's feeling surfacing at the safest possible distance — real feeling, minimal demand. Notice what it never is: an opening to the serious conversation. If ${p.subject} wanted that, ${p.subject}'d be having it. What it means for you: each breadcrumb costs you days of re-living. You don't have to be rude, and you don't have to be available. The "Should I text my ex?" check exists for exactly this moment.`,
  },
  a3: {
    heading: `${cap(p.subject)} acts like ${p.subject} has already moved on`,
    body: `${cap(p.possessive)} feed is not a window into ${p.possessive} heart; it's a broadcast, and broadcasts are edited. Two honest possibilities sit side by side: ${p.subject} may be performing fine — for you, for friends, for ${p.reflexive} — or, if ${p.possessive} pattern leans avoidant, ${p.subject} may genuinely feel fine right now, because suppression works until it doesn't, usually weeks later and off-camera. Neither version is a scoreboard of the relationship's value, and neither is information you can use. What it means for you: watching ${p.object} perform recovery while you're doing the real thing is the worst trade on the internet. Mute or unfollow — not as a message to ${p.object}, but as a decision about what gets into your head before breakfast.`,
  },
  a4: {
    heading: `${cap(p.subject)} contacts you late at night, or drinking`,
    body: `Night lowers every defence, and alcohol lowers them further. What you get at 1 a.m. is ${p.possessive} pattern with the brakes off: feelings that are real and governance that isn't. Anxious patterns spike; avoidant patterns finally feel the thing they've been out-running all day. Believe that ${p.subject} felt something. Do not believe that a 1 a.m. message is a plan — by morning, the brakes are back on, and the retreat usually follows. What it means for you: 1 a.m. honesty is not a foundation, and you are not obliged to be anyone's night-time regulation. Let the decision tool answer the "should I reply" question in daylight.`,
  },
  a5: {
    heading: `${cap(p.subject)} keeps a thread of contact: likes, story views, small signals`,
    body: `A story view is the cheapest unit of contact in existence: zero risk, zero commitment, and — this is the part that keeps men hooked — zero information. ${cap(p.subject)} may be checking compulsively (${p.possessive} anxiety, mirroring your own profile-checking), monitoring at a distance ${p.subject} can afford (${p.possessive} avoidance), or simply scrolling like everyone alive. No pattern turns a view into a verdict, and no frequency of views adds up to one. What it means for you: if a view from ${p.object} can ruin your afternoon, that's not a sign about ${p.object} — it's a measurement of how much access ${p.subject} still has to your nervous system. Closing that access is a recovery step, not a punishment.`,
  },
  a6: {
    heading: `${cap(p.subject)} says ${p.subject} misses you, or regrets how it ended`,
    body: `Take the words at face value — and no further. Missing someone is a feeling, not a plan; regret about how things ended is not the same as the capacity to do them differently. Both can be completely sincere and completely compatible with the relationship still being wrong for both of you. The question that actually protects you isn't "does ${p.subject} feel something?" — ${p.subject} may well — it's "what has changed?" Feelings aren't change. Patterns are only beaten by track records, built slowly, in the open. What it means for you: it's allowed to feel good to hear. You're not a machine, and being missed is not nothing. It just isn't a reason. Let it be a kind moment you didn't build a decision on.`,
  },
};

export const decodeFallback = `Nothing ${p.subject}'s done since the breakup changes the read below — and that's information too.`;

export const dynamics: Record<DynamicId, Dynamic> = {
  "anxious-avoidant": {
    title: `The pursue–withdraw loop`,
    paragraphs: [
      `This is the classic trap, and if it felt crazy-making, that's because it is engineered to be. His pattern treats distance as danger, so when ${p.subject} went quiet, his alarm fired and he pursued — more texts, more fixing, more closeness. ${cap(p.possessive)} pattern treats pursuit as pressure, so the more he chased, the more overwhelmed ${p.subject} felt, and the further ${p.subject} withdrew. ${cap(p.possessive)} withdrawal was his alarm's loudest possible input. Each person's way of coping was the other person's trigger, running in a loop neither of them chose and neither could stop from inside it.`,
      `Why it ended the way it did: loops like this usually end by exhaustion or by ${p.possessive} final withdrawal — and ${p.possessive} silence now is the loop's last move, still ringing his alarm every day it continues. What protects him specifically in this pairing: ${p.possessive} distance is not a puzzle to solve with one perfect message. There is no message. The loop only stops when one side steps out of it, and he's the only side he controls.`,
    ],
  },
  "avoidant-anxious": {
    title: `The mirror loop`,
    paragraphs: [
      `The same machine, with him in the other seat. ${cap(p.possessive)} pattern needed contact to feel safe, so ${p.subject} asked, checked, escalated. His pattern needed room to feel safe, so he deflected, went quiet, found reasons. ${cap(p.possessive)} escalation confirmed his belief that closeness means pressure; his distance confirmed ${p.possessive} belief that ${p.subject} was about to be left. Both were, from inside their own wiring, being reasonable.`,
      `Two things he deserves to hear plainly. First: his withdrawal was a pattern, not cruelty — he'll be tempted to cast himself as the cold villain of this story, and that rewrite is its own distortion. Second: ${p.subject} probably left more times in ${p.possessive} head than ${p.subject} ever said out loud — anxious patterns often rehearse the exit for months before using it — so ${p.possessive} leaving, if ${p.subject} left, wasn't as sudden as it looked. His recovery risk in this pairing is the delayed wave: it may hit weeks late, aimed at a woman who's no longer there to receive it. That's grief arriving, not a mistake to fix.`,
    ],
  },
  "anxious-anxious": {
    title: `Two alarms, no regulator`,
    paragraphs: [
      `When both patterns treat distance as danger, a relationship gets loud: constant contact, arguments that must be settled tonight, reconciliation as intense as the rupture. It can feel like extraordinary closeness — nobody was hiding — and it burns enormous fuel. Ruptures came fast and repairs came fast, and the cycle itself became the bond.`,
      `The post-breakup danger here is structural: both people want contact, so the loop restarts on almost any pretext, and "one last talk" is never the last. His no-contact can't run on willpower in this pairing; it has to run on setup — blocked, muted, friction added before the 1 a.m. version of him makes choices. That's not weakness. That's engineering.`,
    ],
  },
  "avoidant-avoidant": {
    title: `The quiet starvation`,
    paragraphs: [
      `Nothing dramatic happened, and that's the story. Two people who both cope by withdrawing can run a relationship with almost no fighting and almost no feeding: needs unspoken, bids unanswered, distance mistaken for peace. It likely ended the way it lived — gradually, then in a single calm conversation, possibly one neither of them fully fought.`,
      `The risk for him now isn't contact; it's numbness. Two avoidant patterns can produce a breakup that feels suspiciously easy, and the processing he skips will collect its debt later — in the next relationship, usually, aimed at the wrong person. Feeling fine is allowed. Believing "fine" this fast is worth one honest question.`,
    ],
  },
  swing: {
    title: `The swing`,
    paragraphs: [
      `If either pattern was fearful-avoidant, the defining feature was unpredictability: pursuit and withdrawal from the same person, sometimes the same day. If it was ${p.object}: ${p.possessive} signals were not a code he failed to crack — they were genuinely contradictory, because the wants behind them were. Decoding ${p.object} was an unwinnable assignment, and he can hand it back. If it was him: his work starts with learning to notice, in real time, *which pull is running* — the urge to chase or the urge to vanish — because a man who can name the pull can choose one steady action instead of obeying the swing. Either way: the relationship's chaos was structural, not a character verdict on either person.`,
    ],
  },
  "secure-involved": {
    title: `When there is no villain pattern`,
    paragraphs: [
      `Sometimes the honest read is that one side of this relationship was fairly steady — and it ended anyway. That possibility matters, because the mind would rather manufacture a villain than accept that a decent person can leave, or be left, for reasons of fit, timing, and life. If he leaned secure and ${p.subject} didn't, his profile section holds his (smaller) share of the loop. If ${p.subject} leaned secure and he didn't, his pattern did real damage — and the useful response to that is the repair work in his own read, not self-punishment. Either way, this pairing's recovery is mostly grief, honestly felt, without a villain to organise it around. That's slower-feeling work. It's also the kind that actually ends.`,
    ],
  },
};

export const bridges: Record<ProfileId, string> = {
  anxious: `Your pattern's hardest hour is the urge spike — the moment ${p.possessive} silence or a breadcrumb convinces you one message could fix the feeling. So your recovery is built around the pause: the tracker to make days visible, the text-check to slow the 1 a.m. decisions, and a structure for the first ninety days, when the spikes are loudest and least trustworthy.`,
  avoidant: `Your pattern's trap is skipping the grief and calling it recovery. Your ninety days aren't about resisting contact — they're about not out-running what this meant: naming it, on paper, on a schedule your feelings can't negotiate with. The tracker still matters for you, differently: it counts the days you're tempted to spend *not* thinking about ${p.object}.`,
  "fearful-avoidant": `Your pattern's risk is the swing — a chasing day undoing a withdrawing week. Your recovery needs one steady action repeated: the daily check-in, the same small ritual, so the streak belongs to the calm version of you and not to whichever pull woke up strongest.`,
  secure: `Your pattern gives you the steadiest starting position — your work is grief and patience, not repair. Keep the routines, keep the boundaries when the bad evening arrives, and don't rush a new relationship to skip the hard part.`,
};

export const programmeLine = `The full 90-day programme is in development — the list hears first.`;

/** The tools each bridge names (brief, Act 3). */
export const bridgeTools: Record<ProfileId, [NextStep, NextStep]> = {
  anxious: [
    { label: "Start a no-contact streak", href: routes.tracker },
    { label: "Check before you text", href: routes.decision },
  ],
  avoidant: [
    { label: "Start a no-contact streak", href: routes.tracker },
    { label: "How long does a breakup take?", href: routes.guideHowLong },
  ],
  "fearful-avoidant": [
    { label: "Start a no-contact streak", href: routes.tracker },
    { label: "Check before you text", href: routes.decision },
  ],
  secure: [
    { label: "Start a no-contact streak", href: routes.tracker },
    { label: "Attachment styles after a breakup", href: routes.guideAfterBreakup },
  ],
};

const LEAN_ARTICLE = { anxious: "an anxious", avoidant: "an avoidant" } as const;

/** The lean lines shown above a dynamic read that a lean selected (composition rule). */
export function dynamicLeanLines(pick: DynamicPick): string[] {
  const lines: string[] = [];
  if (pick.youLean !== "none") lines.push(resultCopy.dynamicLean.you(LEAN_ARTICLE[pick.youLean]));
  if (pick.herLean !== "none") lines.push(resultCopy.dynamicLean.her(LEAN_ARTICLE[pick.herLean]));
  return lines;
}

/** The brief's *emphasis* markers, removed for plain-text contexts. */
export const plain = (text: string) => text.replace(/\*([^*]+)\*/g, "$1");
