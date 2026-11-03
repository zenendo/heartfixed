/**
 * The quiz engine — Section 9. Every assessment on the site imports from here; no
 * page or component may duplicate scoring logic.
 */
export * from "./types";
export {
  QuizScoringError,
  bandFor,
  effectiveValue,
  leanFor,
  maxRawFor,
  normalize,
  profileFor,
  scorePerceived,
  scoreQuiz,
  selectedDecodes,
  type ScoreOptions,
} from "./scoring";
export {
  attentionCheck,
  checkQuestionBank,
  herQuestions,
  questions,
  renderStem,
  sinceBreakupSelectors,
  type BankRules,
} from "./questions";
export {
  completeAttempt,
  emptyProgress,
  isAttemptExpired,
  isOptional,
  opensPartnerSection,
  scaleLabelsFor,
  isResumable,
  runnerSteps,
  type LikertStep,
  type RunnerStep,
} from "./runner";
export {
  checkProfileCopy,
  leanWatchOuts,
  profileCopy,
  profileCopyRules,
  profiles,
  type NextStep,
  type ProfileCopy,
  type ProfileMeta,
} from "./profiles";
export { dynamicFor, type DynamicId, type DynamicPick } from "./dynamics";
export {
  decodeShareToken,
  encodeShareToken,
  shareLink,
  type ShareDecodeResult,
  type SharedResult,
} from "./share";
