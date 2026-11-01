import { copy } from "@/config/copy";
import type { FaqItem } from "@/lib/seo/schema";

/**
 * FAQ copy per tool page (Section 7.2). The visible FAQ and the FAQPage schema both
 * render from these lists — never schema-only questions (Section 12.2).
 */

const { partner } = copy;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const faqs: { tracker: FaqItem[] } = {
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
};
