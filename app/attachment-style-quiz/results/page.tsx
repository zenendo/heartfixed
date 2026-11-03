import { ResultShell } from "@/components/quiz/ResultShell";
import { routes } from "@/config/site";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.quizResults);

/**
 * /attachment-style-quiz/results/ — noindex (Section 9.6). The result is read from
 * this browser's storage, or from a share link's scores, so the page renders on the
 * client (components/quiz/ResultShell.tsx).
 */
export default function QuizResultsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <ResultShell />
    </div>
  );
}
