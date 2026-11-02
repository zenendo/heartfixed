"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { formCopy as f } from "@/content/emails/forms";
import { postEmail } from "@/lib/email/client";
import { checkEmail, type Placement } from "@/lib/email/validate";

type Status = { kind: "idle" | "sending" | "done" } | { kind: "error"; message: string };

/** Visually and audibly hidden; a person never fills it in, so any value marks a bot. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>{f.honeypotLabel}</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Join the email list — Section 13.1 (b) only. The footer's version (Section 13.3) is
 * the one pre-value form on the site; the tracker shows it once a streak exists.
 * One field, inline success, no redirect. TODO(session-13): newsletter_signup event
 * with `placement` only.
 */
export function EmailSignup({
  placement,
  id: sectionId,
  className = "",
}: {
  placement: Placement;
  id?: string;
  className?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = checkEmail(email);
    if (problem) return setStatus({ kind: "error", message: problem });
    setStatus({ kind: "sending" });
    const res = await postEmail({ action: "join_list", email, placement, website });
    setStatus(res.ok ? { kind: "done" } : { kind: "error", message: f.errors[res.error] });
  }

  return (
    <section
      id={sectionId}
      aria-labelledby={`${id}-heading`}
      className={`relative ${className}`}
      data-testid={`email-signup-${placement}`}
    >
      <h2 id={`${id}-heading`} className="text-base font-semibold text-ink">
        {f.list.heading}
      </h2>
      <p id={`${id}-micro`} className="mt-1 text-sm text-muted">
        {f.list.microcopy}
      </p>
      {status.kind === "done" ? (
        <p role="status" className="mt-3 font-semibold text-success">
          {f.list.success}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-56">
            <label htmlFor={`${id}-email`} className="block text-sm font-semibold">
              {f.emailLabel}
            </label>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={status.kind === "error"}
              aria-describedby={`${id}-micro ${id}-error`}
              className="mt-1 min-h-11 w-full rounded-lg border border-muted bg-surface px-3 py-2"
            />
          </div>
          <Honeypot value={website} onChange={setWebsite} />
          <Button type="submit" disabled={status.kind === "sending"}>
            {status.kind === "sending" ? f.sending : f.list.submit}
          </Button>
        </form>
      )}
      <p id={`${id}-error`} aria-live="polite" className="mt-2 text-sm font-semibold text-ink">
        {status.kind === "error" ? status.message : ""}
      </p>
    </section>
  );
}
