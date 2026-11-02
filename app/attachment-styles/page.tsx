import Link from "next/link";
import { BandTable } from "@/components/content/BandTable";
import { Faq } from "@/components/content/Faq";
import { ProfileCard } from "@/components/content/ProfileCard";
import { QuizCta } from "@/components/content/QuizCta";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { hubCopy as h, profilePageCopy } from "@/content/attachment-styles";
import { faqs } from "@/content/faqs";
import { profiles, type ProfileId } from "@/lib/quiz";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.attachmentStyles);

const PROFILE_ORDER: readonly ProfileId[] = ["secure", "anxious", "avoidant", "fearful-avoidant"];

/**
 * /attachment-styles/ — the explainer hub (Section 6). Links all four profiles and the
 * quiz. The band table (BandTable) is computed from the engine's profileFor, so it can never
 * disagree with how results are scored.
 */
export default function AttachmentStylesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: "Attachment styles", path: routes.attachmentStyles },
        ]}
      />

      <h1 className="mt-4">{h.h1}</h1>
      {h.intro.map((text) => (
        <p key={text} className="mt-3 text-lg text-muted">
          {text}
        </p>
      ))}
      <ButtonLink href={routes.quiz} className="mt-6">
        {h.quizCta}
      </ButtonLink>

      <section aria-labelledby="profiles-heading" className="mt-12">
        <h2 id="profiles-heading" className="text-xl font-semibold">
          {h.profilesHeading}
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {PROFILE_ORDER.map((id) => (
            <li key={id}>
              <ProfileCard id={id} linkLabel={h.readProfile(profiles[id].name)} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dimensions-heading" className="mt-12">
        <h2 id="dimensions-heading" className="text-xl font-semibold">
          {h.dimensions.heading}
        </h2>
        {h.dimensions.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
        <BandTable caption={h.dimensions.tableCaption} className="mt-4" />
      </section>

      <section aria-labelledby="trap-heading" className="mt-12">
        <h2 id="trap-heading" className="text-xl font-semibold">
          {h.trap.heading}
        </h2>
        {h.trap.paragraphs.map((text) => (
          <p key={text} className="mt-3">
            {text}
          </p>
        ))}
        <p className="mt-3">
          <Link
            href={routes.guideAfterBreakup}
            className="inline-flex min-h-11 items-center font-semibold text-primary underline"
          >
            {h.trap.link}
          </Link>
        </p>
      </section>

      <section aria-labelledby="labels-heading" className="mt-12">
        <h2 id="labels-heading" className="text-xl font-semibold">
          {h.notLabels.heading}
        </h2>
        <p className="mt-3">{h.notLabels.paragraph}</p>
      </section>

      <QuizCta className="mt-12" {...profilePageCopy.quizCta} />

      <section aria-labelledby="sources-heading" className="mt-12">
        <h2 id="sources-heading" className="text-xl font-semibold">
          {h.sources.heading}
        </h2>
        <p className="mt-3">{h.sources.paragraph}</p>
        <p className="mt-3 text-muted">
          {profilePageCopy.methodology.text}{" "}
          <Link href={routes.methodology} className="text-primary underline">
            {profilePageCopy.methodology.link}
          </Link>
          .
        </p>
      </section>

      <div className="mt-12">
        <Faq heading={h.faqHeading} items={faqs.attachmentStyles} />
      </div>
    </div>
  );
}
