import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { routes, tools } from "@/config/site";
import { notFoundCopy as t } from "@/content/notFound";
import { notFoundMetadata } from "@/lib/seo/metadata";

export const metadata = notFoundMetadata;

/** Section 12.2: a real 404 page linking the three tools and the crisis page. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <h1>{t.h1}</h1>
      <p className="mt-4 text-lg">{t.body}</p>

      <section aria-labelledby="nf-tools-heading" className="mt-8">
        <h2 id="nf-tools-heading" className="text-xl font-semibold">
          {t.toolsHeading}
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.key}>
              <Card className="h-full">
                <Link
                  href={tool.href}
                  className="inline-flex min-h-11 items-center font-semibold text-primary underline"
                >
                  {tool.name}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8">
        {t.crisis.text}{" "}
        <Link href={routes.crisis} className="font-semibold text-primary underline">
          {t.crisis.link}
        </Link>
        .
      </p>

      <ButtonLink href={routes.home} variant="secondary" className="mt-8">
        {t.home}
      </ButtonLink>
    </div>
  );
}
