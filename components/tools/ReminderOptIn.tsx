"use client";

import { useId, useState, type FormEvent } from "react";
import { Honeypot } from "@/components/content/EmailSignup";
import { Button } from "@/components/ui/Button";
import { formCopy, hourLabel } from "@/content/emails/forms";
import { postEmail } from "@/lib/email/client";
import { checkEmail } from "@/lib/email/validate";
import type { GoalDays, IsoDate } from "@/lib/tools/tracker";

const f = formCopy.reminders;
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const DEFAULT_HOUR = 20;

type Status = { kind: "idle" | "sending" } | { kind: "error"; message: string };

/**
 * Tracker reminders — Section 13.1 (c). Its own consent, separate from the list; shown
 * only once a streak exists. Sends the email plus what a reminder needs (day 1, goal,
 * hour, time zone) — never notes, urges or slips. The address is not kept in the
 * browser. TODO(session-13): reminder_optin event with goal_days only.
 */
export function ReminderOptIn({
  startDate,
  goalDays,
  onEnabled,
}: {
  startDate: IsoDate;
  goalDays: GoalDays;
  onEnabled: () => void;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = checkEmail(email);
    if (problem) return setStatus({ kind: "error", message: problem });
    setStatus({ kind: "sending" });
    const res = await postEmail({
      action: "reminders_on",
      email,
      website,
      reminders: {
        startDate,
        goalDays,
        hour,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
    if (res.ok) onEnabled();
    else setStatus({ kind: "error", message: formCopy.errors[res.error] });
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="relative space-y-2"
      data-testid="reminder-optin"
    >
      <h3 id={`${id}-heading`} className="font-semibold">
        {f.heading}
      </h3>
      <p id={`${id}-body`} className="text-sm text-muted">
        {f.body}
      </p>
      <form onSubmit={submit} noValidate className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-52">
          <label htmlFor={`${id}-email`} className="block text-sm font-semibold">
            {formCopy.emailLabel}
          </label>
          <input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={status.kind === "error"}
            aria-describedby={`${id}-body ${id}-error`}
            className="mt-1 min-h-11 w-full rounded-lg border border-muted bg-surface px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor={`${id}-hour`} className="block text-sm font-semibold">
            {f.hourLabel}
          </label>
          <select
            id={`${id}-hour`}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="mt-1 min-h-11 rounded-lg border border-muted bg-surface px-3 py-2"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
        </div>
        <Honeypot value={website} onChange={setWebsite} />
        <Button type="submit" variant="secondary" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? formCopy.sending : f.submit}
        </Button>
      </form>
      <p className="text-sm text-muted">{f.caveat}</p>
      <p id={`${id}-error`} aria-live="polite" className="text-sm font-semibold text-ink">
        {status.kind === "error" ? status.message : ""}
      </p>
    </section>
  );
}
