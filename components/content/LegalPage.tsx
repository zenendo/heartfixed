import type { ReactNode } from "react";
import { GuideBlocks } from "@/components/content/GuideBody";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { legal } from "@/config/legal";
import { routes } from "@/config/site";
import type { LegalDoc } from "@/content/legal/types";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

/** Privacy, Terms and Affiliate Disclosure (Section 14.4): one readable template. */
export function LegalPage({
  doc,
  route,
  children,
}: {
  doc: LegalDoc;
  route: string;
  /** Rendered after the intro, before the sections (e.g. a computed status line). */
  children?: ReactNode;
}) {
  const updated = legal.lastUpdated[route]!;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: doc.h1, path: route },
        ]}
      />
      <h1 className="mt-4">{doc.h1}</h1>
      <p className="mt-2 text-sm text-muted" data-testid="last-updated">
        Last updated <time dateTime={updated}>{formatDate(updated)}</time>
      </p>
      {doc.intro.map((text) => (
        <p key={text} className="mt-4 text-lg">
          {text}
        </p>
      ))}
      {children}
      {doc.sections.map((section, i) => (
        <section key={section.heading} aria-labelledby={`section-${i}`} className="mt-10">
          <h2 id={`section-${i}`} className="text-xl font-semibold">
            {section.heading}
          </h2>
          <GuideBlocks blocks={section.blocks} />
        </section>
      ))}
    </div>
  );
}
