/**
 * The results route with no saved result and no valid share link (Fixture 7's generic
 * shell). Kept apart from content/quiz-result.ts so this view loads none of Part B.
 */
export const resultEmptyCopy = {
  heading: "Your attachment quiz result",
  body: "There's no quiz result saved in this browser. Take the assessment to get your own. The full result is free.",
  cta: "Take the quiz",
} as const;
