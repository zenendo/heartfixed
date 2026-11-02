import Link from "next/link";
import { GuideCard } from "@/components/content/GuideCard";
import { ProfileCard } from "@/components/content/ProfileCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { routes, tools } from "@/config/site";
import { allGuides } from "@/content/guides";
import { home } from "@/content/home";
import type { ProfileId } from "@/lib/quiz";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.home);

const PROFILE_ORDER: readonly ProfileId[] = ["secure", "anxious", "avoidant", "fearful-avoidant"];

/**
 * / — the hub (Section 6): the brand, all three tools, the attachment hub and profiles,
 * every launch guide and the resources page, so every route is within two clicks.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <h1 className="max-w-3xl">{home.hero}</h1>
      <p className="mt-4 max-w-2xl text-muted">{home.intro}</p>

      <section aria-labelledby="tools-heading" className="mt-10">
        <h2 id="tools-heading" className="text-xl font-semibold">
          {home.toolsHeading}
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.key}>
              <Card className="flex h-full flex-col">
                <h3 className="text-lg font-semibold">{tool.name}</h3>
                <p className="mt-2 flex-1 text-muted">{home.tools[tool.key].summary}</p>
                <ButtonLink href={tool.href} className="mt-4 self-start">
                  {home.tools[tool.key].cta}
                </ButtonLink>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="patterns-heading" className="mt-14">
        <h2 id="patterns-heading" className="text-xl font-semibold">
          {home.patterns.heading}
        </h2>
        <p className="mt-2 max-w-3xl text-muted">{home.patterns.intro}</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILE_ORDER.map((id) => (
            <li key={id}>
              <ProfileCard id={id} linkLabel={home.patterns.cardLink} />
            </li>
          ))}
        </ul>
        <Link
          href={routes.attachmentStyles}
          className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline"
        >
          {home.patterns.hubLink}
        </Link>
      </section>

      <section aria-labelledby="guides-heading" className="mt-14">
        <h2 id="guides-heading" className="text-xl font-semibold">
          {home.guides.heading}
        </h2>
        <p className="mt-2 text-muted">{home.guides.intro}</p>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {allGuides.map((guide) => (
            <li key={guide.route}>
              <GuideCard guide={guide} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="resources-heading" className="mt-14">
        <Card className="bg-panel">
          <h2 id="resources-heading" className="text-xl font-semibold">
            {home.resources.heading}
          </h2>
          <p className="mt-2">{home.resources.body}</p>
          <ButtonLink href={routes.resources} variant="secondary" className="mt-4">
            {home.resources.link}
          </ButtonLink>
        </Card>
      </section>

      <section aria-labelledby="how-heading" className="mt-14">
        <h2 id="how-heading" className="text-xl font-semibold">
          {home.howItWorks.heading}
        </h2>
        <dl className="mt-4 grid gap-6 md:grid-cols-3">
          {home.howItWorks.points.map((point) => (
            <div key={point.term}>
              <dt className="font-semibold">{point.term}</dt>
              <dd className="mt-1 text-muted">{point.text}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-4 flex flex-wrap gap-x-6">
          <li>
            <Link
              href={routes.methodology}
              className="inline-flex min-h-11 items-center text-primary underline"
            >
              {home.howItWorks.methodology}
            </Link>
          </li>
          <li>
            <Link
              href={routes.about}
              className="inline-flex min-h-11 items-center text-primary underline"
            >
              {home.howItWorks.about}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
