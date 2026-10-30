import { blockC } from "@/content/compliance";

/**
 * Block C (Section 14.3) — renders in the footer of every page, in body-size text,
 * never as small print. Calm crisis-panel styling, never red.
 */
export function CrisisFooterLine() {
  const [before, after] = blockC.text.split(blockC.emphasis);
  return (
    <p
      data-testid="crisis-footer-line"
      className="rounded-card border-l-4 border-primary bg-crisis px-4 py-3 text-body text-ink"
    >
      {before}
      <strong>{blockC.emphasis}</strong>
      {after}
    </p>
  );
}
