import { routes } from "@/config/site";
import { honestFraming } from "@/content/compliance";
import type { EmailTemplate } from "./types";

/**
 * The welcome sequence — Section 13.2: five list emails over ten days, loaded into the
 * email provider's automation for new list members. Marketing email: every one carries
 * one-click unsubscribe and the config mailing address (added by the renderer).
 * Rules: no manufactured urgency, no subscription language, nothing written as a person
 * missing him (Section 14.1, item 7). TODO(session-9 founder review): voice and accuracy.
 */
export const welcomeSequence: readonly EmailTemplate[] = [
  {
    id: "welcome-1",
    sendDay: 0,
    subject: "Start here: the one tool for week one",
    preheader: "What these emails are, and the most useful thing to do this week.",
    blocks: [
      {
        p: "You joined the list, so here's what to expect: five emails over the next ten days, then one or two a week. Each one is short and has one thing to do. Unsubscribe anytime with the link at the bottom.",
      },
      {
        p: "If you took the quiz, your result is saved in the browser you took it on. If you didn't, it's the best ten minutes you can spend on understanding why this hit the way it did.",
      },
      {
        p: "But if the breakup is recent, the most useful thing this week isn't insight. It's not making it worse. That means no contact, counted one day at a time.",
      },
      { link: { label: "Start your no-contact streak", href: routes.tracker } },
      { link: { label: "Take the attachment quiz", href: routes.quiz } },
    ],
  },
  {
    id: "welcome-2",
    sendDay: 2,
    subject: "The no-contact rules that actually hold",
    preheader: "What counts, how long, and the exceptions that are real.",
    blocks: [
      {
        p: "Most no-contact advice is either too vague to follow or sold as a tactic. Here's the version that holds up:",
      },
      {
        list: [
          'Count calls, texts, DMs, likes, story replies and "just dropping something off".',
          "Pick a goal — 30 days is the standard start — and count it.",
          "The real exceptions are children, housing, money and emergencies. Keep those messages to the thing itself.",
          "A slip restarts the count. It doesn't erase the days you did.",
        ],
      },
      { link: { label: "Read the full no-contact rule", href: routes.noContactRule } },
    ],
  },
  {
    id: "welcome-3",
    sendDay: 4,
    subject: "Why this breakup hits the way it does",
    preheader: "Your attachment pattern shows up loudest right now.",
    blocks: [
      {
        p: "A breakup is when your attachment pattern is easiest to see. If you chase, you'll want to chase. If you go quiet, you'll go quiet — and the grief may arrive later. Some people do both.",
      },
      {
        p: "Knowing which one you are doesn't make it hurt less. It does make the urges easier to spot before you act on them.",
      },
      { link: { label: "Attachment styles after a breakup", href: routes.guideAfterBreakup } },
      { link: { label: "The books worth reading, by moment", href: routes.resources } },
    ],
  },
  {
    id: "welcome-4",
    sendDay: 7,
    subject: "The day it gets harder, not easier",
    preheader: "Why the second week can be worse than the first.",
    blocks: [
      {
        p: 'Around the second week, a lot of men find it gets harder. The shock wears off, people stop checking in, and "it\'s been long enough to say hi" starts to sound reasonable.',
      },
      {
        p: "That's normal, and it passes. Two short guides for exactly this stretch — including what to do if your ex gets in touch first:",
      },
      { link: { label: "No contact, day 14", href: routes.guideDay14 } },
      { link: { label: "If your ex texts during no contact", href: routes.guideSheTexted } },
    ],
  },
  {
    id: "welcome-5",
    sendDay: 10,
    subject: "When a book isn't enough",
    preheader: "Programmes that go deeper — and how to pick the right one.",
    blocks: [
      {
        p: "The free tools will take you a long way. If you want a structured plan to follow, there are programmes that go deeper than a website can.",
      },
      { p: honestFraming.text },
      {
        slot: "email-welcome-5",
        fallback: { label: "See the recommended resources", href: routes.resources },
      },
    ],
  },
];
