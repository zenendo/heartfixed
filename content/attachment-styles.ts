import { copy } from "@/config/copy";
import type { ProfileId } from "@/lib/quiz";

/**
 * /attachment-styles/ hub and profile-page copy — Session 8. The core profile copy
 * (description, after-a-breakup, risk, watch-outs, strengths) lives in
 * lib/quiz/profiles.ts and is shared with the result view; this file adds the long-form
 * page content around it. Partner references resolve through config/copy.ts.
 *
 * Language rule (Section 14.2): profiles are patterns and tendencies, never conditions.
 * tests/unit/attachment-content.test.ts checks every string here.
 */

const { partner } = copy;

export const QUIZ_FRAMING = "a self-reflection assessment informed by attachment research";

export interface ProfilePageCopy {
  h1: string;
  /** One-line summary for the hub card and the page intro. */
  summary: string;
  intro: string;
  inRelationship: { heading: string; paragraph: string; signs: string[] };
  whatHelps: { heading: string; items: string[] };
  canChange: string;
}

export const profilePages: Record<ProfileId, ProfilePageCopy> = {
  secure: {
    h1: "Secure Attachment in Men",
    summary: "Closeness feels safe and distance feels survivable.",
    intro:
      "Secure is the pattern where closeness doesn't feel like a trap and distance doesn't feel like an emergency. It's the most common pattern in the research, and it still hurts when a relationship ends.",
    inRelationship: {
      heading: "How it tends to show up in a relationship",
      paragraph: `With a secure pattern, you can be close to ${partner.object} without losing yourself, and apart from ${partner.object} without spiralling. Problems get talked about rather than tested or avoided.`,
      signs: [
        'A slow reply reads as "busy", not "leaving".',
        "You say what bothered you in an argument, then listen to the answer.",
        "You can ask for more time together, or for a night to yourself, without it becoming a fight.",
        `When ${partner.subject} has a bad day, you can be there without making it about you.`,
        "You trust what you're told unless you have a real reason not to.",
      ],
    },
    whatHelps: {
      heading: "What helps after a breakup",
      items: [
        "Let the bad days be bad. Steady doesn't mean feeling nothing.",
        'Decide on no contact deliberately rather than drifting into "just checking in".',
        "Use the space to look honestly at what didn't work — including your part.",
        "If your scores showed a lean, read that profile too. It's the pattern stress will pull you towards.",
      ],
    },
    canChange:
      "Secure isn't a trophy or a fixed trait. Enough stress — a breakup included — can pull anyone towards the anxious or avoidant side for a while, and people who start elsewhere can move towards secure over time.",
  },
  anxious: {
    h1: "Anxious Attachment in Men",
    summary: "You want closeness, and distance sets off an alarm.",
    intro:
      "The anxious pattern — sometimes called preoccupied — is high attachment anxiety with low or moderate avoidance. It's common in men, even though it rarely matches how men are expected to act in relationships.",
    inRelationship: {
      heading: "How it tends to show up in a relationship",
      paragraph: `With an anxious pattern, the relationship takes up a lot of your attention. When things feel close, you feel great. When ${partner.subject} seems distant, you feel it immediately — and you want to fix it now.`,
      signs: [
        `You check your phone again and again when ${partner.subject} hasn't replied.`,
        "You'd rather argue all night than go to bed with it unresolved.",
        "You ask for reassurance, feel better briefly, then need it again.",
        `You notice small changes in ${partner.possessive} tone and replay them later.`,
        "You give a lot, and sometimes keep score when it doesn't feel returned.",
      ],
    },
    whatHelps: {
      heading: "What helps after a breakup",
      items: [
        "Cut the checking. Mute or archive, so each look doesn't restart the loop.",
        "Write the message, then don't send it. Put it somewhere private instead.",
        "Plan for nights. That's when the urge peaks, so decide in daylight what you'll do instead.",
        "Count the days. A number that only goes up gives the anxiety something steady to hold.",
      ],
    },
    canChange:
      "The anxious pattern describes what you've tended to do, not who you have to be. With practice — noticing the alarm, waiting it out, choosing partners who are consistent — many people move towards secure over time.",
  },
  avoidant: {
    h1: "Avoidant Attachment in Men",
    summary: "You value independence, and closeness can feel like pressure.",
    intro:
      "The avoidant pattern — sometimes called dismissive — is high attachment avoidance with low or moderate anxiety. It's often mistaken for not caring. It's closer to caring while keeping the cost of closeness low.",
    inRelationship: {
      heading: "How it tends to show up in a relationship",
      paragraph: `With an avoidant pattern, you're often the calm one. You like having your own space, and when ${partner.subject} wants more time, talk or commitment than feels comfortable, you find ways to pull back.`,
      signs: [
        "You take longer to reply when things start to feel serious.",
        "You end arguments by going quiet, changing the subject or leaving the room.",
        `When ${partner.subject} asks how you feel, the honest answer is \"I don't know\".`,
        "You focus on small flaws when the relationship gets close.",
        "You feel more relaxed when you have plans of your own.",
      ],
    },
    whatHelps: {
      heading: "What helps after a breakup",
      items: [
        "Expect a late wave. Grief that skips the first weeks often turns up later.",
        'Put a word on it. Saying "I miss this" or "I\'m angry about that", even privately, helps.',
        "Hold off on dating while you're still telling everyone you're fine.",
        "Look at your part honestly, not just the reasons it was right to end.",
      ],
    },
    canChange:
      "The avoidant pattern describes what you've tended to do, not who you have to be. Staying a little longer in moments of closeness, and saying what you feel a little sooner, moves many people towards secure over time.",
  },
  "fearful-avoidant": {
    h1: "Fearful-Avoidant Attachment in Men",
    summary: "You want closeness and brace against it, often at once.",
    intro:
      "The fearful-avoidant pattern — sometimes called disorganized — is high attachment anxiety and high avoidance together. It's the push-pull pattern: wanting to be close, and wanting to get away when you are.",
    inRelationship: {
      heading: "How it tends to show up in a relationship",
      paragraph: `With a fearful-avoidant pattern, the relationship can feel like the best and worst thing in your life at once. When ${partner.subject} gets close, you want distance. When ${partner.subject} pulls back, you want ${partner.object} back.`,
      signs: [
        "You go from wanting to move in together to wanting out within a few weeks.",
        "When things are going well, you start looking for what will go wrong.",
        "In arguments, you push for an answer, then shut down when you get one.",
        "You test the relationship to see if it will hold.",
        "Afterwards, it's hard to explain why you reacted the way you did.",
      ],
    },
    whatHelps: {
      heading: "What helps after a breakup",
      items: [
        "Make no big moves at the top of a swing — no blocking, unblocking or long messages.",
        'Name the swing out loud: "This is the cold side" or "This is the alarm".',
        "Keep one steady habit — sleep, the gym, a daily walk — that doesn't change with your mood.",
        "Count the days. A counter that only moves forward holds steady across both moods.",
      ],
    },
    canChange:
      "The fearful-avoidant pattern describes what you've tended to do, not who you have to be. It often feels the hardest to change from the inside, but learning to spot which alarm is talking is a real starting point.",
  },
};

export const profilePageCopy = {
  dimensionsHeading: "The scores behind this pattern",
  dimensionsIntro: "This pattern is where these combinations of the two scores land:",
  quizCta: {
    heading: "Check your own scores",
    body: `This page describes the pattern in general. The quiz is ${QUIZ_FRAMING}: 43 questions about what you actually did — and what ${copy.partner.subject} did — in your last relationship, about 5 minutes, and the full result is free.`,
    cta: "Take the quiz",
  },
  sections: {
    whatItIs: "What this pattern is",
    afterBreakup: "How it tends to show up after a breakup",
    risk: "Your likely no-contact risk",
    watchOuts: "Watch-outs",
    strengths: "Strengths",
    canChange: "Patterns can shift",
    nextSteps: "Next steps",
  },
  trackerLink: "Start a no-contact streak",
  methodology: {
    text: "How the scoring works, and what it can and can't tell you:",
    link: "read the methodology",
  },
  otherProfiles: "The other three patterns",
  faqHeading: "Questions people ask",
} as const;

/** "Read about the anxious pattern" — shared by the hub and the quiz page. */
export const readProfileLabel = (name: string) => `Read about the ${name.toLowerCase()} pattern`;

export const hubCopy = {
  h1: "Attachment Styles, Explained for Men",
  intro: [
    "Attachment styles describe how you tend to act when a relationship feels close, distant or under threat — who chases, who goes quiet, and why the same fights keep happening.",
    "There are four patterns. None of them is a medical label or a life sentence. They're a way of naming what you do, so you can see it coming.",
  ],
  quizCta: "Find your pattern",
  profilesHeading: "The four patterns",
  readProfile: readProfileLabel,
  dimensions: {
    heading: "Two scores, not four boxes",
    paragraphs: [
      "Researchers who study adult attachment measure two things. Attachment anxiety is how strongly you react to distance — the fear of being left, and the urge to close the gap. Attachment avoidance is how uncomfortable you are with closeness — the pull to keep space, and to handle things alone.",
      "Everyone has some of both. Your pattern comes from where your two scores fall, each as low, moderate or high. That's why two people with the same label can still look different: one can be secure with an anxious lean, another secure with an avoidant one.",
    ],
    tableCaption:
      "Which pattern each combination lands in. Rows are your anxiety score; columns are your avoidance score.",
    anxietyLabel: "Anxiety",
    avoidanceLabel: "avoidance",
  },
  trap: {
    heading: "Why anxious and avoidant so often end up together",
    paragraphs: [
      "The anxious pattern feels most alive when chasing; the avoidant pattern feels most comfortable with a little distance. Put them together and each one's move sets off the other's: one reaches, the other pulls back, which makes the first reach harder.",
      "It can feel like intense chemistry. Often it's two alarm systems setting each other off. Knowing your own pattern is the first step to seeing the loop while you're in it.",
    ],
    link: "Attachment styles after a breakup",
  },
  notLabels: {
    heading: "Patterns, not labels",
    paragraph:
      "Your attachment pattern describes what you've tended to do in relationships — especially under stress. It isn't a fixed identity and it isn't a verdict on you. Patterns can shift with time, with experience and with a partner who's consistent.",
  },
  sources: {
    heading: "Where to read more",
    paragraph:
      "The ideas on these pages are explained in our own words. If you want to go deeper, the books most readers start with are Attached by Amir Levine and Rachel Heller, and Anxiously Attached by Jessica Baum.",
  },
  faqHeading: "Questions people ask",
} as const;
