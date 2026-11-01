import Link from "next/link";
import { blockB, blockD, type Segment } from "@/content/compliance";

function renderSegments(segments: readonly Segment[]) {
  return segments.map((s, i) => {
    if (typeof s === "string") return s;
    if ("strong" in s) return <strong key={i}>{s.strong}</strong>;
    return (
      <Link key={i} href={s.href} className="font-semibold text-primary underline">
        {s.link}
      </Link>
    );
  });
}

/** Block D — the crisis block. Calm crisis panel, never red; body-size text. */
export function CrisisBlock({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-label="Crisis support"
      data-testid="crisis-block"
      className={`rounded-card border-l-4 border-primary bg-crisis px-4 py-4 text-body text-ink ${className}`}
    >
      <p>{renderSegments(blockD)}</p>
    </aside>
  );
}

/** Block B — the general disclaimer for tool pages. Readable, never small print. */
export function ToolDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p data-testid="tool-disclaimer" className={`text-sm text-muted ${className}`}>
      {blockB.text}
    </p>
  );
}
