import type { FitId } from "@/lib/quiz/ending";
import type { EndingAnswers } from "@/lib/quiz/questions";
import { cap, type PronounContext } from "@/lib/quiz/pronouns";

/**
 * "How it ended, read plainly" — quiz v3 amendment brief, 4 and 5, with the wording of
 * the founder-approved "How it ended" copy draft (repo root), word for
 * word: tests/unit/quiz-ending.test.ts checks every block against the draft.
 *
 * The draft is written for a he/him taker and a she/her partner. Partner references
 * render through `p` (brief, 3). Where the draft says "men" about people in the
 * reader's position ("Men who do the leaving", "many men never get"), it renders
 * through the taker's nouns, as the v2 build did for "the next man who gets close
 * enough". One verb agrees with a partner subject ("She was the one who said it"), via
 * the `was` token; every other partner verb is past tense or modal. No em dashes (v2
 * brief, 2.6).
 *
 * The questions' intro line and progress label are runner copy, in content/quiz.ts.
 */

export interface EndingContent {
  heading: string;
  intro: string;
  arrival: Record<"blindsided" | "distance" | "event" | "cycles", string>;
  initiator: Record<"partner" | "me" | "together" | "faded", string>;
  delivery: Record<"in-person" | "call-or-message" | "went-quiet" | "unclear", string>;
  reason: Record<"made-sense" | "mismatch" | "none" | "kept-changing", string>;
  trigger: Record<"closer" | "fight" | "distant" | "on-off", string>;
  fit: Record<FitId, string>;
  caution: string;
  /** Act 3 bridge additions (copy draft): blindsided, and "I ended it". */
  bridge: { blindsided: string; me: string };
}

export function endingContentFor({ t, p }: PronounContext): EndingContent {
  const P = cap(p.subject);
  const T = cap(t.nounPlural);

  return {
    heading: "How it ended, read plainly",
    intro:
      "You told us how the ending happened. Read next to the patterns above, it says more than it might seem.",

    arrival: {
      blindsided:
        "From your side, there was no warning. One day the relationship existed; the next it did not. That kind of ending does a specific kind of damage: your mind keeps searching for the moment it turned, because if you can find the moment, maybe it makes sense. Here is what the pattern suggests was happening on the other side. Endings that feel instant to one partner are usually slow for the other. The decision tends to be made privately, over weeks, while the surface of the relationship still looks normal. You were not necessarily missing obvious signs. You were seeing the surface, and the surface was the last thing to change.",
      distance:
        "This ending did not arrive all at once. It arrived as a fade: less warmth, shorter answers, plans that stopped being made. By the time it was said out loud, some part of you already knew. That does not make it easier. A slow ending gives you weeks of low-level dread, and it often leaves a particular question behind: if I could see it coming, why could I not stop it? The honest answer is that distance like this is rarely a response to one thing you did. It is what a pattern does when closeness starts to feel like pressure: it withdraws first and explains later, if it explains at all.",
      event:
        "There was a moment, and you can probably replay it exactly. It is tempting to believe the relationship ended because of that argument, that night, that thing you said. Treat that carefully. In most relationships, a single fight is the occasion, not the cause. Couples who can repair do not end over one explosion; they end when the pattern underneath has already worn the connection thin, and the fight is simply where it finally shows. The event matters, but the explanation lives underneath it, in everything the two reads above describe.",
      cycles:
        "This was not your first ending. It was the latest in a series, and the series itself is the information. On-off cycles happen when the forces that end the relationship and the forces that restart it are the same forces: the distance becomes unbearable, then the loss becomes unbearable, and nothing in between changes. Each round tends to cost more and settle less. It also means some part of both of you kept choosing this, which is worth sitting with honestly, because the pull to run one more round is usually the last stage of the pattern, not an exception to it.",
    },

    initiator: {
      partner: `${P} ${p.was} the one who said it, or showed it. Being the one who was left puts you in the harder seat for one specific reason: the decision was made somewhere you could not see, so your mind tries to reconstruct it from outside. That reconstruction is most of what this result is for.`,
      me: `You were the one who ended it, and it can still hurt like you were left. ${T} who do the leaving often get less sympathy and more confusion, including from themselves: if I chose this, why does it feel this bad? Because ending a relationship your pattern was struggling inside does not cancel the attachment. You can know it was not working and still grieve it, and you can have been the one who spoke the words while the dynamic did most of the deciding.`,
      together:
        "You both said it, which usually means you both saw it. Mutual endings tend to come with less mystery and more plain sadness, and they are the ending most consistent with two people who could still talk to each other at the end. If it feels worse than 'mutual' sounds like it should, that is normal too: agreement is not the same as readiness.",
      faded:
        "There was no conversation and no clean line, just less and less until there was nothing. Faded endings are their own kind of hard: there is no date to point at, no final words to examine, and your mind may keep treating the relationship as paused rather than over. Part of the work with this ending is letting the absence itself be the answer. A relationship that ends by evaporation was telling you something about how conflict and closeness were handled inside it: by avoidance, on at least one side.",
    },

    delivery: {
      "in-person":
        "It was at least said to your face. Whatever else was missing, that conversation happened, and it is worth more than it may feel like right now.",
      "call-or-message":
        "It arrived through a screen, which often leaves the strange feeling that something enormous happened in a very small place. The medium was thin. That does not make what it carried any less real.",
      "went-quiet": `You never got the conversation. ${P} went quiet, and the quiet was the message. Refusing the closing conversation is itself pattern behaviour: it avoids the discomfort of your reaction, at the cost of leaving you with every unanswered question. The hunger for one real talk can be intense after this kind of ending, and it helps to name what that talk would actually give you. It would give you ${p.possessive} version. It would not give you certainty, and ${t.nounPlural} who get the conversation usually find it settles less than they hoped.`,
      unclear: `You are not even sure it is over, and that uncertainty is doing real work on you. Unclear endings keep the attachment system switched on: as long as the door might be open, part of you stays in the room. For the purposes of your own recovery, treat ${p.possessive} behaviour as the current answer. If ${p.subject} wanted the relationship, the relationship would be happening. You do not need ${p.object} to close the door formally before you are allowed to start getting over this.`,
    },

    reason: {
      "made-sense": `${P} gave you a reason you can believe. Hold on to that, even when it hurts. A believable reason is a form of closure many ${t.nounPlural} never get, and the ache you feel is probably grief rather than confusion. Those need different things: grief needs time, confusion needs answers that may not exist.`,
      mismatch: `The reason you were given does not match what you saw, and your instinct there is worth trusting. People who end relationships often give the softest true-ish version rather than the whole of it, because the whole of it feels cruel to say. The mismatch does not automatically mean the real reason is darker. It usually means the real reason is more about ${p.possessive} pattern than about any single thing you did, and patterns are hard to say out loud, so they get translated into something smaller.`,
      none: `'I never got a reason' is the sentence ${t.nounPlural} repeat most after endings like this, because the mind treats a missing explanation as an unsolved problem and keeps working on it. Here is the reframe this whole result is built on: the reason is rarely a sentence ${p.subject} could have said. It is the pattern, the dynamic, and the slow decisions underneath, which is exactly what you have been reading. The explanation exists. It just does not arrive as a quote.`,
      "kept-changing":
        "The reason moved depending on the conversation, and shifting reasons usually mean the real driver was never a reason at all. When someone cannot name why they are leaving, it is often because the leaving is being run by a feeling they have not untangled, and each conversation produces a new translation of it. Judge the pattern of behaviour across the whole relationship instead of the latest version of the story.",
    },

    trigger: {
      closer:
        "Notice what came right before the end: things had just got closer. That sequence matters. In the avoidant pattern especially, the exit often comes not when things are bad but when they deepen: a label, a key, a plan, a stretch of real closeness. Closeness raises the stakes, the stakes feel like pressure or a trap, and distance follows. If your instinct has been to ask what you did wrong in the best period of the relationship, this is the answer the pattern gives: the good period may be precisely what started the exit.",
      fight:
        "A fight can be survived by a relationship that still has repair in it. When a fight becomes the ending, it is usually because the willingness to repair had already gone, quietly, beforehand. The fight decided the date. It rarely decided the outcome.",
      distant: `From your side, nothing happened. No fight, no event, just a cooling you could feel before you could prove it. That pattern, distance with no visible cause, is what an internal exit looks like from outside. The cause was happening where you could not see it: in ${p.possessive} private accounting of the relationship, where small dissatisfactions were being stored instead of said. By the time the distance showed, the accounting was mostly done.`,
      "on-off":
        "Each reunion ran on the same fuel: the pain of being apart, mistaken for evidence the relationship could work. Missing someone is real, but it is not the same as the relationship being viable, and the cycle tends to confuse the two every single round.",
    },

    fit: {
      avoidant: `Read against ${p.possessive} pattern, the shape of this ending fits what you have already read: distance first, then an exit with little conversation. The ending is not separate from the pattern. It is the pattern, run one final time.`,
      fearful: `The on-off shape of this ending matches the swing in ${p.possessive} pattern: the same pull that brought ${p.object} back is the one that took ${p.object} away. Expect the swing to be part of how this feels for a while, and be careful not to mistake its next move for new information.`,
      explosion:
        "The dynamic described above tends to end one of two ways: it explodes, or it breaks. This one exploded. The fight was the sound of the cycle finishing, not a separate accident.",
      anxious: `An anxious pattern rarely ends things cleanly or finally, so an ending from this side usually follows a long period of ${p.object} feeling unmet. If ${p.subject} ended it, read that as the end of a buildup, not a sudden change of heart.`,
    },

    caution:
      "A last caution: endings are noisy. People act out of character under the stress of one, so hold this section a little more loosely than the reads above it.",

    bridge: {
      blindsided: `Because this ending blindsided you, expect the first stretch of recovery to be less about missing ${p.object} and more about shock: the urge to investigate, to reconstruct, to find the moment it turned. That urge is your mind trying to make the world predictable again. The tracker and the decision tool are built for exactly those moments: when the urge to search or to text spikes, run it through the tool before you act on it.`,
      me: `Because you ended it, your version of the hard moments will look different: less 'how could ${p.subject}' and more 'did I do the right thing', often at 1 a.m. Decide your answer to that question once, in daylight, from everything in this result, and let the night-time version argue with a settled decision instead of an open one.`,
    },
  };
}

/**
 * The segment's blocks for one complete set of answers, in the brief's fixed order (4):
 * arrival (b2), initiator (b1), delivery (b3), reason (b4), trigger (b5), the fit line
 * if one fired, then the closing caution. Empty when the block wasn't answered.
 */
export function assembleEnding(
  content: EndingContent,
  answers: EndingAnswers,
  fit: FitId | null,
): string[] {
  const { b1, b2, b3, b4, b5 } = answers;
  if (!b1 || !b2 || !b3 || !b4 || !b5) return [];
  const pick = <K extends string>(blocks: Record<K, string>, key: string) => blocks[key as K];
  return [
    pick(content.arrival, b2),
    pick(content.initiator, b1),
    pick(content.delivery, b3),
    pick(content.reason, b4),
    pick(content.trigger, b5),
    ...(fit ? [content.fit[fit]] : []),
    content.caution,
  ];
}
