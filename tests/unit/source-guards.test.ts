import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Static guards over the site source. These enforce Section 1 rules that are easy to
 * break silently: brand/domain only in config/site.ts, no `{{` placeholders, no
 * gendered literals in components, no Section 14.2 prohibited terms.
 */
const ROOT = path.resolve(__dirname, "../..");
const SOURCE_DIRS = ["app", "components", "lib", "config", "content"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : walk(full);
    return /\.(ts|tsx|css|md|mdx)$/.test(name) ? [full] : [];
  });
}

const files = SOURCE_DIRS.flatMap((d) => walk(path.join(ROOT, d))).map((file) => ({
  rel: path.relative(ROOT, file),
  text: readFileSync(file, "utf8"),
}));

function hits(pattern: RegExp, include: (rel: string) => boolean) {
  return files
    .filter((f) => include(f.rel))
    .flatMap((f) =>
      f.text.split("\n").flatMap((line, i) => (pattern.test(line) ? [`${f.rel}:${i + 1}`] : [])),
    );
}

describe("source guards", () => {
  it("scans a non-trivial set of files", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("brand name and domain appear only in config/site.ts (Section 1.3)", () => {
    // The rendered brand is matched case-sensitively: the lowercase storage keys in
    // lib/storage.ts ("heartfixed-tracker-v1") are fixed identifiers, not the brand.
    expect(hits(/HeartFixed|heartfixed\.com/, (rel) => rel !== "config/site.ts")).toEqual([]);
    expect(hits(/heartfixed\.com/i, (rel) => rel !== "config/site.ts")).toEqual([]);
  });

  it("lowercase brand text appears only as storage keys in lib/storage.ts", () => {
    expect(hits(/heartfixed(?!-[a-z-]+-v\d)/i, (rel) => rel !== "config/site.ts")).toEqual([]);
  });

  it("never references the defensive domain in site code (Section 1.3)", () => {
    expect(hits(/fixedheart/i, () => true)).toEqual([]);
  });

  it("contains no `{{` placeholder tokens (Section 19.1)", () => {
    expect(hits(/\{\{/, () => true)).toEqual([]);
  });

  it("components and pages contain no gendered literals (Section 2.3)", () => {
    expect(
      hits(/\b(she|her|hers|he|him|his)\b/i, (rel) => /^(app|components)\//.test(rel)),
    ).toEqual([]);
  });

  it("contains no Section 14.2 prohibited terms outside legal copy", () => {
    const prohibited =
      /therap(y|ist)|counsell?ing|treatment|diagnos(is|e)|clinically proven|mental-health assessment|get your ex back|regret leaving|make her miss you/i;
    // Legal pages and the verbatim compliance blocks explain these terms by necessity.
    const allowed = (rel: string) =>
      rel.startsWith("content/legal/") || rel === "content/compliance.ts";
    expect(hits(prohibited, (rel) => !allowed(rel))).toEqual([]);
  });

  it("contains no AI, chat, payment, or database code paths (Sections 5.2, 17.2)", () => {
    expect(hits(/\b(openai|anthropic|stripe|prisma|mongoose|supabase)\b/i, () => true)).toEqual([]);
  });
});
