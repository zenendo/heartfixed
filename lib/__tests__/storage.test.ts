import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  clearAllStored,
  clearStored,
  exportStored,
  readStored,
  storageKeys,
  writeStored,
  type StorageLike,
} from "@/lib/storage";
import { createTracker, trackerStateSchema } from "@/lib/tools/tracker";

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem = (k: string) => this.data.get(k) ?? null;
  setItem = (k: string, v: string) => void this.data.set(k, v);
  removeItem = (k: string) => void this.data.delete(k);
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

const tracker = createTracker({ lastContact: "2026-10-30", today: "2026-10-31" });

describe("storage keys (Sections 9.6, 11.1)", () => {
  it("uses the spec's versioned keys", () => {
    expect(storageKeys.quiz).toBe("heartfixed-quiz-v1");
    expect(storageKeys.tracker).toBe("heartfixed-tracker-v1");
    for (const key of Object.values(storageKeys)) expect(key).toMatch(/^heartfixed-[a-z-]+-v\d+$/);
  });
});

describe("read / write", () => {
  it("round-trips a valid value", () => {
    const s = new MemoryStorage();
    expect(writeStored(storageKeys.tracker, trackerStateSchema, tracker, s)).toBe(true);
    expect(readStored(storageKeys.tracker, trackerStateSchema, s)).toEqual({
      status: "ok",
      value: tracker,
    });
  });

  it("reports empty when nothing is saved", () => {
    expect(readStored(storageKeys.tracker, trackerStateSchema, new MemoryStorage())).toEqual({
      status: "empty",
    });
  });

  it.each([
    ["unparseable JSON", "{not json"],
    ["wrong shape", JSON.stringify({ hello: "world" })],
    ["wrong version", JSON.stringify({ ...tracker, version: 2 })],
    [
      "over-long note",
      JSON.stringify({
        ...tracker,
        checkIns: [{ date: "2026-10-31", urgeLevel: 0, note: "x".repeat(501) }],
      }),
    ],
  ])("reports a corrupted value (%s) as corrupt, without throwing", (_label, raw) => {
    const s = new MemoryStorage();
    s.setItem(storageKeys.tracker, raw);
    expect(readStored(storageKeys.tracker, trackerStateSchema, s)).toEqual({ status: "corrupt" });
  });

  it("refuses to write an invalid value", () => {
    const s = new MemoryStorage();
    const bad = { ...tracker, goalDays: 45 } as unknown as typeof tracker;
    expect(writeStored(storageKeys.tracker, trackerStateSchema, bad, s)).toBe(false);
    expect(s.data.size).toBe(0);
  });

  it("degrades to 'unavailable' when storage is missing or throws", () => {
    expect(readStored(storageKeys.tracker, trackerStateSchema, null)).toEqual({
      status: "unavailable",
    });
    expect(readStored(storageKeys.tracker, trackerStateSchema, throwing)).toEqual({
      status: "unavailable",
    });
    expect(writeStored(storageKeys.tracker, trackerStateSchema, tracker, throwing)).toBe(false);
    expect(clearStored(storageKeys.tracker, throwing)).toBe(false);
  });

  it("is safe to call during server rendering (no window)", () => {
    expect(readStored(storageKeys.quiz, z.unknown())).toEqual({ status: "unavailable" });
  });
});

describe("clear my data (Section 8.3: clearing must actually delete)", () => {
  it("deletes one tool's key and leaves the others", () => {
    const s = new MemoryStorage();
    s.setItem(storageKeys.tracker, "{}");
    s.setItem(storageKeys.quiz, "{}");
    expect(clearStored(storageKeys.tracker, s)).toBe(true);
    expect(s.data.has(storageKeys.tracker)).toBe(false);
    expect(s.data.has(storageKeys.quiz)).toBe(true);
  });

  it("clears every tool's key, and nothing else in the browser", () => {
    const s = new MemoryStorage();
    for (const key of Object.values(storageKeys)) s.setItem(key, "{}");
    s.setItem("some-other-site-key", "keep");
    expect(clearAllStored(s)).toBe(true);
    expect([...s.data.keys()]).toEqual(["some-other-site-key"]);
  });
});

describe("export", () => {
  it("exports the visitor's stored data as JSON, including unreadable values", () => {
    const s = new MemoryStorage();
    writeStored(storageKeys.tracker, trackerStateSchema, tracker, s);
    s.setItem(storageKeys.quiz, "{broken");
    expect(JSON.parse(exportStored(undefined, s))).toEqual({
      [storageKeys.quiz]: "{broken",
      [storageKeys.tracker]: tracker,
    });
  });

  it("exports only the requested keys", () => {
    const s = new MemoryStorage();
    s.setItem(storageKeys.quiz, "1");
    s.setItem(storageKeys.tracker, "2");
    expect(JSON.parse(exportStored([storageKeys.tracker], s))).toEqual({
      [storageKeys.tracker]: 2,
    });
  });
});
