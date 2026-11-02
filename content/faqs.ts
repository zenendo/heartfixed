import { copy } from "@/config/copy";
import type { ProfileId } from "@/lib/quiz";
import type { FaqItem } from "@/lib/seo/schema";

/**
 * FAQ copy per tool page (Section 7.2). The visible FAQ and the FAQPage schema both
 * render from these lists — never schema-only questions (Section 12.2).
 */

const { partner } = copy;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const faqs: {
  tracker: FaqItem[];
  decision: FaqItem[];
  attachmentStyles: FaqItem[];
  profiles: Record<ProfileId, FaqItem[]>;
} = {
  tracker: [
    {
      question: "Does my tracker data leave this browser?",
      answer:
        "No. Your streak, check-ins and notes are saved only in this browser on this device. There is no account and nothing is sent to a server. You can download your data or delete it at any time from the “Your data” panel.",
    },
    {
      question: "What counts as contact?",
      answer: `Calls, texts, DMs, social-media interaction, meeting in person, and asking friends about ${partner.object}. Viewing ${partner.possessive} stories counts if you want the strict version. Checking ${partner.possessive} profiles doesn't reach ${partner.object}, but most men count it when they're honest.`,
    },
    {
      question: "Why is 30 days the default goal?",
      answer:
        "Thirty days is the standard starting goal: long enough to get through the hardest first stretch, short enough to see the end of. When you reach it you can extend to 60 or 90 days without losing your history.",
    },
    {
      question: "What happens if I slip?",
      answer:
        "Tap “I broke no contact” and answer one question. The counter restarts today, and your longest streak and total days without contact are kept. The days you already did still count.",
    },
    {
      question: `What if ${partner.subject} contacts me first?`,
      answer: `${cap(partner.subject)} reaching out doesn't reset your counter — replying does, unless it's genuine logistics like belongings, money or a shared obligation. Before you answer, use the “Should I text my ex?” tool to check what your reply is really for.`,
    },
    {
      question: "Can I use the tracker on my phone and my laptop?",
      answer:
        "Each browser keeps its own tracker, and nothing syncs between them. Pick the one you'll have with you — usually your phone — and use that.",
    },
  ],
  decision: [
    {
      question: "Is my draft sent anywhere or stored?",
      answer:
        "No. The checks run in your browser. Your draft isn't sent to a server, isn't stored after you leave the page, and nobody sees it. The only exception is if you choose “Save it unsent” — then it's kept on this device only, until you delete it.",
    },
    {
      question: "Is this AI?",
      answer:
        "No. It's a fixed set of rules written in advance. The same answers always give the same result, and nothing about your message leaves your device.",
    },
    {
      question: "Why does it always say don't send when I've been drinking?",
      answer:
        "Because that rule holds every time. Nothing good gets sent drunk or at a 9 out of 10. What you want to say can still be true in the morning — and you can run the check again then.",
    },
    {
      question: "When does it say sending is reasonable?",
      answer:
        "Only for logistics — belongings, money, housing, or something you still share — when you're calm, you haven't drafted and deleted it repeatedly, and the draft is short, plain and free of pressure phrases.",
    },
    {
      question: `Can it tell me how ${partner.subject}'ll respond?`,
      answer:
        "No. It doesn't predict anyone's response, and it takes no side on whether you should try to get back together. It only helps you decide whether to send this message now.",
    },
    {
      question: "What is the unsent list?",
      answer:
        "A private place to keep what you wanted to say without sending it. It's stored only on this device, and you can delete any message, or all of them, at any time.",
    },
  ],
  attachmentStyles: [
    {
      question: "What are the four attachment styles?",
      answer:
        "Secure, anxious (also called preoccupied), avoidant (also called dismissive) and fearful-avoidant (also called disorganized). Each describes how you tend to act when a relationship feels close, distant or under threat.",
    },
    {
      question: "Can your attachment style change?",
      answer:
        "Yes. An attachment style is a pattern, not a fixed trait. It can shift with time, with experience, and with consistent relationships — and stress, like a breakup, can pull anyone away from secure for a while.",
    },
    {
      question: "Is an attachment style a mental-health condition?",
      answer:
        "No. Attachment styles describe patterns of behaviour in relationships. They're a way of understanding what you do, not a medical label, and nothing on this site assesses your mental health.",
    },
    {
      question: "How do I find out my attachment style?",
      answer:
        "Take the free quiz on this site. It asks 24 questions about what you actually did in your last relationship and what you're doing now, takes about 3 minutes, and shows your full result without an email.",
    },
  ],
  profiles: {
    secure: [
      {
        question: "Can a man with a secure attachment style still struggle after a breakup?",
        answer:
          "Yes. Secure doesn't mean it doesn't hurt. It means the hurt tends to stay the size of the event, and you're more likely to lean on people and keep your routines while you get through it.",
      },
      {
        question: 'What does "secure with an anxious lean" mean?',
        answer:
          "Both scores are in the secure range, but your anxiety score is moderate rather than low. Most of the time you're steady; under stress, the anxious pattern — checking, replaying, wanting an answer now — is the one to watch.",
      },
      {
        question: "Should someone with a secure pattern still do no contact?",
        answer:
          "Usually, yes. The risk is the friendly, reasonable-sounding message that reopens things before either of you is ready. No contact makes that decision deliberate rather than casual.",
      },
    ],
    anxious: [
      {
        question: "What are the signs of anxious attachment in men?",
        answer:
          "Checking your phone repeatedly when a message goes unanswered, needing to settle an argument the same night, asking for reassurance often, and replaying small changes in your partner's tone. It's about what you do, not how you feel about yourself.",
      },
      {
        question: "Why is no contact so hard with an anxious attachment style?",
        answer:
          'Because distance is exactly what sets off the alarm. Every check of your phone or your ex\'s profile restarts the loop, and every replay of "what if we just talked" makes a message feel reasonable. Cutting the checking makes the rest easier.',
      },
      {
        question: "Is anxious attachment the same as being needy?",
        answer:
          "No. It's an alarm system that goes off early and loudly when closeness feels threatened. The pattern can be changed by noticing the alarm and waiting it out before you act on it.",
      },
    ],
    avoidant: [
      {
        question: "What are the signs of avoidant attachment in men?",
        answer:
          "Taking longer to reply when things get serious, ending arguments by going quiet or leaving the room, not knowing how you feel when asked, and focusing on small flaws when the relationship gets close.",
      },
      {
        question: "Do avoidant men miss their ex?",
        answer:
          "Often, yes — but later. With an avoidant pattern, the first weeks can feel like relief or like nothing much, and the grief tends to arrive weeks on, triggered by a song, a place or a quiet night.",
      },
      {
        question: "Does avoidant attachment mean I don't care?",
        answer:
          "No. It means closeness has a cost your system works to keep low. Many people with this pattern care a great deal; they're just more comfortable showing it with a little distance.",
      },
    ],
    "fearful-avoidant": [
      {
        question: "What are the signs of fearful-avoidant attachment in men?",
        answer:
          "Wanting closeness and then pulling away from it, looking for what will go wrong when things are good, pushing hard in arguments and then shutting down, and testing whether the relationship will hold.",
      },
      {
        question: "Why do I keep going back and forth about my ex?",
        answer:
          "With a fearful-avoidant pattern, the anxious and avoidant sides take turns. One day you're certain it's over; the next you want to reach out. The swings are the pattern, not proof that either side is right.",
      },
      {
        question: "Is fearful-avoidant the same as disorganized attachment?",
        answer:
          "Yes. Both names describe the pattern where attachment anxiety and attachment avoidance are both high. This site uses fearful-avoidant as the main name and disorganized as the alternative.",
      },
    ],
  },
};
