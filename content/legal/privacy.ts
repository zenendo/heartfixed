import { legal } from "@/config/legal";
import { routes, site } from "@/config/site";
import type { LegalDoc } from "./types";

/**
 * Privacy Policy — Section 14.4. Plain English. A build checklist, not legal advice:
 * the founder has the final text reviewed by a lawyer before paid promotion (Section
 * 14). TODO(session-11 founder): legal review; confirm the provider categories match
 * the accounts you set up (Section 17.3).
 */
export const privacyPolicy: LegalDoc = {
  h1: "Privacy Policy",
  intro: [
    `${site.name} is built so that the private things you do here stay on your device. This page explains exactly what that means, what we do collect, and what we never collect.`,
    "The short version: your quiz answers, your tracker and any message you check stay in your browser. We only ever receive an email address if you choose to give us one, and anonymous usage counts.",
  ],
  sections: [
    {
      heading: "What stays in your browser",
      blocks: [
        {
          p: "These are saved only in your browser's local storage, on the device you're using. They are never sent to us or anyone else:",
        },
        {
          list: [
            "Your quiz answers, your result, and any quiz you've started but not finished.",
            "Your no-contact tracker: dates, check-ins, urge ratings and notes.",
            "Messages you choose to save unsent in the decision tool, and any re-check time you set.",
          ],
        },
        {
          p: "A message you paste into the decision tool's draft check isn't saved at all unless you choose to save it — it's gone when you leave the page.",
        },
        {
          callout:
            'Because this data lives only in your browser, clearing your browser data erases it, and we can\'t recover it — we never had a copy. Each tool has a "Clear my data" control that deletes it on purpose.',
        },
      ],
    },
    {
      heading: "What we collect",
      blocks: [
        {
          p: "An email address — only if you give us one, and only for the thing you asked for. There are three separate choices, and each one is independent:",
        },
        {
          list: [
            "Sending yourself a result or summary: we send that one email. It does not add you to any list.",
            "Joining the email list: you receive one or two emails a week about getting through a breakup, until you unsubscribe.",
            "Tracker reminders: you receive functional streak reminders, until you turn them off or reach your goal.",
          ],
        },
        {
          p: "Anonymous usage analytics — which pages are visited and which tools are used. Events carry only things like a tool name, a count, a score band or an outcome code. They never include your quiz answers, notes, drafts or email address.",
        },
      ],
    },
    {
      heading: "What we never collect",
      blocks: [
        {
          list: [
            "Anything you type or choose in the tools: answers, notes, drafts or unsent messages.",
            "Your name, phone number or date of birth.",
            "Any information about your ex. The site never asks for a name.",
            "Financial information. There is nothing to buy on this site.",
            "Health information.",
          ],
        },
        {
          p: "Nothing you do here is used to train any AI model, and there are no AI features on this site.",
        },
      ],
    },
    {
      heading: "Cookies and analytics",
      blocks: [
        {
          p: "Our analytics provider uses cookies to count visits and tell new visitors from returning ones. We don't use advertising cookies, we don't run ads, and we don't use ad networks or tracking pixels.",
        },
        {
          p: "Local storage, where your tool data lives, is not a cookie and is never sent with your requests to the site.",
        },
      ],
    },
    {
      heading: "Email",
      blocks: [
        {
          list: [
            "Every list email has a one-click unsubscribe link. One click is all it takes.",
            "Tracker reminders can be turned off separately, and stop on their own when you reach your goal.",
            "Sending yourself a result never subscribes you. Joining the list is always its own, separate choice.",
          ],
        },
      ],
    },
    {
      heading: "Who we share data with",
      blocks: [
        {
          p: "We use a small number of service providers to run the site, and they process data only to provide their service to us:",
        },
        {
          list: [
            "An email provider, which stores list email addresses and sends the emails you asked for.",
            "An analytics provider, which receives the anonymous usage events described above.",
            "A hosting provider, which serves the site and keeps standard server logs, such as IP addresses, for security and reliability.",
          ],
        },
        {
          p: "We never sell your data. We never share your self-reflection content — answers, results, notes or drafts — with anyone, including affiliate programmes. We don't have it to share.",
        },
      ],
    },
    {
      heading: "Affiliate links",
      blocks: [
        {
          p: "Some recommendations may be affiliate links. Clicking one is an ordinary link to another site. The destination learns that you arrived from this site, through its affiliate parameters — nothing about your results, answers or anything else you did here.",
        },
        { links: [{ label: "Read the affiliate disclosure", href: routes.affiliateDisclosure }] },
      ],
    },
    {
      heading: "Share links",
      blocks: [
        {
          p: "If you share your quiz result, the link contains your two scores and the quiz version — never your answers and never anything that identifies you. Anyone you send it to can see those scores.",
        },
      ],
    },
    {
      heading: "How long we keep data",
      blocks: [
        {
          list: [
            `Email list: until you unsubscribe, or after ${legal.listInactivityPurgeMonths} months without opening any of our emails, whichever comes first.`,
            "Tracker reminders: until you turn them off or reach your goal.",
            "Result emails: we don't keep the address on any list. Our email provider keeps a delivery record under its own retention period.",
            "Analytics: kept in aggregate, under the analytics provider's retention settings.",
          ],
        },
      ],
    },
    {
      heading: "Your choices and requests",
      blocks: [
        {
          p: 'Data in your browser is under your control: use "Clear my data" in each tool, or clear your browser data.',
        },
        {
          p: "For anything we hold — an email address on the list or for reminders — you can ask us to show you what we have or to delete it. Use the contact page and we'll act on it.",
        },
        { links: [{ label: "Contact", href: routes.contact }] },
      ],
    },
    {
      heading: "Adults only",
      blocks: [
        {
          p: `This site is written for adults (${legal.minimumAge}+). It isn't aimed at anyone younger, and we don't knowingly collect email addresses from minors.`,
        },
      ],
    },
    {
      heading: "Changes to this policy",
      blocks: [
        {
          p: "If this policy changes, the date at the top of the page changes with it. A change that affects how we use an email address you've already given us will be explained in an email first.",
        },
      ],
    },
  ],
};
