import { trackerCopy } from "@/content/tracker";
import type { CalendarDay, IsoDate } from "@/lib/tools/tracker";

const t = trackerCopy.calendar;

function label(date: IsoDate): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const dayOfMonth = (date: IsoDate) => Number(date.slice(8));

/**
 * Calendar strip (Section 8.2): checked days are filled cells; each cell is labelled
 * by date and status for screen readers. Missed days stay visible as gaps. No flame
 * icons, no loss animations.
 */
export function StreakCalendar({ days, today }: { days: CalendarDay[]; today: IsoDate }) {
  if (days.length === 0) return null;
  return (
    <section aria-labelledby="calendar-heading">
      <h3 id="calendar-heading" className="font-semibold">
        {t.heading}
      </h3>
      <ol className="mt-2 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const status = day.slip ? t.contact : day.checkedIn ? t.checked : t.missed;
          const style = day.slip
            ? "border-2 border-dashed border-accent bg-warning text-ink"
            : day.checkedIn
              ? "border-2 border-primary bg-primary text-surface"
              : "border-2 border-muted bg-surface text-muted";
          return (
            <li
              key={day.date}
              data-date={day.date}
              data-status={day.slip ? "contact" : day.checkedIn ? "checked" : "missed"}
              className={`flex aspect-square items-center justify-center rounded-md text-sm font-semibold ${style} ${day.date === today ? "outline outline-2 outline-offset-2 outline-ink" : ""}`}
            >
              <span aria-hidden="true">{dayOfMonth(day.date)}</span>
              <span className="sr-only">{`${label(day.date)}: ${status}`}</span>
            </li>
          );
        })}
      </ol>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-hidden="true">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm border-2 border-primary bg-primary" />
          {t.legend.checked}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm border-2 border-muted bg-surface" />
          {t.legend.missed}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm border-2 border-dashed border-accent bg-warning" />
          {t.legend.contact}
        </li>
      </ul>
    </section>
  );
}
