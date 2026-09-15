# Deploying Vedic Neev

This is an npm-workspaces + Turborepo monorepo (`apps/web`, `packages/db`,
`packages/engine`, `packages/ui`). The web app deploys to Vercel; the
database is Supabase Postgres, provisioned separately via Prisma.

## 1. Prerequisites

- A Supabase project (free tier is fine to start).
- A Vercel account with this GitHub repository accessible to it.
- Node.js >= 18.18.0 locally (matches the root `package.json` `engines` field).

## 2. Connect the repo to Vercel

Import the GitHub repository in Vercel, then set these project settings:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `npx turbo run build --filter=@vedicneev/web...` |
| Install Command | *(leave default)* |
| Output Directory | *(leave default)* |

Notes:
- The package is named `@vedicneev/web` in `apps/web/package.json`, not
  `web` — the filter above must use the full name or Turborepo won't
  resolve it. The trailing `...` pulls in `packages/db`, `packages/engine`,
  and `packages/ui` too, since `turbo.json` declares `build` as
  `dependsOn: ["^build"]`.
- Vercel auto-detects npm workspaces from the `package-lock.json` at the
  repo root and installs there even though Root Directory is `apps/web` —
  you don't need a custom Install Command.
- `apps/web/next.config.js` sets `output: "standalone"`. This doesn't
  change anything about the Vercel build — Vercel's own builder traces and
  bundles Next.js apps itself, ignoring `output: standalone`. It matters
  only if you ever self-host this app outside Vercel (e.g. `next start` in
  a Docker container), where it produces a minimal, dependency-complete
  `.next/standalone` bundle.

## 3. Environment variables

Copy every key from [`.env.production.example`](.env.production.example)
into Vercel's Project Settings → Environment Variables (Production scope;
also add to Preview if you want preview deploys to hit the same Supabase
project — otherwise give Preview its own).

`DATABASE_URL`, `DIRECT_URL`, and `NEXT_PUBLIC_APP_URL` are required — the
app 500s on sign-in/exam-submit without the first two, and every canonical/
OG/sitemap URL is wrong without the third. Each paid integration (Razorpay,
WhatsApp) runs a clearly mock-labeled fallback when its variables are
unset, so the app deploys and works in demo mode even before you have real
credentials — use **live**, not test, Razorpay keys for an actual
production deployment. `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` are in the
template but not read by any code yet (auth is a fully client-side mock —
see the comment block in `.env.production.example`). See the comments in
that file for exactly which file reads which variable.

## 4. Provision the database

Run these from the repo root, with `DATABASE_URL` and `DIRECT_URL` set to
your Supabase project (either export them locally or run via `vercel env
pull .env.production` first):

```bash
npm run db:push
npm run db:seed
```

- `db:push` (`prisma db push`) syncs `packages/db/prisma/schema.prisma` to
  Supabase directly — no migration history, appropriate for getting a fresh
  project's schema in place. Switch to `migrate:deploy`
  (`prisma migrate deploy`) once you've adopted versioned migrations.
- `db:seed` (`packages/db/prisma/seed.ts`) is safe to re-run: every model
  is seeded via `upsert` on its natural key, and the two bulk-insert blocks
  (questions, media items) check the existing row count first and skip if
  already populated — so re-running against a live database won't
  duplicate rows or crash on a constraint violation.

Note: the app's UI state (auth, test history, subscriptions) still lives
entirely client-side in Zustand + `localStorage` — the demo is fully usable
with zero database configured. But `apps/web` *does* call this database now,
as a best-effort background sync on two flows: every OTP sign-in
(`app/api/auth/sync/route.ts`, upserts a `User` row) and every mock-test
submit (`app/api/exam/submit/route.ts`, creates a `TestSession` +
`TestResponse`/`MistakeVault` rows). Both are fire-and-forget from the
client (a failure there doesn't block the on-screen result), but the sync
itself needs both a reachable database *and* this seed data: exam-submit
looks up an `ExamTemplate` by slug and 404s outright if none exists, and
silently skips any response whose `questionId` isn't a seeded `Question`
row (logged server-side as "skipped N response(s)"). Run `db:seed`, not
just `db:push`, for that sync to actually persist real data instead of a
near-empty session.

## 5. Deploy and verify

1. Push to `main`. This repo's GitHub default branch is `master` (not
   `main`), and Vercel's Production deployment tracks that default branch —
   `.github/workflows/mirror-main-to-master.yml` fast-forwards `master` to
   `main` on every push automatically, so pushing to `main` is enough;
   don't push to `master` directly, since the next mirror run would just
   overwrite it.
2. Once live, spot-check: the mock/demo banners on `/pricing` checkout and
   on `/exam/[examId]/results` (WhatsApp dispatch) should read "mock" until
   `RAZORPAY_*` / `WHATSAPP_*` are set, then switch to their real-API
   wording once those env vars are added and redeployed.
3. Confirm Open Graph previews (e.g. paste the URL into a chat app) resolve
   images against `NEXT_PUBLIC_APP_URL`, not `localhost`.
4. Sign in with the demo OTP flow and submit one mock test, then check
   Supabase (Table Editor or SQL) for a matching `User` row and a
   `TestSession` with `TestResponse` rows attached — confirms `DATABASE_URL`
   is reachable from Vercel and `db:seed` actually ran. Vercel's Function
   Logs for `/api/exam/submit` will show a "skipped N response(s)" line if
   the question bank wasn't seeded — see §4.
5. Check `/robots.txt` and `/sitemap.xml` resolve on the real domain (not a
   preview URL), and that `/dashboard`, `/parent`, `/onboarding`, and
   `/exam/**` carry `<meta name="robots" content="noindex,...">` in page
   source — see `SEO_CHECKLIST.md` for the full indexing checklist.

## 6. Local production build sanity check

Before pushing, you can reproduce the whole Vercel build locally:

```bash
npx turbo run build lint type-check
```

All four packages (`@vedicneev/web`, `@vedicneev/db`, `@vedicneev/engine`,
`@vedicneev/ui`) should report success with zero errors.

## 7. Deploying a subdomain app (`apps/typingtest`, `apps/omrtest`, ...)

This repo has no host-based routing anywhere — no `vercel.json` rewrites,
no middleware that dispatches by hostname. Each subdomain
(`typingtest.vedicneev.com`, `omrtest.vedicneev.com`, ...) is its own
**separate Vercel Project**, pointed at its own app folder. If a subdomain
serves the wrong app's content (e.g. `typingtest.vedicneev.com` shows
`apps/web`'s homepage), the domain is attached to the wrong Vercel Project
— that's a dashboard/DNS fix, not a code change.

To deploy `apps/typingtest`:

1. In Vercel, create a Project from this same GitHub repo (a second Project
   pointed at the same repo is normal — Vercel doesn't require one project
   per repo) with: Root Directory = `apps/typingtest`, Build Command =
   `npx turbo run build --filter=@vedicneev/typingtest...`, Install/Output
   left default (same npm-workspaces auto-detect §2 describes for
   `apps/web`).
2. Under **that Project's** Settings → Domains, add
   `typingtest.vedicneev.com`. Domains can only serve one Project at a
   time — if it's already attached elsewhere (e.g. the `apps/web`
   Project), remove it there first.
3. Point the `typingtest` CNAME at Namecheap to whatever target Vercel
   shows once the domain is added to the Project (typically
   `cname.vercel-dns.com`).
4. Set this Project's environment variables — a new Project starts with
   none. Copy these six verbatim from the `apps/web` Project (same
   Supabase project, same cookie domain — not new ones): `DATABASE_URL`,
   `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_COOKIE_DOMAIN=.vedicneev.com`, and `NEXT_PUBLIC_APP_URL`
   (apps/web's real URL — apps/typingtest's login page links out to it).
   Without `NEXT_PUBLIC_COOKIE_DOMAIN` set identically on both Projects,
   the Supabase session cookie apps/web's login sets won't be readable
   here, and every page under apps/typingtest that requires sign-in will
   loop back to `/login`. Do **not** add `SUPABASE_SERVICE_ROLE_KEY` here —
   apps/typingtest never calls the Supabase Admin API, only reads the
   existing session via the anon key, so this Project has no need for that
   privileged secret. See `.env.example`'s "Typing Test Suite" section for
   the full list with explanations.

The same recipe applies to `apps/omrtest` (swap the package name/domain).
