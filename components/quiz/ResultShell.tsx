"use client";

import { useEffect, useState } from "react";
import { CrisisBlock, SelfReflectionDisclaimer } from "@/components/content/ComplianceBlocks";
import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { readProfileLabel } from "@/content/attachment-styles";
import { resultShellCopy as t } from "@/content/quiz";
import { profiles, savedQuizSchema, type QuizResult } from "@/lib/quiz";
import { readStored, storageKeys } from "@/lib/storage";

/**
 * The result view, Session 4 minimum: the profile headline, both scores and Block A
 * directly under them (Sections 9.5, 10.3), from the result saved in this browser.
 * With nothing saved, the generic shell with a "take the assessment" prompt.
 * TODO(session-5): the full Part B result view, shared-token views, print, email, share.
 */
export function ResultShell() {
  const [result, setResult] = useState<QuizResult | null | undefined>(undefined);

  useEffect(() => {
    const saved = readStored(storageKeys.quiz, savedQuizSchema);
    setResult(saved.status === "ok" ? saved.value.result : null);
  }, []);

  if (result === undefined) return <div className="min-h-[24rem]" aria-busy="true" />;

  if (result === null) {
    return (
      <div className="min-h-[24rem]" data-testid="result-empty">
        <h1>{t.empty.heading}</h1>
        <p className="mt-3 text-lg">{t.empty.body}</p>
        <ButtonLink href={routes.quiz} className="mt-6">
          {t.empty.cta}
        </ButtonLink>
      </div>
    );
  }

  const profile = profiles[result.profileId];
  return (
    <div className="min-h-[24rem]" data-testid="result">
      <h1>{t.headline(profile.label)}</h1>
      <ul className="mt-4 space-y-1 text-lg font-semibold" data-testid="result-scores">
        <li>{t.score("anxiety", result.anxietyNorm, result.anxietyBand)}</li>
        <li>{t.score("avoidance", result.avoidanceNorm, result.avoidanceBand)}</li>
      </ul>
      <SelfReflectionDisclaimer className="mt-4" />
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href={profile.route}>{readProfileLabel(profile.name)}</ButtonLink>
        <ButtonLink href={routes.quiz} variant="secondary">
          {t.retake}
        </ButtonLink>
      </div>
      <CrisisBlock placement="result" className="mt-10" />
    </div>
  );
}
