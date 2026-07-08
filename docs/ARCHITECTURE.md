# Architecture

## Overview

FitPro is a single Next.js 16 application (App Router) serving three
audiences — a marketing site for prospective users, an authenticated
dashboard area split into three role-gated sections (Admin/Trainer/Client),
and a JSON REST API under `/api/*` consumed by both the web dashboards and
the Expo mobile app. Postgres (hosted on Supabase) is the single source of
truth, accessed through Prisma. Supabase Auth is the identity provider;
Supabase Storage holds uploaded files (avatars, progress photos, body
analysis PDFs).

```
Browser / Mobile app
        │
        ▼
Next.js 16 App Router  ──── src/proxy.ts (i18n + RBAC gate)
        │
        ├── Server Components (dashboards) ──┐
        ├── Route Handlers (/api/*)          ├──► Prisma ──► Postgres (Supabase)
        └── Server Actions / forms           ┘
        │
        ├──► Supabase Auth (sessions, OAuth, app_metadata.role)
        ├──► Supabase Storage (avatars, progress-photos, documents buckets)
        └──► AI provider (OpenAI/Anthropic/Gemini) — optional, with deterministic fallback
```

## Authentication & authorization

- **Identity**: Supabase Auth owns the user's credentials, session, and
  OAuth flows (Google, Apple, email/password). Supabase issues a JWT
  session cookie managed via `@supabase/ssr`.
- **Role storage**: each user's role (`ADMIN` / `TRAINER` / `CLIENT`) is
  stored in two places that are kept in sync: Supabase's
  `auth.users.app_metadata.role` (fast, available directly from the JWT,
  no DB call) and the `role` column on Prisma's `User` model (used for
  relational queries/joins). `src/lib/auth/roles.ts` is the only place
  that provisions users, and it always writes both.
- **Route protection**: `src/proxy.ts` runs on (almost) every request. It
  first applies next-intl's locale routing, then decodes the Supabase
  session JWT to read `app_metadata.role` and enforces which top-level
  section (`/admin`, `/trainer`, `/client`) the user is allowed into —
  unauthenticated users are sent to `/login`, wrong-role users are sent to
  their own section. Because the role comes from the JWT claim rather than
  a database lookup, this check adds no extra latency or DB load per
  request.
- **API-level checks**: route handlers additionally call
  `requireApiRole(...)` (`src/lib/auth/session.ts`) so the API is safe to
  call directly (e.g. from the mobile app) without relying on proxy-level
  gating alone.

## Data model

Full schema: [`web/prisma/schema.prisma`](../web/prisma/schema.prisma).
Key models:

- **User** — one row per account (`supabaseId` mirrors `auth.users.id`), `role`, profile basics.
- **TrainerProfile** / **ClientProfile** — 1:1 extensions of `User` holding role-specific data. `ClientProfile` carries the full intake (age, gender, height, goal, activity level, experience, injuries, diseases, sleep, water) and links to a `TrainerProfile`.
- **Measurement** — time-series body metrics (weight, body fat %, muscle mass, BMI) that feed the progress charts.
- **BodyAnalysisReport** — an uploaded PDF plus AI/`pdf-parse`-extracted structured metrics.
- **ProgressPhoto** — client photo uploads, tagged by angle (front/side/back).
- **MealPlan** / **WorkoutPlan** — generated plan content (JSON columns) plus the calculated targets (BMR/TDEE/calories/macros) or schedule metadata, each with a `status` (ACTIVE/ARCHIVED) so history is preserved.
- **Exercise** — the shared exercise library (34 seeded exercises: name, muscle group, difficulty, equipment, instructions, common mistakes, alternatives — bilingual).
- **Notification** — bilingual in-app notifications with a `read` flag.
- **Attendance** — daily check-in records per client.
- **Report** — a record of a generated PDF/Excel export (for the Admin reports history view).
- **Subscription** — client billing/subscription status used by the Admin subscriptions view.
- **AuditLog** — administrative action trail.

## AI generation pipeline

`src/lib/ai/providers.ts` centralizes all LLM calls: `generateWithAI()`
tries providers in the order configured by `AI_PROVIDER` (OpenAI →
Anthropic → Gemini, or a fixed single provider), parses the response with
`extractJson()`, and throws only if every configured provider fails or none
are configured.

Both generators are LLM-first with a deterministic fallback that keeps the
app fully functional with zero API keys:

- **Nutrition** (`src/lib/nutrition/`): `calculations.ts` computes BMR
  (Mifflin-St Jeor), TDEE, calorie target, and macro split from the
  client's intake data — these numbers are always calculated deterministically,
  never left to the LLM, so they're consistent and auditable.
  `ai.ts`/`generator.ts` produce the actual meal plan content (specific
  meals, supplements, alternatives, shopping list): `ai.ts` asks the LLM for
  goal-appropriate meals built around the calculated targets, falling back
  to `generator.ts`'s curated meal-template library if no provider is
  available or the call fails.
- **Workout** (`src/lib/workout/`): same pattern — `ai.ts` asks the LLM for
  a weekly schedule matching the requested style/experience/days-per-week,
  falling back to `generator.ts`'s exercise-pool-based deterministic
  builder (`exercise-pools.ts` holds the canonical exercise slugs shared
  with the seed data, so generated plans always reference real library
  entries).

## PDF body-analysis extraction

`src/lib/pdf-analysis/extract.ts` extracts raw text from an uploaded PDF
via `pdf-parse`, then asks the configured AI provider to pull out
structured measurements (weight, body fat %, muscle mass, etc.) from that
text; if no provider is configured, it falls back to a regex-based
extraction pass over the raw text so the upload flow still produces a
usable `BodyAnalysisReport` record.

## Reports

`src/lib/reports/pdf.tsx` (via `@react-pdf/renderer`) and
`src/lib/reports/excel.ts` (via `exceljs`) generate the client progress
report, meal/workout plan documents, measurement history, and analytics
exports surfaced through `/api/reports/pdf` and `/api/reports/excel`.

## Internationalization

next-intl drives routing (`/en/...`, `/ar/...`) and translation lookup
(`messages/en.json`, `messages/ar.json`). Arabic pages render
right-to-left via the `dir` attribute set in the locale layout; Tailwind
utility classes throughout the app use logical properties (`ps-`/`pe-`,
`start-`/`end-`) rather than `left`/`right` so layouts mirror correctly.

## Mobile app

The Expo app (`mobile/`) is a separate client of the same backend: it
authenticates against the same Supabase project and calls the same
`/api/*` routes as the web app rather than talking to Postgres/Prisma
directly, so both clients always see consistent, centrally-validated data.
