import type { AffiliateSlot as Slot } from "@/config/affiliates";
import { affiliateDisclosure } from "@/content/compliance";
import { renderableSlot } from "@/lib/affiliates";

/**
 * One affiliate slot (Section 13.4). Disabled or incomplete slots render nothing. When
 * enabled, the Section 14.5 disclosure renders directly above it in the same container.
 * `slots` is for tests only; pages always read config/affiliates.ts.
 */
export function AffiliateSlot({
  id,
  className = "",
  slots,
}: {
  id: string;
  className?: string;
  slots?: readonly Slot[];
}) {
  const slot = renderableSlot(id, slots);
  if (!slot) return null;
  // TODO(session-13): affiliate_slot_view / affiliate_click events with slot_id only.
  return (
    <aside
      data-testid="affiliate-slot"
      data-slot-id={slot.id}
      className={`rounded-card border border-panel bg-surface p-5 ${className}`}
    >
      <p className="text-body text-muted" data-testid="affiliate-disclosure">
        {affiliateDisclosure.text}
      </p>
      <h3 className="mt-3 text-lg font-semibold">{slot.heading}</h3>
      <p className="mt-2">{slot.body}</p>
      <a
        href={slot.url}
        rel="sponsored nofollow noopener"
        className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline"
      >
        {slot.ctaLabel}
      </a>
    </aside>
  );
}
