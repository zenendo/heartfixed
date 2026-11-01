import { JsonLd } from "@/components/content/JsonLd";
import { faqSchema, type FaqItem } from "@/lib/seo/schema";

/** Visible FAQ plus FAQPage schema, from the same data (Section 12.2). */
export function Faq({ heading, items }: { heading: string; items: readonly FaqItem[] }) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-semibold">
        {heading}
      </h2>
      <dl className="mt-4 space-y-5">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-semibold">{item.question}</dt>
            <dd className="mt-1 text-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
      <JsonLd data={faqSchema(items)} />
    </section>
  );
}
