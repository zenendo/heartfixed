"use client";

import type { ReactNode } from "react";
import { SelfReflectionDisclaimer } from "@/components/content/ComplianceBlocks";
import { DimensionBars } from "@/components/quiz/DimensionBars";
import { TrackerOffer } from "@/components/quiz/TrackerOffer";
import { resultCopy as t } from "@/content/quiz-result-ui";
import { leanFor, leanWatchOuts, profileCopy, profiles, type QuizResult } from "@/lib/quiz";

/**
 * The pieces the full result view and the shared-link view both render: the headline
 * block and Act 2's profile content (Section 10.3 items 1–6).
 */

export const LINK = "inline-flex min-h-11 items-center font-semibold text-primary underline";

export function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12 border-t border-panel pt-8">
      <h2 id={id} className="text-xl font-bold">
        {heading}
      </h2>
      {children}
    </section>
  );
}

export function Sub({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">{heading}</h3>
      {children}
    </div>
  );
}

export function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Headline, both scores with bars, then Block A directly beneath (Sections 9.5, 10.3). */
type Shown = Pick<
  QuizResult,
  "profileId" | "anxietyNorm" | "avoidanceNorm" | "anxietyBand" | "avoidanceBand"
>;

export function ResultHeader({ result }: { result: Shown }) {
  return (
    <header>
      <h1>{t.headline(profiles[result.profileId].label)}</h1>
      <DimensionBars result={result} className="mt-5" />
      <SelfReflectionDisclaimer className="mt-5" />
    </header>
  );
}

/** Act 2's profile content — shared by the full view and the shared-link view. */
export function ProfileSections({ result, own = true }: { result: Shown; own?: boolean }) {
  const copy = profileCopy[result.profileId];
  const lean = leanFor(result);
  return (
    <>
      <Sub heading={t.sections.whatItMeans}>
        {lean !== "none" && copy.leans && (
          <div data-testid="lean">
            <p className="mt-3 font-semibold">{copy.leans[lean]}</p>
            <List items={leanWatchOuts(lean)} />
          </div>
        )}
        <p className="mt-3">{copy.description}</p>
      </Sub>
      <Sub heading={t.sections.afterBreakup}>
        <p className="mt-3">{copy.afterBreakup}</p>
      </Sub>
      <Sub heading={t.sections.risk}>
        <p className="mt-3">{copy.noContactRisk}</p>
        {own && <TrackerOffer />}
      </Sub>
      <div className="grid gap-x-8 md:grid-cols-2">
        <Sub heading={t.sections.watchOuts}>
          <List items={copy.watchOuts} />
        </Sub>
        <Sub heading={t.sections.strengths}>
          <List items={copy.strengths} />
        </Sub>
      </div>
    </>
  );
}
