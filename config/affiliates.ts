/**
 * Affiliate slots — Section 13.4. Slots, not offers: every slot ships `enabled: false`
 * and renders nothing at all while disabled. The founder enables a slot only after a
 * programme approves him, by filling in programKey/heading/body/ctaLabel/url here.
 * Never hardcode an affiliate URL, programme price, or payout anywhere else.
 */
export interface AffiliateSlot {
  id: string;
  /** Route or result-profile the slot belongs to. */
  page: string;
  /** Named anchor, e.g. "after-next-steps". */
  position: string;
  enabled: boolean;
  programKey?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  /** Rendered with rel="sponsored nofollow noopener". */
  url?: string;
  disclosureId: string;
}

export interface AffiliateProgram {
  key: string;
  name: string;
  network: string;
  termsUrl?: string;
  /** Founder-only notes (e.g. commission terms). NEVER rendered to a page. */
  founderNote?: string;
}

/** Programmes are added at activation time — none at launch. */
export const affiliatePrograms: AffiliateProgram[] = [];

const DISCLOSURE = "proximity"; // Section 14.5 sentence, rendered directly above the slot

// Slot inventory per Section 13.4. Rendering is wired in the session that builds each page.
export const affiliateSlots: AffiliateSlot[] = [
  ...(["secure", "anxious", "avoidant", "fearful-avoidant"] as const).map((profile) => ({
    id: `quiz-result-${profile}`,
    page: `quiz-result:${profile}`,
    position: "go-deeper",
    enabled: false,
    disclosureId: DISCLOSURE,
  })),
  {
    id: "tracker-after-explainer",
    page: "/no-contact-tracker/",
    position: "after-explainer",
    enabled: false,
    disclosureId: DISCLOSURE,
  },
  {
    id: "decision-dont-send",
    page: "/should-i-text-my-ex/",
    position: "outcome-dont-send",
    enabled: false,
    disclosureId: DISCLOSURE,
  },
  ...[1, 2, 3, 4].map((n) => ({
    id: `resources-${n}`,
    page: "/recommended-resources/",
    position: `resource-${n}`,
    enabled: false,
    disclosureId: DISCLOSURE,
  })),
  {
    id: "email-welcome-5",
    page: "email:welcome-5",
    position: "recommendation",
    enabled: false,
    disclosureId: DISCLOSURE,
  },
  {
    id: "guide-how-long-in-content",
    page: "/guides/how-long-does-a-breakup-take/",
    position: "in-content",
    enabled: false,
    disclosureId: DISCLOSURE,
  },
];
