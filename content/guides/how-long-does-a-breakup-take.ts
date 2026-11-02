import { routes } from "@/config/site";
import type { ArticleGuide } from "./types";

/**
 * Guide 3 — How Long Does a Breakup Take? (Section 12.3). Honest ranges, no promised
 * timeline (Section 14.2). Written so a 30/60/90-day structure reads as a natural next
 * step later (Section 15) without selling anything not yet built. Carries the
 * in-content affiliate slot (Section 13.4), disabled at launch.
 * TODO(session-10 founder review): accuracy and voice.
 */
export const howLongDoesABreakupTake: ArticleGuide = {
  kind: "article",
  route: routes.guideHowLong,
  shortTitle: "How long does a breakup take?",
  summary: "Honest ranges, what makes it longer, and what the first 90 days tend to feel like.",
  h1: "How Long Does a Breakup Take?",
  intro: [
    "Nobody can give you a date. Anyone who promises you a fixed number of days is selling something. What you can get is an honest range, the things that stretch it out, and a sense of what the next three months tend to feel like, so the hard days don't convince you you're stuck.",
  ],
  sections: [
    {
      heading: "The honest answer",
      blocks: [
        {
          p: "For many people, the sharpest pain eases over a few weeks to a few months. Feeling genuinely settled — able to think about the relationship without it taking over the day — usually takes longer, and longer again after a long relationship or one that ended suddenly.",
        },
        {
          p: "It also isn't a straight line. Most people get better in a zigzag: a good week, then a bad day that feels like starting over. It isn't. The bad days get shorter and further apart, even when it doesn't feel that way from inside one.",
        },
      ],
    },
    {
      heading: "What makes it take longer",
      blocks: [
        {
          list: [
            "Ongoing contact. Every conversation restarts the clock — this is the biggest one you control.",
            "Checking. Profiles, stories, mutual friends. Each look keeps the wound open.",
            "A long or shared life: living together, shared friends, a shared city, shared plans.",
            "A sudden ending, or one you didn't choose and didn't see coming.",
            "Rebounding fast, so the feelings get postponed rather than felt.",
            "Other losses landing at the same time — a job, a move, a death.",
          ],
        },
      ],
    },
    {
      heading: "The first 90 days, roughly",
      blocks: [
        {
          p: "This is what the stretch often looks like. Yours will differ; use it as a map, not a schedule.",
        },
        {
          list: [
            "Weeks 1–2: shock and the strongest urges. Sleep, appetite and focus are off. Getting through each day is enough.",
            "Weeks 3–4: the adrenaline fades and the sadness can get heavier, which is confusing — it can feel like going backwards. It's usually the opposite.",
            "Weeks 5–8: more ordinary hours. Reminders still hit hard, but you recover from them faster. You start noticing time you didn't spend thinking about it.",
            "Weeks 9–12: the relationship starts to become something that happened rather than something happening. You can look at what went wrong — including your part — without it flattening you.",
          ],
        },
        {
          p: "Thinking in 30-day stretches helps: each one has a different job. The first is about not making it worse. The second is about getting your days back. The third is about understanding what happened, so it doesn't repeat.",
        },
      ],
    },
    {
      heading: "What actually helps",
      blocks: [
        {
          list: [
            "No contact, for a set number of days you've chosen in advance.",
            "Sleep, food and movement before insight. You can't think clearly on four hours.",
            "Telling two or three people the truth about how you're doing.",
            "Keeping one routine that doesn't depend on mood: a walk, the gym, a set bedtime.",
            "Understanding your own pattern — why you chase, or go quiet, or both.",
          ],
        },
        {
          links: [
            { label: "The no-contact rule", href: routes.noContactRule },
            { label: "Attachment styles after a breakup", href: routes.guideAfterBreakup },
          ],
        },
        { slot: "guide-how-long-in-content" },
      ],
    },
    {
      heading: "When it's more than a breakup",
      blocks: [
        {
          p: "If weeks pass and you still can't sleep, eat, work or get out of bed — or if the heaviness keeps getting worse instead of coming in waves — that's worth talking to a doctor or a licensed professional about. It isn't weakness, and you don't have to wait for it to get worse first.",
        },
        {
          p: "If you're having thoughts of harming yourself, please reach out to a person today.",
        },
        { links: [{ label: "Crisis resources", href: routes.crisis }] },
      ],
    },
  ],
  toolBlock: {
    heading: "Start with the first 30 days",
    body: "Count the days without contact. It takes ten seconds, needs no account, and lives only in this browser.",
  },
};
