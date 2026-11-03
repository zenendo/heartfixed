"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { resultCopy as t } from "@/content/quiz-result-ui";
import { trackerCopy } from "@/content/tracker";
import { track } from "@/lib/analytics";
import { readStored, storageKeys, writeStored } from "@/lib/storage";
import {
  DEFAULT_GOAL,
  createTracker,
  currentStreak,
  toLocalDate,
  trackerStateSchema,
} from "@/lib/tools/tracker";

type State =
  { kind: "loading" } | { kind: "offer" } | { kind: "running"; day: number; goal: number };

/**
 * The result view's tracker block — Section 10.3 item 5. One click creates a streak
 * starting today with the default goal (Section 11.1). Nothing is written until the
 * button is pressed, so declining leaves no half-made tracker. An existing streak is shown, never
 * replaced.
 */
export function TrackerOffer() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const stored = readStored(storageKeys.tracker, trackerStateSchema);
    const today = toLocalDate(new Date());
    setState(
      stored.status === "ok"
        ? { kind: "running", day: currentStreak(stored.value, today), goal: stored.value.goalDays }
        : { kind: "offer" },
    );
  }, []);

  function start() {
    const today = toLocalDate(new Date());
    const created = createTracker({ lastContact: today, today, goalDays: DEFAULT_GOAL });
    if (!writeStored(storageKeys.tracker, trackerStateSchema, created)) return;
    track({ name: "tracker_created", params: { goal_days: created.goalDays } });
    setState({ kind: "running", day: currentStreak(created, today), goal: created.goalDays });
  }

  return (
    <div
      className="mt-4 min-h-28 rounded-card bg-panel p-4 print:hidden"
      data-testid="tracker-offer"
    >
      <p>{t.trackerOffer}</p>
      <div aria-live="polite" className="mt-3">
        {state.kind === "offer" && <Button onClick={start}>{trackerCopy.setup.submit}</Button>}
        {state.kind === "running" && (
          <div className="space-y-2">
            <p className="font-semibold">
              {state.day === 0
                ? trackerCopy.streak.dayZero
                : trackerCopy.streak.dayOf(state.day, state.goal)}
            </p>
            <ButtonLink href={routes.tracker} variant="secondary">
              {t.trackerOpen}
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
