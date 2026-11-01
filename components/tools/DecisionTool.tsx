"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DecisionOutcome } from "@/components/tools/DecisionOutcome";
import { DraftCheck } from "@/components/tools/DraftCheck";
import { UnsentVault } from "@/components/tools/UnsentVault";
import { UrgeTimer } from "@/components/tools/UrgeTimer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { RadioCard } from "@/components/ui/RadioCard";
import { routes } from "@/config/site";
import { decisionCopy as t } from "@/content/decision";
import { formatWhen } from "@/components/tools/DecisionOutcome";
import { clearStored, readStored, storageKeys, writeStored } from "@/lib/storage";
import {
  BREAKUP_BANDS,
  CONTACT_BANDS,
  PURPOSES,
  decide,
  type Decision,
  type DecisionInput,
} from "@/lib/tools/decision";
import { currentStreak, toLocalDate, trackerStateSchema } from "@/lib/tools/tracker";
import {
  VaultError,
  addToVault,
  emptyVault,
  isRecheckDue,
  recheckFrom,
  recheckSchema,
  removeFromVault,
  unsentVaultSchema,
  type Recheck,
  type UnsentVault as Vault,
} from "@/lib/tools/unsent";

const TOTAL_STEPS = 5;

interface Answers {
  sinceBreakup: DecisionInput["sinceBreakup"] | null;
  sinceContact: DecisionInput["sinceContact"] | null;
  purpose: DecisionInput["purpose"] | null;
  alcohol: boolean | null;
  intensity: number;
  draftedAndDeleted: boolean | null;
  draft: string;
}

const EMPTY: Answers = {
  sinceBreakup: null,
  sinceContact: null,
  purpose: null,
  alcohol: null,
  intensity: 5,
  draftedAndDeleted: null,
  draft: "",
};

type TimerFrom = "tracker" | "decision" | "direct";
type Mode =
  { name: "flow" } | { name: "timer"; from: TimerFrom } | { name: "timer-done"; from: TimerFrom };

function focusSoon(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

function complete(a: Answers): DecisionInput | null {
  if (!a.sinceBreakup || !a.sinceContact || !a.purpose) return null;
  if (a.alcohol === null || a.draftedAndDeleted === null) return null;
  return {
    sinceBreakup: a.sinceBreakup,
    sinceContact: a.sinceContact,
    purpose: a.purpose,
    alcohol: a.alcohol,
    intensity: a.intensity,
    draftedAndDeleted: a.draftedAndDeleted,
  };
}

function YesNo({
  name,
  legend,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="font-semibold">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <RadioCard
          name={name}
          checked={value === true}
          onChange={() => onChange(true)}
          label={t.state.yes}
        />
        <RadioCard
          name={name}
          checked={value === false}
          onChange={() => onChange(false)}
          label={t.state.no}
        />
      </div>
    </fieldset>
  );
}

/**
 * "Should I text my ex?" — Section 11.2. A five-step, deterministic flow; all logic is
 * lib/tools/decision.ts. The flow and the draft live only in memory (Block E: "not
 * stored after you leave this page"). Only the unsent list and a re-check time are
 * ever saved, and only when the visitor chooses to save them.
 */
export function DecisionTool() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [decidedAt, setDecidedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ name: "flow" });
  const [now, setNow] = useState<Date | null>(null);
  const [fromTracker, setFromTracker] = useState(false);
  const [trackerDay, setTrackerDay] = useState<number | null>(null);
  const [vault, setVault] = useState<Vault>(emptyVault());
  const [recheck, setRecheck] = useState<Recheck | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const current = new Date();
    setNow(current);
    setFromTracker(new URLSearchParams(window.location.search).get("from") === "tracker");
    const tracker = readStored(storageKeys.tracker, trackerStateSchema);
    if (tracker.status === "ok") setTrackerDay(currentStreak(tracker.value, toLocalDate(current)));
    const storedVault = readStored(storageKeys.unsentVault, unsentVaultSchema);
    if (storedVault.status === "ok") setVault(storedVault.value);
    const storedRecheck = readStored(storageKeys.decisionRecheck, recheckSchema);
    if (storedRecheck.status === "ok") setRecheck(storedRecheck.value);
  }, []);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setError(null);
  };

  function goTo(next: number) {
    setStep(next);
    setError(null);
    focusSoon(next === TOTAL_STEPS ? "outcome-heading" : `step-${next}-heading`);
  }

  function advance() {
    const missing =
      (step === 1 && (!answers.sinceBreakup || !answers.sinceContact)) ||
      (step === 2 && !answers.purpose) ||
      (step === 3 && (answers.alcohol === null || answers.draftedAndDeleted === null));
    if (missing) return setError(t.chooseError);
    if (step === 1) {
      // TODO(session-13): decision_started analytics event.
    }
    if (step === 4) {
      const input = complete(answers)!;
      const at = new Date();
      setDecision(decide(input, answers.draft || null, at));
      setDecidedAt(at);
      // TODO(session-13): decision_completed { outcome, draft_check_used } — never draft text.
    }
    goTo(step + 1);
  }

  function startOver() {
    setAnswers(EMPTY);
    setDecision(null);
    setDecidedAt(null);
    setMode({ name: "flow" });
    goTo(1);
  }

  function startTimer(from: TimerFrom) {
    setMode({ name: "timer", from: fromTracker ? "tracker" : from });
    focusSoon("timer-heading");
  }

  function saveUnsent(text: string): string | null {
    try {
      const next = addToVault(vault, text, crypto.randomUUID(), new Date());
      setVault(next);
      return writeStored(storageKeys.unsentVault, unsentVaultSchema, next)
        ? null
        : t.vault.saveFailed;
    } catch (e) {
      if (e instanceof VaultError) return e.message;
      throw e;
    }
  }

  function deleteEntry(id: string) {
    const next = removeFromVault(vault, id);
    setVault(next);
    writeStored(storageKeys.unsentVault, unsentVaultSchema, next);
  }

  function clearAll() {
    clearStored(storageKeys.unsentVault);
    clearStored(storageKeys.decisionRecheck);
    setVault(emptyVault());
    setRecheck(null);
    setNotice(t.vault.cleared);
  }

  function setReminder() {
    if (!decidedAt) return;
    const next = recheckFrom(decidedAt);
    setRecheck(next);
    writeStored(storageKeys.decisionRecheck, recheckSchema, next);
  }

  function dismissRecheck() {
    clearStored(storageKeys.decisionRecheck);
    setRecheck(null);
  }

  if (!now) {
    return <div className="min-h-[30rem]" aria-busy="true" />;
  }

  // ---- Timer --------------------------------------------------------------------
  if (mode.name === "timer") {
    return (
      <div className="min-h-[30rem]">
        <UrgeTimer
          trackerDay={trackerDay}
          onStop={() => {
            setMode({ name: "flow" });
            focusSoon(step === TOTAL_STEPS ? "outcome-heading" : `step-${step}-heading`);
          }}
          onComplete={() => {
            // TODO(session-13): urge_timer_completed { from } analytics event.
            setMode({ name: "timer-done", from: mode.from });
            focusSoon("timer-done-heading");
          }}
        />
      </div>
    );
  }

  if (mode.name === "timer-done") {
    return (
      <div className="min-h-[30rem] space-y-4">
        <h2 id="timer-done-heading" tabIndex={-1} className="text-xl font-semibold">
          {t.timer.doneHeading}
        </h2>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={routes.tracker}>
            {trackerDay !== null ? t.timer.doneTracker : t.timer.doneNoTracker}
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              setMode({ name: "flow" });
              focusSoon(step === TOTAL_STEPS ? "outcome-heading" : `step-${step}-heading`);
            }}
          >
            {t.timer.back}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Flow ---------------------------------------------------------------------
  const input = complete(answers);
  let body: ReactNode;

  if (step === 1) {
    body = (
      <div className="space-y-6">
        <fieldset>
          <legend className="font-semibold">{t.timing.breakupLegend}</legend>
          <div className="mt-2 grid gap-2">
            {BREAKUP_BANDS.map((band) => (
              <RadioCard
                key={band}
                name="since-breakup"
                checked={answers.sinceBreakup === band}
                onChange={() => set("sinceBreakup", band)}
                label={t.timing.breakup[band]}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-semibold">{t.timing.contactLegend}</legend>
          <div className="mt-2 grid gap-2">
            {CONTACT_BANDS.map((band) => (
              <RadioCard
                key={band}
                name="since-contact"
                checked={answers.sinceContact === band}
                onChange={() => set("sinceContact", band)}
                label={t.timing.contact[band]}
              />
            ))}
          </div>
        </fieldset>
      </div>
    );
  } else if (step === 2) {
    body = (
      <fieldset>
        <legend className="sr-only">{t.purpose.heading}</legend>
        <p className="text-muted">{t.purpose.help}</p>
        <div className="mt-3 grid gap-2">
          {PURPOSES.map((purpose) => (
            <RadioCard
              key={purpose}
              name="purpose"
              checked={answers.purpose === purpose}
              onChange={() => set("purpose", purpose)}
              label={t.purpose.options[purpose].label}
              description={t.purpose.options[purpose].description}
            />
          ))}
        </div>
      </fieldset>
    );
  } else if (step === 3) {
    body = (
      <div className="space-y-6">
        <YesNo
          name="alcohol"
          legend={t.state.alcoholLegend}
          value={answers.alcohol}
          onChange={(v) => set("alcohol", v)}
        />
        <div>
          <label htmlFor="intensity" className="block font-semibold">
            {t.state.intensityLabel}
          </label>
          <p id="intensity-help" className="mt-1 text-sm text-muted">
            {t.state.intensityHelp}
          </p>
          <input
            id="intensity"
            type="range"
            min={0}
            max={10}
            step={1}
            value={answers.intensity}
            onChange={(e) => set("intensity", Number(e.target.value))}
            aria-describedby="intensity-help"
            aria-valuetext={t.state.intensityValue(answers.intensity)}
            className="mt-2 h-11 w-full accent-primary"
          />
          <p data-testid="intensity-value" className="font-semibold">
            {t.state.intensityValue(answers.intensity)}
          </p>
        </div>
        <YesNo
          name="drafted"
          legend={t.state.draftedLegend}
          value={answers.draftedAndDeleted}
          onChange={(v) => set("draftedAndDeleted", v)}
        />
      </div>
    );
  } else if (step === 4) {
    body = <DraftCheck draft={answers.draft} onChange={(d) => set("draft", d)} now={now} />;
  } else if (decision && input && decidedAt) {
    body = (
      <DecisionOutcome
        decision={decision}
        input={input}
        draft={answers.draft}
        recheckAt={recheckFrom(decidedAt).recheckAt}
        reminderSet={recheck !== null && Date.parse(recheck.recheckAt) > decidedAt.getTime()}
        hasTracker={trackerDay !== null}
        onStartTimer={() => startTimer("decision")}
        onSaveUnsent={saveUnsent}
        onSetReminder={setReminder}
      />
    );
  }

  const progressWidth = { width: `${(step / TOTAL_STEPS) * 100}%` };
  const headings: Record<number, string> = {
    1: t.timing.heading,
    2: t.purpose.heading,
    3: t.state.heading,
    4: t.draft.heading,
  };

  return (
    <div className="min-h-[30rem] space-y-6">
      <p aria-live="polite" className="sr-only">
        {notice}
      </p>

      {recheck && step === 1 && (
        <Callout className="space-y-2">
          <p>
            {isRecheckDue(recheck, now)
              ? t.recheckBanner.due
              : t.recheckBanner.pending(formatWhen(recheck.recheckAt))}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={dismissRecheck}>
              {t.recheckBanner.dismiss}
            </Button>
          </div>
        </Callout>
      )}

      {fromTracker && trackerDay !== null && trackerDay > 0 && step === 1 && (
        <p className="font-semibold">{t.fromTracker(trackerDay)}</p>
      )}

      <div>
        <p data-testid="progress" className="text-sm font-semibold text-muted">
          {t.progress(step, TOTAL_STEPS)}
        </p>
        <div className="mt-2 h-2 rounded-full bg-panel" aria-hidden="true">
          <div className="h-2 rounded-full bg-primary" style={progressWidth} />
        </div>
      </div>

      {step < TOTAL_STEPS && (
        <h2 id={`step-${step}-heading`} tabIndex={-1} className="text-xl font-semibold">
          {headings[step]}
        </h2>
      )}

      {body}

      {step < TOTAL_STEPS && (
        <p aria-live="polite" className="font-semibold">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {step > 1 && (
          <Button variant="secondary" onClick={() => goTo(step - 1)}>
            {t.back}
          </Button>
        )}
        {step < TOTAL_STEPS && <Button onClick={advance}>{t.next}</Button>}
        {step === 4 && !answers.draft.trim() && (
          <Button variant="quiet" onClick={advance}>
            {t.draft.skip}
          </Button>
        )}
        {step > 1 && (
          <Button variant="quiet" onClick={startOver}>
            {t.startOver}
          </Button>
        )}
      </div>

      {step === 1 && (
        <div className="border-t border-panel pt-4">
          <p className="text-muted">{t.directTimer.lead}</p>
          <Button variant="secondary" className="mt-2" onClick={() => startTimer("direct")}>
            {t.directTimer.cta}
          </Button>
        </div>
      )}

      <UnsentVault vault={vault} onDelete={deleteEntry} onClearAll={clearAll} />
    </div>
  );
}
