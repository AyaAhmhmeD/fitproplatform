# FitPro — AI-Powered Fitness Coaching Platform

FitPro is a bilingual (Arabic/English), multi-tenant fitness coaching
platform built for gyms and personal trainers. It gives an **Admin** full
oversight of the business, gives **Trainers** the tools to onboard and
manage clients with AI-generated nutrition and workout plans, and gives
**Clients** a personal dashboard to track their progress.

This repository is a monorepo with two apps that share one backend:

```
fitpro-platform/
├── web/      Next.js 16 web app — the full product (marketing site,
│             auth, all three dashboards, REST API, PDF/Excel reports,
│             Prisma schema, AI generators)
├── mobile/   Expo (React Native) companion app — consumes the same
│             REST API and Supabase Auth project as the web app
└── docs/     Architecture, API, and deployment reference docs
```

The web app is the primary, full-depth deliverable. The mobile app is a
working scaffold covering navigation, auth, theming, i18n, and the core
screens for all three roles, wired to the same backend — see
`mobile/README.md` for its specific setup and current coverage.

## Who is this for

| Role | Can do |
|---|---|
| **Admin (Owner)** | Create trainers and clients, view every client's progress, upload body-analysis PDFs/photos/plans, edit or deactivate any account, send notifications, export PDF/Excel reports, view business analytics, subscriptions, and attendance. |
| **Trainer** | Onboard clients with a full intake form (age, gender, height, weight, goal, activity level, experience, injuries, diseases, sleep, water), upload body-analysis PDFs/photos/measurements, generate AI nutrition and workout plans, edit client info. |
| **Client** | Log in, see a personal dashboard (weight, body fat, muscle mass, BMI, calories, water, protein/carbs/fat), download body-analysis PDFs, view meal and workout plans, track progress, upload photos, receive notifications. |

## Tech stack

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts
- **i18n**: next-intl (English + Arabic, full RTL support)
- **Backend**: Next.js Route Handlers, Prisma ORM, PostgreSQL (Supabase)
- **Auth**: Supabase Auth (email/password + Google/Apple OAuth), role-based access control via `app_metadata.role`
- **Storage**: Supabase Storage (avatars, progress photos, documents)
- **AI**: OpenAI / Anthropic / Gemini for nutrition & workout generation and PDF body-analysis extraction, with a deterministic fallback so the app is fully functional with zero API keys configured
- **Reports**: `@react-pdf/renderer` (PDF) and `exceljs` (Excel)
- **Mobile**: Expo, React Native, expo-router, NativeWind
- **Deployment**: Vercel (web), EAS (mobile)

## Quick start (web app)

```bash
cd web
npm install                # postinstall runs `prisma generate`
cp .env.example .env       # fill in your Supabase + AI provider credentials
npm run db:push            # create tables from prisma/schema.prisma
npm run db:seed            # exercise library + 3 demo accounts + sample client data
npm run dev
```

Full setup, environment variable reference, and troubleshooting live in
[`web/README.md`](./web/README.md).

## Demo accounts

After `npm run db:seed`, three working accounts are created (password for
all three: **`FitProDemo123!`**):

| Role | Email |
|---|---|
| Admin | `admin@fitpro.dev` |
| Trainer | `trainer@fitpro.dev` |
| Client | `client@fitpro.dev` |

The client account (Sara Al-Harbi) comes pre-loaded with 60 days of
measurement history, an active meal plan, an active workout plan, and a
welcome notification, so every dashboard has real data to look at
immediately after seeding.

## Further reading

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — data model, RBAC design, AI generation pipeline
- [`docs/API.md`](./docs/API.md) — REST API reference
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — deploying to Vercel + Supabase
- [`web/README.md`](./web/README.md) — web app setup and scripts
- [`mobile/README.md`](./mobile/README.md) — mobile app setup and current scope
