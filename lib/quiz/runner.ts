import { quizConfig } from "@/config/quiz";
import { attentionCheck, herQuestions, questions, sinceBreakupSelectors } from "./questions";
import { scorePerceived, scoreQuiz } from "./scoring";
import type { QuizAnswer, QuizProgress, SavedQuiz } from "./types";

/**
 * The runner's screen order (Section 10.2; quiz build brief, Part A), as data the
 * QuizRunner component walks: his 24 with the attention check unnumbered at position
 * 13 → her 12 → the 6 since-the-breakup selectors → the 2 context questions last.
 */
export type RunnerStep =
  | { kind: "his"; id: string; number: number; total: number }
  | { kind: "attention"; id: string }
  | { kind: "her"; id: string; number: number; total: number }
  | { kind: "selector"; id: string; number: number; total: number }
  | { kind: "context"; id: string; number: number; total: number };

export type LikertStep = Exclude<RunnerStep, { kind: "context" }>;

function buildSteps(): RunnerStep[] {
  const his: RunnerStep[] = questions.map((q, i) => ({
    kind: "his",
    id: q.id,
    number: i + 1,
    total: questions.length,
  }));
  his.splice(attentionCheck.position - 1, 0, { kind: "attention", id: attentionCheck.id });
  return [
    ...his,
    ...herQuestions.map((q, i) => ({
      kind: "her" as const,
      id: q.id,
      number: i + 1,
      total: herQuestions.length,
    })),
    ...sinceBreakupSelectors.map((s, i) => ({
      kind: "selector" as const,
      id: s.id,
      number: i + 1,
      total: sinceBreakupSelectors.length,
    })),
    ...quizConfig.contextQuestions.map((c, i) => ({
      kind: "context" as const,
      id: c.id,
      number: i + 1,
      total: quizConfig.contextQuestions.length,
    })),
  ];
}

export const runnerSteps: readonly RunnerStep[] = buildSteps();

/** Context questions are optional (Section 10.2); every other step needs an answer. */
export const isOptional = (step: RunnerStep) => step.kind === "context";

/** The answer labels for a Likert step: "like me" only where the visitor describes himself. */
export const scaleLabelsFor = (step: LikertStep): readonly string[] =>
  step.kind === "her" || step.kind === "selector"
    ? quizConfig.likert.partnerLabels
    : quizConfig.likert.labels;

/** The first question about the partner, which carries the founder's framing line. */
export const opensPartnerSection = (step: RunnerStep) => step.kind === "her" && step.number === 1;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Section 10.2: an attempt not touched for 7 days is discarded, not resumed. */
export function isAttemptExpired(progress: QuizProgress, now: Date): boolean {
  return now.getTime() - Date.parse(progress.savedAt) > quizConfig.inProgressMaxAgeDays * DAY_MS;
}

/** An attempt from an older question set can't be resumed against this one. */
export function isResumable(progress: QuizProgress, now: Date): boolean {
  return (
    progress.version === quizConfig.questionSetVersion &&
    !isAttemptExpired(progress, now) &&
    progress.step < runnerSteps.length &&
    Object.keys(progress.answers).length > 0
  );
}

export function emptyProgress(now: Date): QuizProgress {
  const at = now.toISOString();
  return {
    version: quizConfig.questionSetVersion,
    step: 0,
    answers: {},
    context: {},
    startedAt: at,
    savedAt: at,
  };
}

/**
 * Scores a finished attempt into what saves under heartfixed-quiz-v1. Throws (via
 * scoreQuiz) if any scored item is unanswered — the runner never lets that happen.
 */
export function completeAttempt(progress: QuizProgress, now: Date): SavedQuiz {
  const answers: QuizAnswer[] = Object.entries(progress.answers).map(([questionId, value]) => ({
    questionId,
    value,
  }));
  const result = scoreQuiz(answers, questions, {
    completedAt: now.toISOString(),
    attentionCheck: { questionId: attentionCheck.id, expectedValue: attentionCheck.expectedValue },
  });
  return {
    version: quizConfig.questionSetVersion,
    result,
    perceived: scorePerceived(answers, herQuestions),
    answers,
    context: { ...progress.context },
  };
}
