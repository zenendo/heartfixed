import { resultCopy as t } from "@/content/quiz-result-ui";
import type { QuizResult } from "@/lib/quiz";

type Scores = Pick<QuizResult, "anxietyNorm" | "avoidanceNorm" | "anxietyBand" | "avoidanceBand">;

/**
 * Section 8.2 dimension bars: anxiety in amber, avoidance in slate blue, each labelled
 * in text with its name, score and band — the bar itself is decoration, never the only
 * carrier of the result.
 */
export function DimensionBars({ result, className = "" }: { result: Scores; className?: string }) {
  const rows = [
    { key: "anxiety", score: result.anxietyNorm, band: result.anxietyBand, fill: "bg-accent" },
    {
      key: "avoidance",
      score: result.avoidanceNorm,
      band: result.avoidanceBand,
      fill: "bg-primary",
    },
  ] as const;
  return (
    <ul className={`space-y-4 ${className}`} data-testid="result-scores">
      {rows.map((row) => {
        const width = { width: `${row.score}%` };
        return (
          <li key={row.key}>
            <p className="text-lg font-semibold">{t.score(row.key, row.score, row.band)}</p>
            <div
              className="mt-2 h-3 rounded-full border border-muted bg-panel print:border-ink"
              aria-hidden="true"
            >
              <div className={`h-full rounded-full ${row.fill} print:bg-ink`} style={width} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
