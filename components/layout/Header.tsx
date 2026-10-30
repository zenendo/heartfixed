import Link from "next/link";
import { routes, site, tools } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-panel bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 py-2">
        <Link
          href={routes.home}
          className="inline-flex min-h-11 items-center text-lg font-bold text-primary no-underline"
        >
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-x-4">
            {tools.map((tool) => (
              <li key={tool.key}>
                <Link
                  href={tool.href}
                  className="inline-flex min-h-11 items-center text-sm text-ink hover:text-primary"
                >
                  {tool.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
