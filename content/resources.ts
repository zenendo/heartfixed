import { routes } from "@/config/site";

/**
 * /recommended-resources/ — Sections 12.4 and 13.4. The canon, organised by the moment the
 * reader is in, not by commission. Named here in the site's own words; no URLs, prices or
 * payouts (those live only in config/affiliates.ts, and every slot ships disabled).
 * TODO(session-10 founder review): every description, and confirm each resource is one
 * you've used, before any slot is enabled.
 */

export interface Resource {
  name: string;
  by: string;
  kind: "Book" | "Course" | "Programme";
  /** Who it's for, in one line. */
  forWho: string;
  text: string;
  /** The affiliate slot rendered after this resource (Section 13.4). */
  slotId: string;
}

export interface OwnLink {
  label: string;
  href: string;
  text: string;
}

export const resourcesPage = {
  h1: "Recommended Resources",
  intro: [
    "Books and programmes that go further than a website can, organised by the moment you're in — not by what pays.",
    "Start with the free tools. Everything on this page is optional.",
  ],
  firstWeeks: {
    heading: "For the first two weeks",
    body: "Right now you don't need a course. You need to get through the nights without making it worse. These are free and on this site.",
    links: [
      {
        label: "No-contact tracker",
        href: routes.tracker,
        text: "Count the days and protect the streak.",
      },
      {
        label: "Should I text my ex?",
        href: routes.decision,
        text: "Five steps for the moment you're about to send.",
      },
      {
        label: "The no-contact rule",
        href: routes.noContactRule,
        text: "What counts, how long, and the real exceptions.",
      },
    ] satisfies OwnLink[],
  },
  pattern: {
    heading: "For understanding your pattern",
    body: "Once the first wave passes, the useful question is why the relationship went the way it did. These two books are where most readers start.",
    resources: [
      {
        name: "Attached",
        by: "Amir Levine and Rachel Heller",
        kind: "Book",
        forWho: "For anyone who wants the attachment basics in one read.",
        text: "The book that brought adult attachment to a general audience. Clear on the anxious and avoidant patterns, and especially good on why they so often end up together.",
        slotId: "resources-1",
      },
      {
        name: "Anxiously Attached",
        by: "Jessica Baum",
        kind: "Book",
        forWho: "For the man whose scores came out anxious, or anxious-leaning.",
        text: "A closer look at the anxious pattern: the checking, the need for reassurance, and practical ways to feel steadier on your own.",
        slotId: "resources-2",
      },
    ] satisfies Resource[],
    quizLink: "Not sure of your pattern? Take the quiz",
  },
  deeper: {
    heading: "Programmes that go deeper",
    body: "Structured courses, for when a book isn't enough and you want a plan to follow.",
    resources: [
      {
        name: "Personal Development School",
        by: "Thais Gibson",
        kind: "Course",
        forWho: "For understanding and shifting your attachment pattern over time.",
        text: "A library of attachment-focused courses built around changing the pattern, not just naming it.",
        slotId: "resources-3",
      },
      {
        name: "Ex Recovery Program",
        by: "Chris Seiter",
        kind: "Programme",
        forWho: "For the man who has decided to try to reconcile.",
        text: "A structured programme about whether and how to approach reconciling. It's about one specific goal, and it isn't the right fit if you want to move on.",
        slotId: "resources-4",
      },
    ] satisfies Resource[],
  },
  /** Section 14.5 also requires the disclosure above each slot; this is the page note. */
  note: "Some of these may become affiliate links in future. If they do, a disclosure will sit directly above each one, and it will never change the order here.",
  disclosureLink: "Read the affiliate disclosure",
} as const;
