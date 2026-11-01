import Link from "next/link";
import { CrisisBlock, ToolDisclaimer } from "@/components/content/ComplianceBlocks";
import { Faq } from "@/components/content/Faq";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Tracker } from "@/components/tools/Tracker";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { routes } from "@/config/site";
import { faqs } from "@/content/faqs";
import { trackerCopy, trackerPage as p } from "@/content/tracker";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.tracker);

/**
 * /no-contact-tracker/ — Section 11.1. The tool hydrates on the client; everything
 * below it (explainer, goal guidance, what counts as contact, FAQ) is in the
 * server-rendered HTML.
 */
export default function NoContactTrackerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: trackerCopy.h1, path: routes.tracker },
        ]}
      />

      <h1 className="mt-4">{trackerCopy.h1}</h1>
      <p className="mt-3 text-lg text-muted print:hidden">{trackerCopy.promise}</p>

      <Card className="mt-6 print:p-0 print:shadow-none">
        <Tracker />
      </Card>

      <div className="print:hidden">
        <CrisisBlock className="mt-8" />

        <section aria-labelledby="explainer-heading" className="mt-12">
          <h2 id="explainer-heading" className="text-xl font-semibold">
            {p.explainer.heading}
          </h2>
          {p.explainer.paragraphs.map((text) => (
            <p key={text} className="mt-3">
              {text}
            </p>
          ))}
          <p className="mt-3">
            <Link href={routes.noContactRule} className="font-semibold text-primary underline">
              {p.explainer.link}
            </Link>
          </p>
        </section>

        <section aria-labelledby="goals-heading" className="mt-12">
          <h2 id="goals-heading" className="text-xl font-semibold">
            {p.goals.heading}
          </h2>
          <dl className="mt-4 space-y-4">
            {p.goals.items.map((goal) => (
              <div key={goal.days}>
                <dt className="font-semibold">{`${goal.days} days`}</dt>
                <dd className="mt-1 text-muted">{goal.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="contact-heading" className="mt-12">
          <h2 id="contact-heading" className="text-xl font-semibold">
            {p.contact.heading}
          </h2>
          <p className="mt-3">{p.contact.intro}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {p.contact.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-muted">{p.contact.strictness}</p>
          <p className="mt-2 text-muted">{p.contact.soft}</p>
        </section>

        <Card className="mt-12 bg-panel">
          <h2 className="text-xl font-semibold">{p.urgeBlock.heading}</h2>
          <p className="mt-2">{p.urgeBlock.body}</p>
          <ButtonLink href={routes.decision} className="mt-4">
            {p.urgeBlock.cta}
          </ButtonLink>
        </Card>

        {/* TODO(session-10): affiliate slot "tracker-after-explainer" (Section 13.4) —
            ships disabled and renders nothing until the founder enables it. */}

        <div className="mt-12">
          <Faq heading={p.faqHeading} items={faqs.tracker} />
        </div>

        <Card className="mt-12">
          <h2 className="text-xl font-semibold">{p.ruleBlock.heading}</h2>
          <p className="mt-2 text-muted">{p.ruleBlock.body}</p>
          <Link
            href={routes.noContactRule}
            className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline"
          >
            {p.explainer.link}
          </Link>
        </Card>
      </div>

      <ToolDisclaimer className="mt-12" />
    </div>
  );
}
