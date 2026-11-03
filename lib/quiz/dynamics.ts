import { leanFor } from "./scoring";
import type { Lean, ProfileId, QuizResult } from "./types";

/**
 * The dynamic read for his × her pairing — quiz build brief, Part B. Six reads cover
 * the archetypal pairings; the remaining combinations compose by dimension:
 *
 * - Either side fearful-avoidant → "swing" (the brief: "either side").
 * - A secure result with an anxious or avoidant lean borrows that lean's pattern, as
 *   the profile rules do, and the view names the lean above the read.
 * - Otherwise a secure side (including a mixed lean) → "secure-involved".
 * - The rest are his pattern × hers: anxious/avoidant in either order.
 */

export type DynamicId =
  | "anxious-avoidant"
  | "avoidant-anxious"
  | "anxious-anxious"
  | "avoidant-avoidant"
  | "swing"
  | "secure-involved";

type Side = Pick<QuizResult, "profileId" | "anxietyBand" | "avoidanceBand">;

export interface DynamicPick {
  id: DynamicId;
  /** The lean that chose this read for each side, or "none" when the profile did. */
  youLean: Exclude<Lean, "mixed">;
  herLean: Exclude<Lean, "mixed">;
}

function borrowedLean(side: Side): "anxious" | "avoidant" | "none" {
  const lean = leanFor(side);
  return lean === "anxious" || lean === "avoidant" ? lean : "none";
}

function effective(side: Side): ProfileId {
  const lean = borrowedLean(side);
  return lean === "none" ? side.profileId : lean;
}

export function dynamicFor(you: Side, her: Side): DynamicPick {
  if (you.profileId === "fearful-avoidant" || her.profileId === "fearful-avoidant") {
    return { id: "swing", youLean: "none", herLean: "none" };
  }
  const a = effective(you);
  const b = effective(her);
  if (a === "secure" || b === "secure") {
    return { id: "secure-involved", youLean: "none", herLean: "none" };
  }
  return {
    id: `${a}-${b}` as DynamicId,
    youLean: borrowedLean(you),
    herLean: borrowedLean(her),
  };
}
