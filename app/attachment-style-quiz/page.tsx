import Link from "next/link";
import { SelfReflectionDisclaimer, ToolDisclaimer } from "@/components/content/ComplianceBlocks";
import { Faq } from "@/components/content/Faq";
import { ProfileCard } from "@/components/content/ProfileCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CrisisFooterLine } from "@/components/layout/CrisisFooterLine";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { Card } from "@/components/ui/Card";
import { routes } from "@/config/site";
import { readProfileLabel } from "@/content/attachment-styles";
import { quizFaqs, quizPage as p } from "@/content/quiz";
import { profiles, type ProfileId } from "@/lib/quiz";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.quiz);

const PROFILE_ORDER: readonly ProfileId[] = ["secure", "anxious", "avoidant", "fearful-avoidant"];

/**
 * /attachment-style-quiz/ — Section 10.1. Above the fold: H1, the two-sentence promise,
 * Block A and the start button. Everything below is server-rendered for crawlability.
 * No email field and no affiliate slot appear on this page.
 */
export default function AttachmentStyleQuizPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: p.h1, path: routes.quiz },
        ]}
      />

      <h1 className="mt-4">{p.h1}</h1>
      {p.promise.map((text) => (
        <p key={text} className="mt-3 text-lg text-muted">
          {text}
        </p>
      ))}
      <SelfReflectionDisclaimer className="mt-6" />

      <Card className="mt-6">
        <QuizRunner />
      </Card>

      <section aria-labelledby="profiles-heading" className="mt-12">
        <h2 id="profiles-heading" className="text-xl font-semibold">
          {p.profiles.heading}
        </h2>
        <p className="mt-2 text-muted">{p.profiles.intro}</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {PROFILE_ORDER.map((id) => (
            <li key={id}>
              <ProfileCard id={id} linkLabel={readProfileLabel(profiles[id].name)} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="mt-12">
        <h2 id="how-heading" className="text-xl font-semibold">
          {p.how.heading}
        </h2>
        {p.how.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
        <p className="mt-3">
          <Link href={routes.methodology} className="font-semibold text-primary underline">
            {p.how.methodologyLink}
          </Link>
        </p>
      </section>

      <section aria-labelledby="audience-heading" className="mt-12">
        <h2 id="audience-heading" className="text-xl font-semibold">
          {p.audience.heading}
        </h2>
        <p className="mt-3">{p.audience.forText}</p>
        <h3 className="mt-6 text-lg font-semibold">{p.audience.notForHeading}</h3>
        <p className="mt-2">{p.audience.notForText}</p>
        <div className="mt-4">
          <CrisisFooterLine />
        </div>
      </section>

      <div className="mt-12">
        <Faq heading={p.faqHeading} items={quizFaqs} />
      </div>

      <Card className="mt-12 bg-panel">
        <h2 className="text-xl font-semibold">{p.trust.heading}</h2>
        <p className="mt-2">{p.trust.body}</p>
        <p className="mt-3">
          <Link href={p.trust.link.href} className="font-semibold text-primary underline">
            {p.trust.link.label}
          </Link>
        </p>
      </Card>

      <ToolDisclaimer className="mt-12" />
    </div>
  );
}
