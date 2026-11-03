"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { baseUrl } from "@/config/site";
import { resultCopy } from "@/content/quiz-result-ui";
import { track } from "@/lib/analytics";
import { profiles, shareLink, type QuizResult } from "@/lib/quiz";

const t = resultCopy.share;

type Status = "idle" | "copied" | "failed";

/**
 * Share your result — Section 10.3 item 8. Copies the Section 9.6 link: the visitor's profile
 * and two scores only, never answers and never anything about the partner read. The
 * share text is the profile name and the site name.
 */
export function ShareResult({
  result,
}: {
  result: Pick<QuizResult, "version" | "anxietyNorm" | "avoidanceNorm" | "profileId">;
}) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const url = new URL(shareLink(result), baseUrl).toString();
  const name = profiles[result.profileId].name;

  async function copy() {
    track({ name: "quiz_result_shared", params: { profile: result.profileId } });
    try {
      await navigator.clipboard.writeText(`${t.text(name)} ${url}`);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="space-y-3">
      <p>{t.body}</p>
      <div className="flex flex-wrap gap-3 print:hidden">
        <Button onClick={copy}>{t.button}</Button>
        <Button variant="secondary" onClick={() => window.print()}>
          {resultCopy.print}
        </Button>
      </div>
      <p aria-live="polite" className="min-h-6 font-semibold">
        {status === "copied" && t.copied}
        {status === "failed" && t.copyFailed}
      </p>
      {status === "failed" && (
        <input
          id={`${id}-link`}
          readOnly
          aria-label={t.heading}
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-11 w-full rounded-lg border border-muted bg-surface px-3 py-2"
        />
      )}
    </div>
  );
}
