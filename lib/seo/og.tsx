import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { ogCards, type OgKey } from "@/content/og";
import { OG_SIZE } from "@/lib/seo/ogConfig";
import { tokens } from "@/tailwind.config";

/**
 * Shared Open Graph renderer (Section 12.2). Statically generated at build with
 * next/og's bundled font — no network font request. Style objects are named
 * constants rather than inline literals.
 */
export const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

const { colors } = tokens;

const frame = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  padding: "72px 80px",
  backgroundColor: colors.primary,
  color: colors.surface,
};
const brandRow = { display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 };
const eyebrowStyle = { fontSize: 32, color: colors.accent, marginBottom: 20 };
const titleStyle = { fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 };
export { OG_KEYS, type OgKey } from "@/lib/seo/ogConfig";

const subtitleStyle = { fontSize: 30, color: colors.panel };
const column = { display: "flex", flexDirection: "column" as const };

export function renderOgImage(key: OgKey): ImageResponse {
  const card = ogCards[key];
  return new ImageResponse(
    <div style={frame}>
      <div style={brandRow}>
        <svg width="44" height="44" viewBox="0 0 24 24">
          <path d={HEART_PATH} fill={colors.surface} />
        </svg>
        {site.name}
      </div>
      <div style={column}>
        <div style={eyebrowStyle}>{card.eyebrow}</div>
        <div style={titleStyle}>{card.title}</div>
      </div>
      <div style={subtitleStyle}>{card.subtitle}</div>
    </div>,
    OG_SIZE,
  );
}

const iconBox = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.primary,
};

export function renderAppleIcon(): ImageResponse {
  return new ImageResponse(
    <div style={iconBox}>
      <svg width="120" height="120" viewBox="0 0 24 24">
        <path d={HEART_PATH} fill={colors.surface} />
      </svg>
    </div>,
    { width: 180, height: 180 },
  );
}
