import type { ReactNode } from "react";

/**
 * Optional founder intro block — Section 12.5. Defined and tested, used on zero pages
 * at launch. No photo slot is required; `media` renders nothing when empty, so adding
 * founder-led content later is a content decision, not a template change.
 */
export function FounderNote({
  heading,
  body,
  media,
  className = "",
}: {
  heading?: string;
  body: string | readonly string[];
  media?: ReactNode;
  className?: string;
}) {
  const paragraphs = typeof body === "string" ? [body] : body;
  return (
    <section data-testid="founder-note" className={`rounded-card bg-panel p-5 ${className}`}>
      {media ? <div className="mb-4">{media}</div> : null}
      {heading ? <h2 className="text-xl font-semibold">{heading}</h2> : null}
      {paragraphs.map((text) => (
        <p key={text} className={heading ? "mt-3" : "mt-3 first:mt-0"}>
          {text}
        </p>
      ))}
    </section>
  );
}
