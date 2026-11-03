import type { AffiliateSlot } from "@/config/affiliates";
import { baseUrl, routes, site } from "@/config/site";
import { affiliateDisclosure, blockC } from "@/content/compliance";
import type { EmailBlock, EmailTemplate } from "@/content/emails/types";
import { renderableSlot } from "@/lib/affiliates";
import { tokens } from "@/tailwind.config";

/**
 * Email rendering: one block model, two outputs (HTML and plain text). Every string is
 * escaped; every link is made absolute with the configured base URL. Inline styles only,
 * because email clients ignore stylesheets.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const c = tokens.colors;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const absoluteUrl = (href: string) => new URL(href, baseUrl).toString();

const P = `margin:0 0 16px;font-size:17px;line-height:27px;color:${c.ink};`;
const H2 = `margin:24px 0 8px;font-size:20px;line-height:28px;color:${c.ink};`;
const A = `color:${c.primary};font-weight:600;`;
const SMALL = `margin:0 0 12px;font-size:14px;line-height:21px;color:${c.muted};`;

export const html = {
  p: (text: string, style = P) => `<p style="${style}">${escapeHtml(text)}</p>`,
  /** A paragraph whose *asterisks* mark emphasis (the brief's result reads). */
  rich: (text: string, lead?: string) =>
    `<p style="${P}">${lead ? `<strong>${escapeHtml(lead)}</strong> ` : ""}${escapeHtml(text).replace(/\*([^*]+)\*/g, "<em>$1</em>")}</p>`,
  h2: (text: string) => `<h2 style="${H2}">${escapeHtml(text)}</h2>`,
  link: (label: string, href: string) =>
    `<p style="${P}"><a href="${escapeHtml(href)}" style="${A}">${escapeHtml(label)}</a></p>`,
  list: (items: readonly string[]) =>
    `<ul style="margin:0 0 16px;padding-left:22px;">${items
      .map((i) => `<li style="${P}margin-bottom:8px;">${escapeHtml(i)}</li>`)
      .join("")}</ul>`,
  small: (text: string) => html.p(text, SMALL),
  panel: (inner: string) =>
    `<div style="margin:0 0 16px;padding:16px;border-left:4px solid ${c.primary};background:${c.panel};">${inner}</div>`,
};

/** A rendered block pair. Slots render only when enabled — with the disclosure first. */
export function renderBlock(
  block: EmailBlock,
  /** Tests only; real emails always read config/affiliates.ts. */
  slots?: readonly AffiliateSlot[],
): { html: string; text: string } {
  if ("p" in block) return { html: html.p(block.p), text: block.p };
  if ("list" in block) {
    return { html: html.list(block.list), text: block.list.map((i) => `- ${i}`).join("\n") };
  }
  if ("link" in block) {
    const href = absoluteUrl(block.link.href);
    return { html: html.link(block.link.label, href), text: `${block.link.label}: ${href}` };
  }
  const slot = renderableSlot(block.slot, slots);
  if (!slot) {
    if (!block.fallback) return { html: "", text: "" };
    const href = absoluteUrl(block.fallback.href);
    return {
      html: html.link(block.fallback.label, href),
      text: `${block.fallback.label}: ${href}`,
    };
  }
  // Section 14.5: the disclosure sits directly above the recommendation, in the email.
  return {
    html: html.panel(
      html.p(affiliateDisclosure.text) +
        html.p(slot.heading, `${P}font-weight:600;`) +
        html.p(slot.body) +
        `<p style="${P}"><a href="${escapeHtml(slot.url)}" rel="sponsored nofollow noopener" style="${A}">${escapeHtml(slot.ctaLabel)}</a></p>`,
    ),
    text: [affiliateDisclosure.text, slot.heading, slot.body, `${slot.ctaLabel}: ${slot.url}`].join(
      "\n",
    ),
  };
}

export function layout(body: string, preheader: string): string {
  return [
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(site.name)}</title></head>`,
    `<body style="margin:0;padding:0;background:${c.surface};">`,
    `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>`,
    `<div style="max-width:600px;margin:0 auto;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">`,
    `<p style="margin:0 0 24px;font-size:20px;font-weight:700;color:${c.primary};">${escapeHtml(site.name)}</p>`,
    body,
    `</div></body></html>`,
  ].join("");
}

/** Block C, the crisis line — in every email, in readable type. */
export function crisisFooter() {
  return {
    html: html.panel(html.p(blockC.text)),
    text: blockC.text,
  };
}

/**
 * Resend's unsubscribe merge tag. Built from parts so the double-brace source guard (Section
 * 19.1) keeps catching leftover template tokens in site code.
 */
export const UNSUBSCRIBE_PLACEHOLDER = `${"{".repeat(3)}RESEND_UNSUBSCRIBE_URL${"}".repeat(3)}`;

export class MissingMailingAddressError extends Error {
  override name = "MissingMailingAddressError";
}

/**
 * List and reminder emails (Section 14.4): one-click unsubscribe and the config mailing
 * address in every one. Without an address it refuses to render, unless `preview` is
 * set, in which case the gap is shown plainly.
 */
export function renderMarketingEmail(
  template: EmailTemplate,
  options: { reason: string; preview?: boolean },
): RenderedEmail {
  const address = site.mailingAddress.trim();
  if (!address && !options.preview) {
    throw new MissingMailingAddressError("config/site.ts mailingAddress is empty");
  }
  const shownAddress = address || "[Mailing address — set mailingAddress in config/site.ts]";
  const blocks = template.blocks.map((b) => renderBlock(b)).filter((b) => b.html);
  const crisis = crisisFooter();
  const unsubscribe = `<a href="${UNSUBSCRIBE_PLACEHOLDER}" style="${A}">Unsubscribe</a>`;

  const body = [
    ...blocks.map((b) => b.html),
    crisis.html,
    `<hr style="border:none;border-top:1px solid ${c.panel};margin:24px 0;">`,
    html.small(options.reason),
    `<p style="${SMALL}">${unsubscribe} · <a href="${escapeHtml(absoluteUrl(routes.privacy))}" style="${A}">Privacy</a></p>`,
    html.small(`${site.name} · ${shownAddress}`),
  ].join("");

  const text = [
    ...blocks.map((b) => b.text),
    crisis.text,
    "—",
    options.reason,
    `Unsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}`,
    `${site.name} · ${shownAddress}`,
  ].join("\n\n");

  return { subject: template.subject, html: layout(body, template.preheader), text };
}

export const marketingReasons = {
  list: `You're getting this because you joined the ${site.name} email list. One click unsubscribes you.`,
  reminders: `You're getting this because you turned on tracker reminders on ${site.name}. One click stops them; it doesn't affect anything else.`,
} as const;
