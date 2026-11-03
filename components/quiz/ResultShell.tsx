"use client";

import { useEffect, useState } from "react";
import { SharedResultView } from "@/components/quiz/SharedResultView";
import { lazyPanel } from "@/components/tools/lazyPanel";
import { ButtonLink } from "@/components/ui/Button";
import { quizConfig } from "@/config/quiz";
import { routes } from "@/config/site";
import { resultEmptyCopy as t } from "@/content/quiz-result-empty";
import { decodeShareToken, savedQuizSchema, type SavedQuiz, type SharedResult } from "@/lib/quiz";
import { readStored, storageKeys } from "@/lib/storage";

type View =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "shared"; result: SharedResult }
  | { kind: "own"; saved: SavedQuiz };

/**
 * The full view carries all of Part B, so it loads on its own; the shared view, which
 * public links land on, ships with the page so it paints without a second request.
 */
const ResultView = lazyPanel(() =>
  import("@/components/quiz/ResultView").then((m) => m.ResultView),
);

/** A screen's height held from first paint, so nothing below jumps (Section 16.3 CLS). */
const HOLD = "min-h-screen";

/** Any share-token parameter in the URL makes this a shared-link visit (Section 9.6). */
const SHARE_PARAMS = ["v", "a", "v2"];

/**
 * /attachment-style-quiz/results/ — Sections 9.6 and 10.3.
 *
 * - A share link renders the sharer's profile view under the Section 9.6 banner: scores and
 *   profile only, no partner read, no decodes, no email form. A tampered or malformed
 *   token gets the generic shell (Fixture 7), never an error page.
 * - Otherwise the result saved in this browser renders in full.
 * - With neither, the generic shell with a "take the assessment" prompt.
 */
export function ResultShell() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (SHARE_PARAMS.some((key) => params.has(key))) {
      const decoded = decodeShareToken(params);
      setView(decoded.ok ? { kind: "shared", result: decoded.result } : { kind: "empty" });
      return;
    }
    const saved = readStored(storageKeys.quiz, savedQuizSchema);
    setView(saved.status === "ok" ? { kind: "own", saved: saved.value } : { kind: "empty" });
  }, []);

  if (view.kind === "loading") return <div className={HOLD} aria-busy="true" />;

  if (view.kind === "own") {
    return (
      <div className={HOLD}>
        <ResultView
          saved={view.saved}
          outdated={view.saved.version !== quizConfig.questionSetVersion}
        />
      </div>
    );
  }

  if (view.kind === "shared") return <SharedResultView result={view.result} />;

  return (
    <div className={HOLD} data-testid="result-empty">
      <h1>{t.heading}</h1>
      <p className="mt-3 text-lg">{t.body}</p>
      <ButtonLink href={routes.quiz} className="mt-6">
        {t.cta}
      </ButtonLink>
    </div>
  );
}
