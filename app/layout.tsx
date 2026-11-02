import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/content/JsonLd";
import { AnalyticsListener } from "@/components/layout/AnalyticsListener";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { defaultMetadata } from "@/lib/seo/metadata";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

// No web app manifest: Section 5.2 rules out a PWA install prompt. Icons are file-based
// (app/icon.svg, app/favicon.ico, app/apple-touch-icon/).

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
        <AnalyticsListener />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
