"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { RadioCard } from "@/components/ui/RadioCard";
import { PRONOUN_IDS, type PronounId } from "@/config/copy";
import { quizConfig } from "@/config/quiz";
import { routes } from "@/config/site";
import { runnerCopy as t } from "@/content/quiz";
import { track } from "@/lib/analytics";
import {
  attentionCheck,
  completeAttempt,
  emptyProgress,
  endingQuestions,
  firstQuestionStep,
  herQuestions,
  isAttemptExpired,
  isOptional,
  isResumable,
  opensPartnerSection,
  pronounsFor,
  questions,
  quizProgressSchema,
  renderStem,
  runnerSteps,
  savedQuizSchema,
  scaleLabelsFor,
  sinceBreakupSelectors,
  type QuizProgress,
  type RunnerStep,
} from "@/lib/quiz";
import { clearStored, readStored, storageKeys, writeStored } from "@/lib/storage";

type Phase = "loading" | "intro" | "saved" | "outdated" | "resume" | "running";

const byId = new Map<string, { id: string; stem: string }>(
  [...questions, ...herQuestions, ...sinceBreakupSelectors].map((q) => [q.id, q]),
);

const endingById = new Map<string, (typeof endingQuestions)[number]>(
  endingQuestions.map((q) => [q.id, q]),
);

function stemFor(step: RunnerStep, progress: QuizProgress): string {
  if (step.kind === "pronouns") return t.pronouns[step.id];
  if (step.kind === "ending") return renderStem(endingById.get(step.id)!, pronounsFor(progress));
  if (step.kind === "attention") return attentionCheck.stem;
  if (step.kind === "context") {
    return quizConfig.contextQuestions.find((c) => c.id === step.id)!.prompt;
  }
  return renderStem(byId.get(step.id)!, pronounsFor(progress));
}

/**
 * The progress line for a step. The attention check and the two pronoun questions are
 * unnumbered (Section 9.2; amendment brief, 2.1).
 */
function progressLabel(step: RunnerStep): string | null {
  if (step.kind === "attention" || step.kind === "pronouns") return null;
  return t.progress[step.kind](step.number, step.total);
}

/** For the resume prompt: an unnumbered step reads as the next numbered one. */
function resumeLabel(index: number): string {
  for (const step of runnerSteps.slice(index)) {
    const label = progressLabel(step);
    if (label) return label;
  }
  return progressLabel(runnerSteps[runnerSteps.length - 1]!)!;
}

/** Section 16.1 quiz_view source: categories only, never the referrer itself. */
function viewSource(): "organic" | "internal" | "share" | "email" {
  const params = new URLSearchParams(window.location.search);
  if (params.get("utm_medium") === "email") return "email";
  if (params.get("from") === "share") return "share";
  try {
    if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
      return "internal";
    }
  } catch {
    // An unreadable referrer counts as organic.
  }
  return "organic";
}

function focusSoon(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

/**
 * QuizRunner — Section 10.2 with the brief's Part A flow: one item per screen, real
 * radio inputs under card styling, Back that keeps answers, progress saved on every
 * answer. Scores are computed only in lib/quiz, entirely in this browser; nothing
 * about the answers is sent anywhere (Section 9.5).
 */
export function QuizRunner() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmRetake, setConfirmRetake] = useState(false);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    track({ name: "quiz_view", params: { source: viewSource() } });
    const now = new Date();
    const saved = readStored(storageKeys.quiz, savedQuizSchema);
    if (saved.status === "unavailable") setStorageOk(false);
    if (saved.status === "corrupt") {
      clearStored(storageKeys.quiz);
      setNotice(t.corrupt);
    }
    if (saved.status === "ok") {
      setPhase(saved.value.version === quizConfig.questionSetVersion ? "saved" : "outdated");
      return;
    }
    const stored = readStored(storageKeys.quizProgress, quizProgressSchema);
    if (stored.status === "ok" && isResumable(stored.value, now)) {
      setProgress(stored.value);
      setPhase("resume");
      return;
    }
    if (stored.status === "corrupt") setNotice(t.corrupt);
    if (
      stored.status === "corrupt" ||
      (stored.status === "ok" && isAttemptExpired(stored.value, now))
    ) {
      clearStored(storageKeys.quizProgress);
    }
    setPhase("intro");
  }, []);

  function persist(next: QuizProgress) {
    const stamped = { ...next, savedAt: new Date().toISOString() };
    setProgress(stamped);
    writeStored(storageKeys.quizProgress, quizProgressSchema, stamped);
  }

  function begin() {
    const fresh = emptyProgress(new Date());
    clearStored(storageKeys.quizProgress);
    setProgress(fresh);
    setConfirmRetake(false);
    setError(null);
    setPhase("running");
    track({ name: "quiz_started", params: {} });
    focusSoon("quiz-question");
  }

  function resume() {
    setPhase("running");
    focusSoon("quiz-question");
  }

  function clearData() {
    clearStored(storageKeys.quiz);
    clearStored(storageKeys.quizProgress);
    setProgress(null);
    setConfirmRetake(false);
    setPhase("intro");
    setNotice(t.cleared);
  }

  // ---- Before the quiz ---------------------------------------------------------
  if (phase === "loading") {
    return <div className="min-h-[24rem]" aria-busy="true" />;
  }

  const noticeLine = (
    <p aria-live="polite" className={notice ? "font-semibold" : "sr-only"}>
      {notice}
    </p>
  );
  const storageLine = !storageOk && <Callout>{t.storageUnavailable}</Callout>;
  const clearButton = (
    <Button variant="quiet" onClick={clearData}>
      {t.clear}
    </Button>
  );

  if (phase !== "running" || !progress) {
    let body;
    if (phase === "resume" && progress) {
      body = (
        <>
          <p className="font-semibold">{t.resume(resumeLabel(progress.step))}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={resume}>{t.resumeCta}</Button>
            <Button variant="secondary" onClick={begin}>
              {t.startOver}
            </Button>
          </div>
        </>
      );
    } else if (phase === "saved" || phase === "outdated") {
      const outdated = phase === "outdated";
      body = (
        <>
          <h2 className="text-xl font-semibold">
            {outdated ? t.outdated.heading : t.saved.heading}
          </h2>
          {outdated && <p>{t.outdated.body}</p>}
          {confirmRetake ? (
            <div className="space-y-3" role="group" aria-label={t.saved.retake}>
              <p className="font-semibold">{t.saved.confirm}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={begin}>{t.saved.confirmYes}</Button>
                <Button variant="secondary" onClick={() => setConfirmRetake(false)}>
                  {t.saved.confirmNo}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push(routes.quizResults)}>
                {outdated ? t.outdated.keep : t.saved.see}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmRetake(true)}>
                {outdated ? t.outdated.retake : t.saved.retake}
              </Button>
            </div>
          )}
        </>
      );
    } else {
      body = (
        <div>
          <Button onClick={begin}>{t.start}</Button>
        </div>
      );
    }
    return (
      <div className="min-h-[24rem] space-y-4">
        {noticeLine}
        {storageLine}
        {body}
        {phase !== "intro" && <div>{clearButton}</div>}
      </div>
    );
  }

  // ---- The runner ----------------------------------------------------------------
  const index = progress.step;
  const step = runnerSteps[index]!;
  const isLast = index === runnerSteps.length - 1;
  const label = progressLabel(step);
  const value =
    step.kind === "pronouns"
      ? progress.pronouns?.[step.id]
      : step.kind === "context" || step.kind === "ending"
        ? progress.context[step.id]
        : progress.answers[step.id];
  const answered = value !== undefined;
  const stem = stemFor(step, progress);
  const barWidth = { width: `${((index + 1) / runnerSteps.length) * 100}%` };

  function choose(next: number | string) {
    if (!progress) return;
    setError(null);
    if (step.kind === "pronouns" || step.kind === "ending") return;
    if (step.kind === "context") {
      persist({ ...progress, context: { ...progress.context, [step.id]: String(next) } });
    } else {
      persist({ ...progress, answers: { ...progress.answers, [step.id]: Number(next) } });
    }
  }

  function goTo(nextIndex: number) {
    if (!progress) return;
    setError(null);
    persist({ ...progress, step: nextIndex });
    focusSoon("quiz-question");
  }

  function advance(e?: FormEvent) {
    e?.preventDefault();
    if (!progress) return;
    if (!answered && !isOptional(step)) {
      setError(t.chooseError);
      return;
    }
    if (!isLast) return goTo(index + 1);

    const saved = completeAttempt(progress, new Date());
    writeStored(storageKeys.quiz, savedQuizSchema, saved);
    clearStored(storageKeys.quizProgress);
    // The visitor's own profile and bands only — never answers, never the perceived pattern.
    track({
      name: "quiz_completed",
      params: {
        profile: saved.result.profileId,
        anxiety_band: saved.result.anxietyBand,
        avoidance_band: saved.result.avoidanceBand,
      },
    });
    router.push(routes.quizResults);
  }

  /**
   * A one-tap screen: the pronoun questions (amendment brief, 2.1) and the "how it ended"
   * block (v3 brief, 2). One tap stores the answer and moves on.
   */
  function chooseTap(choice: string) {
    if (!progress) return;
    setError(null);
    if (step.kind === "pronouns") {
      persist({
        ...progress,
        pronouns: { ...progress.pronouns, [step.id]: choice as PronounId },
        step: index + 1,
      });
    } else if (step.kind === "ending") {
      persist({
        ...progress,
        context: { ...progress.context, [step.id]: choice },
        step: index + 1,
      });
    }
    focusSoon("quiz-question");
  }

  if (step.kind === "pronouns" || step.kind === "ending") {
    const tapOptions =
      step.kind === "pronouns"
        ? PRONOUN_IDS.map((id) => ({ value: id, label: t.pronouns.options[id] }))
        : endingById.get(step.id)!.options.map((o) => ({
            value: o.value,
            label: renderStem({ id: step.id, stem: o.label }, pronounsFor(progress)),
          }));
    return (
      <div className="min-h-[24rem] space-y-5" data-testid="quiz-runner">
        {noticeLine}
        {storageLine}
        {step.kind === "ending" && (
          <div>
            <p data-testid="quiz-progress" className="min-h-6 text-sm font-semibold text-muted">
              {label}
            </p>
            <div className="mt-2 h-2 rounded-full bg-panel" aria-hidden="true">
              <div className="h-2 rounded-full bg-primary" style={barWidth} />
            </div>
          </div>
        )}
        {step.kind === "pronouns" && step.id === "taker" && (
          <p className="font-semibold">{t.pronouns.intro}</p>
        )}
        {step.kind === "ending" && step.number === 1 && (
          <p className="font-semibold" data-testid="ending-intro">
            {t.endingIntro}
          </p>
        )}
        <div
          role="group"
          aria-labelledby="quiz-question"
          data-testid={step.kind === "pronouns" ? "pronoun-question" : "ending-question"}
        >
          <h2 id="quiz-question" tabIndex={-1} className="text-xl font-semibold">
            {stem}
          </h2>
          <div className="mt-4 grid gap-2">
            {tapOptions.map((option) => (
              <Button
                key={option.value}
                variant={value === option.value ? "primary" : "secondary"}
                aria-pressed={value === option.value}
                className={step.kind === "ending" ? "justify-start text-left" : ""}
                onClick={() => chooseTap(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        {index > 0 && (
          <div>
            <Button variant="secondary" onClick={() => goTo(index - 1)}>
              {t.back}
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-x-6 border-t border-panel pt-4">
          <Button variant="quiet" onClick={begin}>
            {t.startOver}
          </Button>
          {clearButton}
        </div>
      </div>
    );
  }

  const options =
    step.kind === "context"
      ? quizConfig.contextQuestions.find((c) => c.id === step.id)!.options
      : scaleLabelsFor(step).map((labelText, v) => ({ value: String(v), label: labelText }));

  return (
    <form
      onSubmit={advance}
      noValidate
      className="min-h-[24rem] space-y-5"
      data-testid="quiz-runner"
    >
      {noticeLine}
      {storageLine}
      <div>
        <p data-testid="quiz-progress" className="min-h-6 text-sm font-semibold text-muted">
          {label}
        </p>
        <div className="mt-2 h-2 rounded-full bg-panel" aria-hidden="true">
          <div className="h-2 rounded-full bg-primary" style={barWidth} />
        </div>
      </div>

      {index === firstQuestionStep && <p className="font-semibold">{t.instruction}</p>}
      {opensPartnerSection(step) && (
        <p className="font-semibold" data-testid="partner-intro">
          {t.herIntro(pronounsFor(progress))}
        </p>
      )}
      {step.kind === "context" && <p className="text-muted">{t.contextNote}</p>}

      <fieldset key={step.id}>
        <legend className="w-full">
          <h2 id="quiz-question" tabIndex={-1} className="text-xl font-semibold">
            {stem}
          </h2>
        </legend>
        <div className="mt-4 grid gap-2">
          {options.map((option) => (
            <RadioCard
              key={option.value}
              name={step.id}
              value={option.value}
              checked={value !== undefined && String(value) === option.value}
              onChange={() => choose(option.value)}
              label={option.label}
            />
          ))}
        </div>
      </fieldset>

      <p aria-live="polite" className="min-h-6 font-semibold">
        {error}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {index > 0 && (
          <Button variant="secondary" onClick={() => goTo(index - 1)}>
            {t.back}
          </Button>
        )}
        <Button type="submit">{isLast ? t.finish : t.next}</Button>
        {isOptional(step) && !answered && (
          <Button variant="quiet" onClick={() => advance()}>
            {t.skip}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 border-t border-panel pt-4">
        <Button variant="quiet" onClick={begin}>
          {t.startOver}
        </Button>
        {clearButton}
      </div>
    </form>
  );
}
