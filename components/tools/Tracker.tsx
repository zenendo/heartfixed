"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { TrackerSetup } from "@/components/tools/TrackerSetup";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { routes } from "@/config/site";
import { formCopy } from "@/content/emails/forms";
import { trackerCopy as t } from "@/content/tracker";
import { dayBand, track } from "@/lib/analytics";
import { downloadText } from "@/lib/download";
import { preloadWhenIdle } from "@/lib/preload";
import { clearStored, exportStored, readStored, storageKeys, writeStored } from "@/lib/storage";
import {
  TrackerError,
  addDays,
  calendar,
  checkGoalCompletion,
  checkIn,
  currentStreak,
  extendGoal,
  goalProgress,
  lastContactDate,
  longestStreak,
  recordSlip,
  toLocalDate,
  totalDays,
  trackerStateSchema,
  trackerToCsv,
  type CheckIn,
  type GoalDays,
  type IsoDate,
  type SlipType,
  type TrackerState,
} from "@/lib/tools/tracker";

type Load = "loading" | "ready" | "corrupt";
type View =
  | { name: "streak" }
  | { name: "slip" }
  | { name: "slip-done"; previousStreak: number; total: number; longest: number; type: SlipType }
  | { name: "confirm-clear" };

const CALENDAR_DAYS = 14;

/**
 * A first visit shows only the setup form, so the streak view's panels load on their
 * own (Section 16.3 LCP budget) and are preloaded once the browser is idle.
 */
const panels = {
  checkIn: () => import("@/components/tools/CheckInForm"),
  reminder: () => import("@/components/tools/ReminderOptIn"),
  slip: () => import("@/components/tools/SlipFlow"),
  calendar: () => import("@/components/tools/StreakCalendar"),
  email: () => import("@/components/content/EmailSignup"),
};
const CheckInForm = dynamic(() => panels.checkIn().then((m) => m.CheckInForm));
const ReminderOptIn = dynamic(() => panels.reminder().then((m) => m.ReminderOptIn));
const SlipFlow = dynamic(() => panels.slip().then((m) => m.SlipFlow));
const StreakCalendar = dynamic(() => panels.calendar().then((m) => m.StreakCalendar));
const EmailSignup = dynamic(() => panels.email().then((m) => m.EmailSignup));

/** Moves focus to a view's heading after it renders (Section 8.4). */
function focusSoon(id: string, frames = 120) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    // A lazily loaded panel may still be arriving: try again for up to ~2 seconds.
    if (el) el.focus();
    else if (frames > 0) focusSoon(id, frames - 1);
  });
}

/**
 * The no-contact tracker — Section 11.1. Local-first: state lives only in this
 * browser under heartfixed-tracker-v1. All streak maths comes from lib/tools/tracker.
 */
export function Tracker() {
  const [load, setLoad] = useState<Load>("loading");
  const [canPersist, setCanPersist] = useState(true);
  const [state, setState] = useState<TrackerState | null>(null);
  const [today, setToday] = useState<IsoDate | null>(null);
  const [view, setView] = useState<View>({ name: "streak" });
  const [notice, setNotice] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const refresh = () => setToday(toLocalDate(new Date()));
    refresh();
    const stored = readStored(storageKeys.tracker, trackerStateSchema);
    if (stored.status === "ok") setState(stored.value);
    if (stored.status === "unavailable") setCanPersist(false);
    setLoad(stored.status === "corrupt" ? "corrupt" : "ready");
    const cancelPreload = preloadWhenIdle(Object.values(panels));
    // The day can roll over while the tab stays open.
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      cancelPreload();
    };
  }, []);

  const save = useCallback(
    (next: TrackerState) => {
      setState(next);
      if (canPersist && !writeStored(storageKeys.tracker, trackerStateSchema, next)) {
        setNotice(t.storage.saveFailed);
      }
    },
    [canPersist],
  );

  // Goal completion fires once: checkGoalCompletion records it in the saved state.
  useEffect(() => {
    if (!state || !today) return;
    const result = checkGoalCompletion(state, today);
    if (result.completedNow) {
      save(result.state);
      setCompleted(true);
    }
  }, [state, today, save]);

  function deleteTracker() {
    clearStored(storageKeys.tracker);
    setState(null);
    setCompleted(false);
    setView({ name: "streak" });
    setNotice(t.data.cleared);
    focusSoon("tracker-setup-heading");
  }

  const shell = (children: ReactNode) => (
    <div className="min-h-[30rem]" aria-busy={load === "loading"}>
      <p aria-live="polite" className="sr-only">
        {notice}
      </p>
      {children}
    </div>
  );

  if (load === "loading" || !today) {
    return shell(<p className="text-muted">{t.loading}</p>);
  }

  if (load === "corrupt") {
    return shell(
      <Callout tone="warning" className="space-y-3">
        <h2 className="text-xl font-semibold">{t.storage.corruptHeading}</h2>
        <p>{t.storage.corruptBody}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              downloadText(
                "no-contact-tracker-backup.json",
                "application/json",
                exportStored([storageKeys.tracker]),
              )
            }
          >
            {t.storage.corruptDownload}
          </Button>
          <Button
            onClick={() => {
              clearStored(storageKeys.tracker);
              setLoad("ready");
              focusSoon("tracker-setup-heading");
            }}
          >
            {t.storage.corruptReset}
          </Button>
        </div>
      </Callout>,
    );
  }

  const unavailable = !canPersist && <Callout tone="warning">{t.storage.unavailable}</Callout>;

  if (!state) {
    return shell(
      <div className="space-y-4">
        {unavailable}
        {notice === t.data.cleared && <Callout>{t.data.cleared}</Callout>}
        <TrackerSetup
          today={today}
          onCreate={(created) => {
            save(created);
            setNotice(null);
            track({ name: "tracker_created", params: { goal_days: created.goalDays } });
            focusSoon("streak-heading");
          }}
        />
      </div>,
    );
  }

  if (view.name === "slip") {
    return shell(
      <SlipFlow
        onCancel={() => {
          setView({ name: "streak" });
          focusSoon("streak-heading");
        }}
        onConfirm={(type) => {
          const outcome = recordSlip(state, today);
          save(outcome.state);
          setCompleted(false);
          track({ name: "tracker_slip_recorded", params: { slip_type: type } });
          setView({
            name: "slip-done",
            previousStreak: outcome.previousStreak,
            total: outcome.totalDays,
            longest: outcome.state.longestStreak,
            type,
          });
          focusSoon("slip-done-heading");
        }}
      />,
    );
  }

  if (view.name === "slip-done") {
    return shell(
      <div className="space-y-4">
        <h2 id="slip-done-heading" tabIndex={-1} className="text-xl font-semibold">
          {t.slip.resetHeading}
        </h2>
        <p className="text-lg">{t.slip.did(view.previousStreak)}</p>
        <ul className="space-y-1">
          <li>{t.slip.total(view.total)}</li>
          <li>{t.slip.longest(view.longest)}</li>
        </ul>
        <p>{t.slip.newStreak}</p>
        {view.type === "they-reached-out-i-replied" && (
          <Callout>
            <p>{t.slip.reachedOut}</p>
            <Link href={routes.guideSheTexted} className="font-semibold text-primary underline">
              {t.slip.reachedOutLink}
            </Link>
          </Callout>
        )}
        <Button
          onClick={() => {
            setView({ name: "streak" });
            focusSoon("streak-heading");
          }}
        >
          {t.slip.continue}
        </Button>
      </div>,
    );
  }

  if (view.name === "confirm-clear") {
    return shell(
      <Callout tone="warning" className="space-y-3">
        <h2 id="confirm-clear-heading" tabIndex={-1} className="text-xl font-semibold">
          {t.data.confirmHeading}
        </h2>
        <p>{t.data.confirmBody}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={deleteTracker}>
            {t.data.confirmYes}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setView({ name: "streak" });
              focusSoon("streak-heading");
            }}
          >
            {t.data.confirmNo}
          </Button>
        </div>
      </Callout>,
    );
  }

  // ---- Streak view --------------------------------------------------------------
  const progress = goalProgress(state, today);
  const days = calendar(state, today).slice(-CALENDAR_DAYS);
  const dayLine =
    progress.day === 0
      ? t.streak.dayZero
      : progress.pastGoal
        ? t.streak.pastGoal(progress.day, progress.goalDays)
        : t.streak.dayOf(progress.day, progress.goalDays);
  const longest = longestStreak(state, today);
  const total = totalDays(state, today);

  function saveCheckIn(entry: CheckIn): string | null {
    try {
      save(checkIn(state!, entry, today!));
      track({
        name: "tracker_checkin",
        params: { day_band: dayBand(currentStreak(state!, today!)) },
      });
      return null;
    } catch (e) {
      if (e instanceof TrackerError) return e.message;
      throw e;
    }
  }

  function extend(goal: GoalDays) {
    save(extendGoal(state!, goal));
    setCompleted(false);
  }

  return shell(
    <div className="space-y-8">
      {unavailable}

      {/* Print: the streak summary only (Section 8.3); the page adds the disclaimer. */}
      <div className="hidden print:block">
        <h2 className="text-xl font-semibold">{t.print.heading}</h2>
        <p>{t.print.asOf(today)}</p>
        <p className="mt-2 text-lg font-semibold">{dayLine}</p>
        <p>{t.streak.longest(longest)}</p>
        <p>{t.streak.total(total)}</p>
        <p>{t.print.checkIns(state.checkIns.length)}</p>
      </div>

      <div className="space-y-8 print:hidden">
        <section aria-labelledby="streak-heading" className="space-y-4">
          <h2 id="streak-heading" tabIndex={-1} className="sr-only">
            {t.streak.heading}
          </h2>
          <div>
            <p className="flex items-baseline gap-3">
              <span
                className="text-[4.5rem] font-bold leading-none text-primary"
                aria-hidden="true"
              >
                {progress.day}
              </span>
              <span className="text-muted" aria-hidden="true">
                {t.streak.caption}
              </span>
            </p>
            <p data-testid="day-line" className="mt-2 text-lg font-semibold">
              {dayLine}
            </p>
            {!progress.reached && progress.day > 0 && (
              <p className="text-muted">{t.streak.toGoal(progress.goalDays - progress.day)}</p>
            )}
          </div>

          <div className="space-y-2">
            <ButtonLink href={`${routes.decision}?from=tracker`} className="w-full sm:w-auto">
              {t.urge.label}
            </ButtonLink>
            <p className="text-sm text-muted">{t.urge.help}</p>
          </div>
        </section>

        {completed && (
          <Callout tone="success" role="status">
            <p className="font-semibold">{t.completion.heading(state.goalDays)}</p>
            <p className="mt-1">{t.completion.body}</p>
          </Callout>
        )}

        {progress.reached && progress.extendOptions.length > 0 && (
          <section aria-labelledby="extend-heading" className="space-y-2">
            <h3 id="extend-heading" className="font-semibold">
              {t.extend.heading}
            </h3>
            <div className="flex flex-wrap gap-3">
              {progress.extendOptions.map((g) => (
                <Button key={g} variant="secondary" onClick={() => extend(g)}>
                  {t.extend.option(g)}
                </Button>
              ))}
            </div>
          </section>
        )}

        <StreakCalendar days={days} today={today} />

        <CheckInForm state={state} today={today} onSave={saveCheckIn} />

        <ul className="space-y-1 text-muted">
          <li>{t.streak.longest(longest)}</li>
          <li>{t.streak.total(total)}</li>
        </ul>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Button
            variant="secondary"
            onClick={() => {
              setView({ name: "slip" });
              focusSoon("slip-heading");
            }}
          >
            {t.slip.action}
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              setView({ name: "confirm-clear" });
              focusSoon("confirm-clear-heading");
            }}
          >
            {t.streak.startOver}
          </Button>
        </div>

        {/* Section 13.1: reminders (c) and the list (b) are separate forms, shown only
            once a streak exists. */}
        <div className="space-y-6 rounded-card border border-panel px-4 py-4 print:hidden">
          {state.reminderOptIn ? (
            <p data-testid="reminders-on" className="text-sm">
              {formCopy.reminders.on}
            </p>
          ) : (
            !state.goalReachedOn && (
              <ReminderOptIn
                startDate={addDays(lastContactDate(state), 1)}
                goalDays={state.goalDays}
                onEnabled={() => {
                  save({ ...state, reminderOptIn: true });
                  track({ name: "reminder_optin", params: { goal_days: state.goalDays } });
                }}
              />
            )
          )}
          <EmailSignup placement="tracker" />
        </div>

        <section
          aria-labelledby="data-heading"
          className="space-y-3 rounded-card bg-panel px-4 py-4"
        >
          <h3 id="data-heading" className="font-semibold">
            {t.data.heading}
          </h3>
          <p className="text-sm text-muted">{t.data.body}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                downloadText(
                  `no-contact-tracker-${today}.json`,
                  "application/json",
                  exportStored([storageKeys.tracker]),
                )
              }
            >
              {t.data.exportJson}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                downloadText(`no-contact-tracker-${today}.csv`, "text/csv", trackerToCsv(state))
              }
            >
              {t.data.exportCsv}
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              {t.data.print}
            </Button>
          </div>
          <Button
            variant="quiet"
            onClick={() => {
              setView({ name: "confirm-clear" });
              focusSoon("confirm-clear-heading");
            }}
          >
            {t.data.clear}
          </Button>
        </section>
      </div>
    </div>,
  );
}
