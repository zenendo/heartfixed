import { routes } from "@/config/site";
import { actionLists } from "@/content/emails/actionLists";
import { resultEmailCopy as t } from "@/content/emails/result";
import { endingContentFor } from "@/content/quiz-ending";
import { dynamicLeanLines, plain, resultContentFor, resultCopy } from "@/content/quiz-result";
import {
  DEFAULT_PRONOUNS,
  decodeShareToken,
  dynamicFor,
  endingFitFor,
  leanFor,
  leanWatchOuts,
  profileCopyFor,
  profiles,
  pronounContext,
  shareLink,
  type PronounChoice,
  type EndingAnswers,
  type PronounContext,
  type SharedResult,
} from "@/lib/quiz";
import { absoluteUrl, crisisFooter, escapeHtml, html, layout, type RenderedEmail } from "./render";

/**
 * The quiz result email — Section 13.2. Built on the server from the share token (two
 * scores + version) and, when sent, the same-shaped token for the partner read: bands
 * and profiles come from the engine via decodeShareToken, never from anything the
 * browser claims. Founder decision (2026-11-02): the email carries the partner read and
 * the dynamic; share links never do. Transactional: no unsubscribe link needed,
 * and sending it never subscribes him to anything (Section 13.1).
 *
 * Amendment brief, 2.5: it renders with the same pronoun context as the result view.
 * The two selections arrive with the request as enum values, are used to render, and
 * are never stored.
 *
 * Quiz v3 amendment brief, 6: after the dynamic, a short "how it ended" part with the
 * arrival read and the fit line (if one fired), and nothing else from that segment. The
 * answers it needs come with the request as option ids and aren't stored either.
 */

export class ResultTokenError extends Error {
  override name = "ResultTokenError";
}

/** Decodes and checks a token: well-formed and from the current question set. */
export function resultFromToken(token: string): SharedResult {
  const decoded = decodeShareToken(token);
  if (!decoded.ok || !decoded.result.isCurrentVersion) {
    throw new ResultTokenError("Invalid or outdated result token");
  }
  return decoded.result;
}

const READING: Record<SharedResult["profileId"], (keyof typeof t.reading)[]> = {
  secure: ["attached"],
  anxious: ["anxiouslyAttached", "attached"],
  avoidant: ["attached"],
  "fearful-avoidant": ["attached", "anxiouslyAttached"],
};

/** Her read (caveat first) and the dynamic, as on the result view's Act 1. */
type EmailEnding = Pick<EndingAnswers, "b1" | "b2" | "b5">;

/** The arrival read and the fit line, if the answers came with the request. */
function endingPart(
  result: SharedResult,
  perceived: SharedResult,
  ctx: PronounContext,
  answers?: EmailEnding,
) {
  if (!answers?.b2) return null;
  const content = endingContentFor(ctx);
  const fit = endingFitFor({
    herProfile: perceived.profileId,
    dynamic: dynamicFor(result, perceived).id,
    answers,
  });
  const arrival = content.arrival[answers.b2 as keyof typeof content.arrival];
  return { heading: content.heading, lines: fit ? [arrival, content.fit[fit]] : [arrival] };
}

function partnerSection(
  result: SharedResult,
  perceived: SharedResult,
  ctx: PronounContext,
  ending?: EmailEnding,
) {
  const { caveat, herReads, dynamics } = resultContentFor(ctx);
  const read = herReads[perceived.profileId];
  const pick = dynamicFor(result, perceived);
  const dynamic = dynamics[pick.id];
  const leanLines = dynamicLeanLines(pick, ctx);
  const headline = resultCopy.herHeadline(ctx.p, profiles[perceived.profileId].label);
  const how = endingPart(result, perceived, ctx, ending);
  return {
    html: [
      html.h2(headline),
      html.panel(html.rich(caveat.body, caveat.lead)),
      ...read.paragraphs.map((x) => html.rich(x)),
      html.rich(read.means, resultCopy.meansLead),
      html.rich(read.since, resultCopy.sinceLead),
      html.h2(`${resultCopy.dynamicHeading}: ${dynamic.title}`),
      ...leanLines.map((x) => html.p(x)),
      ...dynamic.paragraphs.map((x) => html.rich(x)),
      ...(how ? [html.h2(how.heading), ...how.lines.map((x) => html.p(x))] : []),
    ],
    text: [
      headline,
      `${caveat.lead} ${plain(caveat.body)}`,
      ...read.paragraphs.map(plain),
      `${resultCopy.meansLead} ${plain(read.means)}`,
      `${resultCopy.sinceLead} ${plain(read.since)}`,
      `${resultCopy.dynamicHeading}: ${dynamic.title}`,
      ...leanLines,
      ...dynamic.paragraphs.map(plain),
      ...(how ? [how.heading, ...how.lines] : []),
    ],
  };
}

export function buildResultEmail(
  result: SharedResult,
  perceived?: SharedResult,
  pronouns: PronounChoice = DEFAULT_PRONOUNS,
  ending?: EmailEnding,
): RenderedEmail {
  const ctx = pronounContext(pronouns);
  const meta = profiles[result.profileId];
  const copySet = profileCopyFor(ctx.p);
  const copy = copySet[result.profileId];
  const lean = leanFor(result);
  const leanText = lean !== "none" ? copy.leans?.[lean] : undefined;
  const leanList = lean !== "none" ? leanWatchOuts(lean, copySet) : [];
  const partner = perceived
    ? partnerSection(result, perceived, ctx, ending)
    : { html: [], text: [] };
  const share = absoluteUrl(shareLink(result));
  const tracker = absoluteUrl(routes.tracker);
  const resources = absoluteUrl(routes.resources);
  const joinUrl = `${absoluteUrl(routes.home)}#email-signup`;
  const scores = [
    t.score(t.anxietyLabel, result.anxietyNorm, result.anxietyBand),
    t.score(t.avoidanceLabel, result.avoidanceNorm, result.avoidanceBand),
  ];
  const plan = actionLists[result.profileId];
  const reading = READING[result.profileId].map((k) => t.reading[k]);
  const crisis = crisisFooter();

  const body = [
    html.small(t.shortDisclaimer),
    html.small(t.requestedNote),
    `<h1 style="margin:0 0 16px;font-size:28px;line-height:36px;">${escapeHtml(copy.headline)}</h1>`,
    html.h2(t.scoresHeading),
    html.list(scores),
    html.h2(t.whatItMeans),
    ...(leanText ? [html.p(leanText), html.list(leanList)] : []),
    html.p(copy.description),
    html.h2(t.watchOutsHeading),
    html.list(copy.watchOuts),
    ...partner.html,
    html.h2(t.planHeading),
    ...plan.flatMap((stage) => [
      html.p(stage.days, "margin:0 0 8px;font-weight:600;"),
      html.list(stage.actions),
    ]),
    html.h2(t.trackerHeading),
    html.p(t.trackerBody),
    html.link(t.trackerLink, tracker),
    html.h2(t.readingHeading),
    html.list(reading),
    html.link(t.resourcesLink, resources),
    html.h2(t.shareHeading),
    html.link(share, share),
    html.small(t.shareNote),
    html.panel(html.p(t.disclaimer)),
    crisis.html,
    `<hr style="border:none;margin:24px 0;">`,
    html.h2(t.join.heading),
    html.small(t.join.body),
    html.link(t.join.link, joinUrl),
  ].join("");

  const text = [
    t.shortDisclaimer,
    t.requestedNote,
    copy.headline,
    `${t.scoresHeading}\n${scores.join("\n")}`,
    t.whatItMeans,
    ...(leanText ? [leanText, leanList.map((w) => `- ${w}`).join("\n")] : []),
    copy.description,
    `${t.watchOutsHeading}\n${copy.watchOuts.map((w) => `- ${w}`).join("\n")}`,
    ...partner.text,
    `${t.planHeading}\n${plan.map((s) => `${s.days}\n${s.actions.map((a) => `- ${a}`).join("\n")}`).join("\n\n")}`,
    `${t.trackerHeading}\n${t.trackerBody}\n${t.trackerLink}: ${tracker}`,
    `${t.readingHeading}\n${reading.map((r) => `- ${r}`).join("\n")}\n${t.resourcesLink}: ${resources}`,
    `${t.shareHeading}\n${share}\n${t.shareNote}`,
    t.disclaimer,
    crisis.text,
    "---",
    `${t.join.heading}\n${t.join.body}\n${t.join.link}: ${joinUrl}`,
  ].join("\n\n");

  return { subject: t.subject(meta.name), html: layout(body, t.preheader), text };
}
