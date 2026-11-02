import type { ReactNode } from "react";
import { CrisisBlock } from "@/components/content/ComplianceBlocks";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { routes } from "@/config/site";
import {
  crisisPage as c,
  verifiedInternationalLines,
  type CrisisLine,
  type InternationalLine,
} from "@/content/crisis";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.crisis);

const withCountry = (line: InternationalLine): CrisisLine => ({
  ...line,
  name: `${line.country}: ${line.name}`,
});

function Line({ line, children }: { line: CrisisLine; children?: ReactNode }) {
  return (
    <li data-testid="crisis-line">
      <Card>
        <h3 className="text-lg font-semibold">{line.name}</h3>
        <p className="mt-1 text-body">{line.how}</p>
        {line.action && (
          <a
            href={line.action.href}
            className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary underline"
          >
            {line.action.label}
          </a>
        )}
        {children}
      </Card>
    </li>
  );
}

/**
 * /crisis-resources/ — Section 14.3. Block D renders first, directly under the H1.
 * International lines render only once the founder has verified each against the
 * provider's own page (source + date); until then, the emergency-number guidance stands.
 */
export default function CrisisResourcesPage() {
  const international = verifiedInternationalLines(c.international.lines);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: c.h1, path: routes.crisis },
        ]}
      />
      <h1 className="mt-4">{c.h1}</h1>
      <CrisisBlock className="mt-4" />
      <p className="mt-6 text-lg">{c.intro}</p>

      <section aria-labelledby="us-heading" className="mt-10">
        <h2 id="us-heading" className="text-xl font-semibold">
          {c.us.heading}
        </h2>
        <ul className="mt-4 space-y-4">
          {c.us.lines.map((line) => (
            <Line key={line.name} line={line} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="intl-heading" className="mt-10">
        <h2 id="intl-heading" className="text-xl font-semibold">
          {c.international.heading}
        </h2>
        <p className="mt-3 font-semibold">{c.international.emergency}</p>
        {international.length > 0 && (
          <>
            <p className="mt-4">{c.international.listIntro}</p>
            <ul className="mt-4 space-y-4" data-testid="international-lines">
              {international.map((line) => (
                <Line key={`${line.country}-${line.name}`} line={withCountry(line)}>
                  <p className="mt-2 text-sm text-muted">
                    {c.international.checked(line.verifiedOn)} ·{" "}
                    <a href={line.sourceUrl} rel="noopener" className="text-primary underline">
                      {c.international.source}
                    </a>
                  </p>
                </Line>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="someone-heading" className="mt-10">
        <h2 id="someone-heading" className="text-xl font-semibold">
          {c.someoneElse.heading}
        </h2>
        {c.someoneElse.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
      </section>

      <p className="mt-10 text-muted">{c.notACrisisService}</p>
    </div>
  );
}
