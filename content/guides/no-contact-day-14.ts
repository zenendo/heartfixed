import { copy } from "@/config/copy";
import { routes } from "@/config/site";
import type { SituationalGuide } from "./types";

/**
 * Situational instance 1 — No Contact, Day 14 (Section 12.3). Template sections come
 * from config/content.ts. TODO(session-10 founder review): accuracy and voice.
 */

const { partner } = copy;

export const noContactDay14: SituationalGuide = {
  kind: "situational",
  route: routes.guideDay14,
  shortTitle: "No contact, day 14",
  summary: "Why the second week can be harder than the first, and how to get through tomorrow.",
  h1: "No Contact, Day 14",
  intro: [
    "Two weeks in. The shock has worn off, the friends who checked in every day have gone back to their lives, and the resolve that carried you through week one is running low. You might be thinking it's been long enough to just say hi.",
    "This is one of the most common points to break no contact. Here's why, and how to get through the next 24 hours.",
  ],
  headings: { whySpikes: "Why day 14 is harder than day 3" },
  whySpikes: [
    {
      p: "In the first days, adrenaline does a lot of the work. You're angry, or in shock, or busy telling people. By the second week that's gone, and what's left is the quiet — which can feel worse.",
    },
    {
      p: `Two weeks also sounds like a meaningful amount of time. It's long enough for a message to feel calm and reasonable — \"just wanted to see how you're doing\" — and short enough that ${partner.possessive} reply, or silence, would still knock you straight back to day one.`,
    },
    {
      p: "And the support thins out. People assume you're through the worst. Often you're just entering the slower, heavier part.",
    },
  ],
  normal: [
    {
      list: [
        "Sleep still being off, especially waking early with it on your mind.",
        "Good hours followed by a bad evening that feels like starting over.",
        "Doubting the decision — remembering only the good parts.",
        `Wanting to check whether ${partner.subject}'s posted, or whether ${partner.subject} looked at your profile.`,
        "Feeling flat rather than sad, and wondering if that means something's wrong. It usually doesn't.",
      ],
    },
  ],
  mistakes: [
    {
      title: 'The "just checking in" text',
      text: "It feels small and friendly. It reopens everything — and whatever comes back, or doesn't, sets you back to the start.",
    },
    {
      title: "Treating a good day as proof you're done",
      text: "A good day is real progress, not a finish line. It's often the day you let your guard down and check a profile you'd stopped checking.",
    },
    {
      title: "Making a big decision on a bad night",
      text: "Deleting every photo at 2am, downloading three dating apps, or planning a long message. Decide in daylight, after sleep.",
    },
  ],
  next24: [
    {
      when: "Right now",
      what: "Look at your day count. Fourteen days is real. Say the number out loud if it helps.",
    },
    {
      when: "Within the hour",
      what: "Mute or archive the profiles you've been checking. You can undo it later; you can't unsee a story.",
    },
    {
      when: "This evening",
      what: "Plan the evening in advance: who you'll talk to, what you'll eat, what you'll do at the time the urge usually hits.",
    },
    {
      when: "If the urge spikes",
      what: "Don't decide in the moment. Run the five-step check first, or start a 30-minute timer and let it pass.",
    },
    {
      when: "Tomorrow morning",
      what: "Check in on your tracker. Day 15. Notice that the urge last night peaked and passed.",
    },
  ],
  toolBlock: {
    heading: "Keep the count going",
    body: "Your tracker shows every day you've done, and it lives only in this browser. Check in for today.",
  },
};
