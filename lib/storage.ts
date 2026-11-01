import type { z } from "zod";

/**
 * Versioned localStorage helpers — Sections 8.3, 9.6, 11.1, 14.4.
 *
 * Everything a visitor creates with the tools lives only in his browser, under the
 * keys below. Every read is validated against a schema, so a corrupted or tampered
 * value comes back as `corrupt` rather than crashing the page, and "Clear my data"
 * really deletes the key. Nothing here ever sends data anywhere.
 */

/**
 * Storage keys. The version suffix changes only when a stored shape changes
 * incompatibly. These strings are fixed by the spec and must never follow a brand
 * change — renaming them would silently wipe every visitor's saved data.
 */
export const storageKeys = {
  /** Saved quiz result + answers (Section 9.6). */
  quiz: "heartfixed-quiz-v1",
  /** In-progress quiz attempt (Section 10.2). Shape defined in Session 4. */
  quizProgress: "heartfixed-quiz-progress-v1",
  /** No-contact tracker state (Section 11.1). */
  tracker: "heartfixed-tracker-v1",
  /** Decision tool's unsent vault (Section 11.2). Shape defined in Session 7. */
  unsentVault: "heartfixed-unsent-v1",
  /** Decision tool's "come back tomorrow" re-check state. Shape defined in Session 7. */
  decisionRecheck: "heartfixed-recheck-v1",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

/** The subset of the Web Storage API these helpers use; injectable for tests. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * The browser's localStorage, or null when it can't be used (server render, private
 * mode, or storage disabled). Accessing `localStorage` itself can throw.
 */
export function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export type ReadResult<T> =
  | { status: "ok"; value: T }
  | { status: "empty" }
  /** Present but unreadable or invalid — the UI offers a plain-English reset. */
  | { status: "corrupt" }
  /** Storage can't be used in this browser — the tool still works for this visit. */
  | { status: "unavailable" };

export function readStored<T>(
  key: StorageKey,
  schema: z.ZodType<T>,
  storage: StorageLike | null = browserStorage(),
): ReadResult<T> {
  if (!storage) return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "empty" };
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? { status: "ok", value: parsed.data } : { status: "corrupt" };
  } catch {
    return { status: "corrupt" };
  }
}

/** Validates, then saves. Returns false if the value is invalid or storage fails (e.g. full). */
export function writeStored<T>(
  key: StorageKey,
  schema: z.ZodType<T>,
  value: T,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage || !schema.safeParse(value).success) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Deletes one key. Returns false only if storage can't be used. */
export function clearStored(
  key: StorageKey,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** "Clear my data on this device" across every tool. */
export function clearAllStored(storage: StorageLike | null = browserStorage()): boolean {
  return Object.values(storageKeys)
    .map((key) => clearStored(key, storage))
    .every(Boolean);
}

/**
 * The visitor's own stored data as a pretty-printed JSON document, for the "Your
 * data" export. Unparseable values are included as raw strings so nothing is hidden.
 */
export function exportStored(
  keys: readonly StorageKey[] = Object.values(storageKeys),
  storage: StorageLike | null = browserStorage(),
): string {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    let raw: string | null = null;
    try {
      raw = storage?.getItem(key) ?? null;
    } catch {
      // Unavailable storage exports as empty.
    }
    if (raw === null) continue;
    try {
      out[key] = JSON.parse(raw);
    } catch {
      out[key] = raw;
    }
  }
  return JSON.stringify(out, null, 2);
}
