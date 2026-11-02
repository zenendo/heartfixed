/**
 * Legal and trust configuration — Sections 14.4 and 17.1. Business facts the policies
 * state; changing one is a config change. The contact email and mailing address live
 * in config/site.ts.
 */
export const legal = {
  /** Shown as "Last updated" on Privacy, Terms and Affiliate Disclosure. */
  lastUpdated: "2026-11-01",
  /**
   * Email-list inactivity purge (Section 14.4). The founder sets the same value in the
   * email provider. TODO(session-11 founder): confirm, or change both together.
   */
  listInactivityPurgeMonths: 24,
  /** Minimum age the site is written for (Section 14.1, item 8). */
  minimumAge: 18,
} as const;
