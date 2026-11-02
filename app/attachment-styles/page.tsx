import Link from "next/link";
import { Faq } from "@/components/content/Faq";
import { QuizCta } from "@/components/content/QuizCta";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { routes } from "@/config/site";
import { hubCopy as h, profilePageCopy, profilePages } from "@/content/attachment-styles";
import { faqs } from "@/content/faqs";
import { profileFor, profiles, type Band, type ProfileId } from "@/lib/quiz";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.attachmentStyles);

const PROFILE_ORDER: readonly ProfileId[] = ["secure", "anxious", "avoidant", "fearful-avoidant"];
const BANDS: readonly Band[] = ["low", "moderate", "high"];

/**
 * /attachment-styles/ — the explainer hub (Section 6). Links all four profiles and the
 * quiz. The band table is computed from the engine's profileFor, so it can never
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
              <Card className="flex h-full flex-col" data-testid="profile-card">
                <h3 className="text-lg font-semibold">{profiles[id].label}</h3>
                <p className="mt-2 flex-1 text-muted">{profilePages[id].summary}</p>
                <Link
                  href={profiles[id].route}
                  className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline"
                >
                  {h.readProfile(profiles[id].name)}
                </Link>
              </Card>
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
        <div className="mt-4 overflow-x-auto">
          <table
            className="w-full table-fixed border-collapse text-left text-small sm:text-sm [&_td]:break-words [&_th]:break-words"
            data-testid="band-table"
          >
            <caption className="mb-2 text-left text-muted">{h.dimensions.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-muted py-2 pr-2">
                  <span className="sr-only">{`${h.dimensions.anxietyLabel} by row, ${h.dimensions.avoidanceLabel} by column`}</span>
                </th>
                {BANDS.map((avoidance) => (
                  <th
                    key={avoidance}
                    scope="col"
                    className="border-b border-muted px-1 py-2 font-normal text-muted"
                  >
                    {avoidance}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANDS.map((anxiety) => (
                <tr key={anxiety}>
                  <th
                    scope="row"
                    className="border-b border-panel py-2 pr-1 font-normal text-muted"
                  >
                    {anxiety}
                  </th>
                  {BANDS.map((avoidance) => {
                    const id = profileFor(anxiety, avoidance);
                    return (
                      <td key={avoidance} className="border-b border-panel px-1 py-2">
                        <Link href={profiles[id].route} className="text-primary underline">
                          {profiles[id].name}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
