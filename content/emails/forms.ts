import type { EmailErrorCode } from "@/lib/email/validate";

/**
 * Email form copy — Sections 13.1 and 13.3. Each form is labelled as what it is: the
 * list is a subscription, the result email is a one-off, reminders are reminders.
 */
export const formCopy = {
  emailLabel: "Email address",
  honeypotLabel: "Leave this field empty",
  sending: "Sending…",
  errors: {
    invalid_email: "Enter a full email address, like name@example.com.",
    invalid_request: "Something in that request didn't look right. Please try again.",
    rate_limited: "Too many tries from this connection. Please wait an hour and try again.",
    provider_error: "That didn't go through. Please try again in a minute.",
    not_configured: "Email isn't switched on yet on this site. Please try again later.",
  } satisfies Record<EmailErrorCode, string>,

  list: {
    heading: "The email list",
    /** Section 13.3 microcopy, verbatim. */
    microcopy: "One or two emails a week on getting through a breakup. Free, unsubscribe anytime.",
    submit: "Join the list",
    success: "You're on the list. The first email is on its way.",
  },

  result: {
    heading: "Email the full result",
    body: 'Your result on this page is already complete. The email adds a "your first 14 days" action list for your pattern, the reading list, and a copy you can print or keep.',
    submit: "Email my result",
    /** Section 13.1 (b), verbatim — unchecked by default. */
    alsoJoin:
      "Also join the free email list — one or two emails a week on getting through this, unsubscribe anytime",
    success: (email: string) => `Your result is on its way to ${email}.`,
    joinedToo: "You're on the email list too.",
    joinFailed:
      "We couldn't add you to the email list just now. You can join with the form at the bottom of any page.",
    fallback: "You can still keep your result: print it or save it as a PDF.",
    print: "Print / Save PDF",
  },

  reminders: {
    heading: "Daily reminders",
    body: "A short email on days you haven't checked in by your chosen time — at most one a day, and they stop when you reach your goal. Separate from the email list.",
    hourLabel: "Remind me after",
    submit: "Turn on reminders",
    success: "Reminders are on. Each one has a link to stop them.",
    on: "Reminders are on for this streak. To stop them, use the link in any reminder email.",
    caveat:
      "Reminders can't see check-ins from another browser, so if you check in elsewhere, ignore them.",
  },
} as const;

export const hourLabel = (h: number) =>
  new Date(2000, 0, 1, h).toLocaleTimeString("en-US", { hour: "numeric" });
