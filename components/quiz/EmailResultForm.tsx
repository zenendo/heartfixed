"use client";

import { useId, useState, type FormEvent } from "react";
import { Honeypot } from "@/components/content/EmailSignup";
import { Button } from "@/components/ui/Button";
import { formCopy } from "@/content/emails/forms";
import {
  encodeShareToken,
  type EndingAnswers,
  type PronounChoice,
  type QuizResult,
} from "@/lib/quiz";
import { track } from "@/lib/analytics";
import { postEmail } from "@/lib/email/client";
import { checkEmail } from "@/lib/email/rules";

const f = formCopy.result;

type Status =
  | { kind: "idle" | "sending" }
  | { kind: "done"; email: string; listJoined?: boolean }
  | { kind: "error"; message: string };

/**
 * Email the full result — Sections 10.3 (item 7) and 13.1 (a). Sends the share token
 * (two scores + version, never answers) and, for the partner read and the dynamic
 * (founder decision, 2026-11-02), the same-shaped token of the two perceived scores.
 * Nothing else about the answers leaves the browser. The list checkbox is separate and
 * unchecked by default; ticking it is the only way this form joins the list.
 * The visitor's two pronoun answers go too, as two enum values, so the email renders
 * like the page (amendment brief, 2.5). Placed on the result view in Session 5. Sends email_result_* events, with an error code
 * only; and newsletter_signup { placement: "result" } when the list box joined.
 */
type Scores = Pick<QuizResult, "version" | "anxietyNorm" | "avoidanceNorm">;

export function EmailResultForm({
  result,
  perceived,
  pronouns,
  ending,
  note,
}: {
  result: Scores;
  perceived?: Scores;
  pronouns?: PronounChoice;
  /** The "how it ended" answers; only b1, b2 and b5 are sent (v3 amendment brief, 6). */
  ending?: EndingAnswers;
  /** A line under the form's intro, such as the brief's programme line. */
  note?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [alsoJoinList, setAlsoJoinList] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = checkEmail(email);
    if (problem) return setStatus({ kind: "error", message: problem });
    setStatus({ kind: "sending" });
    track({ name: "email_result_submit", params: {} });
    const res = await postEmail({
      action: "send_result",
      email,
      token: encodeShareToken(result),
      ...(perceived ? { perceived: encodeShareToken(perceived) } : {}),
      ...(pronouns ? { pronouns: { taker: pronouns.taker, partner: pronouns.partner } } : {}),
      ...(ending?.b1 && ending.b2 && ending.b5
        ? { ending: { b1: ending.b1, b2: ending.b2, b5: ending.b5 } }
        : {}),
      alsoJoinList,
      website,
    });
    if (res.ok) {
      track({ name: "email_result_success", params: {} });
      if (res.listJoined) track({ name: "newsletter_signup", params: { placement: "result" } });
    } else {
      track({ name: "email_result_error", params: { error: res.error } });
    }
    setStatus(
      res.ok
        ? { kind: "done", email: email.trim(), listJoined: res.listJoined }
        : { kind: "error", message: formCopy.errors[res.error] },
    );
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="relative" data-testid="email-result">
      <h2 id={`${id}-heading`} className="text-xl font-semibold">
        {f.heading}
      </h2>
      <p id={`${id}-body`} className="mt-2">
        {f.body}
      </p>
      {note && <p className="mt-2 font-semibold">{note}</p>}
      {status.kind === "done" ? (
        <div role="status" className="mt-3 space-y-1">
          <p className="font-semibold text-success">{f.success(status.email)}</p>
          {status.listJoined === true && <p>{f.joinedToo}</p>}
          {status.listJoined === false && <p>{f.joinFailed}</p>}
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-3 space-y-3">
          <div>
            <label htmlFor={`${id}-email`} className="block text-sm font-semibold">
              {formCopy.emailLabel}
            </label>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={status.kind === "error"}
              aria-describedby={`${id}-body ${id}-error`}
              className="mt-1 min-h-11 w-full rounded-lg border border-muted bg-surface px-3 py-2"
            />
          </div>
          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              checked={alsoJoinList}
              onChange={(e) => setAlsoJoinList(e.target.checked)}
              className="mt-1 h-5 w-5"
            />
            <span>{f.alsoJoin}</span>
          </label>
          <Honeypot value={website} onChange={setWebsite} />
          <Button type="submit" disabled={status.kind === "sending"}>
            {status.kind === "sending" ? formCopy.sending : f.submit}
          </Button>
        </form>
      )}
      <div id={`${id}-error`} aria-live="polite" className="mt-2">
        {status.kind === "error" && (
          <>
            <p className="font-semibold">{status.message}</p>
            <p className="mt-1">{f.fallback}</p>
            <Button variant="secondary" className="mt-2" onClick={() => window.print()}>
              {f.print}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
