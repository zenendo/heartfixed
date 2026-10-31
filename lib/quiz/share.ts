import { z } from "zod";
import { quizConfig } from "@/config/quiz";
import { routes } from "@/config/site";
import { bandFor, profileFor } from "./scoring";
import type { Band, ProfileId, QuizResult } from "./types";

/**
 * Share tokens — Section 9.6. A token carries the two normalized scores and the
 * question-set version, nothing else: never answers, context responses, or any
 * identifier. Bands and profile are recomputed from the scores on decode, so a token
 * can't claim a profile its scores don't support.
 */

const PARAM = { version: "v", anxiety: "a", avoidance: "v2" } as const;

/** An integer 0–100 written canonically ("7", not "07", "7.0" or "+7"). */
const scoreParam = z
  .string()
  .regex(/^(100|[1-9]?\d)$/)
  .transform(Number);

const tokenSchema = z.object({
  version: z.string().regex(/^[a-z0-9-]{1,32}$/),
  anxiety: scoreParam,
  avoidance: scoreParam,
});

export interface SharedResult {
  version: string;
  anxietyNorm: number;
  avoidanceNorm: number;
  anxietyBand: Band;
  avoidanceBand: Band;
  profileId: ProfileId;
  /** False for tokens from an older question set; their scores may not be comparable. */
  isCurrentVersion: boolean;
}

export type ShareDecodeResult = { ok: true; result: SharedResult } | { ok: false };

type ShareableResult = Pick<QuizResult, "version" | "anxietyNorm" | "avoidanceNorm">;

export function encodeShareToken(result: ShareableResult): string {
  const parsed = tokenSchema.safeParse({
    version: result.version,
    anxiety: String(result.anxietyNorm),
    avoidance: String(result.avoidanceNorm),
  });
  if (!parsed.success) throw new Error("Cannot encode an invalid result as a share token");
  return new URLSearchParams([
    [PARAM.version, result.version],
    [PARAM.anxiety, String(result.anxietyNorm)],
    [PARAM.avoidance, String(result.avoidanceNorm)],
  ]).toString();
}

/** Site-relative share link; the page makes it absolute with the configured base URL. */
export function shareLink(result: ShareableResult): string {
  return `${routes.quizResults}?${encodeShareToken(result)}`;
}

/**
 * Decodes a share token. Any malformed, out-of-range, or repeated parameter fails
 * validation ({ ok: false }) — the page then shows the generic results shell with a
 * "take the assessment" prompt, never an error page. Unknown parameters are ignored.
 */
export function decodeShareToken(input: string | URLSearchParams): ShareDecodeResult {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const single = (key: string) => {
    const all = params.getAll(key);
    return all.length === 1 ? all[0] : undefined;
  };
  const parsed = tokenSchema.safeParse({
    version: single(PARAM.version),
    anxiety: single(PARAM.anxiety),
    avoidance: single(PARAM.avoidance),
  });
  if (!parsed.success) return { ok: false };

  const { version, anxiety, avoidance } = parsed.data;
  const anxietyBand = bandFor(anxiety);
  const avoidanceBand = bandFor(avoidance);
  return {
    ok: true,
    result: {
      version,
      anxietyNorm: anxiety,
      avoidanceNorm: avoidance,
      anxietyBand,
      avoidanceBand,
      profileId: profileFor(anxietyBand, avoidanceBand),
      isCurrentVersion: version === quizConfig.questionSetVersion,
    },
  };
}
