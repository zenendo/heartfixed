"use client";

import { useId } from "react";
import { DraftPrivacyNotice } from "@/components/content/ComplianceBlocks";
import { decisionCopy } from "@/content/decision";
import { checkDraft, type DraftCheck as DraftCheckResult } from "@/lib/tools/decision";

const t = decisionCopy.draft;

/**
 * Attributes that keep the draft on the device: no browser autocomplete history, and
 * no spellcheck (Chrome's enhanced spellcheck can send typed text to a server).
 */
export const PRIVATE_TEXTAREA = {
  spellCheck: false,
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  "data-gramm": "false",
  "data-gramm_editor": "false",
  "data-enable-grammarly": "false",
} as const;

/** Rule-based observations, shown as notes rather than a verdict. */
export function DraftObservations({ check }: { check: DraftCheckResult }) {
  const items = [
    check.tooLong ? t.tooLong : t.length(check.length),
    check.manyQuestions
      ? `${t.questions(check.questionMarks)} — ${t.manyQuestions}`
      : t.questions(check.questionMarks),
    check.pressurePhrases.length > 0 ? t.pressure(check.pressurePhrases) : null,
    check.ultimatums.length > 0 ? t.ultimatums(check.ultimatums) : null,
    check.stackedApologies ? t.apologies(check.apologies) : null,
    check.nightSend ? t.night : null,
  ].filter((x): x is string => x !== null);

  return (
    <div data-testid="draft-observations" className="space-y-2">
      <ul className="list-disc space-y-1 pl-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {check.clean && <p className="font-semibold">{t.clean}</p>}
    </div>
  );
}

/**
 * Step 4 — the optional draft check. Block E sits directly above the textarea. The
 * draft lives only in component state: never stored, logged, or transmitted.
 */
export function DraftCheck({
  draft,
  onChange,
  now,
}: {
  draft: string;
  onChange: (draft: string) => void;
  now: Date;
}) {
  const id = useId();
  const check = draft.trim() ? checkDraft(draft, now) : null;

  return (
    <div className="space-y-3">
      <p className="text-muted">{t.help}</p>
      <label htmlFor={`${id}-draft`} className="block font-semibold">
        {t.label}
      </label>
      <DraftPrivacyNotice id={`${id}-privacy`} />
      <textarea
        id={`${id}-draft`}
        value={draft}
        rows={6}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-privacy`}
        className="w-full rounded-lg border border-muted bg-surface px-3 py-2"
        {...PRIVATE_TEXTAREA}
      />
      <div aria-live="polite">{check && <DraftObservations check={check} />}</div>
    </div>
  );
}
