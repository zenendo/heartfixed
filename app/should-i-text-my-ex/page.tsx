import { ToolDisclaimer } from "@/components/content/ComplianceBlocks";
import { Faq } from "@/components/content/Faq";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DecisionTool } from "@/components/tools/DecisionTool";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { routes } from "@/config/site";
import { decisionCopy, decisionPage as p } from "@/content/decision";
import { faqs } from "@/content/faqs";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.decision);

/**
 * /should-i-text-my-ex/ — Section 11.2. The flow hydrates on the client; the
 * explanation of the rules, the three outcomes and the FAQ are server-rendered.
 */
export default function ShouldITextMyExPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: decisionCopy.h1, path: routes.decision },
        ]}
      />

      <h1 className="mt-4">{decisionCopy.h1}</h1>
      <p className="mt-3 text-lg text-muted">{decisionCopy.intro}</p>

      <Card className="mt-6">
        <DecisionTool />
      </Card>

      <section aria-labelledby="how-heading" className="mt-12">
        <h2 id="how-heading" className="text-xl font-semibold">
          {p.how.heading}
        </h2>
        {p.how.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
      </section>

      <section aria-labelledby="outcomes-heading" className="mt-12">
        <h2 id="outcomes-heading" className="text-xl font-semibold">
          {p.outcomes.heading}
        </h2>
        <dl className="mt-4 space-y-4">
          {p.outcomes.items.map((item) => (
            <div key={item.term}>
              <dt className="font-semibold">{item.term}</dt>
              <dd className="mt-1 text-muted">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Card className="mt-12 bg-panel">
        <h2 className="text-xl font-semibold">{p.trackerBlock.heading}</h2>
        <p className="mt-2">{p.trackerBlock.body}</p>
        <ButtonLink href={routes.tracker} className="mt-4">
          {p.trackerBlock.cta}
        </ButtonLink>
      </Card>

      <div className="mt-12">
        <Faq heading={p.faqHeading} items={faqs.decision} />
      </div>

      <ToolDisclaimer className="mt-12" />
    </div>
  );
}
