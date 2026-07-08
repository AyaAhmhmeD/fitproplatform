# FitPro Mobile

Expo (React Native + TypeScript) companion app for the FitPro platform. It
talks to the existing Next.js web app's REST API (`web/src/app/api/**`) and
shares the same Supabase Auth project — this app never touches Postgres or
Prisma directly.

## What's implemented

- **Navigation**: file-based routing via `expo-router`, gated by auth state
  and role. `app/index.tsx` redirects to `/admin`, `/trainer`, or `/client`
  based on the signed-in user's `app_metadata.role` (mirrors the web app's
  `src/proxy.ts` logic), or to `/(auth)/login` when signed out. Each role
  section has its own bottom-tab navigator (`RequireRole` guards every
  section client-side, redirecting away if the role doesn't match).
- **Auth**: email/password login + registration, and "Continue with
  Google" / "Continue with Apple" via `supabase.auth.signInWithOAuth` +
  `expo-web-browser` (PKCE code exchange, deep-linked back into the app via
  `expo-linking`). Session persistence uses `@react-native-async-storage`.
- **Theming**: dark/light, user-togglable from each role's Profile tab,
  persisted in AsyncStorage, defaults to dark. Built on NativeWind v4's
  color-scheme store (`useColorScheme`/`setColorScheme` from `nativewind`),
  so every component just uses Tailwind `dark:` classes.
- **i18n**: English + Arabic via `i18next`/`react-i18next`
  (`src/i18n/en.json`, `src/i18n/ar.json`). Switching to Arabic flips
  `I18nManager` RTL flags and attempts `Updates.reloadAsync()` to apply the
  new layout direction immediately (RN only picks up RTL changes after a
  fresh JS bundle load); if `expo-updates` can't reload in the current
  environment (e.g. Expo Go without EAS Update configured), the user gets an
  alert telling them to restart manually — see `src/contexts/locale-context.tsx`.
- **Client screens** (most fleshed out, per the brief):
  - Dashboard: stat tiles (weight, body fat, muscle mass, BMI from the
    latest measurement; calories/water/protein/carbs/fat from the active
    meal plan's targets) + quick links.
  - Nutrition: full active meal plan — breakfast/snacks/lunch/dinner cards
    with macros + items, supplements, alternatives, shopping list.
  - Workouts: weekly schedule, day cards with exercises (sets/reps/rest/
    tempo), rest days styled distinctly.
  - Progress: weight + body-fat trend line (hand-rolled `react-native-svg`
    polyline chart, see `src/components/charts/TrendChart.tsx`), progress
    photo grid, and an upload button (`expo-image-picker` →
    `POST /api/photos` multipart).
  - Profile: account info, theme/language switches, logout.
- **Trainer screens**: client roster with search, tap-through to a client
  detail screen (intake data + "Generate meal plan" / "Generate workout
  plan" buttons calling the AI generate endpoints, with a training-style
  picker), an exercise library browser, and a profile/settings tab.
- **Admin screens**: KPI overview (total clients/trainers, active
  subscriptions, attendance rate — composed client-side, see gap below),
  trainer roster with a simple "add trainer" form, full client roster, and
  a reports tab that generates + opens Excel reports
  (`POST /api/reports/excel`).
- **Notifications**: bell icon in every tab header → `/notifications` modal,
  listing `GET /api/notifications` with a "mark all read"
  (`PATCH /api/notifications`) button.

## Setup

```bash
cd mobile
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_API_URL + Supabase values
npx expo start
```

- `EXPO_PUBLIC_API_URL` — base URL of the web app's `/api` routes. Point it
  at `http://localhost:3000/api` while running `web/` locally, or your
  deployed URL (e.g. `https://fitpro.app/api`).
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — the **same**
  Supabase project as `web/.env`'s `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Signing in here produces a session the
  web app's API routes validate identically to its own cookies — we just
  attach it as `Authorization: Bearer <access_token>` on every request (see
  `src/lib/api.ts`).

Run `npx tsc --noEmit` (aliased as `npm run typecheck`) to type-check.
There's no device/simulator in this build environment, so the app hasn't
been launched — structural and type correctness were the verification bar.

## How role-based navigation works

1. `app/_layout.tsx` wraps everything in `ThemeProvider` → `LocaleProvider` →
   `AuthProvider`, then a root `Stack`.
2. `app/index.tsx` reads `useAuth()` (`session`, `role`) and `<Redirect>`s to
   `/admin`, `/trainer`, `/client`, or `/(auth)/login`.
3. Each of `app/admin`, `app/trainer`, `app/client` has its own `_layout.tsx`
   wrapping its tab navigator in `<RequireRole role="...">`
   (`src/components/RequireRole.tsx`), which redirects unauthenticated users
   to login and misrouted users to their actual section — this is the
   client-side equivalent of the web app's `src/proxy.ts` middleware, since
   Expo Router has no request-level middleware to enforce it before a screen
   mounts.
4. `app/trainer` additionally nests a `(tabs)` group inside a `Stack` so the
   client-detail screen (`app/trainer/client/[id].tsx`) can push on top of
   the tab bar instead of being just another tab.

Note on route naming: the task's suggested structure used route *groups*
(parenthesized folders) for `(admin)`, `(trainer)`, `(client)` — but since
groups don't add a URL segment, `(admin)/index.tsx`, `(trainer)/index.tsx`,
and `(client)/index.tsx` would all resolve to the same `/` path and collide
in Expo Router. This build uses real segments (`/admin`, `/trainer`,
`/client`) instead, which is the standard fix for this pattern.

## Known gaps / next steps

- **"My client ID" resolution (biggest assumption).** The backend has no
  `GET /api/clients/me`. `GET /api/clients/:id` requires the ClientProfile
  id up front, and while a CLIENT-role JWT *is* allowed to read/write their
  own record (`clients/:id`'s `assertAccess` permits `client.userId ===
  session.id`), there's no documented endpoint for a client to discover
  that id. `POST /api/measurements`, `POST /api/photos`, and
  `GET /api/attendance` all resolve "my own client row" **server-side**
  when `clientId` is omitted for a CLIENT session — but `clients/:id` does
  not have that fallback. This app assumes `app_metadata.clientId` is
  stamped onto the Supabase user the same way `app_metadata.role` already
  is (see `src/contexts/auth-context.tsx` and `src/hooks/useMyClient.ts`
  for the exact comment/assumption). **If that claim isn't actually set
  today, the cleanest backend fix is either (a) add it alongside `role` at
  provisioning time, or (b) add a real `GET /api/clients/me` route** — the
  mobile code only needs `useMyClient.ts` updated once that exists.
- **No public "sign up as client" endpoint.** `app/(auth)/register.tsx`
  calls `supabase.auth.signUp` directly, which creates a bare Supabase auth
  user with no `app_metadata.role` and no Prisma `User`/`ClientProfile` row
  — the backend's real provisioning path (`provisionUser`, used by
  `POST /api/clients` / `POST /api/trainers`) requires an already
  authenticated ADMIN/TRAINER caller. A self-registered user currently
  lands back on the login screen because `app/index.tsx` has no role to
  route on. Treat `register.tsx` as scaffolding for a future public sign-up
  flow, not a fully wired path yet.
- **Admin overview is composed client-side.** There's no
  `/api/admin/overview` aggregate endpoint, so `app/admin/index.tsx` calls
  `GET /api/clients`, `GET /api/trainers`, and `GET /api/attendance`
  (which already returns an org-wide `{ rate, total, present }` for
  admins/trainers with no `clientId`) and combines them. Fine at small
  scale; a dedicated backend endpoint would be worth adding if this grows
  more KPIs or the client/trainer lists get large enough that fetching full
  arrays just to `.length` them gets wasteful.
- **Push notifications aren't wired up.** The notifications screen only
  reads/writes the existing REST endpoints (`GET`/`PATCH /api/notifications`)
  — there's no device-token registration, no `expo-notifications` push
  integration, and no backend endpoint to store push tokens. Today it's a
  pull-based in-app inbox only.
- **OAuth (Google/Apple) is implemented but untested end-to-end.** The code
  path (`signInWithOAuth` → `expo-web-browser` → `exchangeCodeForSession`)
  follows Supabase's documented PKCE flow for native apps, but actually
  completing a Google/Apple sign-in requires provider credentials + a
  configured redirect scheme in the Supabase dashboard, which isn't
  something this build environment can exercise.
- **No offline/caching layer.** Every screen fetches fresh on mount/pull-to-
  refresh; there's no local cache, optimistic updates, or retry/backoff
  beyond the basic error-with-retry UI.
- **Not launched.** No simulator/device is available in this build
  environment. `npx tsc --noEmit` passes cleanly, and the code follows
  standard, long-stable Expo Router / NativeWind / Supabase-JS patterns, but
  it hasn't been run against Metro or a real device.

## Project structure

```
app/                      # expo-router file-based routes
  _layout.tsx             # root: Theme/Locale/Auth providers + Stack
  index.tsx                # auth/role redirect gate
  (auth)/                  # login, register (route group, no URL segment)
  admin/                   # ADMIN tabs: Overview, Trainers, Clients, Reports
  trainer/                 # TRAINER: Stack(tabs + client/[id] push screen)
  client/                  # CLIENT tabs: Dashboard, Nutrition, Workouts, Progress, Profile
  notifications.tsx        # modal, reachable from the bell icon everywhere
src/
  lib/
    supabase.ts             # Supabase client (AsyncStorage-backed session)
    api.ts                  # fetch wrapper + typed endpoint functions
  contexts/
    theme-context.tsx
    locale-context.tsx
    auth-context.tsx
  hooks/
    useMyClient.ts           # resolves "my" ClientProfile (see gaps above)
    useTabScreenOptions.ts
  components/
    ui/                      # Button, Card, StatTile, Badge, Input, etc.
    charts/TrendChart.tsx     # react-native-svg trend line
    ClientListItem.tsx, ProfileSettings.tsx, RequireRole.tsx
  i18n/                      # en.json, ar.json + i18next init
  types/index.ts             # mirrors web/src/types + prisma/schema.prisma
```
