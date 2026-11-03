import { copy } from "@/config/copy";
import { routes } from "@/config/site";
import type { Lean, ProfileId } from "./types";

/**
 * Result profiles — Section 9.4.
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
  /** Secure only: the lean line shown first when a dimension is moderate (see leanWatchOuts). */
  leans?: Record<Exclude<Lean, "none">, string>;
}

const { subject, object, possessive } = copy.partner;

/**
 * Profile copy — Section 9.4, from the founder-approved quiz build brief (Part B, the four
 * profiles). One source for the result view (Session 5), the profile pages (Session 8),
 * the guide and the result email. Founder decisions (2026-11-02): the brief's copy
 * replaces the Session 8 drafts site-wide, and its third-person lines are in the second
 * person, so every section speaks to the reader. Partner pronouns come from
 * config/copy.ts (Section 2.3).
 */
export const profileCopy: Record<ProfileId, ProfileCopy> = {
  secure: {
    headline: "Your pattern: Secure",
    description: `Your pattern is steady. You tend to trust that closeness and space can both exist in a relationship, and you usually say what you need without chasing or shutting down. That does not mean breakups do not hurt you — they do — but you are more likely to look at what happened honestly, keep your daily life going, and let feelings pass without turning every bad day into proof that something is wrong with you. Under stress you may still check for news about ${object} or want one more talk, and that is normal, not a failure of the pattern. Your work after a breakup is mostly about grief and patience: feeling it, keeping your boundaries, and not rushing into a new relationship to skip the hard part.`,
    afterBreakup:
      "Grief comes in waves rather than as a constant alarm. You can usually name what you miss, keep routines going, and talk to friends without turning every conversation into a case for getting back together.",
    noContactRisk:
      'Lower than the other profiles, but not zero. The risk window is a bad day or a lonely evening — one message sent to "check in" that restarts the whole cycle.',
    watchOuts: [
      "Rushing into someone new to skip grief.",
      'Treating a calm week as proof you are "done" and dropping your boundaries early.',
      'One "friendly" check-in that reopens contact.',
    ],
    strengths: [
      "You can name what you feel without acting on every feeling.",
      "You keep daily routines going under stress.",
      "You can end contact cleanly and mean it.",
    ],
    nextSteps: [
      { label: "Start a no-contact streak", href: routes.tracker },
      { label: "Attachment styles after a breakup", href: routes.guideAfterBreakup },
    ],
    leans: {
      anxious:
        "Broadly secure, with an anxious lean — under breakup stress, the pattern below is the one to watch.",
      avoidant:
        "Broadly secure, with an avoidant lean — under breakup stress, the pattern below is the one to watch.",
      mixed:
        "Broadly secure, with a mixed lean — under breakup stress, both patterns below are the ones to watch.",
    },
  },
  anxious: {
    headline: "Your pattern: Anxious (preoccupied)",
    description: `Your pattern is to hold on tight when closeness feels uncertain. When a reply is slow or a partner pulls back, your mind fills the gap fast, and you act on that worry — checking, texting, asking for reassurance, trying to fix things in the same hour. That comes from caring a lot, not from being weak, but it can push the other person further away and leave you exhausted. After a breakup, the same pattern can keep you checking ${possessive} profiles, replaying talks, and hoping one message will change the outcome. Your work is learning to pause between the urge and the action: notice the spike, wait, and choose a response that protects your own steadiness instead of seeking proof in the moment.`,
    afterBreakup: `The days are organized around ${object}: checking, rereading old messages, rehearsing what to say, and reading meaning into silence. Relief comes briefly after contact, then the worry returns stronger.`,
    noContactRisk:
      "High. Message-checking and reconciliation fantasies: the urge to text is frequent, and each check feels like it might settle things, when it usually restarts them.",
    watchOuts: [
      `Checking ${possessive} profiles or status many times a day.`,
      'Sending a long message late at night to "get closure."',
      `Treating any reply from ${object} as a sign the relationship is back on.`,
    ],
    strengths: [
      "You notice your own feelings quickly.",
      "You're willing to talk honestly when you feel safe.",
      "You care deeply and show up when it counts.",
    ],
    nextSteps: [
      { label: "Check before you text", href: routes.decision },
      { label: "The no-contact rule", href: routes.noContactRule },
    ],
  },
  avoidant: {
    headline: "Your pattern: Avoidant (dismissive)",
    description:
      "Your pattern is to create space when closeness feels like too much. When a partner wants more time, more talk, or more feeling, you may go quiet, get busy, or find a fault that justifies stepping back. That protects your independence, but it can leave the other person feeling shut out and leave you alone with feelings you have not yet faced. After a breakup, you may feel fine at first, then find the grief arriving weeks later, or jump into someone new before you have looked at what ended. Your work is staying with the uncomfortable part a little longer: naming what you feel, answering the hard talk, and letting closeness last long enough to learn from it. That is a skill, not a personality change.",
    afterBreakup:
      "Relief first, then a delayed hit. You may say you are fine, stay busy, and date again quickly — then find the old feelings surfacing weeks later, often aimed at the wrong person.",
    noContactRisk:
      "Delayed grief and rebound dating. Less a 1 a.m. text, more a slow drift: new dating before the last relationship has been looked at, or contact months later when the delayed feelings arrive.",
    watchOuts: [
      `Saying "I'm fine" and believing it too early.`,
      "Starting something new to avoid sitting with the ending.",
      "Going quiet instead of answering a hard conversation.",
    ],
    strengths: [
      "You can stay calm under pressure.",
      "You value independence and can hold boundaries.",
      "You're practical about daily life even in a hard week.",
    ],
    nextSteps: [
      { label: "Start a no-contact streak", href: routes.tracker },
      { label: "How long does a breakup take?", href: routes.guideHowLong },
    ],
  },
  "fearful-avoidant": {
    headline: "Your pattern: Fearful-avoidant (disorganized)",
    description: `Your pattern pulls in both directions at once. You want closeness, and you fear it. So you may chase reassurance one day and shut down the next, want ${object} back and want space in the same week, or feel sure about a relationship until it gets close and then look for a way out. That swing is exhausting, for you and for the other person, and it can make a breakup feel especially chaotic. After a breakup, the risk is living in the swing: texting, then regretting it, then texting again. Your work is noticing which pull is running the moment — the urge to chase or the urge to withdraw — and choosing one steady action instead of following the swing wherever it goes.`,
    afterBreakup:
      "Hot and cold in the same week: a long message, then silence, then regret, then another message. Friends hear two different stories depending on the day.",
    noContactRisk: `Oscillation: chasing and withdrawing in turn, so a streak breaks not from one big decision but from a swing between "I need ${object}" and "I need space."`,
    watchOuts: [
      "Texting, regretting it, then texting again to undo it.",
      `Reading a single reply as both proof ${subject} cares and proof ${subject} does not.`,
      "Making big relationship decisions on the worst day of the week.",
    ],
    strengths: [
      "You see both sides of a situation quickly.",
      "You can be deeply honest once you slow down.",
      "You know what closeness costs — and what it is worth.",
    ],
    nextSteps: [
      { label: "Check before you text", href: routes.decision },
      { label: "Attachment styles after a breakup", href: routes.guideAfterBreakup },
    ],
  },
};

/**
 * The watch-outs a secure lean points at (brief, Part B): an anxious or avoidant lean
 * names that pattern's three; a mixed lean covers both sets.
 */
export function leanWatchOuts(lean: Exclude<Lean, "none">): string[] {
  if (lean === "mixed")
    return [...profileCopy.anxious.watchOuts, ...profileCopy.avoidant.watchOuts];
  return [...profileCopy[lean].watchOuts];
}

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
