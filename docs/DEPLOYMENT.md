# Deployment Guide

FitPro's web app is designed to deploy straightforwardly to Vercel with
Supabase as the managed Postgres/Auth/Storage backend. This guide covers a
production setup end to end.

## 1. Provision Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. **Database** — Settings → Database: copy the pooled connection string
   (port 6543, `?pgbouncer=true`) for `DATABASE_URL`, and the direct
   connection string (port 5432) for `DIRECT_URL`. Prisma Migrate needs
   the direct connection; the app's runtime queries use the pooled one.
3. **API keys** — Settings → API: copy the Project URL
   (`NEXT_PUBLIC_SUPABASE_URL`), the `anon` public key
   (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), and the `service_role` secret key
   (`SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to the
   client).
4. **Storage buckets** — Storage → create three buckets: `avatars`,
   `progress-photos`, `documents`. Set them public if you want direct CDN
   URLs, or private and adjust `src/lib/storage/upload.ts` to generate
   signed URLs instead.
5. **Auth providers** — Authentication → Providers: email/password is on
   by default. To enable Google/Apple sign-in, configure their OAuth
   client credentials here (Supabase handles the OAuth exchange; the app
   only needs `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, no separate Google/Apple
   secrets in `.env`).
6. **Auth redirect URLs** — Authentication → URL Configuration: add your
   production URL's `/api/auth/callback` (and `http://localhost:3000/api/auth/callback`
   for local dev) to the allowed redirect list.

## 2. Apply the schema

From your own machine or CI (not required to be the same place you deploy
from):

```bash
cd web
npm install
cp .env.example .env   # fill in DATABASE_URL / DIRECT_URL from step 1
npm run db:migrate      # creates a tracked migration history (recommended for production)
npm run db:seed         # optional — seeds the exercise library + demo accounts
```

Use `db:migrate` (not `db:push`) for production so schema changes are
versioned; `db:push` is fine for quick local prototyping.

## 3. Deploy to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket and import it into
   [Vercel](https://vercel.com/new).
2. **Root Directory**: set to `web` (this is a monorepo; Vercel needs to
   know the web app isn't at the repo root).
3. **Environment variables**: add everything from `web/.env.example` in
   the Vercel project settings — `DATABASE_URL`, `DIRECT_URL`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, the three `SUPABASE_BUCKET_*` names, your
   AI provider key(s) + `AI_PROVIDER`, `NEXT_PUBLIC_APP_URL` (your final
   Vercel domain), `NEXT_PUBLIC_APP_NAME`, and `JWT_SECRET`.
4. Deploy. Vercel runs `npm install` (which triggers `prisma generate` via
   `postinstall`) and `next build` automatically.
5. Once live, update `NEXT_PUBLIC_APP_URL` to the real deployed URL if you
   didn't know it beforehand, and add the production callback URL to
   Supabase's redirect allow-list (step 1.6) if you haven't already.

## 4. Custom domain & images

If you serve uploaded images/PDFs from a custom domain or a different
Supabase project than the one used during development, update
`images.remotePatterns` in `web/next.config.ts` to include it — Next.js
`<Image>` will otherwise refuse to optimize/serve external hosts that
aren't explicitly allow-listed.

## 5. Mobile app (optional)

The Expo app in `mobile/` talks to the same deployed API and Supabase
project — set its API base URL and Supabase keys per
`mobile/README.md`, then build with EAS (`eas build`) for TestFlight/Play
Store distribution, or run it via Expo Go during development.

## Notes

- The app runs with **zero AI provider keys configured** — nutrition and
  workout generation, and PDF body-analysis extraction, all fall back to
  deterministic implementations. Add an `OPENAI_API_KEY` /
  `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` whenever you want LLM-generated
  content instead.
- `prisma generate`/`migrate`/`db:push` require outbound access to
  `binaries.prisma.sh` to download Prisma's query engine binary the first
  time. This is a normal outbound HTTPS call — it works on Vercel, GitHub
  Actions, and any standard developer machine. (It happens to be blocked
  in the network-restricted sandbox this project was originally generated
  in, which is a property of that sandbox only — see the note at the
  bottom of `web/README.md`.)
