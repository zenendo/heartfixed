import { z } from "zod";

/**
 * Decision-tool local state — Section 11.2. Both live only in this browser, via
 * lib/storage.ts, and only when the visitor chooses to save them:
 *
 * - The unsent vault: messages he wrote and decided to keep instead of sending.
 * - The re-check reminder: a "come back tomorrow" time for the wait-24-hours outcome.
 *   It stores a time only — never the draft.
 */

export const VAULT_TEXT_MAX = 5000;
export const VAULT_MAX_ENTRIES = 100;
export const RECHECK_HOURS = 24;

export interface VaultEntry {
  id: string;
  /** ISO timestamp. */
  savedAt: string;
  text: string;
}

export interface UnsentVault {
  version: 1;
  entries: VaultEntry[];
}

export const unsentVaultSchema = z.object({
  version: z.literal(1),
  entries: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        savedAt: z.iso.datetime(),
        text: z.string().min(1).max(VAULT_TEXT_MAX),
      }),
    )
    .max(VAULT_MAX_ENTRIES),
}) satisfies z.ZodType<UnsentVault>;

export const emptyVault = (): UnsentVault => ({ version: 1, entries: [] });

export class VaultError extends Error {
  override name = "VaultError";
}

/** Adds a message, newest first. Throws VaultError for empty, too-long, or a full vault. */
export function addToVault(vault: UnsentVault, text: string, id: string, now: Date): UnsentVault {
  if (!text.trim()) throw new VaultError("There's nothing to save yet.");
  if (text.length > VAULT_TEXT_MAX) {
    throw new VaultError(`Messages can be up to ${VAULT_TEXT_MAX} characters.`);
  }
  if (vault.entries.length >= VAULT_MAX_ENTRIES) {
    throw new VaultError(
      `Your unsent list is full (${VAULT_MAX_ENTRIES}). Delete one to save another.`,
    );
  }
  return { ...vault, entries: [{ id, savedAt: now.toISOString(), text }, ...vault.entries] };
}

export function removeFromVault(vault: UnsentVault, id: string): UnsentVault {
  return { ...vault, entries: vault.entries.filter((e) => e.id !== id) };
}

export interface Recheck {
  version: 1;
  /** ISO timestamp when he planned to run the check again. */
  recheckAt: string;
}

export const recheckSchema = z.object({
  version: z.literal(1),
  recheckAt: z.iso.datetime(),
}) satisfies z.ZodType<Recheck>;

export function recheckFrom(now: Date): Recheck {
  return {
    version: 1,
    recheckAt: new Date(now.getTime() + RECHECK_HOURS * 3_600_000).toISOString(),
  };
}

export function isRecheckDue(recheck: Recheck, now: Date): boolean {
  return now.getTime() >= Date.parse(recheck.recheckAt);
}
