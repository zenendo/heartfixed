import type { Config } from "tailwindcss";

/**
 * Design tokens — Section 8.2. These are the only colours, type sizes, radius and
 * shadow the site uses. The colour and font-size scales REPLACE Tailwind's defaults
 * (rather than extending them) so off-token values can't creep into components.
 *
 * Contrast notes (verified in tests/unit/design-tokens.test.ts):
 * - accent (#D98E32) is ~2.7:1 against white, so it is never a text colour. CTA
 *   buttons put ink text on accent (~6:1) and carry an ink border so the control
 *   boundary meets the 3:1 non-text contrast rule.
 */
export const tokens = {
  colors: {
    primary: "#1F3A4D", // deep slate blue
    accent: "#D98E32", // warm amber — calls to action only
    ink: "#1A2027",
    muted: "#5B6770",
    surface: "#FFFFFF", // page background
    panel: "#F3F6F8", // soft panel
    success: "#1E7A34",
    warning: "#FFF4E0", // warning amber background
    crisis: "#EEF4FB", // crisis-resource panel background (left border in primary)
  },
  // [font-size, line-height] in px. Small print minimum is 13px.
  fontSize: {
    small: [13, 20],
    sm: [15, 24],
    body: [17, 27],
    lg: [20, 30],
    xl: [24, 32],
    h1: [32, 40], // mobile
    "h1-lg": [44, 52], // desktop
  },
  radius: { card: 12 },
  shadow: "0 1px 3px rgba(26, 32, 39, 0.08), 0 4px 12px rgba(26, 32, 39, 0.06)",
  fontFamily: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    '"Noto Sans"',
    "sans-serif",
  ],
} as const;

const px = (n: number) => `${n / 16}rem`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      ...tokens.colors,
    },
    fontSize: Object.fromEntries(
      Object.entries(tokens.fontSize).map(([k, [size, lh]]) => [k, [px(size), px(lh)]]),
    ),
    fontFamily: { sans: [...tokens.fontFamily] },
    boxShadow: { DEFAULT: tokens.shadow, none: "none" },
    extend: {
      borderRadius: { card: `${tokens.radius.card}px` },
    },
  },
  plugins: [],
};

export default config;
