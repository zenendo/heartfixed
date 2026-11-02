import { baseUrl, site } from "@/config/site";

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

// TODO(session-12): WebSite + Organization (sitewide).

export interface ArticleInput {
  route: string;
  headline: string;
  description: string;
  /** ISO dates (YYYY-MM-DD) from config/content.ts. */
  datePublished: string;
  dateModified: string;
}

/**
 * Article schema for guides (Section 12.2). Faceless (Section 12.5): author and
 * publisher are the site as an Organization — never a Person.
 */
export function articleSchema(a: ArticleInput) {
  const org = { "@type": "Organization", name: site.name, url: absolute("/") };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.headline,
    description: a.description,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    mainEntityOfPage: absolute(a.route),
    author: org,
    publisher: org,
  };
}

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

/** The schema types this site emits. Anything else is a mistake until added here. */
export const ALLOWED_SCHEMA_TYPES = [
  "BreadcrumbList",
  "ListItem",
  "FAQPage",
  "Question",
  "Answer",
  "Article",
  "Organization",
  // TODO(session-12): "WebSite".
] as const;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const nonEmpty = (v: unknown) => typeof v === "string" && v.trim() !== "";

/**
 * Structural check of one JSON-LD document against the rules Google documents for
 * FAQPage and BreadcrumbList, plus Section 12.2's prohibited types. Returns problems;
 * empty means valid.
 */
export function validateJsonLd(data: unknown): string[] {
  const problems: string[] = [];
  if (!isRecord(data)) return ["JSON-LD root is not an object"];
  if (data["@context"] !== "https://schema.org")
    problems.push("@context must be https://schema.org");

  const visit = (node: unknown, where: string) => {
    if (Array.isArray(node)) return node.forEach((n, i) => visit(n, `${where}[${i}]`));
    if (!isRecord(node)) return;
    const type = node["@type"];
    if (type !== undefined) {
      if ((PROHIBITED_SCHEMA_TYPES as readonly unknown[]).includes(type)) {
        problems.push(`${where}: prohibited type ${String(type)}`);
      } else if (!(ALLOWED_SCHEMA_TYPES as readonly unknown[]).includes(type)) {
        problems.push(`${where}: unexpected type ${String(type)}`);
      }
    }
    for (const [key, value] of Object.entries(node)) visit(value, `${where}.${key}`);
  };
  visit(data, "root");

  if (data["@type"] === "FAQPage") {
    const entities = data.mainEntity;
    if (!Array.isArray(entities) || entities.length === 0) {
      problems.push("FAQPage needs a non-empty mainEntity");
    } else {
      entities.forEach((q, i) => {
        const answer = isRecord(q) ? q.acceptedAnswer : undefined;
        if (!isRecord(q) || q["@type"] !== "Question" || !nonEmpty(q.name)) {
          problems.push(`mainEntity[${i}] must be a Question with a name`);
        }
        if (!isRecord(answer) || answer["@type"] !== "Answer" || !nonEmpty(answer.text)) {
          problems.push(`mainEntity[${i}] needs an acceptedAnswer with text`);
        }
      });
    }
  } else if (data["@type"] === "BreadcrumbList") {
    const items = data.itemListElement;
    if (!Array.isArray(items) || items.length === 0) {
      problems.push("BreadcrumbList needs a non-empty itemListElement");
    } else {
      items.forEach((item, i) => {
        if (!isRecord(item) || item["@type"] !== "ListItem") {
          problems.push(`itemListElement[${i}] must be a ListItem`);
          return;
        }
        if (item.position !== i + 1)
          problems.push(`itemListElement[${i}] position must be ${i + 1}`);
        if (!nonEmpty(item.name)) problems.push(`itemListElement[${i}] needs a name`);
        if (typeof item.item !== "string" || !/^https?:\/\//.test(item.item)) {
          problems.push(`itemListElement[${i}] item must be an absolute URL`);
        }
      });
    }
  } else if (data["@type"] === "Article") {
    if (!nonEmpty(data.headline) || String(data.headline).length > 110) {
      problems.push("Article needs a headline of at most 110 characters");
    }
    for (const key of ["datePublished", "dateModified"] as const) {
      if (typeof data[key] !== "string" || Number.isNaN(Date.parse(data[key] as string))) {
        problems.push(`Article ${key} must be an ISO date`);
      }
    }
    if (Date.parse(String(data.dateModified)) < Date.parse(String(data.datePublished))) {
      problems.push("Article dateModified is before datePublished");
    }
    for (const key of ["author", "publisher"] as const) {
      const org = data[key];
      if (!isRecord(org) || org["@type"] !== "Organization" || !nonEmpty(org.name)) {
        problems.push(`Article ${key} must be an Organization with a name`);
      }
    }
  } else {
    problems.push(`unexpected root type ${String(data["@type"])}`);
  }
  return problems;
}
