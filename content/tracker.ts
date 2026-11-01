import { copy } from "@/config/copy";
import type { SlipType } from "@/lib/tools/tracker";

/**
 * No-contact tracker copy — Section 11.1. Partner references resolve through
 * config/copy.ts (Section 2.3).
 *
 * Tone rule (Section 11.1): the slip flow — and, to be safe, this whole file — never
 * uses "failed", "relapse", "clean", or "streak lost". tests/unit/tracker-copy.test.ts
 * and the e2e suite both check.
 */

const { partner } = copy;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const days = (n: number) => (n === 1 ? "1 day" : `${n} days`);

export const trackerCopy = {
  h1: "No-Contact Tracker",
  promise:
    "Count the days. Protect the streak. No account, nothing leaves this browser unless you ask for reminders.",
  loading: "Loading your tracker…",

  setup: {
    heading: "Start your streak",
    lastContactLabel: "When did you last have contact?",
    lastContactHelp:
      "Calls, texts, messages, or seeing each other. If it was today, leave it as today.",
    missingError: "Enter the date you last had contact.",
    futureError: "That date is in the future. Choose today or an earlier day.",
    goalLegend: "Your goal",
    goalHelp:
      "30 days is the standard starting goal: long enough to get through the hardest first stretch, short enough to see the end of. You can extend it later.",
    goalOption: (d: number) => `${d} days`,
    submit: "Start my streak",
    privacy: "No name, no account. Your tracker lives only in this browser.",
  },

  streak: {
    heading: "Your streak",
    dayOf: (day: number, goal: number) => `Day ${day} of ${goal}`,
    pastGoal: (day: number, goal: number) => `Day ${day} — past your ${goal}-day goal`,
    dayZero: "Day 0 — your first full day starts tomorrow",
    caption: "full days without contact",
    toGoal: (n: number) => `${days(n)} to your goal`,
    longest: (n: number) => `Longest streak: ${days(n)}`,
    total: (n: number) => `Total days without contact: ${n}`,
    startOver: "Start over",
  },

  completion: {
    heading: (goal: number) => `Day ${goal}. You reached your goal.`,
    body: "That took something. Keep going, or set a longer goal — your history stays either way.",
  },
  extend: {
    heading: "Set a longer goal",
    option: (g: number) => `Extend to ${g} days`,
  },

  calendar: {
    heading: "Recent days",
    checked: "checked in",
    missed: "no check-in",
    contact: "contact",
    legend: { checked: "Checked in", missed: "No check-in", contact: "Contact" },
  },

  checkIn: {
    heading: "Check in",
    dayLabel: "Which day?",
    today: "Today",
    urgeLegend: "How strong was the urge? (optional)",
    urgeLevels: ["None", "Mild", "Strong", "I nearly slipped"] as const,
    noteLabel: "Private note (optional)",
    notePrivacy: "Notes stay in this browser and are never sent anywhere.",
    noteCount: (n: number, max: number) => `${n} of ${max} characters`,
    submit: "Still no contact",
    saved: (isToday: boolean) => (isToday ? "Checked in for today." : "Missed day checked in."),
    doneToday: "You've checked in today.",
    edit: "Change today's check-in",
    dayZero: "Your first check-in is tomorrow, on Day 1.",
  },

  urge: {
    label: "I'm about to break it",
    help: "Use this before you send anything. It takes a few minutes.",
  },

  slip: {
    action: "I broke no contact",
    heading: "What happened?",
    help: "One question, then the counter restarts. Your history stays.",
    types: {
      called: "I called",
      texted: "I texted or messaged",
      saw: `I saw ${partner.object}`,
      "they-reached-out-i-replied": `${cap(partner.subject)} reached out and I replied`,
      other: "Something else",
    } satisfies Record<SlipType, string>,
    chooseError: "Choose what happened to continue.",
    confirm: "Restart the counter",
    cancel: "Go back",
    resetHeading: "The counter has restarted.",
    did: (n: number) =>
      n === 0
        ? "Today is a new start."
        : `You did ${n} full ${n === 1 ? "day" : "days"}. That progress is real, and the counter restarting doesn't erase it.`,
    total: (n: number) => `Total days without contact so far: ${n}`,
    longest: (n: number) => `Your longest streak: ${days(n)}`,
    newStreak: "Your new streak starts today. Day 1 is tomorrow.",
    reachedOut: `When ${partner.subject} reaches out first, it's one of the hardest moments to hold the line. This guide covers what to do next time:`,
    reachedOutLink: `${cap(partner.subject)} texted me during no contact`,
    continue: "Back to my tracker",
  },

  data: {
    heading: "Your data",
    body: "Everything here is stored only in this browser. Nothing syncs between devices. Clearing your browser data erases the tracker, and it can't be recovered.",
    exportJson: "Download as JSON",
    exportCsv: "Download as CSV",
    print: "Print / Save PDF",
    clear: "Clear my data on this device",
    confirmHeading: "Delete your tracker from this browser?",
    confirmBody: "Your streak, check-ins and notes will be deleted. This can't be undone.",
    confirmYes: "Yes, delete it",
    confirmNo: "Keep it",
    cleared: "Your tracker has been deleted from this browser.",
  },

  storage: {
    unavailable:
      "This browser isn't letting the tracker save. It works for this visit, but it will reset when you close the tab.",
    saveFailed: "That didn't save. Your browser may be out of space or blocking storage.",
    corruptHeading: "We couldn't read your saved tracker",
    corruptBody:
      "The saved tracker on this device is damaged. You can download what's there, then start fresh.",
    corruptDownload: "Download what's there",
    corruptReset: "Start fresh",
  },

  print: {
    heading: "No-contact tracker summary",
    asOf: (date: string) => `As of ${date}`,
    checkIns: (n: number) => `Check-ins recorded: ${n}`,
  },
};

/** Server-rendered supporting content below the tool (Section 11.1). */
export const trackerPage = {
  explainer: {
    heading: "How no contact works",
    paragraphs: [
      "No contact means a set stretch of time with no calls, texts, messages or meetups with your ex, so the urge to reach out can fade instead of being fed every few days.",
      "It isn't a tactic and it isn't a punishment. It's space to stop checking, stop drafting, and get your days back. Whatever you end up wanting, the first weeks look the same: don't reach out.",
    ],
    link: "Read the full no-contact rule",
  },
  goals: {
    heading: "30, 60 or 90 days?",
    items: [
      {
        days: 30,
        text: "The standard starting goal. It covers the hardest first stretch, when the urge to reach out is strongest and most frequent.",
      },
      {
        days: 60,
        text: "For when 30 feels within reach, or the relationship was long. More distance before you decide anything.",
      },
      {
        days: 90,
        text: "For long relationships, or a pattern of breaking up and getting back together. It gives any decision time to settle.",
      },
    ],
  },
  contact: {
    heading: "What counts as contact",
    intro: "If you're counting days, count these:",
    items: [
      "Calls and voice notes",
      "Texts, DMs and messages on any app",
      `Social media: likes, comments, reactions, and replying to ${partner.possessive} stories`,
      "Meeting in person, including “just dropping something off”",
      `Asking friends about ${partner.object}`,
    ],
    strictness: `Story views: viewing ${partner.possessive} stories shows up on ${partner.possessive} side. If you want the strict version, count it.`,
    soft: `Checking ${partner.possessive} profiles doesn't reach ${partner.object}, but most men count it when they're honest — it keeps things raw in the same way.`,
  },
  urgeBlock: {
    heading: "If the urge is right now",
    body: "Use this first. Five short steps, built for the moment your thumb is over the send button.",
    cta: "Check before you send",
  },
  ruleBlock: {
    heading: "The no-contact rule, in full",
    body: `The exceptions (children, housing, money), what to do if ${partner.subject} reaches out, and what to expect week by week.`,
  },
  faqHeading: "Questions about the tracker",
};
