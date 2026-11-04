"use client";

import Link from "next/link";
import { CrisisBlock } from "@/components/content/ComplianceBlocks";
import { ProfileSections, ResultHeader } from "@/components/quiz/ResultParts";
import { ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { pronounTerms } from "@/config/copy";
import { routes } from "@/config/site";
import { readProfileLabel } from "@/content/attachment-styles";
import { resultCopy as t } from "@/content/quiz-result-ui";
import { profiles, type SharedResult } from "@/lib/quiz";

/**
 * A shared link's view — Section 9.6: the sharer's profile and scores under the banner,
 * and nothing else — no partner read, no decodes, no email form, no tracker offer.
 * No pronoun choice travels in a link, so the profile's partner lines use the neutral
 * they/them forms (amendment brief, 2.5).
 */
export function SharedResultView({ result }: { result: SharedResult }) {
  const meta = profiles[result.profileId];
  return (
    <article data-testid="result-shared">
      <Callout className="mb-6">
        <p className="font-semibold">{t.sharedBanner}</p>
        <ButtonLink href={`${routes.quiz}?from=share`} className="mt-3">
          {t.sharedCta}
        </ButtonLink>
      </Callout>
      <ResultHeader result={result} />
      <section aria-labelledby="shared-profile" className="mt-12 border-t border-panel pt-8">
        <h2 id="shared-profile" className="text-xl font-bold">
          {t.sharedProfileHeading(meta.name)}
        </h2>
        <ProfileSections result={result} partner={pronounTerms.they} own={false} />
      </section>
      <p className="mt-8">
        <Link
          href={meta.route}
          className="inline-flex min-h-11 items-center font-semibold text-primary underline"
        >
          {readProfileLabel(meta.name)}
        </Link>
      </p>
      <CrisisBlock placement="result" className="mt-12" />
    </article>
  );
}
