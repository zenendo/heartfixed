/**
 * Permanent (301) redirects — Section 6. Any slug renamed after launch gets an entry
 * here. Host-level redirects (www → apex, http → https, the defensive domain →
 * primary domain) are configured at the host/registrar, not here (Section 17.5).
 */
import type { Redirect } from "../lib/seo/redirects";
import { routes } from "./site";

// Checked by checkRedirects (tests/unit/seo.test.ts): sources must not shadow a live route,
// destinations must be Section 6 routes, and redirects never chain.
export const redirects: Redirect[] = [
  // The guessed short address (founder request, 2026-11-04). With trailingSlash on,
  // Next normalises /quiz to /quiz/ before this runs, so one entry covers both.
  { source: "/quiz/", destination: routes.quiz },
];
