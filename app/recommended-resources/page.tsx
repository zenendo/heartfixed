import Link from "next/link";
import { AffiliateSlot } from "@/components/content/AffiliateSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { routes } from "@/config/site";
import { honestFraming } from "@/content/compliance";
import { resourcesPage as r, type Resource } from "@/content/resources";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.resources);

function ResourceEntry({ resource }: { resource: Resource }) {
  return (
    <li data-testid="resource">
      <Card>
        <p className="text-sm text-muted">{resource.kind}</p>
        <h3 className="text-lg font-semibold">
          {resource.name}
          <span className="font-normal text-muted">{` — ${resource.by}`}</span>
        </h3>
        <p className="mt-1 font-semibold">{resource.forWho}</p>
        <p className="mt-2">{resource.text}</p>
      </Card>
      <AffiliateSlot id={resource.slotId} className="mt-3" />
    </li>
  );
}

/**
 * /recommended-resources/ — Sections 12.4 and 13.4. Organised by moment. Four slots,
 * one per resource, all disabled at launch; the honest-framing line sits above the
 * programmes because one of them is about reconciling.
 */
export default function RecommendedResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: r.h1, path: routes.resources },
        ]}
      />
      <h1 className="mt-4">{r.h1}</h1>
      {r.intro.map((text) => (
        <p key={text} className="mt-3 text-lg text-muted">
          {text}
        </p>
      ))}

      <section aria-labelledby="first-weeks-heading" className="mt-10">
        <h2 id="first-weeks-heading" className="text-xl font-semibold">
          {r.firstWeeks.heading}
        </h2>
        <p className="mt-2">{r.firstWeeks.body}</p>
        <ul className="mt-3 space-y-2">
          {r.firstWeeks.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center font-semibold text-primary underline"
              >
                {link.label}
              </Link>
              <p className="text-muted">{link.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pattern-heading" className="mt-12">
        <h2 id="pattern-heading" className="text-xl font-semibold">
          {r.pattern.heading}
        </h2>
        <p className="mt-2">{r.pattern.body}</p>
        <ul className="mt-4 space-y-4">
          {r.pattern.resources.map((resource) => (
            <ResourceEntry key={resource.slotId} resource={resource} />
          ))}
        </ul>
        <p className="mt-3">
          <Link
            href={routes.quiz}
            className="inline-flex min-h-11 items-center font-semibold text-primary underline"
          >
            {r.pattern.quizLink}
          </Link>
        </p>
      </section>

      <section aria-labelledby="deeper-heading" className="mt-12">
        <h2 id="deeper-heading" className="text-xl font-semibold">
          {r.deeper.heading}
        </h2>
        <p className="mt-2">{r.deeper.body}</p>
        <Callout className="mt-4" data-testid="honest-framing">
          <p>{honestFraming.text}</p>
        </Callout>
        <ul className="mt-4 space-y-4">
          {r.deeper.resources.map((resource) => (
            <ResourceEntry key={resource.slotId} resource={resource} />
          ))}
        </ul>
      </section>

      <p className="mt-12 text-muted">
        {r.note}{" "}
        <Link href={routes.affiliateDisclosure} className="text-primary underline">
          {r.disclosureLink}
        </Link>
        .
      </p>
    </div>
  );
}
