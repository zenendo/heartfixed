import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { defaultMetadata } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

// TODO(session-12): WebSite + Organization JSON-LD, favicon set, manifest.
// TODO(session-13): analytics (lib/analytics.ts) — no sensitive content, ever (Section 16.1).

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-3 focus:shadow"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
