# HeartFixed

Relationship tools for men after a breakup: an attachment-style assessment, a no-contact
tracker, a "should I text my ex?" decision tool, and a breakup-recovery content hub.

The build spec is [`relationship-tools-build-spec.md`](./relationship-tools-build-spec.md).
It is the source of truth. Work happens in the ordered sessions in its Section 18, and
progress is logged in [`BUILD-LOG.md`](./BUILD-LOG.md).

## Stack

Next.js 15 (App Router, static generation) · TypeScript · Tailwind CSS 3 with design
tokens · Zod · Vitest · Playwright · ESLint + Prettier. Hosting: Vercel. Email: Resend
(Session 9). Analytics: GA4 (Session 13). There is no database, no accounts, no AI, and no
payments in the MVP.

## Setup

Requires Node 24 (see `.nvmrc`). On macOS with Homebrew:

```bash
brew install node@24
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"   # node@24 is keg-only; add to ~/.zshrc
npm ci
npx playwright install chromium                      # once, for e2e tests
cp .env.example .env.local                           # optional locally; all vars can stay empty
```

## Scripts

| Command                | What it does                                                |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Dev server at http://localhost:3000                         |
| `npm run build`        | Production build (all public pages statically generated)    |
| `npm start`            | Serve the production build at http://localhost:3000         |
| `npm test`             | Vitest unit tests (engine, config, tokens, source guards)   |
| `npm run test:e2e`     | Builds, starts on :3100, runs Playwright at 320/360/desktop |
| `npm run typecheck`    | `tsc --noEmit`                                              |
| `npm run lint`         | ESLint                                                      |
| `npm run format:check` | Prettier check (`npm run format` to fix)                    |
| `npm run check`        | typecheck + lint + format check + unit tests                |

## Structure

The folder layout follows spec Section 7.2:

- `app/`: routes. Slugs are fixed by spec Section 6 and listed in `config/site.ts`.
- `components/`: `layout/`, `ui/`, and later `quiz/`, `tools/`, `content/`.
- `lib/`: logic. `lib/quiz/` is the only place scoring lives.
- `config/`: the **only** place for brand, domain, URLs, affiliate slots, quiz thresholds,
  and partner-reference copy.
- `content/`: copy. `content/compliance.ts` holds the verbatim Section 14.3 blocks.
- `tests/unit/`, `tests/e2e/`, plus `lib/**/__tests__/` for engine fixtures.

The rules from spec Section 1 apply in every session: work only on that session's scope
and leave `TODO(session-n)` comments for later work; never hardcode the brand, a domain, or
an affiliate link outside `config/`; keep compliance copy verbatim; send no sensitive
content to analytics. `tests/unit/source-guards.test.ts` enforces several of these.

## Deploy (Vercel)

1. Push the repo to GitHub and import it in Vercel. Framework preset: Next.js; defaults
   are fine.
2. Set the environment variables from `.env.example` in Vercel → Settings → Environment
   Variables. Set `NEXT_PUBLIC_SITE_URL=https://heartfixed.com` for Production only, and
   put secrets only in the dashboard, never in the repo.
3. Every branch or PR gets a preview URL. Review previews, never production, during the
   build. Vercel marks previews `noindex` automatically.
4. `main` auto-deploys to production.
5. **Launch only (Session 14):** add `heartfixed.com` and `www.heartfixed.com` to the
   project, redirect www → apex (http → https is automatic), and configure `fixedheart.com`
   at the registrar/host as a 301 of every path to the matching heartfixed.com path. See
   spec Section 17.5.

You can also deploy a preview from the CLI: `npx vercel` (preview) or `npx vercel --prod`.

Rollback: use Vercel's one-click rollback to the previous deployment.
