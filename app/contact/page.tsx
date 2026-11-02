import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { routes, site } from "@/config/site";
import { contactPage as c } from "@/content/trust";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.contact);

/**
 * /contact/ — Section 14.4. The address comes only from config/site.ts. Until the
 * founder supplies it, the page says so plainly rather than showing an empty link.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: c.h1, path: routes.contact },
        ]}
      />
      <h1 className="mt-4">{c.h1}</h1>
      <p className="mt-4 text-lg">{c.intro}</p>

      <Card className="mt-6 bg-panel" data-testid="contact-card">
        <p className="font-semibold">{c.emailLabel}</p>
        {site.contactEmail ? (
          <p className="mt-1">
            <a
              href={`mailto:${site.contactEmail}`}
              className="inline-flex min-h-11 items-center break-all text-primary underline"
            >
              {site.contactEmail}
            </a>
          </p>
        ) : (
          <p className="mt-1 text-muted" data-testid="contact-pending">
            {c.emailPending}
          </p>
        )}
        <p className="mt-3" data-testid="contact-expectations">
          {c.expectations}
        </p>
        <Link
          href={routes.crisis}
          className="mt-1 inline-flex min-h-11 items-center font-semibold text-primary underline"
        >
          {c.crisisLink}
        </Link>
      </Card>

      <section aria-labelledby="topics-heading" className="mt-10">
        <h2 id="topics-heading" className="text-xl font-semibold">
          {c.topics.heading}
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          {c.topics.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-muted">{c.privacyNote}</p>
      </section>

      <section aria-labelledby="local-heading" className="mt-10">
        <h2 id="local-heading" className="text-xl font-semibold">
          {c.localData.heading}
        </h2>
        <p className="mt-3">{c.localData.text}</p>
      </section>
    </div>
  );
}
