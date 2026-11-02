import { routes } from "@/config/site";
import type { EmailTemplate } from "./types";

/**
 * Tracker reminders — Sections 11.1, 13.1(c), 13.2. Product notifications, never
 * written as a person, a friend, or the brand missing him. At most one a day, only on a
 * day with no check-in by his chosen hour; the site can't see check-ins from another
 * browser, so the copy tolerates being wrong. They stop at goal completion.
 */
export function dailyReminder(day: number, goal: number): EmailTemplate {
  return {
    id: "reminder-daily",
    subject: `Day ${day}. Still going.`,
    preheader: `Day ${day} of ${goal}. Check in when you're ready.`,
    blocks: [
      { p: `Day ${day} of your ${goal}-day goal. One tap to check in.` },
      { link: { label: "Check in", href: routes.tracker } },
      { p: "If you've already checked in today, ignore this." },
      {
        p: "If the urge is strong right now, use the five-step check before you send anything.",
      },
      { link: { label: "Check before you send", href: routes.decision } },
    ],
  };
}

export function goalReached(goal: number): EmailTemplate {
  return {
    id: "reminder-complete",
    subject: `Day ${goal}. You reached your goal.`,
    preheader: "Reminders stop here. Your history stays in your tracker.",
    blocks: [
      { p: `${goal} days without contact. That took something.` },
      {
        p: "Reminders stop here. If you want to keep going, you can extend your goal in the tracker — your history stays either way.",
      },
      { link: { label: "Open your tracker", href: routes.tracker } },
    ],
  };
}
