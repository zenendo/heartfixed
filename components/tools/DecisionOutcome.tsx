"use client";

import { useId, useState } from "react";
import { CrisisBlock } from "@/components/content/ComplianceBlocks";
import { DraftObservations, PRIVATE_TEXTAREA } from "@/components/tools/DraftCheck";
import { Button, ButtonLink } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { decisionCopy } from "@/content/decision";
import type { Decision, DecisionInput } from "@/lib/tools/decision";
import { VAULT_TEXT_MAX } from "@/lib/tools/unsent";

const t = decisionCopy.outcome;

/** "Sunday at 2:00 PM" in the visitor's local time. */
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} at ${time}`;
}

function reasonFor(decision: Decision, input: DecisionInput): string {
  if (decision.ruleId === "default") return t.reasons.default[input.purpose];
  return t.reasons[decision.ruleId as Exclude<keyof typeof t.reasons, "default">];
}

/**
 * Step 5 — one of three outcomes, always with a next action (Section 11.2). Block D
 * renders on every outcome view (Section 14.1).
 */
export function DecisionOutcome({
  decision,
  input,
  draft,
  recheckAt,
  reminderSet,
  hasTracker,
  onStartTimer,
  onSaveUnsent,
  onSetReminder,
}: {
  decision: Decision;
  input: DecisionInput;
  draft: string;
  recheckAt: string;
  reminderSet: boolean;
  hasTracker: boolean;
  onStartTimer: () => void;
  onSaveUnsent: (text: string) => string | null;
  onSetReminder: () => void;
}) {
  const id = useId();
  const [writing, setWriting] = useState(false);
  const [written, setWritten] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const { outcome } = decision;

  function save(text: string) {
    setSaveStatus(onSaveUnsent(text) ?? t.saved);
  }

  const why =
    decision.ruleId === "logistics-not-yet"
      ? [
          !decision.draft ? t.logisticsWhy.noDraft : null,
          input.draftedAndDeleted ? t.logisticsWhy.drafted : null,
          decision.draft && !decision.draft.clean ? t.logisticsWhy.flagged : null,
        ].filter((x): x is string => x !== null)
      : [];

  const trackerLink = (
    <ButtonLink href={routes.tracker} variant="secondary">
      {hasTracker ? t.openTracker : t.startTracker}
    </ButtonLink>
  );

  const unsentActions = draft.trim() ? (
    <Button variant="secondary" onClick={() => save(draft)}>
      {t.saveUnsent}
    </Button>
  ) : (
    !writing && (
      <Button variant="secondary" onClick={() => setWriting(true)}>
        {t.writeItOut}
      </Button>
    )
  );

  return (
    <div className="space-y-6">
      <div data-testid="outcome" data-outcome={outcome} className="space-y-3">
        <h2 id="outcome-heading" tabIndex={-1} className="text-2xl font-bold">
          {t.heading[outcome]}
        </h2>
        <p className="text-lg">{reasonFor(decision, input)}</p>
        {why.length > 0 && (
          <ul className="list-disc space-y-1 pl-6">
            {why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {outcome === "logistics_ok" && (
        <section aria-labelledby={`${id}-guide`} className="rounded-card bg-panel p-4">
          <h3 id={`${id}-guide`} className="font-semibold">
            {t.logisticsGuide.heading}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {t.logisticsGuide.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-3">{t.logisticsGuide.pattern}</p>
          <p className="mt-2 text-sm text-muted">{t.logisticsGuide.note}</p>
        </section>
      )}

      {decision.draft && (
        <section aria-labelledby={`${id}-flags`}>
          <h3 id={`${id}-flags`} className="font-semibold">
            {t.draftFlagsHeading}
          </h3>
          <div className="mt-2">
            <DraftObservations check={decision.draft} />
          </div>
        </section>
      )}

      <p className="text-muted">{t.noPosition}</p>

      {outcome !== "logistics_ok" && (
        <section aria-labelledby={`${id}-next`} className="space-y-3">
          <h3 id={`${id}-next`} className="font-semibold">
            {t.nextHeading}
          </h3>

          {outcome === "wait_24h" && (
            <div className="space-y-2">
              <p className="font-semibold">{t.recheckAt(formatWhen(recheckAt))}</p>
              {reminderSet ? (
                <p role="status">{t.reminderSet(formatWhen(recheckAt))}</p>
              ) : (
                <Button variant="secondary" onClick={onSetReminder}>
                  {t.setReminder}
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={onStartTimer}>{t.startTimer}</Button>
            {unsentActions}
            {trackerLink}
          </div>

          {writing && !draft.trim() && (
            <div className="space-y-2">
              <label htmlFor={`${id}-write`} className="block font-semibold">
                {t.writeLabel}
              </label>
              <textarea
                id={`${id}-write`}
                value={written}
                rows={5}
                maxLength={VAULT_TEXT_MAX}
                onChange={(e) => setWritten(e.target.value)}
                className="w-full rounded-lg border border-muted bg-surface px-3 py-2"
                {...PRIVATE_TEXTAREA}
              />
              <Button variant="secondary" onClick={() => save(written)}>
                {t.saveUnsent}
              </Button>
            </div>
          )}

          <p className="text-sm text-muted">{t.vaultNote}</p>
          <p aria-live="polite" className="font-semibold">
            {saveStatus}
          </p>
        </section>
      )}

      {/* TODO(session-10): affiliate slot "decision-dont-send" (Section 13.4) — "don't
          send" outcome only, ships disabled. */}

      <CrisisBlock />
    </div>
  );
}
