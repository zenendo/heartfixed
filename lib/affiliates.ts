import { affiliateSlots, type AffiliateSlot } from "@/config/affiliates";

/**
 * Affiliate slot rules — Section 13.4. A slot renders only when it is enabled AND has
 * every field it needs; anything else renders nothing at all (no empty box).
 */
export type RenderableSlot = AffiliateSlot &
  Required<Pick<AffiliateSlot, "heading" | "body" | "ctaLabel" | "url">>;

export function renderableSlot(
  id: string,
  slots: readonly AffiliateSlot[] = affiliateSlots,
): RenderableSlot | null {
  const slot = slots.find((s) => s.id === id);
  // An unknown id is a typo in a page, not a disabled slot: fail the build loudly.
  if (!slot) throw new Error(`Unknown affiliate slot "${id}"`);
  if (!slot.enabled) return null;
  const { heading, body, ctaLabel, url } = slot;
  if (!heading || !body || !ctaLabel || !url) return null;
  return { ...slot, heading, body, ctaLabel, url };
}

/** Slot copy may not promise an outcome or quote money (Section 13.4). */
const PROHIBITED_SLOT_COPY =
  /get (your ex|her|him|them) back|regret|miss you|guarantee|commission|payout|\bearn|\$|%|\bper (sale|click)\b/i;

export function checkSlotCopy(slot: AffiliateSlot): string[] {
  const text = [slot.heading, slot.body, slot.ctaLabel].filter(Boolean).join(" ");
  const problems: string[] = [];
  if (PROHIBITED_SLOT_COPY.test(text))
    problems.push(`${slot.id}: copy promises an outcome or quotes money`);
  if (slot.url && !/^https:\/\//.test(slot.url)) problems.push(`${slot.id}: url must be https`);
  return problems;
}

/** Slots per page: at most two, except up to four on the resources page (Section 13.4). */
export function slotLimitFor(page: string): number {
  return page === "/recommended-resources/" ? 4 : 2;
}
