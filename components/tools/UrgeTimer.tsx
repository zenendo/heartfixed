"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { urgeTimer } from "@/config/content";
import { decisionCopy, urgePrompt } from "@/content/decision";

const t = decisionCopy.timer;
const TOTAL_MS = urgeTimer.minutes * 60_000;

function format(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * The 30-minute urge timer (Section 11.2). A plain numeric countdown — it has no
 * animation, so it works identically with reduced motion. Remaining time is computed
 * from a fixed end time, so a throttled background tab can't make it drift.
 */
export function UrgeTimer({
  trackerDay,
  onComplete,
  onStop,
}: {
  trackerDay: number | null;
  onComplete: () => void;
  onStop: () => void;
}) {
  const endsAt = useRef<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  // Held in a ref so a parent re-render can never restart the countdown.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [remaining, setRemaining] = useState(TOTAL_MS);
  const [promptOffset, setPromptOffset] = useState(0);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    endsAt.current = Date.now() + TOTAL_MS;
    setCanFullscreen(typeof document !== "undefined" && !!document.fullscreenEnabled);
    const tick = () => {
      const left = endsAt.current! - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0 && !done.current) {
        done.current = true;
        if (document.fullscreenElement) void document.exitFullscreen();
        onCompleteRef.current();
      }
    };
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const elapsedSeconds = Math.floor((TOTAL_MS - remaining) / 1000);
  const index =
    (Math.floor(elapsedSeconds / urgeTimer.rotateSeconds) + promptOffset) %
    urgeTimer.prompts.length;
  const prompt = urgePrompt(urgeTimer.prompts[index]!, trackerDay);
  const minutesLeft = Math.ceil(remaining / 60_000);

  return (
    <div
      ref={container}
      className="space-y-6 bg-surface text-center [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:p-8"
    >
      <h2 id="timer-heading" tabIndex={-1} className="text-xl font-semibold">
        {t.heading}
      </h2>
      <p className="text-muted">{t.help}</p>
      <p
        role="timer"
        aria-label={t.label}
        data-testid="timer-display"
        className="text-[4.5rem] font-bold tabular-nums leading-none text-primary"
      >
        {format(remaining)}
      </p>
      {/* Announce every five minutes rather than every second. */}
      <p aria-live="polite" className="sr-only">
        {minutesLeft % 5 === 0 ? `${minutesLeft} minutes left` : ""}
      </p>
      <blockquote data-testid="timer-prompt" className="mx-auto max-w-md text-lg font-semibold">
        {prompt}
      </blockquote>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={() => setPromptOffset((o) => o + 1)}>
          {t.nextPrompt}
        </Button>
        {canFullscreen && (
          <Button variant="secondary" onClick={() => void container.current?.requestFullscreen()}>
            {t.fullscreen}
          </Button>
        )}
        <Button
          variant="quiet"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            onStop();
          }}
        >
          {t.stop}
        </Button>
      </div>
    </div>
  );
}
