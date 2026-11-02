import Link from "next/link";
import { BandTable } from "@/components/content/BandTable";
import { SelfReflectionDisclaimer } from "@/components/content/ComplianceBlocks";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { routes } from "@/config/site";
import { methodologyPage as m } from "@/content/trust";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.methodology);

function ListSection({
  id,
  heading,
  items,
}: {
  id: string;
  heading: string;
  items: readonly string[];
}) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-xl font-semibold">
        {heading}
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

/**
 * /methodology/ — how the assessment works and its scoring basis (Sections 6, 9, 14.2).
 * Block A sits under the H1. Every number comes from config/quiz.ts and the pattern
 * table from the engine, so this page can't drift from the scoring code. The attention
 * check is deliberately not described (Section 9.2: never mentioned to the visitor).
 */
export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: "Methodology", path: routes.methodology },
        ]}
      />
      <h1 className="mt-4">{m.h1}</h1>
      <SelfReflectionDisclaimer className="mt-4" />
      <p className="mt-4 text-lg">{m.framing}</p>

      <section aria-labelledby="measures-heading" className="mt-10">
        <h2 id="measures-heading" className="text-xl font-semibold">
          {m.measures.heading}
        </h2>
        {m.measures.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
      </section>

      <ListSection id="questions-heading" heading={m.questions.heading} items={m.questions.items} />

      <section aria-labelledby="scale-heading" className="mt-10">
        <h2 id="scale-heading" className="text-xl font-semibold">
          {m.scale.heading}
        </h2>
        <p className="mt-3">{m.scale.intro}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-6" data-testid="likert-labels">
          {m.scale.labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ol>
      </section>

      <ListSection id="scoring-heading" heading={m.scoring.heading} items={m.scoring.items} />
      <BandTable caption={m.scoring.tableCaption} className="mt-4" />

      <ListSection id="integrity-heading" heading={m.integrity.heading} items={m.integrity.items} />

      <section aria-labelledby="limits-heading" className="mt-10">
        <h2 id="limits-heading" className="text-xl font-semibold">
          {m.limits.heading}
        </h2>
        {m.limits.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
      </section>

      <section aria-labelledby="sources-heading" className="mt-10">
        <h2 id="sources-heading" className="text-xl font-semibold">
          {m.sources.heading}
        </h2>
        <p className="mt-3">{m.sources.paragraph}</p>
        <ul className="mt-3">
          {m.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center font-semibold text-primary underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
