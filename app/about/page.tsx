import Link from "next/link";
import { ToolDisclaimer } from "@/components/content/ComplianceBlocks";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { routes } from "@/config/site";
import { aboutPage as a } from "@/content/trust";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.about);

/**
 * /about/ — trust page (Section 6). Faceless (Section 12.5). Carries Block B (Section
 * 14.3), the adults-only line (Section 14.1, item 8) and a link to the crisis page
 * (Section 14.1, item 5).
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: "About", path: routes.about },
        ]}
      />
      <h1 className="mt-4">{a.h1}</h1>
      {a.intro.map((text) => (
        <p key={text} className="mt-4 text-lg">
          {text}
        </p>
      ))}

      <section aria-labelledby="for-heading" className="mt-10">
        <h2 id="for-heading" className="text-xl font-semibold">
          {a.forWho.heading}
        </h2>
        {a.forWho.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
      </section>

      <section aria-labelledby="principles-heading" className="mt-10">
        <h2 id="principles-heading" className="text-xl font-semibold">
          {a.principles.heading}
        </h2>
        <dl className="mt-4 space-y-4">
          {a.principles.items.map((item) => (
            <div key={item.term}>
              <dt className="font-semibold">{item.term}</dt>
              <dd className="mt-1 text-muted">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="not-heading" className="mt-10">
        <h2 id="not-heading" className="text-xl font-semibold">
          {a.notHeading}
        </h2>
        <ToolDisclaimer className="mt-3" />
      </section>

      <nav aria-labelledby="more-heading" className="mt-10">
        <h2 id="more-heading" className="text-xl font-semibold">
          {a.links.heading}
        </h2>
        <ul className="mt-2">
          {a.links.items.map((link) => (
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
      </nav>
    </div>
  );
}
