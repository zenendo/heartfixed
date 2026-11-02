/** Email content blocks — rendered to HTML and plain text by lib/email/render.ts. */
export type EmailBlock =
  | { p: string }
  | { list: readonly string[] }
  /** A site link; `href` is a Section 6 route, made absolute when rendered. */
  | { link: { label: string; href: string } }
  /** An affiliate slot by id. Disabled renders nothing; enabled carries the disclosure. */
  | { slot: string; fallback?: { label: string; href: string } };

export interface EmailTemplate {
  id: string;
  /** Days after joining the list (welcome sequence) — the provider schedules it. */
  sendDay?: number;
  subject: string;
  preheader: string;
  blocks: readonly EmailBlock[];
}
