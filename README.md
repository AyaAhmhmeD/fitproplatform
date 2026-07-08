# FitPro — Web App

Next.js 16 (App Router) web application: marketing site, authentication,
the Admin/Trainer/Client dashboards, the REST API, AI nutrition & workout
generators, PDF body-analysis extraction, and PDF/Excel report export.

See the [repository root README](../README.md) for the overall project
overview, and [`../docs/`](../docs/) for architecture and API reference.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is enough) — used for Postgres, Auth, and Storage
- Optional: an OpenAI, Anthropic, or Gemini API key (nutrition/workout generation and PDF extraction work without one — see [AI generation](#ai-generation) below)

## Setup

```bash
npm install          # postinstall runs `prisma generate`
cp .env.example .env
```

Fill in `.env`:

1. **Database** — in your Supabase project, go to Settings → Database and copy the pooled connection string into `DATABASE_URL` and the direct connection string into `DIRECT_URL`.
2. **Supabase project** — Settings → API: copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`, the `anon` public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the `service_role` secret key into `SUPABASE_SERVICE_ROLE_KEY`.
3. **Storage buckets** — create three public buckets in Supabase Storage named `avatars`, `progress-photos`, and `documents` (or change the `SUPABASE_BUCKET_*` env vars to match whatever names you use).
4. **OAuth (optional)** — enable Google/Apple providers under Supabase Auth → Providers if you want social login; email/password works out of the box with no extra config.
5. **AI provider (optional)** — set `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY` and point `AI_PROVIDER` at the one you want tried first.
6. **JWT_SECRET** — any long random string (used for internal signing; not related to Supabase's own JWT).

Then set up the database:

```bash
npm run db:push     # creates all tables from prisma/schema.prisma (use db:migrate instead if you want tracked migrations)
npm run db:seed     # seeds the 34-exercise library + 3 demo accounts + sample client data
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/en` (or `/ar`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push `schema.prisma` to the database without a migration history |
| `npm run db:migrate` | Create/apply a tracked migration (use for anything beyond local dev) |
| `npm run db:seed` | Seed exercises + demo accounts + sample client data (safe to re-run) |
| `npm run db:studio` | Open Prisma Studio |

## Demo accounts

Password for all three: **`FitProDemo123!`**

- `admin@fitpro.dev` — Admin
- `trainer@fitpro.dev` — Trainer (Karim Osman)
- `client@fitpro.dev` — Client (Sara Al-Harbi), pre-loaded with 60 days of measurement history, an active meal plan, an active workout plan, and a welcome notification

`npm run db:seed` only creates these if `NEXT_PUBLIC_SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` are set — without them it seeds just the
exercise library and skips the Supabase-auth-backed demo users (it warns
you when this happens).

## AI generation

Nutrition and workout plan generation call an LLM (OpenAI → Anthropic →
Gemini, in the order set by `AI_PROVIDER`) to produce the plan content. If
no API key is configured, or the call fails for any reason, the app
transparently falls back to a built-in deterministic generator (Mifflin-St
Jeor BMR/TDEE calculations, a curated meal-template library, and an
exercise-pool-based workout builder) — the feature is never blocked on
having an API key. The same applies to PDF body-analysis extraction
(`src/lib/pdf-analysis/extract.ts`): text/measurement extraction from the
uploaded PDF is done with `pdf-parse` regardless of AI configuration.

## Internationalization

Locales live under `/en` and `/ar` (`localePrefix: "always"`). Arabic
renders right-to-left automatically via the `dir` attribute on `<html>`.
Translation strings are in `messages/en.json` and `messages/ar.json` — add
new keys to both files together.

## Prisma configuration (`prisma.config.ts`)

Prisma 7 reads CLI-level settings (schema location, migration seed command,
etc.) from `prisma.config.ts` at the project root instead of the old
`"prisma"` key in `package.json`. The one thing worth knowing if you ever
edit it: `defineConfig` is exported from the `prisma` package's
`prisma/config` subpath (re-exporting `@prisma/config`) — **not** from
`@prisma/client`, which only exports the generated `PrismaClient` runtime
and has no `defineConfig` export. Importing it from the wrong package is a
common copy-paste mistake and is exactly what breaks type-checking/VS
Code if you hit it:

```ts
// correct
import { defineConfig } from "prisma/config";

// wrong — @prisma/client does not export defineConfig
import { defineConfig } from "@prisma/client";
```

This file also sets `migrations.seed` so `prisma migrate dev` / `prisma
migrate reset` auto-run `prisma/seed.ts`, in addition to the standalone
`npm run db:seed`.

## Auth & roles

Role-based access control is handled in `src/proxy.ts` (Next.js 16's
successor to `middleware.ts`): it reads the signed-in user's role from
their Supabase `app_metadata.role` claim (set by `src/lib/auth/roles.ts`
when an account is provisioned) and redirects unauthenticated or
wrong-role requests, without an extra database round-trip per request.

## Deploying

See [`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for the full Vercel +
Supabase deployment walkthrough.

## A note on this environment vs. production

If you're reading this from the same sandboxed environment this project
was originally generated in: that sandbox's network policy blocks
`binaries.prisma.sh`, which `prisma generate`/`migrate`/`db:push` need to
download their query engine. That's a restriction of that specific sandbox
— on your own machine, in CI, or on Vercel, `npm install` (via
`postinstall`) and the `db:*` scripts will work normally with no changes
needed.
