// Pin a zone with daylight saving so the DST fixtures mean the same thing everywhere.
// US clocks change on 2026-03-08 (spring forward) and 2026-11-01 (fall back).
process.env.TZ = "America/New_York";

import { describe, expect, it } from "vitest";
import {
  TrackerError,
  addDays,
  calendar,
  checkGoalCompletion,
  checkIn,
  createTracker,
  currentStreak,
  daysBetween,
  extendGoal,
  goalProgress,
  longestStreak,
  recordSlip,
  toLocalDate,
  totalDays,
  trackerStateSchema,
  trackerToCsv,
  type TrackerState,
} from "@/lib/tools/tracker";

const tracker = (lastContact: string, today = lastContact, goalDays?: 30 | 60 | 90) =>
  createTracker({ lastContact, today, ...(goalDays ? { goalDays } : {}) });

describe("setup (Section 11.1)", () => {
  it("defaults to a 30-day goal, Day 1 the day after the last contact, nothing else asked", () => {
    const state = tracker("2026-10-31");
    expect(state).toEqual({
      version: 1,
      startDate: "2026-11-01",
      goalDays: 30,
      checkIns: [],
      slips: [],
      longestStreak: 0,
      reminderOptIn: false,
    });
    expect(trackerStateSchema.safeParse(state).success).toBe(true);
  });

  it("is Day 0 on the day of last contact and Day 1 the next day", () => {
    const state = tracker("2026-10-31");
    expect(currentStreak(state, "2026-10-31")).toBe(0);
    expect(currentStreak(state, "2026-11-01")).toBe(1);
  });

  it("rejects a last contact in the future", () => {
    expect(() => tracker("2026-11-02", "2026-11-01")).toThrow(TrackerError);
  });
});

describe("Tracker fixture — streak math across a month boundary", () => {
  it.each([
    ["2026-01-28", "2026-02-03", 6],
    ["2026-10-25", "2026-11-04", 10],
    ["2026-12-30", "2027-01-02", 3],
    ["2028-02-27", "2028-03-01", 3], // leap year: Feb 28, Feb 29, Mar 1
    ["2027-02-27", "2027-03-01", 2], // non-leap year
  ])("last contact %s → %s is %i days", (lastContact, today, days) => {
    expect(currentStreak(tracker(lastContact, today), today)).toBe(days);
  });
});

describe("Tracker fixture — streak math across a daylight-saving change", () => {
  it("spring forward: the 23-hour day still counts as one day", () => {
    const state = tracker("2026-03-07", "2026-03-07");
    // 2026-03-08 has 23 hours. Elapsed-ms math would give 1.96 days at this moment.
    const today = toLocalDate(new Date(2026, 2, 9, 0, 30));
    expect(today).toBe("2026-03-09");
    expect(currentStreak(state, today)).toBe(2);
    expect(daysBetween("2026-03-07", "2026-03-10")).toBe(3);
  });

  it("fall back: the 25-hour day still counts as one day", () => {
    const state = tracker("2026-10-31", "2026-10-31");
    const lateOnChangeDay = new Date(2026, 10, 1, 23, 59);
    expect(toLocalDate(lateOnChangeDay)).toBe("2026-11-01");
    expect(currentStreak(state, toLocalDate(lateOnChangeDay))).toBe(1);
    expect(currentStreak(state, toLocalDate(new Date(2026, 10, 2, 0, 1)))).toBe(2);
  });

  it("uses local time near midnight, not UTC", () => {
    // 23:30 in New York on Oct 31 is already Nov 1 in UTC.
    expect(toLocalDate(new Date(2026, 9, 31, 23, 30))).toBe("2026-10-31");
  });

  it("addDays crosses DST and month ends cleanly", () => {
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("Tracker fixture — a slip preserves longestStreak and total days, restarting today", () => {
  // Last contact Oct 1, so Day 1 is Oct 2 and the tracker reads "Day 18" on Oct 19.
  // He slips on Oct 19. Oct 19 had contact, so the full no-contact days he completed
  // are Oct 2–18: 17 — the spec's "You did 17 days" example.
  const before = tracker("2026-10-01", "2026-10-01");
  const { state, previousStreak, totalDays: total } = recordSlip(before, "2026-10-19");

  it("reports the streak that ended — 'You did 17 days'", () => {
    expect(currentStreak(before, "2026-10-19")).toBe(18);
    expect(previousStreak).toBe(17);
  });

  it("preserves it as longestStreak", () => {
    expect(state.longestStreak).toBe(17);
    expect(longestStreak(state, "2026-10-26")).toBe(17);
  });

  it("restarts the current streak on the restart date", () => {
    expect(state.slips).toEqual([{ date: "2026-10-19", restartedOn: "2026-10-19" }]);
    expect(currentStreak(state, "2026-10-19")).toBe(0);
    expect(currentStreak(state, "2026-10-20")).toBe(1);
  });

  it("keeps the total: earlier days plus the new streak", () => {
    expect(total).toBe(17);
    expect(totalDays(state, "2026-10-24")).toBe(17 + 5);
  });

  it("keeps the history: start date, earlier check-ins", () => {
    const withCheckIn = checkIn(before, { date: "2026-10-05", urgeLevel: 1 }, "2026-10-19");
    const after = recordSlip(withCheckIn, "2026-10-19").state;
    expect(after.startDate).toBe(before.startDate);
    expect(after.checkIns).toEqual(withCheckIn.checkIns);
  });

  it("never lowers longestStreak when a shorter streak ends", () => {
    const second = recordSlip(state, "2026-10-23"); // Oct 20–22: 3 full days
    expect(second.previousStreak).toBe(3);
    expect(second.state.longestStreak).toBe(17);
    expect(second.totalDays).toBe(20);
  });

  it("handles a second slip on the same day without going negative", () => {
    const again = recordSlip(state, "2026-10-19");
    expect(again.previousStreak).toBe(0);
    expect(again.state.longestStreak).toBe(17);
  });

  it("longestStreak follows the current streak once it is longer", () => {
    expect(longestStreak(state, "2026-11-20")).toBe(32);
  });

  it("total always equals the calendar days since Day 1 that had no contact", () => {
    // Invariant behind the numbers above: a contact (slip) day is never counted.
    // State at each date holds only the slips recorded up to that date.
    const slipDays = ["2026-10-19", "2026-10-23", "2026-10-23", "2026-11-02"];
    for (const today of ["2026-10-19", "2026-10-23", "2026-10-30", "2026-11-02", "2026-11-15"]) {
      const s = slipDays
        .filter((d) => d <= today)
        .reduce((acc, d) => recordSlip(acc, d).state, before);
      const contactDays = new Set(s.slips.map((x) => x.date));
      const noContactDays = daysBetween(s.startDate, today) + 1 - contactDays.size;
      expect(totalDays(s, today), today).toBe(noContactDays);
    }
  });
});

describe("Tracker fixture — a missed-day back-fill does not inflate the current streak", () => {
  const base = tracker("2026-10-01", "2026-10-01");
  // Last contact Oct 1, so Day 1 is Oct 2. Checked in Days 1–2 (Oct 2–3), missed Day 3
  // (Oct 4), checked in Day 4 (Oct 5). Today is Oct 5.
  const withGap = [1, 2, 4]
    .map((d) => addDays(base.startDate, d - 1))
    .reduce((s, date) => checkIn(s, { date, urgeLevel: 0 }, "2026-10-05"), base);

  it("the calendar shows the gap honestly", () => {
    const days = calendar(withGap, "2026-10-05").map((d) => [d.date, d.checkedIn]);
    expect(days).toEqual([
      ["2026-10-02", true],
      ["2026-10-03", true],
      ["2026-10-04", false],
      ["2026-10-05", true],
    ]);
  });

  it("back-filling the missed day marks it but leaves the streak unchanged", () => {
    const streak = currentStreak(withGap, "2026-10-05");
    const filled = checkIn(withGap, { date: "2026-10-04", urgeLevel: 2 }, "2026-10-05");
    expect(calendar(filled, "2026-10-05").every((d) => d.checkedIn)).toBe(true);
    expect(currentStreak(filled, "2026-10-05")).toBe(streak);
    expect(totalDays(filled, "2026-10-05")).toBe(totalDays(withGap, "2026-10-05"));
  });

  it("can't back-fill into a previous streak or check in for the future", () => {
    const slipped = recordSlip(withGap, "2026-10-05").state;
    expect(() => checkIn(slipped, { date: "2026-10-04", urgeLevel: 0 }, "2026-10-06")).toThrow(
      TrackerError,
    );
    expect(() => checkIn(withGap, { date: "2026-10-06", urgeLevel: 0 }, "2026-10-05")).toThrow(
      TrackerError,
    );
  });
});

describe("Tracker fixture — goal completion at exactly day 30/60/90 fires once", () => {
  it.each([30, 60, 90] as const)("goal %i", (goal) => {
    const lastContact = "2026-01-01";
    let state = tracker(lastContact, lastContact, goal);
    const fired: number[] = [];
    for (let day = 0; day <= goal + 5; day++) {
      const result = checkGoalCompletion(state, addDays(lastContact, day));
      if (result.completedNow) fired.push(day);
      state = result.state;
    }
    expect(fired).toEqual([goal]);
    expect(state.goalReachedOn).toBe(addDays(lastContact, goal));
  });

  it("fires once on first sight if he didn't open the tracker on goal day", () => {
    const state = tracker("2026-01-01", "2026-01-01");
    const first = checkGoalCompletion(state, "2026-02-05"); // day 35
    expect(first.completedNow).toBe(true);
    expect(checkGoalCompletion(first.state, "2026-02-06").completedNow).toBe(false);
  });

  it("past the goal: 'Day N — past your 30-day goal' with 60 and 90 offered", () => {
    const state = tracker("2026-01-01", "2026-01-01");
    expect(goalProgress(state, "2026-01-31")).toMatchObject({
      day: 30,
      reached: true,
      pastGoal: false,
    });
    expect(goalProgress(state, "2026-02-02")).toEqual({
      day: 32,
      goalDays: 30,
      reached: true,
      pastGoal: true,
      extendOptions: [60, 90],
    });
  });

  it("extending preserves history and lets the new goal complete once", () => {
    let state = checkIn(
      tracker("2026-01-01", "2026-01-01"),
      { date: "2026-01-02", urgeLevel: 3 },
      "2026-01-02",
    );
    state = checkGoalCompletion(state, "2026-01-31").state;
    const extended = extendGoal(state, 60);
    expect(extended.goalDays).toBe(60);
    expect(extended.checkIns).toEqual(state.checkIns);
    expect(extended.startDate).toBe(state.startDate);
    expect(checkGoalCompletion(extended, "2026-02-15").completedNow).toBe(false);
    expect(checkGoalCompletion(extended, "2026-03-02").completedNow).toBe(true);
    expect(() => extendGoal(extended, 30)).toThrow(TrackerError);
  });

  it("a slip resets the completion marker for the new streak", () => {
    const reached = checkGoalCompletion(tracker("2026-01-01", "2026-01-01"), "2026-01-31").state;
    const slipped = recordSlip(reached, "2026-02-03").state;
    expect(slipped.goalReachedOn).toBeUndefined();
    expect(checkGoalCompletion(slipped, "2026-03-05").completedNow).toBe(true);
  });
});

describe("check-ins (Section 11.1)", () => {
  const state = tracker("2026-10-01", "2026-10-01");

  it("one per day: checking in again replaces the day's entry", () => {
    let s = checkIn(state, { date: "2026-10-03", urgeLevel: 1 }, "2026-10-03");
    s = checkIn(s, { date: "2026-10-03", urgeLevel: 3, note: "Rough evening." }, "2026-10-03");
    expect(s.checkIns).toEqual([{ date: "2026-10-03", urgeLevel: 3, note: "Rough evening." }]);
  });

  it("allows a 500-character note and rejects 501", () => {
    const ok = checkIn(
      state,
      { date: "2026-10-02", urgeLevel: 0, note: "x".repeat(500) },
      "2026-10-02",
    );
    expect(trackerStateSchema.safeParse(ok).success).toBe(true);
    expect(() =>
      checkIn(state, { date: "2026-10-02", urgeLevel: 0, note: "x".repeat(501) }, "2026-10-02"),
    ).toThrow(TrackerError);
  });

  it("drops an empty note rather than storing it", () => {
    const s = checkIn(state, { date: "2026-10-02", urgeLevel: 0, note: "   " }, "2026-10-02");
    expect(s.checkIns[0]).toEqual({ date: "2026-10-02", urgeLevel: 0 });
  });

  it("can't check in on the day of last contact (Day 0)", () => {
    expect(() => checkIn(state, { date: "2026-10-01", urgeLevel: 0 }, "2026-10-01")).toThrow(
      TrackerError,
    );
  });
});

describe("schema and export", () => {
  it("rejects corrupted or impossible state", () => {
    const good: TrackerState = tracker("2026-10-01", "2026-10-01");
    expect(trackerStateSchema.safeParse({ ...good, version: 2 }).success).toBe(false);
    expect(trackerStateSchema.safeParse({ ...good, goalDays: 45 }).success).toBe(false);
    expect(trackerStateSchema.safeParse({ ...good, startDate: "2026-02-30" }).success).toBe(false);
    expect(
      trackerStateSchema.safeParse({ ...good, checkIns: [{ date: "2026-10-02", urgeLevel: 4 }] })
        .success,
    ).toBe(false);
  });

  it("exports his own data as CSV, escaping and defusing formulas", () => {
    let s = tracker("2026-10-01", "2026-10-01");
    s = checkIn(
      s,
      { date: "2026-10-02", urgeLevel: 2, note: 'Said "no", then, well' },
      "2026-10-02",
    );
    s = checkIn(s, { date: "2026-10-03", urgeLevel: 0, note: "=HYPERLINK(1)" }, "2026-10-03");
    s = recordSlip(s, "2026-10-04").state;
    expect(trackerToCsv(s)).toBe(
      [
        "type,date,urge_level,note,restarted_on",
        'check-in,2026-10-02,2,"Said ""no"", then, well",',
        "check-in,2026-10-03,0,'=HYPERLINK(1),",
        "slip,2026-10-04,,,2026-10-04",
        "",
      ].join("\r\n"),
    );
  });
});
