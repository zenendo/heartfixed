import Link from "next/link";
import { Faq } from "@/components/content/Faq";
import { GuideBlocks } from "@/components/content/GuideBody";
import { JsonLd } from "@/components/content/JsonLd";
import { ToolBlock } from "@/components/content/ToolBlock";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { guideMeta, situationalTemplate } from "@/config/content";
import { routes } from "@/config/site";
import { guideContent, guideCopy, type Guide } from "@/content/guides";
import type { Section } from "@/content/guides/types";
import { routeMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schema";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

/** The situational template's fixed sections, in config order (Section 12.3). */
function situationalSections(guide: Extract<Guide, { kind: "situational" }>): Section[] {
  return situationalTemplate.sections.map(({ key, heading }) => {
    const title = guide.headings?.[key] ?? heading;
    if (key === "mistakes") {
      return {
        heading: title,
        blocks: [
          { terms: guide.mistakes.map((m) => ({ term: m.title, text: m.text })), ordered: true },
        ],
      };
    }
    if (key === "next24") {
      return {
        heading: title,
        blocks: [{ terms: guide.next24.map((s) => ({ term: s.when, text: s.what })) }],
      };
    }
    return { heading: title, blocks: guide[key] };
  });
}

/**
 * One template for every guide (Section 12.3): breadcrumbs, H1, visible dates, intro,
 * sections, then the tool block and one sibling guide (Section 6). No byline, ever
 * (Section 12.5). Article + BreadcrumbList schema, plus FAQPage when the guide has FAQs.
 */
export function GuidePage({ route }: { route: string }) {
  const guide = guideContent(route);
  const meta = guideMeta(route);
  const sibling = guideContent(meta.sibling);
  const sections = guide.kind === "article" ? guide.sections : situationalSections(guide);
  const head = routeMetadata[route]!;

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 md:py-10" data-guide-kind={guide.kind}>
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: guide.shortTitle, path: route },
        ]}
      />
      <JsonLd
        data={articleSchema({
          route,
          headline: guide.h1,
          description: head.description,
          datePublished: meta.datePublished,
          dateModified: meta.lastReviewed,
        })}
      />

      <h1 className="mt-4">{guide.h1}</h1>
      <p className="mt-2 text-sm text-muted" data-testid="last-reviewed">
        {guideCopy.lastReviewed}{" "}
        <time dateTime={meta.lastReviewed}>{formatDate(meta.lastReviewed)}</time>
      </p>
      {guide.intro.map((text) => (
        <p key={text} className="mt-4 text-lg">
          {text}
        </p>
      ))}

      {sections.map((section, i) => (
        <section key={section.heading} aria-labelledby={`section-${i}`} className="mt-10">
          <h2 id={`section-${i}`} className="text-xl font-semibold">
            {section.heading}
          </h2>
          <GuideBlocks blocks={section.blocks} />
        </section>
      ))}

      <ToolBlock
        tool={meta.tool}
        heading={guide.toolBlock?.heading}
        body={guide.toolBlock?.body}
        className="mt-12"
      />

      <nav aria-labelledby="sibling-heading" className="mt-8" data-testid="sibling-guide">
        <h2 id="sibling-heading" className="text-lg font-semibold">
          {guideCopy.sibling}
        </h2>
        <Link
          href={sibling.route}
          className="inline-flex min-h-11 items-center font-semibold text-primary underline"
        >
          {sibling.shortTitle}
        </Link>
        <p className="text-muted">{sibling.summary}</p>
      </nav>

      {guide.faqs && guide.faqs.length > 0 && (
        <div className="mt-12">
          <Faq heading={guideCopy.faqHeading} items={guide.faqs} />
        </div>
      )}
    </article>
  );
}
