import Link from "next/link";
import { footerNav, routes, site } from "@/config/site";
import { CrisisFooterLine } from "./CrisisFooterLine";

export function Footer() {
  return (
    <footer className="mt-16 bg-panel">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <nav aria-label="Footer">
          <div className="grid gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.heading}>
                <h2 className="text-sm font-semibold text-ink">{group.heading}</h2>
                <ul className="mt-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-sm text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* TODO(session-9): footer email signup (Section 13.3) — list join, action (b) only. */}

        <p className="mt-8 text-sm text-muted">
          Some links on this site may be affiliate links. They never change the tools or your
          results.{" "}
          <Link href={routes.affiliateDisclosure} className="text-primary underline">
            Read the affiliate disclosure
          </Link>
          .
        </p>

        <div className="mt-6">
          <CrisisFooterLine />
        </div>

        <p className="mt-6 text-small text-muted">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
