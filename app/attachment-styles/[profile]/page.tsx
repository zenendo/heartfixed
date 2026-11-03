import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Faq } from "@/components/content/Faq";
import { QuizCta } from "@/components/content/QuizCta";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { routes } from "@/config/site";
import { profilePageCopy as t, profilePages } from "@/content/attachment-styles";
import { faqs } from "@/content/faqs";
import {
  leanWatchOuts,
  profileCopy,
  profileFor,
  profiles,
  type Band,
  type ProfileId,
} from "@/lib/quiz";

const LEANS = ["anxious", "avoidant", "mixed"] as const;
import { metadataFor } from "@/lib/seo/metadata";

const PROFILE_IDS = Object.keys(profiles) as ProfileId[];
const BANDS: readonly Band[] = ["low", "moderate", "high"];

type Params = Promise<{ profile: string }>;

const isProfileId = (value: string): value is ProfileId =>
  (PROFILE_IDS as string[]).includes(value);

export const dynamicParams = false;

export function generateStaticParams() {
  return PROFILE_IDS.map((profile) => ({ profile }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { profile } = await params;
  if (!isProfileId(profile)) notFound();
  return metadataFor(profiles[profile].route);
}

/** The band combinations that land on a profile — from the engine, never restated. */
function combinationsFor(id: ProfileId) {
  return BANDS.flatMap((anxiety) =>
    BANDS.filter((avoidance) => profileFor(anxiety, avoidance) === id).map(
      (avoidance) => `Anxiety ${anxiety} · avoidance ${avoidance}`,
    ),
  );
}

/**
 * /attachment-styles/[profile]/ — the four profile pages (Section 6). Core copy comes
 * from lib/quiz/profiles.ts (shared with the result view); the long-form sections from
 * content/attachment-styles.ts. Every page links the quiz, the methodology page and
 * the other three profiles.
 */
export default async function ProfilePage({ params }: { params: Params }) {
  const { profile } = await params;
  if (!isProfileId(profile)) notFound();

  const meta = profiles[profile];
  const core = profileCopy[profile];
  const page = profilePages[profile];
  const others = PROFILE_IDS.filter((id) => id !== profile);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        trail={[
          { name: "Home", path: routes.home },
          { name: "Attachment styles", path: routes.attachmentStyles },
          { name: meta.name, path: meta.route },
        ]}
      />

      <h1 className="mt-4">{page.h1}</h1>
      <p className="mt-3 text-lg text-muted">{page.intro}</p>

      <section aria-labelledby="dimensions-heading" className="mt-8">
        <h2 id="dimensions-heading" className="text-xl font-semibold">
          {t.dimensionsHeading}
        </h2>
        <p className="mt-2">{t.dimensionsIntro}</p>
        <ul className="mt-2 list-disc space-y-1 pl-6" data-testid="band-combinations">
          {combinationsFor(profile).map((combo) => (
            <li key={combo}>{combo}</li>
          ))}
        </ul>
      </section>

      <QuizCta className="mt-8" {...t.quizCta} />

      <section aria-labelledby="what-heading" className="mt-12">
        <h2 id="what-heading" className="text-xl font-semibold">
          {t.sections.whatItIs}
        </h2>
        <p className="mt-3">{core.description}</p>
        {core.leans &&
          LEANS.map((lean) => (
            <div key={lean} className="mt-4">
              <p className="font-semibold">{core.leans![lean]}</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                {leanWatchOuts(lean).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
      </section>

      <section aria-labelledby="relationship-heading" className="mt-12">
        <h2 id="relationship-heading" className="text-xl font-semibold">
          {page.inRelationship.heading}
        </h2>
        <p className="mt-3">{page.inRelationship.paragraph}</p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          {page.inRelationship.signs.map((sign) => (
            <li key={sign}>{sign}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="breakup-heading" className="mt-12">
        <h2 id="breakup-heading" className="text-xl font-semibold">
          {t.sections.afterBreakup}
        </h2>
        <p className="mt-3">{core.afterBreakup}</p>
      </section>

      <section aria-labelledby="risk-heading" className="mt-12">
        <h2 id="risk-heading" className="text-xl font-semibold">
          {t.sections.risk}
        </h2>
        <p className="mt-3">{core.noContactRisk}</p>
        <p className="mt-3">
          <Link
            href={routes.tracker}
            className="inline-flex min-h-11 items-center font-semibold text-primary underline"
          >
            {t.trackerLink}
          </Link>
        </p>
      </section>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="watchouts-heading">
          <h2 id="watchouts-heading" className="text-xl font-semibold">
            {t.sections.watchOuts}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {core.watchOuts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="strengths-heading">
          <h2 id="strengths-heading" className="text-xl font-semibold">
            {t.sections.strengths}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {core.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="helps-heading" className="mt-12">
        <h2 id="helps-heading" className="text-xl font-semibold">
          {page.whatHelps.heading}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          {page.whatHelps.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="change-heading" className="mt-12">
        <h2 id="change-heading" className="text-xl font-semibold">
          {t.sections.canChange}
        </h2>
        <p className="mt-3">{page.canChange}</p>
      </section>

      <section aria-labelledby="next-heading" className="mt-12">
        <h2 id="next-heading" className="text-xl font-semibold">
          {t.sections.nextSteps}
        </h2>
        <ul className="mt-2">
          {core.nextSteps.map((step) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className="inline-flex min-h-11 items-center font-semibold text-primary underline"
              >
                {step.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-muted">
          {t.methodology.text}{" "}
          <Link href={routes.methodology} className="text-primary underline">
            {t.methodology.link}
          </Link>
          .
        </p>
      </section>

      <nav aria-labelledby="others-heading" className="mt-12" data-testid="other-profiles">
        <h2 id="others-heading" className="text-xl font-semibold">
          {t.otherProfiles}
        </h2>
        <ul className="mt-2">
          {others.map((id) => (
            <li key={id}>
              <Link
                href={profiles[id].route}
                className="inline-flex min-h-11 items-center text-primary underline"
              >
                {profiles[id].label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12">
        <Faq heading={t.faqHeading} items={faqs.profiles[profile]} />
      </div>
    </div>
  );
}
