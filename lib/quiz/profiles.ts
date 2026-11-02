import { routes } from "@/config/site";
import type { Lean, ProfileId } from "./types";

/**
 * Result profiles — Section 9.4. Profile data is written gender-neutrally; the
 * men-specific framing lives in the page copy around it.
 */

export interface ProfileMeta {
  id: ProfileId;
  /** Short name, e.g. for share text: "Anxious". */
  name: string;
  /** Full label for the result headline: "Anxious (preoccupied)". */
  label: string;
  /** The profile's explainer page (Section 6). */
  route: string;
}

export const profiles: Record<ProfileId, ProfileMeta> = {
  secure: {
    id: "secure",
    name: "Secure",
    label: "Secure",
    route: routes.profileSecure,
  },
  anxious: {
    id: "anxious",
    name: "Anxious",
    label: "Anxious (preoccupied)",
    route: routes.profileAnxious,
  },
  avoidant: {
    id: "avoidant",
    name: "Avoidant",
    label: "Avoidant (dismissive)",
    route: routes.profileAvoidant,
  },
  "fearful-avoidant": {
    id: "fearful-avoidant",
    name: "Fearful-avoidant",
    label: "Fearful-avoidant (disorganized)",
    route: routes.profileFearfulAvoidant,
  },
};

export interface NextStep {
  label: string;
  href: string;
}

/** The written content each profile carries (Section 9.4). */
export interface ProfileCopy {
  headline: string;
  /** 120–180 words, plain English. */
  description: string;
  afterBreakup: string;
  /** Feeds the tracker cross-promotion on the result view. */
  noContactRisk: string;
  watchOuts: [string, string, string];
  strengths: [string, string, string];
  nextSteps: [NextStep, NextStep];
  /** Secure only: the lean paragraph shown first when a dimension is moderate. */
  leans?: Record<Exclude<Lean, "none">, string>;
}

/**
 * Profile copy — Section 9.4. Shared by the profile pages (Session 8) and the result
 * view (Session 5). Gender-neutral by rule: the partner is "your partner" or "your
 * ex", never a pronoun, so a future audience reuses it unchanged.
 *
 * TODO(session-5): founder word-by-word review before the result view ships.
 */
export const profileCopy: Record<ProfileId, ProfileCopy> = {
  secure: {
    headline: "Your pattern: Secure",
    description:
      "A secure pattern means both of your scores — attachment anxiety and attachment avoidance — sit in the low-to-moderate range. In practice, closeness doesn't feel like a trap and distance doesn't feel like an emergency. When a message goes unanswered for a few hours, you assume your partner is busy, not leaving. When an argument happens, you can stay in the room, say what bothered you, and hear the other side without needing to win or to disappear. You can ask for what you need without turning it into a test, and you can give space without reading it as rejection. Secure doesn't mean a breakup doesn't hurt. It means the hurt tends to stay the size of the event: heavy, sometimes for a long time, but not a verdict on your worth. It's also a pattern, not a permanent trait — enough stress can pull anyone off it for a while.",
    afterBreakup:
      "You feel it, and you let yourself feel it. There are bad days — the empty side of the bed, the habit of reaching for your phone to share something — but they come and go rather than taking over. You can grieve the relationship without rewriting it as perfect or as a disaster. You're more likely to lean on friends, keep your routines and accept that the decision was made, even if you didn't make it.",
    noContactRisk:
      "Your risk isn't usually a 1am message. It's the reasonable-sounding one: a friendly check-in, a \"hope you're doing well\", a question that could have waited. Because you feel steady, it's easy to tell yourself one message is harmless. Sometimes it is. Often it reopens a conversation you both needed to close. The tracker keeps that decision deliberate rather than casual.",
    watchOuts: [
      'Talking yourself into "just being friendly" before either of you is ready for it.',
      "Taking on the job of managing your ex's feelings about the breakup as well as your own.",
      "Moving on so steadily that you skip the part where you work out what went wrong.",
    ],
    strengths: [
      "You can sit with a bad night without needing to fix it with a message.",
      "You can ask friends for help without feeling like a burden.",
      "You can look back at the relationship honestly — the good parts and the parts that didn't work.",
    ],
    nextSteps: [
      { label: "How long does a breakup take?", href: routes.guideHowLong },
      { label: "The no-contact rule, explained", href: routes.noContactRule },
    ],
    leans: {
      anxious:
        "You're broadly secure, with an anxious lean. Most of the time you handle closeness and distance well, but your anxiety score sits in the moderate range. Under breakup stress, the pattern to watch is the anxious one: checking for messages, replaying the last conversation, wanting an answer tonight.",
      avoidant:
        "You're broadly secure, with an avoidant lean. Most of the time you handle closeness and distance well, but your avoidance score sits in the moderate range. Under breakup stress, the pattern to watch is the avoidant one: getting busy, going quiet and telling yourself you're fine before you are.",
      mixed:
        "You're broadly secure, with a mixed lean. Both of your scores sit in the moderate range, so under breakup stress either pattern can show up — sometimes the urge to reach out and get an answer, sometimes the urge to shut it all down and keep busy. Watch for both, and notice which one is driving on a given day.",
    },
  },
  anxious: {
    headline: "Your pattern: Anxious (preoccupied)",
    description:
      "An anxious pattern means your attachment anxiety scored high while your avoidance stayed low or moderate. You want closeness and you're good at it — attentive, invested, quick to show up. The cost is that distance reads as danger. A slow reply, a flat tone or a plan that falls through can start a loop: checking your phone, rereading the last messages, drafting something to fix it before anything is actually wrong. Reassurance helps, but not for long, so you go back for more. In an argument you'd rather settle it tonight than sleep on it, and silence from the other side feels worse than the fight itself. None of this means you're needy or broken. It's an alarm system set to go off early and loudly. The work isn't switching it off — it's learning to notice the alarm before you act on it.",
    afterBreakup:
      "The alarm goes off and stays on. You check whether your ex has posted, viewed your story or come online. You reread old messages looking for the moment it went wrong, and draft texts you're sure will fix it. The first days can feel physical — trouble sleeping, no appetite, a tight chest. It's common to feel that if you could just talk one more time, it would make sense.",
    noContactRisk:
      'Your highest-risk moments are message-checking and reconciliation fantasies. Every check of your phone or your ex\'s profile restarts the loop, and every replay of "what if we just talked" makes a message feel reasonable. The urge usually peaks at night and after anything that reminds you of the relationship. Your risk window is the urge, not the decision — which is exactly what the tracker is for.',
    watchOuts: [
      'Checking your ex\'s social media "just to see" — each check restarts the loop.',
      "Sending a message to get relief from the anxiety rather than because you have something to say.",
      "Reading meaning into every small signal: a like, a story, a song.",
    ],
    strengths: [
      "You care deeply and you're not afraid to show it.",
      "You notice how the people around you are feeling, often before they say it.",
      "You're willing to work on a relationship rather than walk away at the first problem.",
    ],
    nextSteps: [
      { label: "Start a no-contact streak", href: routes.tracker },
      { label: "Attachment styles after a breakup", href: routes.guideAfterBreakup },
    ],
  },
  avoidant: {
    headline: "Your pattern: Avoidant (dismissive)",
    description:
      "An avoidant pattern means your attachment avoidance scored high while your anxiety stayed low or moderate. You value independence and you're steady in a crisis — you don't panic, you handle it. The cost shows up when someone wants more closeness than feels comfortable. You pull back: a longer gap before replying, a sudden focus on work or the gym, an argument you end by going quiet or leaving the room. Talking about feelings can feel like a task you'd rather skip, and when a partner asks for more, it can land as pressure rather than care. You may notice you feel most drawn to someone when they're slightly out of reach, and least when they're fully in. None of this means you don't care. It means closeness has a cost your system works to keep low. The work is staying in the room a little longer than feels natural.",
    afterBreakup:
      "At first it can feel like relief, or like nothing much. You stay busy, keep your routine and tell people you're fine — and you might be, for a while. The grief often arrives later, sideways: weeks on, a song or a street brings it back hard, and it's confusing because you thought you were past it. You may also find yourself remembering the relationship as worse than it was, which makes leaving it easier to explain.",
    noContactRisk:
      "Your highest-risk moments are delayed grief and rebound dating. No contact can feel easy early on, so the risk isn't texting tonight — it's the message weeks later when the grief finally lands, or jumping into something new to keep the feeling away. Tracking the days makes the gap visible, so the late wave doesn't catch you off guard.",
    watchOuts: [
      'Calling it "fine" so quickly that the grief has nowhere to go until later.',
      "Starting something new to avoid feeling the end of the last thing.",
      "Rewriting the relationship as all bad, so you never look at your part in it.",
    ],
    strengths: [
      "You stay functional under pressure — work, routine and health don't fall apart.",
      "You don't need constant contact to feel okay on your own.",
      "You can give someone space without taking it personally.",
    ],
    nextSteps: [
      { label: "How long does a breakup take?", href: routes.guideHowLong },
      { label: "Start a no-contact streak", href: routes.tracker },
    ],
  },
  "fearful-avoidant": {
    headline: "Your pattern: Fearful-avoidant (disorganized)",
    description:
      "A fearful-avoidant pattern means both scores came out high: attachment anxiety and attachment avoidance. You want closeness and you brace against it, often in the same week. When things are good, you might start looking for the catch, or create distance before the other person can. When they pull away, the alarm goes off and you chase. Arguments can swing between pushing hard for an answer and shutting down completely, and afterwards it can be hard to explain which version of you showed up. Relationships can feel intense and unstable at the same time. From the inside this is the least predictable of the four patterns, which is part of why it's exhausting. None of it means you're too much or beyond help. It means two alarms are active at once. The work is learning which one is talking, and slowing down before you act on either.",
    afterBreakup:
      "It comes in waves that point in opposite directions. One day you're certain it's over and you're better off; the next you're rereading old messages and drafting a long text. You might block your ex, then unblock them. The swings themselves are tiring, and it's easy to read them as proof that something is wrong with you. They're the two halves of the pattern taking turns.",
    noContactRisk:
      "Your highest-risk pattern is oscillation between the two: going cold and certain, then swinging back to reaching out. The cold phase makes no contact feel easy, which is why the swing back catches you off guard. A counter that only moves forward gives you something steady across both moods — and a way to see that the swings pass.",
    watchOuts: [
      "Making big moves — blocking, unblocking, long messages — at the top of a swing.",
      "Treating the cold days as proof you're over it, and the hot days as proof you should go back.",
      "Pushing away the people who want to help on the days you need them most.",
    ],
    strengths: [
      "You feel things fully, and you understand both sides of the closeness question from the inside.",
      "You're often highly aware of other people's moods and shifts.",
      "Once you can name your pattern, you have more information to work with than most.",
    ],
    nextSteps: [
      { label: "Check before you text", href: routes.decision },
      { label: "Attachment styles after a breakup", href: routes.guideAfterBreakup },
    ],
  },
};

export const profileCopyRules = {
  descriptionWords: { min: 120, max: 180 },
} as const;

/** Returns a list of problems with a profile's copy; empty means it meets Section 9.4. */
export function checkProfileCopy(id: ProfileId, profileCopy: ProfileCopy): string[] {
  const problems: string[] = [];
  const words = profileCopy.description.trim().split(/\s+/).length;
  const { min, max } = profileCopyRules.descriptionWords;
  if (words < min || words > max) {
    problems.push(`${id}: description is ${words} words (needs ${min}–${max})`);
  }
  const texts = [
    profileCopy.headline,
    profileCopy.afterBreakup,
    profileCopy.noContactRisk,
    ...profileCopy.watchOuts,
    ...profileCopy.strengths,
  ];
  if (texts.some((t) => t.trim() === "")) problems.push(`${id}: empty copy field`);
  if (id === "secure" && !profileCopy.leans) problems.push("secure: missing lean paragraphs");
  if (id !== "secure" && profileCopy.leans) problems.push(`${id}: only secure carries leans`);
  return problems;
}
