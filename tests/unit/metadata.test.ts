import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { fullTitle, metadataFor, routeMetadata } from "@/lib/seo/metadata";

describe("lib/seo/metadata.ts — Section 12.2 limits", () => {
  const entries = Object.entries(routeMetadata);

  it.each(entries)("%s: title ≤ 60 chars with brand last", (_route, meta) => {
    const title = fullTitle(meta!.title);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith(site.name)).toBe(true);
  });

  it.each(entries)("%s: description ≤ 155 chars", (_route, meta) => {
    expect(meta!.description.length).toBeLessThanOrEqual(155);
  });

  it("sets the canonical to the route", () => {
    expect(metadataFor("/").alternates?.canonical).toBe("/");
  });

  it("refuses to render a route with no metadata defined", () => {
    expect(() => metadataFor("/not-a-route/")).toThrow();
  });
});
