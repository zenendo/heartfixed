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
  endingQuestions,
  herQuestions,
  questions,
  renderStem,
  sinceBreakupSelectors,
  type BankRules,
  type EndingAnswers,
  type EndingOption,
  type EndingQuestion,
} from "./questions";
export { endingAnswersFrom, endingFitFor, isEndingComplete, type FitId } from "./ending";
export {
  completeAttempt,
  emptyProgress,
  firstQuestionStep,
  isAttemptExpired,
  isOptional,
  opensPartnerSection,
  pronounsFor,
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
  profileCopyFor,
  profileCopyRules,
  profiles,
  type NextStep,
  type ProfileCopy,
  type ProfileMeta,
} from "./profiles";
export {
  DEFAULT_PRONOUNS,
  agree,
  cap,
  pronounContext,
  type PronounChoice,
  type PronounContext,
} from "./pronouns";
export { dynamicFor, type DynamicId, type DynamicPick } from "./dynamics";
export {
  decodeShareToken,
  encodeShareToken,
  shareLink,
  type ShareDecodeResult,
  type SharedResult,
} from "./share";
