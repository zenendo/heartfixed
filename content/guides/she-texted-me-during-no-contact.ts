import { copy } from "@/config/copy";
import { routes } from "@/config/site";
import type { SituationalGuide } from "./types";

/**
 * Situational instance 2 — the "texted me during no contact" guide (Section 12.3). The
 * partner reference comes from config/copy.ts. Takes no side on reconciling (Section
 * 2.1). TODO(session-10 founder review): accuracy and voice.
 */

const { partner } = copy;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const Subject = cap(partner.subject);

export const sheTextedMeDuringNoContact: SituationalGuide = {
  kind: "situational",
  route: routes.guideSheTexted,
  shortTitle: `${Subject} texted me during no contact`,
  summary: `What to do in the first hour after ${partner.possessive} name lights up your phone.`,
  h1: `${Subject} Texted Me During No Contact`,
  intro: [
    `You've been holding no contact, and then ${partner.possessive} name lights up your phone. Your heart rate jumps, and the reply is half-written before you've finished reading.`,
    "Before you send anything: this page is about the next 24 hours. It won't tell you what the message means — nobody can — but it will help you answer it, or not, in a way you won't regret tomorrow.",
  ],
  headings: { whySpikes: "Why it feels so urgent" },
  whySpikes: [
    {
      p: "A message after silence feels like the answer you've been waiting for. Your mind fills the gap instantly: a change of heart, an apology, a wish to talk. Or the opposite. Either way, it feels like the moment that decides everything.",
    },
    {
      p: `It usually isn't. Most messages during no contact are small: a returned item, a birthday, a \"hope you're okay\". What ${partner.subject} meant by it is something only ${partner.subject} knows. What you do next is the only part that's yours.`,
    },
  ],
  normal: [
    {
      list: [
        "Relief and anxiety at the same time.",
        "Rereading the message over and over for meaning.",
        "Wanting to reply right now, before the moment passes.",
        "Feeling that not replying is rude, or a game. It isn't — taking time is allowed.",
        "Your day count feeling fragile. A message from the other side doesn't reset it.",
      ],
    },
  ],
  mistakes: [
    {
      title: "Replying in the first few minutes",
      text: "The fastest reply is the one written by the adrenaline. Nothing in an ordinary message needs an answer this minute.",
    },
    {
      title: "Answering a short message with a long one",
      text: "Feelings, apologies, questions about what it means. A long reply to a small message hands over everything you've rebuilt in one go.",
    },
    {
      title: "Ignoring something that genuinely needs an answer",
      text: "If it's logistics — keys, money, a lease, the children — a short, polite reply about that thing is fine. It isn't breaking no contact.",
    },
  ],
  next24: [
    { when: "Right now", what: "Don't reply yet. Put the phone face down or in another room." },
    {
      when: "Within the hour",
      what: "Ask what the message is actually for. Is it logistics that needs an answer, or something else?",
    },
    {
      when: "If it's logistics",
      what: "Write a short reply about the practical thing and nothing more. Run it through the five-step check, then send it when you're calm.",
    },
    {
      when: "If it's anything else",
      what: "You don't owe a reply today. Save what you want to say somewhere private, unsent, and sleep on it.",
    },
    {
      when: "Tonight",
      what: "No replies after 11pm. Late messages are the ones people most often wish they hadn't sent.",
    },
    {
      when: "Tomorrow",
      what: "Read the message again with a clear head. Decide whether to reply then — and if you do, check it first.",
    },
  ],
  toolBlock: {
    heading: "Before you reply",
    body: "Use this first. Five short steps and a draft check, built for exactly this moment. Your draft never leaves your browser.",
  },
  faqs: [
    {
      question: `Does ${partner.possessive} message reset my no-contact streak?`,
      answer: `No. When ${partner.subject} reaches out, that doesn't reset your count. Replying does, unless the reply is genuine logistics like belongings, money or a shared obligation.`,
    },
    {
      question: "Should I reply at all?",
      answer:
        "If it's logistics, a short reply about that thing is fine. If it's anything else, you don't have to decide today. Wait until you're calm, ideally the next morning, and check what your reply would be for.",
    },
  ],
};
