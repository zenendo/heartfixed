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
  scoreQuiz,
  type ScoreOptions,
} from "./scoring";
export { attentionCheck, checkQuestionBank, questions, renderStem } from "./questions";
export {
  checkProfileCopy,
  profileCopyRules,
  profiles,
  type NextStep,
  type ProfileCopy,
  type ProfileMeta,
} from "./profiles";
export {
  decodeShareToken,
  encodeShareToken,
  shareLink,
  type ShareDecodeResult,
  type SharedResult,
} from "./share";
