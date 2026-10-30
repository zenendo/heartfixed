import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { routes, tools } from "@/config/site";
import { home } from "@/content/home";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.home);

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

      {/* TODO(session-10): full homepage hub per Section 6 — guides, profiles, resources. */}
    </div>
  );
}
