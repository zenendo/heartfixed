import { describe, expect, it } from "vitest";
import {
  VAULT_MAX_ENTRIES,
  VAULT_TEXT_MAX,
  VaultError,
  addToVault,
  emptyVault,
  isRecheckDue,
  recheckFrom,
  recheckSchema,
  removeFromVault,
  unsentVaultSchema,
} from "@/lib/tools/unsent";

const NOW = new Date("2026-11-01T18:00:00.000Z");

describe("unsent vault (Section 11.2)", () => {
  it("adds newest first and validates against the schema", () => {
    let v = addToVault(emptyVault(), "first", "a", NOW);
    v = addToVault(v, "second", "b", new Date(NOW.getTime() + 1000));
    expect(v.entries.map((e) => e.text)).toEqual(["second", "first"]);
    expect(unsentVaultSchema.safeParse(v).success).toBe(true);
  });

  it("keeps the text exactly as written", () => {
    const text = "Line one\n\n  line two — “quoted”";
    expect(addToVault(emptyVault(), text, "a", NOW).entries[0]!.text).toBe(text);
  });

  it("rejects empty, over-long, and over-full saves", () => {
    expect(() => addToVault(emptyVault(), "   ", "a", NOW)).toThrow(VaultError);
    expect(() => addToVault(emptyVault(), "x".repeat(VAULT_TEXT_MAX + 1), "a", NOW)).toThrow(
      VaultError,
    );
    let full = emptyVault();
    for (let i = 0; i < VAULT_MAX_ENTRIES; i++) full = addToVault(full, `m${i}`, `id${i}`, NOW);
    expect(() => addToVault(full, "one more", "x", NOW)).toThrow(/full/);
  });

  it("removes one entry by id", () => {
    const v = addToVault(addToVault(emptyVault(), "a", "1", NOW), "b", "2", NOW);
    expect(removeFromVault(v, "1").entries.map((e) => e.id)).toEqual(["2"]);
  });

  it("treats tampered stored data as invalid", () => {
    expect(
      unsentVaultSchema.safeParse({
        version: 1,
        entries: [{ id: "a", savedAt: "yesterday", text: "x" }],
      }).success,
    ).toBe(false);
    expect(unsentVaultSchema.safeParse({ version: 2, entries: [] }).success).toBe(false);
  });
});

describe("re-check reminder (Section 11.2)", () => {
  it("is 24 hours later, stores only a time, and becomes due then", () => {
    const r = recheckFrom(NOW);
    expect(r).toEqual({ version: 1, recheckAt: "2026-11-02T18:00:00.000Z" });
    expect(recheckSchema.safeParse(r).success).toBe(true);
    expect(isRecheckDue(r, new Date("2026-11-02T17:59:59.000Z"))).toBe(false);
    expect(isRecheckDue(r, new Date("2026-11-02T18:00:00.000Z"))).toBe(true);
  });
});
