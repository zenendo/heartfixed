"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { RadioCard } from "@/components/ui/RadioCard";
import { trackerCopy } from "@/content/tracker";
import {
  DEFAULT_GOAL,
  GOAL_OPTIONS,
  createTracker,
  daysBetween,
  isoDateSchema,
  type GoalDays,
  type IsoDate,
  type TrackerState,
} from "@/lib/tools/tracker";

const t = trackerCopy.setup;

/** One screen, under ten seconds: last contact (default today) and a goal (default 30). */
export function TrackerSetup({
  today,
  onCreate,
}: {
  today: IsoDate;
  onCreate: (state: TrackerState) => void;
}) {
  const [lastContact, setLastContact] = useState<string>(today);
  const [goal, setGoal] = useState<GoalDays>(DEFAULT_GOAL);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!isoDateSchema.safeParse(lastContact).success) return setError(t.missingError);
    if (daysBetween(lastContact, today) < 0) return setError(t.futureError);
    setError(null);
    onCreate(createTracker({ lastContact, today, goalDays: goal }));
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <h2 id="tracker-setup-heading" tabIndex={-1} className="text-xl font-semibold">
        {t.heading}
      </h2>

      <div>
        <label htmlFor={`${id}-date`} className="block font-semibold">
          {t.lastContactLabel}
        </label>
        <p id={`${id}-date-help`} className="mt-1 text-sm text-muted">
          {t.lastContactHelp}
        </p>
        <input
          id={`${id}-date`}
          type="date"
          value={lastContact}
          max={today}
          onChange={(e) => setLastContact(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-date-help ${id}-date-error`}
          className="mt-2 min-h-11 w-full max-w-xs rounded-lg border border-muted bg-surface px-3 py-2"
        />
        <p id={`${id}-date-error`} aria-live="polite" className="mt-2 font-semibold text-ink">
          {error}
        </p>
      </div>

      <fieldset aria-describedby={`${id}-goal-help`}>
        <legend className="font-semibold">{t.goalLegend}</legend>
        <p id={`${id}-goal-help`} className="mt-1 text-sm text-muted">
          {t.goalHelp}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {GOAL_OPTIONS.map((g) => (
            <RadioCard
              key={g}
              name={`${id}-goal`}
              value={g}
              checked={goal === g}
              onChange={() => setGoal(g)}
              label={t.goalOption(g)}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <Button type="submit">{t.submit}</Button>
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </div>
    </form>
  );
}
