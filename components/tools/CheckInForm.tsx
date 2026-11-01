"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { RadioCard } from "@/components/ui/RadioCard";
import { trackerCopy } from "@/content/tracker";
import {
  NOTE_MAX_LENGTH,
  addDays,
  calendar,
  currentStreak,
  lastContactDate,
  type CheckIn,
  type IsoDate,
  type TrackerState,
  type UrgeLevel,
} from "@/lib/tools/tracker";

const t = trackerCopy.checkIn;
const MAX_BACKFILL_DAYS = 14;

/** Days in the current streak, before today, with no check-in — most recent first. */
function missedDays(state: TrackerState, today: IsoDate): IsoDate[] {
  const firstDay = addDays(lastContactDate(state), 1);
  return calendar(state, today)
    .filter((d) => d.date >= firstDay && d.date < today && !d.checkedIn)
    .map((d) => d.date)
    .reverse()
    .slice(0, MAX_BACKFILL_DAYS);
}

function dateLabel(date: IsoDate): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * "Still no contact": one tap per day, an optional urge rating, an optional private
 * note. Missed days in the current streak can be back-filled; they never change the
 * streak count.
 */
export function CheckInForm({
  state,
  today,
  onSave,
}: {
  state: TrackerState;
  today: IsoDate;
  onSave: (entry: CheckIn) => string | null;
}) {
  const id = useId();
  const missed = missedDays(state, today);
  const todayEntry = state.checkIns.find((c) => c.date === today);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState<IsoDate>(today);
  const [urge, setUrge] = useState<UrgeLevel | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (currentStreak(state, today) === 0) {
    return <p className="text-muted">{t.dayZero}</p>;
  }

  const showForm = !todayEntry || editing || missed.length > 0;
  const dates = [...(!todayEntry || editing ? [today] : []), ...missed];
  const selected = dates.includes(date) ? date : dates[0];

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const entry: CheckIn = { date: selected, urgeLevel: urge ?? 0 };
    if (note.trim()) entry.note = note;
    const problem = onSave(entry);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStatus(t.saved(selected === today));
    setEditing(false);
    setUrge(null);
    setNote("");
    setDate(today);
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-4">
      <h3 id={`${id}-heading`} className="font-semibold">
        {t.heading}
      </h3>

      {todayEntry && !editing && (
        <p className="flex flex-wrap items-center gap-x-3">
          <span>{t.doneToday}</span>
          <Button
            variant="quiet"
            onClick={() => {
              setEditing(true);
              setDate(today);
              setUrge(todayEntry.urgeLevel);
              setNote(todayEntry.note ?? "");
            }}
          >
            {t.edit}
          </Button>
        </p>
      )}

      {showForm && selected && (
        <form onSubmit={submit} noValidate className="space-y-4">
          {dates.length > 1 && (
            <div>
              <label htmlFor={`${id}-day`} className="block font-semibold">
                {t.dayLabel}
              </label>
              <select
                id={`${id}-day`}
                value={selected}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 min-h-11 w-full max-w-xs rounded-lg border border-muted bg-surface px-3 py-2"
              >
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {d === today ? `${t.today} — ${dateLabel(d)}` : dateLabel(d)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset>
            <legend className="font-semibold">{t.urgeLegend}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {t.urgeLevels.map((levelLabel, level) => (
                <RadioCard
                  key={levelLabel}
                  name={`${id}-urge`}
                  value={level}
                  checked={urge === level}
                  onChange={() => setUrge(level as UrgeLevel)}
                  label={levelLabel}
                />
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${id}-note`} className="block font-semibold">
              {t.noteLabel}
            </label>
            <p id={`${id}-note-privacy`} className="mt-1 text-sm text-muted">
              {t.notePrivacy}
            </p>
            <textarea
              id={`${id}-note`}
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              rows={3}
              onChange={(e) => setNote(e.target.value)}
              aria-describedby={`${id}-note-privacy ${id}-note-count`}
              className="mt-2 w-full rounded-lg border border-muted bg-surface px-3 py-2"
            />
            <p id={`${id}-note-count`} className="text-sm text-muted">
              {t.noteCount(note.length, NOTE_MAX_LENGTH)}
            </p>
          </div>

          <Button type="submit">{t.submit}</Button>
        </form>
      )}

      <p aria-live="polite" className="font-semibold">
        {error ?? status}
      </p>
    </section>
  );
}
