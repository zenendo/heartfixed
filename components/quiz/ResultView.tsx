"use client";

import Link from "next/link";
import { AffiliateSlot } from "@/components/content/AffiliateSlot";
import { CrisisBlock } from "@/components/content/ComplianceBlocks";
import { EmailResultForm } from "@/components/quiz/EmailResultForm";
import { LINK, ProfileSections, ResultHeader, Section, Sub } from "@/components/quiz/ResultParts";
import { Rich } from "@/components/quiz/Rich";
import { ShareResult } from "@/components/quiz/ShareResult";
import { ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { routes } from "@/config/site";
import {
  bridgeTools,
  dynamicLeanLines,
  programmeLine,
  resultContentFor,
  resultCopy as t,
} from "@/content/quiz-result";
import {
  DEFAULT_PRONOUNS,
  dynamicFor,
  profileCopy,
  profiles,
  pronounContext,
  selectedDecodes,
  sinceBreakupSelectors,
  type SavedQuiz,
} from "@/lib/quiz";

/**
 * The full result view — Section 10.3 in the brief's Part B order: headline and Block
 * A; Act 1 (the partner read, caveat first, then the dynamic); Act 2 (the profile, tracker
 * offer); since the breakup (the decodes the answers selected); Act 3 (bridge, tools,
 * email); share; go deeper (the only affiliate position, below the email form); Block
 * D. Everything here renders from this browser's saved result — the partner read and
 * decodes never leave it except in the email the visitor asks for. The text renders
 * with the visitor's two pronoun answers (amendment brief, 2.3).
 */
export function ResultView({ saved, outdated }: { saved: SavedQuiz; outdated: boolean }) {
  const { result, perceived } = saved;
  const pronouns = saved.pronouns ?? DEFAULT_PRONOUNS;
  const ctx = pronounContext(pronouns);
  const { caveat, herReads, decodes, decodeFallback, dynamics, bridges } = resultContentFor(ctx);
  const read = herReads[perceived.profileId];
  const pick = dynamicFor(result, perceived);
  const dynamic = dynamics[pick.id];
  const shown = selectedDecodes(saved.answers, sinceBreakupSelectors);
  const copy = profileCopy[result.profileId];
  const partnerScores = { version: saved.version, ...perceived };

  return (
    <article data-testid="result">
      {outdated && (
        <Callout tone="warning" className="mb-6">
          {t.outdated}
        </Callout>
      )}
      <ResultHeader result={result} />

      <Section id="act-why" heading={t.acts.why}>
        <div data-testid="partner-read">
          <h3 className="mt-6 text-lg font-semibold">
            {t.herHeadline(ctx.p, profiles[perceived.profileId].label)}
          </h3>
          <Callout className="mt-4" data-testid="partner-caveat">
            <p>
              <strong>{caveat.lead}</strong> <Rich text={caveat.body} />
            </p>
          </Callout>
          {read.paragraphs.map((text) => (
            <p key={text} className="mt-4">
              <Rich text={text} />
            </p>
          ))}
          <p className="mt-4">
            <strong>{t.meansLead}</strong> <Rich text={read.means} />
          </p>
          <p className="mt-4">
            <strong>{t.sinceLead}</strong> <Rich text={read.since} />
          </p>
        </div>
        <div data-testid="dynamic" data-dynamic={pick.id}>
          <h3 className="mt-8 text-lg font-semibold">{t.dynamicHeading}</h3>
          <p className="mt-1 font-semibold">{dynamic.title}</p>
          {dynamicLeanLines(pick, ctx).map((line) => (
            <p key={line} className="mt-3 font-semibold">
              {line}
            </p>
          ))}
          {dynamic.paragraphs.map((text) => (
            <p key={text} className="mt-4">
              <Rich text={text} />
            </p>
          ))}
        </div>
      </Section>

      <Section id="act-yours" heading={t.acts.yours}>
        <ProfileSections result={result} partner={ctx.p} />
      </Section>

      <Section id="act-since" heading={t.acts.since}>
        <div data-testid="decodes">
          {shown.length === 0 ? (
            <p className="mt-3">{decodeFallback}</p>
          ) : (
            shown.map((id) => (
              <Sub key={id} heading={decodes[id]!.heading}>
                <p className="mt-3" data-decode={id}>
                  <Rich text={decodes[id]!.body} />
                </p>
              </Sub>
            ))
          )}
        </div>
      </Section>

      <Section id="act-after" heading={t.acts.after(ctx.p)}>
        <p className="mt-3">
          <Rich text={bridges[result.profileId]} />
        </p>
        <div className="mt-4 flex flex-wrap gap-3 print:hidden">
          {bridgeTools[result.profileId].map((step, i) => (
            <ButtonLink
              key={step.href}
              href={step.href}
              variant={i === 0 ? "primary" : "secondary"}
            >
              {step.label}
            </ButtonLink>
          ))}
        </div>
        <div className="mt-8 rounded-card border border-panel p-4 print:hidden">
          <EmailResultForm
            result={result}
            perceived={partnerScores}
            pronouns={pronouns}
            note={programmeLine}
          />
        </div>
      </Section>

      <Section id="act-share" heading={t.share.heading}>
        <div className="mt-3">
          <ShareResult result={result} partner={ctx.p} />
        </div>
      </Section>

      <Section id="act-deeper" heading={t.goDeeper}>
        <ul className="mt-3 space-y-1" data-testid="next-steps">
          {copy.nextSteps.map((step) => (
            <li key={step.href}>
              <Link href={step.href} className={LINK}>
                {step.label}
              </Link>
            </li>
          ))}
        </ul>
        <AffiliateSlot id={`quiz-result-${result.profileId}`} className="mt-6" />
      </Section>

      <CrisisBlock placement="result" className="mt-12" />
      <p className="mt-8 print:hidden">
        <Link href={routes.quiz} className={LINK}>
          {t.retake}
        </Link>
      </p>
    </article>
  );
}
