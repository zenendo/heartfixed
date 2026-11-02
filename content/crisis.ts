/**
 * /crisis-resources/ — Section 14.3, Block D implementation note. Block D renders at
 * the top of the page (content/compliance.ts). The US entries below are the ones the
 * spec names: 988 and the Crisis Text Line.
 *
 * International entries: no number may be published from memory. Each entry needs the
 * provider's own page as its source and the date the founder checked it. Entries
 * without both never render. TODO(session-11 founder): verify and add entries before
 * launch — tests/unit/launch-readiness.test.ts fails at launch while this list is empty.
 */

export interface CrisisLine {
  name: string;
  /** How to reach it, in plain words. */
  how: string;
  /** Optional device link: tel: or sms:. */
  action?: { label: string; href: string };
  note?: string;
}

export interface InternationalLine extends CrisisLine {
  country: string;
  /** The provider's own page the founder checked the details against. */
  sourceUrl: string;
  /** ISO date (YYYY-MM-DD) the founder checked it. */
  verifiedOn: string;
}

export const crisisPage = {
  h1: "Crisis Resources",
  intro: "If you're in danger or thinking about harming yourself, please reach a person now.",
  us: {
    heading: "In the US",
    lines: [
      {
        name: "988 Suicide and Crisis Lifeline",
        how: "Call or text 988, any time, day or night.",
        action: { label: "Call 988", href: "tel:988" },
      },
      {
        name: "Crisis Text Line",
        how: "Text HOME to 741741.",
        action: { label: "Text HOME to 741741", href: "sms:741741" },
      },
      {
        name: "Emergency services",
        how: "If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.",
        action: { label: "Call 911", href: "tel:911" },
      },
    ] satisfies CrisisLine[],
  },
  international: {
    heading: "Outside the US",
    emergency:
      "Your local emergency number always works. If you're in immediate danger, call it now.",
    listIntro: "Helplines checked against each provider's own page:",
    checked: (date: string) => `Checked ${date}`,
    source: "Source",
    lines: [] as InternationalLine[],
  },
  someoneElse: {
    heading: "If you're worried about someone else",
    paragraphs: [
      "Ask them directly if they're thinking about suicide. Asking doesn't put the idea in their head, and it often comes as a relief.",
      "Stay with them if you can, and help them call or text one of the services above. If they're in immediate danger, call emergency services.",
    ],
  },
  notACrisisService:
    "This website isn't a crisis service and can't respond to messages in an emergency. The services above are there for exactly this.",
} as const;

/** Only entries with a source and a check date render. */
export const verifiedInternationalLines = (lines: readonly InternationalLine[]) =>
  lines.filter((l) => /^https:\/\//.test(l.sourceUrl) && /^\d{4}-\d{2}-\d{2}$/.test(l.verifiedOn));
