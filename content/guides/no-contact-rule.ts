import { copy } from "@/config/copy";
import { routes } from "@/config/site";
import { trackerPage } from "@/content/tracker";
import type { ArticleGuide } from "./types";

/**
 * Guide 1 — The No Contact Rule (Section 12.3): the situational cluster's hub. "What
 * counts as contact" and the goal guidance reuse the tracker's definitions, so the two
 * pages can never disagree. TODO(session-10 founder review): accuracy and voice.
 */

const { partner } = copy;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const noContactRule: ArticleGuide = {
  kind: "article",
  route: routes.noContactRule,
  shortTitle: "The no-contact rule",
  summary: "What counts, how long, the real exceptions, and what to do if it breaks.",
  h1: "The No Contact Rule",
  intro: [
    `No contact is a set stretch of time with no calls, texts, messages or meetups with your ex. It's the single most useful thing you can do in the first weeks after a breakup — not because it changes ${partner.object}, but because it stops feeding the part of you that can't let go.`,
    "This page covers what counts, how long to go for, the exceptions that are real, and what to do when the rule gets tested.",
  ],
  sections: [
    {
      heading: "Why it works",
      blocks: [
        {
          p: 'Every message, every look at a profile, every "just checking in" restarts the same loop: hope, waiting, disappointment, and the urge to try again. No contact breaks the loop by taking away the thing that keeps it running.',
        },
        {
          p: "It isn't a tactic and it isn't a punishment. It's space — to sleep, to stop checking, and to find out what you actually want once the panic settles.",
        },
      ],
    },
    {
      heading: trackerPage.contact.heading,
      blocks: [
        { p: trackerPage.contact.intro },
        { list: trackerPage.contact.items },
        { p: trackerPage.contact.strictness },
        { p: trackerPage.contact.soft },
      ],
    },
    {
      heading: "How long: 30, 60 or 90 days",
      blocks: [
        { list: trackerPage.goals.items.map((goal) => `${goal.days} days — ${goal.text}`) },
        {
          p: "Pick one and count it. If you reach it and want more distance, extend it — the days you've done still count.",
        },
      ],
    },
    {
      heading: "The exceptions that are real",
      blocks: [
        {
          p: "Some things genuinely need contact. The rule bends for them, but only as far as the thing itself.",
        },
        {
          list: [
            "Children you share. Keep contact to the children: schedules, handovers, school, health. Short, factual and polite. A shared calendar or a co-parenting app can keep it there.",
            "Housing and money. Leases, bills, deposits, shared accounts and belongings. Say what needs doing, agree it, and stop.",
            "Emergencies. A real emergency is an exception. A bad night is not.",
          ],
        },
        {
          callout:
            "The test for any exception: would this message make sense if you felt nothing at all? If it's about the thing, send it. If it's a way back into a conversation, it isn't an exception.",
        },
      ],
    },
    {
      heading: `What to do if ${partner.subject} gets in touch`,
      blocks: [
        {
          p: `When ${partner.subject} reaches out, that doesn't break your no contact — replying does, unless it's genuine logistics. You don't owe an instant reply. Put the phone down, wait until you're calm, and work out what the message is actually asking for.`,
        },
        {
          p: "If it's logistics, answer that and nothing more. If it's anything else, you can take a day before deciding whether to reply at all.",
        },
        {
          links: [
            {
              label: `Read: ${cap(partner.subject)} texted me during no contact`,
              href: routes.guideSheTexted,
            },
            { label: "Check a reply before you send it", href: routes.decision },
          ],
        },
      ],
    },
    {
      heading: "If you slip",
      blocks: [
        {
          p: "It happens. A slip restarts the counter; it doesn't erase the days you already did. Notice what set it off — the time, the place, the drink, the song — and plan for that next time.",
        },
        {
          p: "Then start again today. The tracker keeps your longest streak and your total days without contact, so the progress is still on the record.",
        },
      ],
    },
    {
      heading: "Is no contact a way to win someone back?",
      blocks: [
        {
          p: "No. It's often sold that way, and that framing turns every day into a test of whether it's \"working\". Some men want to reconcile, some want to move on — and many don't know yet. Either way, the first weeks look the same: no contact. You'll make a better decision about the relationship from day 30 than from day 3.",
        },
      ],
    },
    {
      heading: "What the first month tends to feel like",
      blocks: [
        {
          list: [
            "Days 1–3: the hardest stretch for many men. Sleep and appetite are off, and the urge to reach out comes in waves.",
            "Days 4–10: fewer waves, but they hit hard — often at night, after a drink, or when something reminds you.",
            'Days 11–17: the resolve that got you through week one starts to fade, and "it\'s been long enough to say hi" starts to sound reasonable.',
            "Days 18–30: more ordinary hours. Bad days still come, but they pass faster, and you notice you went a morning without checking.",
          ],
        },
        {
          p: "Everyone's timeline is different, and none of this is a promise. It's what the stretch often looks like, so the hard days don't convince you something is wrong.",
        },
        { links: [{ label: "No contact, day 14: why it gets harder", href: routes.guideDay14 }] },
      ],
    },
  ],
  toolBlock: {
    heading: "Count the days",
    body: "Start a no-contact streak now. It takes ten seconds, needs no account, and lives only in this browser.",
  },
  faqs: [
    {
      question: "How long should no contact last?",
      answer:
        "Thirty days is the standard starting goal. Choose 60 or 90 for a long relationship or a history of breaking up and getting back together. You can extend at any point without losing the days you've done.",
    },
    {
      question: `Does looking at ${partner.possessive} profile break no contact?`,
      answer: `It doesn't reach ${partner.object}, so strictly it isn't contact. But it keeps the loop running the same way, and most men count it when they're honest. Muting or archiving makes it easier.`,
    },
    {
      question: "What if we have children together?",
      answer:
        "Keep contact to the children — schedules, handovers, school and health — and keep it short and factual. That isn't breaking no contact. Conversations about the relationship are.",
    },
    {
      question: `What if ${partner.subject} texts me first?`,
      answer:
        "Their message doesn't reset your count; your reply does, unless it's genuine logistics. Wait until you're calm, work out what the message is asking for, and answer only that if it needs an answer.",
    },
  ],
};
