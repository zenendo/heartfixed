import Link from "next/link";
import { JsonLd } from "@/components/content/JsonLd";
import { breadcrumbSchema, type Crumb } from "@/lib/seo/schema";

/** Breadcrumbs on every non-home page, with matching BreadcrumbList schema (Section 6). */
export function Breadcrumbs({ trail }: { trail: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="print:hidden">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-x-2">
              {last ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <>
                  <Link
                    href={crumb.path}
                    className="inline-flex min-h-11 items-center text-primary"
                  >
                    {crumb.name}
                  </Link>
                  <span aria-hidden="true">›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbSchema(trail)} />
    </nav>
  );
}
