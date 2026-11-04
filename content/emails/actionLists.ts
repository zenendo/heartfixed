import type { ProfileId } from "@/lib/quiz";

/**
 * "Your first 14 days" — the action list the result email adds (Sections 10.3, 13.2),
 * one per profile. Behaviour-level, no promised outcome, no timeline promise.
 * TODO(session-9 founder review): word-by-word, like the profile copy.
 */
export interface ActionStage {
  days: string;
  actions: readonly string[];
}

export const actionLists: Record<ProfileId, readonly ActionStage[]> = {
  secure: [
    {
      days: "Days 1–3",
      actions: [
        "Decide on no contact on purpose, and pick a goal: 30, 60 or 90 days.",
        "Tell two people the truth about how you're doing.",
      ],
    },
    {
      days: "Days 4–7",
      actions: [
        "Keep your routines: sleep, food, training, even when they feel pointless.",
        'Notice any pull towards a "just being friendly" message, and wait it out.',
      ],
    },
    {
      days: "Days 8–14",
      actions: [
        "Write down what worked in the relationship and what didn't, including your part.",
        "If your result named a lean, read that profile: it's the pattern stress pulls you towards.",
      ],
    },
  ],
  anxious: [
    {
      days: "Days 1–3",
      actions: [
        "Start a no-contact streak and check in every day.",
        "Mute or archive your ex's profiles so each look doesn't restart the loop.",
      ],
    },
    {
      days: "Days 4–7",
      actions: [
        "Plan your evenings in advance: who you'll talk to and what you'll do when the urge peaks.",
        "When you want to send something, write it, run the five-step check, and save it unsent.",
      ],
    },
    {
      days: "Days 8–14",
      actions: [
        "Each time you notice the alarm (checking, replaying, drafting), name it out loud.",
        "Expect the second week to feel heavier, not lighter. That's common, and it passes.",
      ],
    },
  ],
  avoidant: [
    {
      days: "Days 1–3",
      actions: [
        "Start a no-contact streak, even if it feels unnecessary right now.",
        "Hold off on dating apps until you can say what you miss about the relationship.",
      ],
    },
    {
      days: "Days 4–7",
      actions: [
        'Once a day, write one sentence about how you actually feel, even "nothing much".',
        'Tell one person the honest version, not the "I\'m fine" version.',
      ],
    },
    {
      days: "Days 8–14",
      actions: [
        "Expect a late wave of grief, often weeks in. Plan what you'll do when it arrives.",
        "Look at your own part in how it ended, not only the reasons it was right to end.",
      ],
    },
  ],
  "fearful-avoidant": [
    {
      days: "Days 1–3",
      actions: [
        "Start a no-contact streak. A count that only goes up holds steady across moods.",
        "Make one rule: no blocking, unblocking or long messages at the top of a swing.",
      ],
    },
    {
      days: "Days 4–7",
      actions: [
        "Keep one daily habit that doesn't change with your mood: a walk, the gym, a bedtime.",
        'When you swing, name which side it is: "this is the cold side" or "this is the alarm".',
      ],
    },
    {
      days: "Days 8–14",
      actions: [
        "Before sending anything, run the five-step check and sleep on the answer.",
        "Notice that the swings pass. Write down one that did.",
      ],
    },
  ],
};
