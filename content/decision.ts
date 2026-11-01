import { copy } from "@/config/copy";
import { draftCheck, urgeTimer } from "@/config/content";
import type { Outcome, Purpose } from "@/lib/tools/decision";

/**
 * "Should I text my ex?" copy — Section 11.2. Partner references resolve through
 * config/copy.ts (Section 2.3).
 *
 * Rules: the tool is deterministic and the copy never implies AI, a person reading,
 * or a chat. It takes no position on reconciliation and never predicts how anyone
 * will respond.
 */

const { partner } = copy;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const RULE_LINE =
  "Nothing good gets sent drunk or at a 9. It can be true at 10am; it can't be sent at 1am like this.";

export const NO_POSITION =
  "This tool doesn't predict how anyone will respond, and it takes no side on whether you should try to get back together. It only helps you decide whether to send this, now.";

export const decisionCopy = {
  h1: "Should I Text My Ex?",
  intro:
    "Five short steps before you hit send. Fixed, rule-based checks that run on your device — no AI, no chat, and nobody reading it.",
  directTimer: {
    lead: "Not up to the steps right now?",
    cta: "Just start the 30-minute urge timer",
  },
  fromTracker: (day: number) => `From your tracker: Day ${day} of no contact.`,
  progress: (step: number, total: number) => `Step ${step} of ${total}`,
  next: "Continue",
  back: "Back",
  startOver: "Start over",
  chooseError: "Choose an answer to continue.",

  timing: {
    heading: "How long has it been?",
    breakupLegend: "Since the breakup",
    contactLegend: "Since you last had contact",
    breakup: {
      "under-14-days": "Less than 2 weeks",
      "14-days-to-3-months": "2 weeks to 3 months",
      "over-3-months": "More than 3 months",
    },
    contact: {
      "under-7-days": "In the last 7 days",
      "7-to-30-days": "1 to 4 weeks ago",
      "over-30-days": "More than a month ago",
    },
  },

  purpose: {
    heading: "What is the message actually for?",
    help: "Pick the one that's most true, not the one that sounds best.",
    options: {
      logistics: {
        label: "Logistics",
        description: "Belongings, money, housing, or something you still share",
      },
      "apology-closure": { label: "An apology or closure", description: undefined },
      "miss-them": { label: `I miss ${partner.object}`, description: undefined },
      "want-them-back": { label: `I want ${partner.object} back`, description: undefined },
      "upset-by-them": {
        label: `${cap(partner.subject)} did something that upset me`,
        description: undefined,
      },
      "no-reason": { label: "No reason — I just want contact", description: undefined },
    } satisfies Record<Purpose, { label: string; description: string | undefined }>,
  },

  state: {
    heading: "An honest check on right now",
    alcoholLegend: "Have you been drinking tonight?",
    intensityLabel: "How intense does it feel right now?",
    intensityHelp: "0 is calm. 10 is the most intense it gets.",
    intensityValue: (n: number) => `${n} out of 10`,
    draftedLegend: "Have you already drafted and deleted this more than once?",
    yes: "Yes",
    no: "No",
  },

  draft: {
    heading: "Check the draft (optional)",
    help: "Paste the message you're about to send. These are rule-based observations, not a judgement.",
    label: "Your draft",
    skip: "Skip — I don't have a draft",
    clean: "No flags from these checks.",
    length: (n: number) => `${n} characters`,
    tooLong: `Long — over ${draftCheck.maxLength} characters. Logistics fit in two sentences.`,
    questions: (n: number) => `${n} question ${n === 1 ? "mark" : "marks"}`,
    manyQuestions: "A lot of questions puts pressure on a reply.",
    pressure: (phrases: string[]) => `Pressure phrases: ${phrases.map((p) => `“${p}”`).join(", ")}`,
    ultimatums: (phrases: string[]) => `Ultimatums: ${phrases.map((p) => `“${p}”`).join(", ")}`,
    apologies: (n: number) => `${n} apologies stacked — one is enough if it's meant.`,
    night: "Night-send risk: it's between 11pm and 5am where you are.",
  },

  outcome: {
    heading: {
      dont_send: "Don't send this.",
      wait_24h: "Wait 24 hours, then re-run this.",
      logistics_ok: "Sending can be reasonable — send the logistics version.",
    } satisfies Record<Outcome, string>,
    reasons: {
      "forced-alcohol": `You've been drinking tonight. ${RULE_LINE}`,
      "forced-intensity": `You rated this a high intensity. ${RULE_LINE}`,
      "logistics-clean":
        "It's logistics, you're calm, and the draft is clean. Keep it to the facts and send the short version.",
      "logistics-not-yet":
        "Logistics can be worth sending — but not this version yet. Make it short and plain, sleep on it, and run it again.",
      "closure-clean":
        "This one is genuine, and the draft is clear of flags. The timing still matters: sleep on it and run it again tomorrow.",
      default: {
        logistics: "",
        "apology-closure":
          "Closure can be worth writing. Right now the timing or the draft says wait — write it out and keep it instead.",
        "miss-them": `Missing ${partner.object} is real. Sending it tends to restart the hardest part instead of ending it.`,
        "want-them-back": `Wanting ${partner.object} back is a real goal, and this tool takes no side on it. A message sent from this moment isn't the way to act on it.`,
        "upset-by-them":
          "You're allowed to be upset. A message written while you are rarely lands the way you mean it.",
        "no-reason": "Wanting contact for its own sake is the urge itself. Let it pass first.",
      } satisfies Record<Purpose, string>,
    },
    logisticsWhy: {
      noDraft: "The checks need to see a draft before they can clear it.",
      drafted:
        "You've drafted and deleted it more than once — a sign it's carrying more than logistics.",
      flagged: "The draft check raised the flags below. Trim it to the facts.",
    },
    draftFlagsHeading: "What the draft check saw",
    noPosition: NO_POSITION,
    nextHeading: "What to do instead",
    saveUnsent: "Save it unsent",
    writeItOut: "Write it out instead",
    writeLabel: "Write what you wanted to say",
    vaultNote: "Saved only on this device, in your unsent list, until you delete it.",
    saved: "Saved to your unsent list. It wasn't sent.",
    startTimer: "Start the 30-minute urge timer",
    openTracker: "Open your tracker",
    startTracker: "Start a no-contact streak",
    recheckAt: (when: string) => `Re-check: ${when}.`,
    setReminder: "Remind me on this device",
    reminderSet: (when: string) => `Reminder saved on this device for ${when}.`,
    logisticsGuide: {
      heading: "The logistics version",
      points: [
        "One or two sentences.",
        "One question, if you need an answer.",
        "No feelings, no history, no “hope you're well” lead-in.",
      ],
      pattern: "Pattern: “Hi — I'd like to pick up [what] this week. Does [day] or [day] work?”",
      note: "Edit your own message to fit this. This tool doesn't write it for you.",
    },
  },

  recheckBanner: {
    due: "It's been 24 hours. Ready to run the check again?",
    pending: (when: string) =>
      `You planned to re-check this ${when}. Until then, the timer and your tracker are here.`,
    dismiss: "Dismiss",
  },

  timer: {
    heading: "30-minute urge timer",
    help: "The urge peaks and passes. Stay with this until it ends.",
    label: "Time remaining",
    fullscreen: "Full screen",
    nextPrompt: "Next prompt",
    stop: "Stop the timer",
    doneHeading: "30 minutes. You made it through.",
    doneTracker: "Check in on your tracker",
    doneNoTracker: "Start a no-contact streak — it takes ten seconds",
    back: "Back to the check",
  },

  data: {
    heading: "Your data",
    body: "This tool stores nothing unless you save a message unsent or set a reminder — and then only on this device.",
  },

  vault: {
    heading: "Your unsent list",
    help: "Messages you wrote and kept instead of sending. Stored only on this device.",
    savedOn: (when: string) => `Saved ${when}`,
    delete: "Delete",
    clear: "Clear my data on this device",
    confirmHeading: "Delete your unsent list and reminder from this browser?",
    confirmBody: "Every saved message will be deleted. This can't be undone.",
    confirmYes: "Yes, delete it",
    confirmNo: "Keep it",
    cleared: "Deleted from this browser.",
    saveFailed:
      "That didn't save on this device. Your browser may be out of space or blocking storage.",
  },
};

/** Resolves an urge-timer prompt card. The {day} card falls back without a tracker day. */
export function urgePrompt(template: string, day: number | null): string {
  if (template.includes("{day}") && (day === null || day < 1)) return urgeTimer.noTrackerPrompt;
  return template.replace(/\{subject\}/g, partner.subject).replace(/\{day\}/g, String(day ?? ""));
}

/** Server-rendered supporting content below the tool. */
export const decisionPage = {
  how: {
    heading: "How this works",
    paragraphs: [
      "The same answers always give the same result. The checks are fixed rules, written down in advance — nothing guesses, and nothing reads your message but your own device.",
      "Two answers settle it on their own: if you've been drinking, or the feeling is 8 or higher out of 10, the answer is don't send. Everything else depends on what the message is for, how recent things are, and what the draft check sees.",
    ],
  },
  outcomes: {
    heading: "The three answers",
    items: [
      {
        term: "Don't send this",
        text: "The answer for anything that isn't logistics, and for any time you're drinking or above a 7. You can save the message unsent, start a 30-minute timer, or open your tracker.",
      },
      {
        term: "Wait 24 hours, then re-run this",
        text: "For messages that are genuine but mistimed — a clear apology or closure note, or logistics that needs another pass.",
      },
      {
        term: "Sending can be reasonable",
        text: "Only for logistics — belongings, money, housing, a shared obligation — when you're calm and the draft is short and clean.",
      },
    ],
  },
  trackerBlock: {
    heading: "Already decided not to send?",
    body: "Start a no-contact streak. It lives only in this browser and takes ten seconds.",
    cta: "Open the no-contact tracker",
  },
  faqHeading: "Questions about this tool",
};
