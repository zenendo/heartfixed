# Build log

## Session 1 — Scaffold (2026-10-29)

**Shipped**

- Next.js 15.5.28 + React 19.1 + TypeScript 5.9 + Tailwind 3.4, with the Section 7.2 folder
  structure. Folders reserved for later sessions hold `.gitkeep` files.
- Section 8.2 design tokens in `tailwind.config.ts`. The colour, font-size and shadow
  scales **replace** Tailwind's defaults, so only token values exist. That also removes
  Tailwind's 12px `text-xs`, keeping the 13px small-print minimum.
- System font stack (no web-font request), global visible focus ring, and
  `prefers-reduced-motion` handling.
- Layout: skip-to-content link, `header`/`main`/`footer` landmarks, header with the wordmark
  and three tool links, and a footer carrying every Section 6 footer link, the short
  affiliate-disclosure line, and **Block C** rendered verbatim at body size on the crisis
  panel.
- Homepage skeleton: the positioning line as H1 and three tool cards.
- Config: `site.ts` (HeartFixed / heartfixed.com, the Section 6 route map, nav), `copy.ts`
  (partner dictionary), `quiz.ts` (men-v1, band edges), `affiliates.ts` (types plus the full
  12-slot inventory, all disabled), `content.ts` (stub), `redirects.ts` (empty, wired into
  `next.config.ts`).
- `lib/seo/metadata.ts` with homepage metadata and canonical. `.env.example` lists all
  Section 17.2 variables. README, CI workflow, and Vitest + Playwright setup.
- Tests: 50 unit tests (config, tokens and WCAG contrast, Block C verbatim, metadata
  limits, source guards) and 30 Playwright smoke tests (10 checks × 320px / 360px /
  desktop).

**Deferred (TODOs in code)**

- Footer email signup → Session 9. Blocks A/D → Session 5, E → Session 7, B → Session 11.
- Remaining route metadata, OG images, JSON-LD, favicon, sitemap/robots, 404 → Session 12.
- Analytics → Session 13. Print stylesheets → Sessions 5–6. Breadcrumbs → with the first
  non-home pages.
- Footer and homepage links point at routes that later sessions build, so they 404 for now.

**Decisions and ambiguities (resolved with spec defaults)**

- Tailwind 3.4 rather than 4: theme values live in a typed config that the tests import.
- Accent amber `#D98E32` is only ~2.7:1 on white. Under the spec's "CTAs only" rule it is
  used only as a button fill, with ink text (~6:1) and an ink border so the boundary passes
  3:1. A unit test records that accent must never be a text colour on white.
- Homepage copy containing a partner pronoun ("without texting her") resolves through
  `config/copy.ts`, per Section 2.3.
- `site.url` is fixed at `https://heartfixed.com`. `baseUrl` honours
  `NEXT_PUBLIC_SITE_URL` for metadata.
- Next 15 bundles a postcss version with a build-time advisory. The only fix npm offers
  (upgrading to Next 16) breaks the locked stack, so `package.json` `overrides` pins
  postcss 8.5.29 instead. `npm audit` now reports 0 vulnerabilities.
- All dependency versions are pinned exactly and are at least two weeks old.
- Committed as `session-01: scaffold` after the founder reviewed the session.
- The preview-URL deploy needs the founder's Vercel account (Section 17.3). Until then, the
  production build is verified locally. See the README.
