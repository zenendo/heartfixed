import Link from "next/link";
import { hubCopy } from "@/content/attachment-styles";
import { profileFor, profiles, type Band } from "@/lib/quiz";

const BANDS: readonly Band[] = ["low", "moderate", "high"];
const h = hubCopy;

/**
 * Which pattern each band combination lands in, computed from the engine's profileFor
 * so it can never disagree with scoring. Fits 320px in wide fonts (fixed layout, 13px
 * text below sm, regular-weight labels, wrap rather than clip).
 */
export function BandTable({ caption, className = "" }: { caption: string; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className="w-full table-fixed border-collapse text-left text-small sm:text-sm [&_td]:break-words [&_th]:break-words"
        data-testid="band-table"
      >
        <caption className="mb-2 text-left text-muted">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="border-b border-muted py-2 pr-2">
              <span className="sr-only">{`${h.dimensions.anxietyLabel} by row, ${h.dimensions.avoidanceLabel} by column`}</span>
            </th>
            {BANDS.map((avoidance) => (
              <th
                key={avoidance}
                scope="col"
                className="border-b border-muted px-1 py-2 font-normal text-muted"
              >
                {avoidance}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BANDS.map((anxiety) => (
            <tr key={anxiety}>
              <th scope="row" className="border-b border-panel py-2 pr-1 font-normal text-muted">
                {anxiety}
              </th>
              {BANDS.map((avoidance) => {
                const id = profileFor(anxiety, avoidance);
                return (
                  <td key={avoidance} className="border-b border-panel px-1 py-2">
                    <Link href={profiles[id].route} className="text-primary underline">
                      {profiles[id].name}
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
