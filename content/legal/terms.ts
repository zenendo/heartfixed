import { legal } from "@/config/legal";
import { routes, site } from "@/config/site";
import { blockB } from "@/content/compliance";
import type { LegalDoc } from "./types";

/**
 * Terms of Use — Section 14.4: educational purpose, no professional relationship
 * (mirroring Block B, quoted verbatim), results are self-reflection not diagnosis,
 * acceptable use, intellectual property, limitation of liability, contact.
 * TODO(session-11 founder): lawyer review; the legal entity name and governing law
 * are deliberately not stated until that review supplies them.
 */
export const termsOfUse: LegalDoc = {
  h1: "Terms of Use",
  intro: [
    `These terms cover your use of ${site.name}. By using the site you agree to them. They're written to be read — if anything is unclear, ask us.`,
  ],
  sections: [
    {
      heading: "What this site is for",
      blocks: [
        {
          p: `${site.name} offers free educational tools and information about attachment patterns and getting through a breakup: a self-reflection assessment, a no-contact tracker, a tool for deciding whether to send a message, and guides.`,
        },
      ],
    },
    {
      heading: "No professional relationship",
      blocks: [
        { callout: blockB.text },
        {
          p: "Nothing on the site is a substitute for help from a qualified professional who knows your situation. If you need that help, please seek it.",
        },
      ],
    },
    {
      heading: "Results are self-reflection, not diagnosis",
      blocks: [
        {
          p: "The attachment assessment is a self-reflection tool informed by attachment research. Its result describes patterns and tendencies in how you've acted in relationships. It is not a diagnosis of any condition, and it shouldn't be used as one — by you or by anyone you share it with.",
        },
        {
          p: "The decision tool applies fixed rules written in advance. It can't know your full situation, and the decision about what to send, and when, is always yours.",
        },
        { links: [{ label: "How the assessment works", href: routes.methodology }] },
      ],
    },
    {
      heading: "Not an emergency service",
      blocks: [
        {
          p: "This site can't respond to emergencies. If you're in crisis or thinking about harming yourself, contact a crisis line or your local emergency number now.",
        },
        { links: [{ label: "Crisis resources", href: routes.crisis }] },
      ],
    },
    {
      heading: "Who can use the site",
      blocks: [
        {
          p: `The site is written for adults (${legal.minimumAge}+). If you're under ${legal.minimumAge}, please don't use it.`,
        },
      ],
    },
    {
      heading: "Acceptable use",
      blocks: [
        { p: "Please don't:" },
        {
          list: [
            "Use the site, or anything from it, to harass, threaten or monitor anyone.",
            "Try to break, overload, or get around the site's security, or scrape it in a way that affects other visitors.",
            "Present a result or share link as something it isn't, such as a clinical assessment of someone.",
            "Copy the site's content to publish elsewhere, except as allowed below.",
          ],
        },
      ],
    },
    {
      heading: "Your data and your content",
      blocks: [
        {
          p: "What you enter into the tools stays in your browser and belongs to you. You're responsible for your own device and for anything you choose to share. How we handle the little data we do receive is set out in the privacy policy.",
        },
        { links: [{ label: "Privacy policy", href: routes.privacy }] },
      ],
    },
    {
      heading: "Intellectual property",
      blocks: [
        {
          p: `The site's text, quiz questions, tools and design belong to ${site.name}. The quiz questions are original to this site. You're welcome to use the site for yourself, share links to it, and quote short passages with a link back. Please don't republish substantial parts of it.`,
        },
      ],
    },
    {
      heading: "Links to other sites",
      blocks: [
        {
          p: "The site links to other websites, including books and programmes, some of which may be affiliate links. We don't control those sites and aren't responsible for their content, products or terms.",
        },
        { links: [{ label: "Affiliate disclosure", href: routes.affiliateDisclosure }] },
      ],
    },
    {
      heading: "No warranties",
      blocks: [
        {
          p: "We work to keep the site accurate and available, but it's provided as it is, without warranties of any kind, to the extent the law allows. Content can be out of date, and the site can be unavailable at times.",
        },
      ],
    },
    {
      heading: "Limitation of liability",
      blocks: [
        {
          p: `To the extent the law allows, ${site.name} isn't liable for any indirect or consequential loss arising from your use of the site, or for decisions you make based on it. The site is free, and nothing in these terms limits any liability that can't be limited by law.`,
        },
      ],
    },
    {
      heading: "Changes to these terms",
      blocks: [
        {
          p: "If these terms change, the date at the top of the page changes with them. Continuing to use the site after a change means you accept the new terms.",
        },
      ],
    },
    {
      heading: "Contact",
      blocks: [{ links: [{ label: "Contact us", href: routes.contact }] }],
    },
  ],
};
