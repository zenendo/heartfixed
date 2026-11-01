import { z } from "zod";

/**
 * No-contact tracker logic — Section 11.1. Pure functions over TrackerState; the page
 * (Session 6) supplies `today` and saves the result via lib/storage.ts.
 *
 * Streak model: the streak is the number of full days since the last contact. The
 * day of contact is day 0 and the next day is Day 1, the first full day. Initially
 * the last contact is the day before `startDate` (startDate is Day 1, per the data
 * model); after a slip it is the slip's `restartedOn` (the counter restarts that day).
 * Because the streak is time-based, check-ins confirm days but can never inflate it.
 */

// ---- Local calendar dates ------------------------------------------------------

/** "YYYY-MM-DD" in the visitor's local time zone. */
export type IsoDate = string;

const DAY_MS = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function utcMidnight(date: IsoDate): number {
  const m = ISO_DATE.exec(date);
  if (!m) throw new RangeError(`Not an ISO date: ${date}`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const check = new Date(t);
  if (check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    throw new RangeError(`Not a real date: ${date}`);
  }
  return t;
}

function fromUtc(t: number): IsoDate {
  return new Date(t).toISOString().slice(0, 10);
}

/** The local calendar date of a moment. */
export function toLocalDate(moment: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`;
}

/**
 * Calendar days from a to b. Computed on dates, not on elapsed milliseconds, so a
 * 23- or 25-hour daylight-saving day still counts as exactly one day.
 */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((utcMidnight(b) - utcMidnight(a)) / DAY_MS);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtc(utcMidnight(date) + days * DAY_MS);
}

export const isoDateSchema = z.string().refine((s) => {
  try {
    utcMidnight(s);
    return true;
  } catch {
    return false;
  }
}, "Expected a real YYYY-MM-DD date");

// ---- State -----------------------------------------------------------------------

export const GOAL_OPTIONS = [30, 60, 90] as const;
export type GoalDays = (typeof GOAL_OPTIONS)[number];
export const DEFAULT_GOAL: GoalDays = 30;
export const NOTE_MAX_LENGTH = 500;

/** 0 None · 1 Mild · 2 Strong · 3 I nearly slipped. */
export type UrgeLevel = 0 | 1 | 2 | 3;

/** What happened — asked once in the slip flow, shown on screen, never stored. */
export const SLIP_TYPES = [
  "called",
  "texted",
  "saw",
  "they-reached-out-i-replied",
  "other",
] as const;
export type SlipType = (typeof SLIP_TYPES)[number];

export interface CheckIn {
  date: IsoDate;
  urgeLevel: UrgeLevel;
  note?: string;
}

export interface Slip {
  date: IsoDate;
  restartedOn: IsoDate;
}

export interface TrackerState {
  version: 1;
  /** ISO date of Day 1 (local) — the day after the last contact entered at setup. */
  startDate: IsoDate;
  goalDays: GoalDays;
  checkIns: CheckIn[];
  slips: Slip[];
  longestStreak: number;
  /** Mirrors email provider state; set only via the Section 13 flow. */
  reminderOptIn: boolean;
  /**
   * Set when the current goal is first reached, so the completion state fires once.
   * Cleared by a slip or a goal extension. (An addition to the Section 11.1 model.)
   */
  goalReachedOn?: IsoDate;
}

export const trackerStateSchema = z.object({
  version: z.literal(1),
  startDate: isoDateSchema,
  goalDays: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  checkIns: z.array(
    z.object({
      date: isoDateSchema,
      urgeLevel: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
      note: z.string().max(NOTE_MAX_LENGTH).optional(),
    }),
  ),
  slips: z.array(z.object({ date: isoDateSchema, restartedOn: isoDateSchema })),
  longestStreak: z.number().int().min(0),
  reminderOptIn: z.boolean(),
  goalReachedOn: isoDateSchema.optional(),
}) satisfies z.ZodType<TrackerState>;

export class TrackerError extends Error {
  override name = "TrackerError";
}

// ---- Setup -----------------------------------------------------------------------

/** One-screen setup: last contact (default today) and a goal (default 30). */
export function createTracker(input: {
  lastContact: IsoDate;
  today: IsoDate;
  goalDays?: GoalDays;
}): TrackerState {
  if (daysBetween(input.lastContact, input.today) < 0) {
    throw new TrackerError("The last contact can't be in the future");
  }
  return {
    version: 1,
    startDate: addDays(input.lastContact, 1),
    goalDays: input.goalDays ?? DEFAULT_GOAL,
    checkIns: [],
    slips: [],
    longestStreak: 0,
    reminderOptIn: false,
  };
}

// ---- Streak math -----------------------------------------------------------------

/** The current streak's day 0: the last contact. */
export function lastContactDate(state: TrackerState): IsoDate {
  const latest = state.slips.at(-1);
  return latest ? latest.restartedOn : addDays(state.startDate, -1);
}

/** Full days since the last contact, local time. Shown as "Day N of [goal]". */
export function currentStreak(state: TrackerState, today: IsoDate): number {
  return Math.max(0, daysBetween(lastContactDate(state), today));
}

/** Longest streak ever — the stored best, or the current streak if it is longer. */
export function longestStreak(state: TrackerState, today: IsoDate): number {
  return Math.max(state.longestStreak, currentStreak(state, today));
}

/** Days a streak ending in a slip on `slipDate` completed (the slip day itself breaks). */
function completedBefore(lastContact: IsoDate, slipDate: IsoDate): number {
  return Math.max(0, daysBetween(lastContact, slipDate) - 1);
}

/** Total no-contact days across every streak, including the current one. */
export function totalDays(state: TrackerState, today: IsoDate): number {
  let lastContact = addDays(state.startDate, -1);
  let total = 0;
  for (const slip of state.slips) {
    total += completedBefore(lastContact, slip.date);
    lastContact = slip.restartedOn;
  }
  return total + currentStreak(state, today);
}

// ---- Check-ins -------------------------------------------------------------------

/**
 * Records "Still no contact" for a date in the current streak (today, or a missed day
 * being back-filled). One check-in per date: checking in again replaces it.
 */
export function checkIn(state: TrackerState, entry: CheckIn, today: IsoDate): TrackerState {
  if (daysBetween(entry.date, today) < 0) {
    throw new TrackerError("Can't check in for a future date");
  }
  if (daysBetween(lastContactDate(state), entry.date) < 1) {
    throw new TrackerError("That date is before the current streak's first full day");
  }
  if (entry.note !== undefined && entry.note.length > NOTE_MAX_LENGTH) {
    throw new TrackerError(`Notes are limited to ${NOTE_MAX_LENGTH} characters`);
  }
  const clean: CheckIn = { date: entry.date, urgeLevel: entry.urgeLevel };
  if (entry.note?.trim()) clean.note = entry.note;
  const checkIns = state.checkIns
    .filter((c) => c.date !== entry.date)
    .concat(clean)
    .sort((a, b) => daysBetween(b.date, a.date));
  return { ...state, checkIns };
}

export function hasCheckedIn(state: TrackerState, date: IsoDate): boolean {
  return state.checkIns.some((c) => c.date === date);
}

export interface CalendarDay {
  date: IsoDate;
  checkedIn: boolean;
  urgeLevel?: UrgeLevel;
  slip: boolean;
}

/** Every day from Day 1 to today. Missed days show as gaps — never filled in for him. */
export function calendar(state: TrackerState, today: IsoDate): CalendarDay[] {
  const days: CalendarDay[] = [];
  const span = daysBetween(state.startDate, today);
  for (let i = 0; i <= span; i++) {
    const date = addDays(state.startDate, i);
    const check = state.checkIns.find((c) => c.date === date);
    days.push({
      date,
      checkedIn: !!check,
      ...(check ? { urgeLevel: check.urgeLevel } : {}),
      slip: state.slips.some((s) => s.date === date),
    });
  }
  return days;
}

/** A copy of the state with the goal-completion marker cleared. */
function withoutGoalMarker(state: TrackerState): TrackerState {
  const copy = { ...state };
  delete copy.goalReachedOn;
  return copy;
}

// ---- Slips -----------------------------------------------------------------------

export interface SlipOutcome {
  state: TrackerState;
  /** The streak that just ended — "You did 17 days." */
  previousStreak: number;
  /** All no-contact days so far, shown alongside the new streak. */
  totalDays: number;
}

/**
 * "I broke no contact." Preserves the previous streak in longestStreak and the total,
 * and restarts the counter today. Nothing about the history is erased.
 */
export function recordSlip(state: TrackerState, today: IsoDate): SlipOutcome {
  const lastContact = lastContactDate(state);
  if (daysBetween(lastContact, today) < 0) {
    throw new TrackerError("A slip can't be dated before the current streak started");
  }
  const previousStreak = completedBefore(lastContact, today);
  const next: TrackerState = {
    ...withoutGoalMarker(state),
    longestStreak: Math.max(state.longestStreak, previousStreak),
    slips: [...state.slips, { date: today, restartedOn: today }],
  };
  return { state: next, previousStreak, totalDays: totalDays(next, today) };
}

// ---- Goals -----------------------------------------------------------------------

export interface GoalProgress {
  day: number;
  goalDays: GoalDays;
  reached: boolean;
  /** "Day N — past your 30-day goal". */
  pastGoal: boolean;
  /** Longer goals he can extend to, preserving history. */
  extendOptions: GoalDays[];
}

export function goalProgress(state: TrackerState, today: IsoDate): GoalProgress {
  const day = currentStreak(state, today);
  return {
    day,
    goalDays: state.goalDays,
    reached: day >= state.goalDays,
    pastGoal: day > state.goalDays,
    extendOptions: GOAL_OPTIONS.filter((g) => g > state.goalDays),
  };
}

/**
 * Fires the goal-completion state exactly once per goal: the first time the streak is
 * seen at or past the goal. Returns the updated state to save.
 */
export function checkGoalCompletion(
  state: TrackerState,
  today: IsoDate,
): { state: TrackerState; completedNow: boolean } {
  if (state.goalReachedOn || currentStreak(state, today) < state.goalDays) {
    return { state, completedNow: false };
  }
  return { state: { ...state, goalReachedOn: today }, completedNow: true };
}

/** Extends to a longer goal. History is untouched; the new goal can complete later. */
export function extendGoal(state: TrackerState, goalDays: GoalDays): TrackerState {
  if (goalDays <= state.goalDays) {
    throw new TrackerError("A new goal must be longer than the current one");
  }
  return { ...withoutGoalMarker(state), goalDays };
}

// ---- Export ----------------------------------------------------------------------

/** Neutralises spreadsheet formula injection and quotes CSV fields. */
function csvField(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** The visitor's own tracker data as CSV — one row per check-in and per slip. */
export function trackerToCsv(state: TrackerState): string {
  const rows = [["type", "date", "urge_level", "note", "restarted_on"]];
  for (const c of state.checkIns) {
    rows.push(["check-in", c.date, String(c.urgeLevel), c.note ?? "", ""]);
  }
  for (const s of state.slips) {
    rows.push(["slip", s.date, "", "", s.restartedOn]);
  }
  return rows.map((r) => r.map(csvField).join(",")).join("\r\n") + "\r\n";
}
