import { routes } from "@/config/site";
import type { Lean, ProfileId } from "./types";

/**
 * Result profiles — Section 9.4. Profile data is written gender-neutrally; the
 * men-specific framing lives in the page copy around it.
 */

export interface ProfileMeta {
  id: ProfileId;
  /** Short name, e.g. for share text: "Anxious". */
  name: string;
  /** Full label for the result headline: "Anxious (preoccupied)". */
  label: string;
  /** The profile's explainer page (Section 6). */
  route: string;
}

export const profiles: Record<ProfileId, ProfileMeta> = {
  secure: {
    id: "secure",
    name: "Secure",
    label: "Secure",
    route: routes.profileSecure,
  },
  anxious: {
    id: "anxious",
    name: "Anxious",
    label: "Anxious (preoccupied)",
    route: routes.profileAnxious,
  },
  avoidant: {
    id: "avoidant",
    name: "Avoidant",
    label: "Avoidant (dismissive)",
    route: routes.profileAvoidant,
  },
  "fearful-avoidant": {
    id: "fearful-avoidant",
    name: "Fearful-avoidant",
    label: "Fearful-avoidant (disorganized)",
    route: routes.profileFearfulAvoidant,
  },
};

export interface NextStep {
  label: string;
  href: string;
}

/** The written content each profile carries (Section 9.4). */
export interface ProfileCopy {
  headline: string;
  /** 120–180 words, plain English. */
  description: string;
  afterBreakup: string;
  /** Feeds the tracker cross-promotion on the result view. */
  noContactRisk: string;
  watchOuts: [string, string, string];
  strengths: [string, string, string];
  nextSteps: [NextStep, NextStep];
  /** Secure only: the lean paragraph shown first when a dimension is moderate. */
  leans?: Record<Exclude<Lean, "none">, string>;
}

// TODO(session-5): founder-reviewed ProfileCopy for all four profiles, checked with
// checkProfileCopy before it ships.

export const profileCopyRules = {
  descriptionWords: { min: 120, max: 180 },
} as const;

/** Returns a list of problems with a profile's copy; empty means it meets Section 9.4. */
export function checkProfileCopy(id: ProfileId, profileCopy: ProfileCopy): string[] {
  const problems: string[] = [];
  const words = profileCopy.description.trim().split(/\s+/).length;
  const { min, max } = profileCopyRules.descriptionWords;
  if (words < min || words > max) {
    problems.push(`${id}: description is ${words} words (needs ${min}–${max})`);
  }
  const texts = [
    profileCopy.headline,
    profileCopy.afterBreakup,
    profileCopy.noContactRisk,
    ...profileCopy.watchOuts,
    ...profileCopy.strengths,
  ];
  if (texts.some((t) => t.trim() === "")) problems.push(`${id}: empty copy field`);
  if (id === "secure" && !profileCopy.leans) problems.push("secure: missing lean paragraphs");
  if (id !== "secure" && profileCopy.leans) problems.push(`${id}: only secure carries leans`);
  return problems;
}
