import { copy } from "@/config/copy";
import { routes } from "@/config/site";
import { profileCopy, profiles, type ProfileId } from "@/lib/quiz";
import type { ArticleGuide, Section } from "./types";

/**
 * Guide 2 — Attachment Styles After a Breakup (Section 12.3). Each profile's section
 * starts from its profile data (lib/quiz/profiles.ts), so this guide and the result
 * view tell the same story. TODO(session-10 founder review): accuracy and voice.
 */

const { partner } = copy;

const extra: Record<ProfileId, string> = {
  secure:
    "What helps most is permission to grieve without rushing it, and a deliberate decision about contact rather than drifting into friendship before either of you is ready.",
  anxious:
    "What helps most is cutting the checking — mute, archive, put the phone in another room at night — and giving the alarm something steady to hold, like a day count that only goes up.",
  avoidant:
    "What helps most is expecting the late wave, so it doesn't knock you over, and holding off on anything new until you can say what you miss about the old thing.",
  "fearful-avoidant":
    "What helps most is making no big moves at the top of a swing, and keeping one daily habit that stays the same whichever mood you wake up in.",
};

const ORDER: readonly ProfileId[] = ["anxious", "avoidant", "fearful-avoidant", "secure"];

const profileSection = (id: ProfileId): Section => ({
  heading: `If your pattern is ${profiles[id].label.toLowerCase()}`,
  blocks: [
    { p: profileCopy[id].afterBreakup },
    { p: profileCopy[id].noContactRisk },
    { p: extra[id] },
    {
      links: [
        {
          label: `More on the ${profiles[id].name.toLowerCase()} pattern`,
          href: profiles[id].route,
        },
      ],
    },
  ],
});

export const attachmentStylesAfterABreakup: ArticleGuide = {
  kind: "article",
  route: routes.guideAfterBreakup,
  shortTitle: "Attachment styles after a breakup",
  summary: "How each pattern tends to behave after a breakup, and the trap two of them fall into.",
  h1: "Attachment Styles After a Breakup",
  intro: [
    "A breakup is the moment your attachment pattern is easiest to see. Whatever you tend to do when a relationship feels threatened — chase, withdraw, or both — you'll probably do it now, louder.",
    "Knowing the pattern doesn't make the breakup hurt less. It does make the urges easier to spot before you act on them.",
  ],
  sections: [
    {
      heading: "Why a breakup sets the pattern off",
      blocks: [
        {
          p: "Attachment patterns are about how you react when closeness is at risk. A breakup is the biggest version of that risk: the person you relied on is suddenly gone, and the part of you that tracks closeness goes into overdrive.",
        },
        {
          p: "Two things shape the reaction: how strongly you react to distance (attachment anxiety) and how much you pull away from closeness (attachment avoidance). Where you sit on each predicts a lot about the weeks after.",
        },
        {
          links: [
            { label: "The four attachment styles, explained", href: routes.attachmentStyles },
          ],
        },
      ],
    },
    ...ORDER.map(profileSection),
    {
      heading: "The anxious–avoidant trap",
      blocks: [
        {
          p: "The most common painful pairing is an anxious pattern with an avoidant one. In the relationship, one reaches and the other pulls back, which makes the first reach harder. It can feel like intense chemistry; often it's two alarm systems setting each other off.",
        },
        {
          p: `After the breakup, the loop keeps running at a distance. If you're the anxious one, ${partner.possessive} silence reads as a message you have to answer. If you're the avoidant one, the relief of space hides the grief until later. Either way, reaching out restarts the cycle you just left.`,
        },
        {
          callout:
            "If you recognise the loop, the most useful thing you can do is stop feeding it for a while. That's what no contact is for.",
        },
      ],
    },
    {
      heading: "What to do with this",
      blocks: [
        {
          list: [
            "Find your own pattern rather than guessing it. The two scores tell you more than a label does.",
            'Name the urge when it comes: "that\'s the alarm" or "that\'s me pulling away". Naming it buys a few seconds.',
            "Plan for your risk window — nights for the anxious pattern, the late wave for the avoidant one, the swings for fearful-avoidant.",
            "Count the days without contact. It gives every pattern something steady.",
          ],
        },
      ],
    },
  ],
  toolBlock: {
    heading: "Find your pattern",
    body: `Take the quiz: a self-reflection assessment informed by attachment research. 44 questions about what you actually did — and what ${copy.partner.subject} did — in your last relationship, about 5 minutes, and the full result is free.`,
  },
};
