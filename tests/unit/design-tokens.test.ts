import { describe, expect, it } from "vitest";
import config, { tokens } from "@/tailwind.config";

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const c = tokens.colors;

describe("design tokens — Section 8.2 values", () => {
  it("matches the spec colour palette exactly", () => {
    expect(c).toEqual({
      primary: "#1F3A4D",
      accent: "#D98E32",
      ink: "#1A2027",
      muted: "#5B6770",
      surface: "#FFFFFF",
      panel: "#F3F6F8",
      success: "#1E7A34",
      warning: "#FFF4E0",
      crisis: "#EEF4FB",
    });
  });

  it("replaces Tailwind's palette so only tokens are available", () => {
    const keys = Object.keys(config.theme?.colors ?? {});
    expect(keys.sort()).toEqual(["transparent", "current", "inherit", ...Object.keys(c)].sort());
  });

  it("uses the spec type scale: H1 32/40 mobile, 44/52 desktop, body 17/27", () => {
    expect(tokens.fontSize.h1).toEqual([32, 40]);
    expect(tokens.fontSize["h1-lg"]).toEqual([44, 52]);
    expect(tokens.fontSize.body).toEqual([17, 27]);
  });

  it("has no font size below the 13px small-print minimum", () => {
    for (const [name, [size]] of Object.entries(tokens.fontSize)) {
      expect(size, name).toBeGreaterThanOrEqual(13);
    }
  });

  it("uses a 12px card radius and a single shadow level", () => {
    expect(tokens.radius.card).toBe(12);
    expect(Object.keys(config.theme?.boxShadow ?? {}).sort()).toEqual(["DEFAULT", "none"]);
  });

  it("uses a system font stack (no web-font network request)", () => {
    expect(tokens.fontFamily).toContain("system-ui");
  });
});

describe("design tokens — WCAG AA contrast (Section 8.2)", () => {
  const bodyText: [string, string, string][] = [
    ["ink", "surface", c.ink],
    ["ink", "panel", c.ink],
    ["ink", "crisis", c.ink],
    ["ink", "warning", c.ink],
    ["muted", "surface", c.muted],
    ["muted", "panel", c.muted],
    ["muted", "crisis", c.muted],
    ["primary", "surface", c.primary],
    ["primary", "panel", c.primary],
    ["primary", "crisis", c.primary],
    ["success", "surface", c.success],
  ];

  it.each(bodyText)("%s text on %s is at least 4.5:1", (_fg, bg, fg) => {
    expect(contrast(fg, c[bg as keyof typeof c])).toBeGreaterThanOrEqual(4.5);
  });

  it("CTA label (ink on accent) is at least 4.5:1", () => {
    expect(contrast(c.ink, c.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("white text on primary is at least 4.5:1", () => {
    expect(contrast(c.surface, c.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it("UI boundaries (ink CTA border, primary crisis border) are at least 3:1", () => {
    expect(contrast(c.ink, c.surface)).toBeGreaterThanOrEqual(3);
    expect(contrast(c.primary, c.crisis)).toBeGreaterThanOrEqual(3);
  });

  it("documents that accent is NOT safe as text on white (CTA fill only)", () => {
    expect(contrast(c.accent, c.surface)).toBeLessThan(3);
  });
});
