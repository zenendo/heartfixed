import { baseUrl } from "@/config/site";

/**
 * JSON-LD builders — Section 12.2. FAQPage is generated from the same content/faqs.ts
 * data that renders the visible FAQ, never schema-only questions.
 *
 * Prohibited anywhere: MedicalCondition, MedicalWebPage, health-claim review schema,
 * a founder Person entity, and any rating/review markup.
 */
export const PROHIBITED_SCHEMA_TYPES = [
  "MedicalCondition",
  "MedicalWebPage",
  "Person",
  "Review",
  "AggregateRating",
] as const;

// TODO(session-12): WebSite + Organization (sitewide) and Article (guides).

export interface Crumb {
  name: string;
  path: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

const absolute = (path: string) => new URL(path, baseUrl).toString();

export function breadcrumbSchema(trail: readonly Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function faqSchema(faqs: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Serialises JSON-LD for a <script> tag, escaping "<" so content can't close it. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
