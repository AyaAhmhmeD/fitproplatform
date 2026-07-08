# API Reference

All endpoints live under `web/src/app/api/` and are served from the web
app's origin (e.g. `https://your-app.vercel.app/api/...`). They're
consumed by both the web dashboards and the mobile app.

## Auth

Every route (except `/api/auth/register` and `/api/auth/callback`)
requires a valid Supabase session — the browser/mobile client sends the
Supabase session cookie/token automatically once signed in via
`@supabase/ssr` / `@supabase/supabase-js`. Each handler calls
`requireApiRole(...roles)` (`src/lib/auth/session.ts`), which resolves the
current session and its `role` claim, and returns a `401`/`403`
`NextResponse` directly (in place of a session) if the caller isn't
signed in or doesn't hold one of the allowed roles — route bodies check
`isSessionUser(session)` and return that response as-is when it fails.

### `POST /api/auth/register`

Public. Bootstraps the **first** Admin account on a fresh deployment only
— once any Admin exists, this always returns `403` and directs people to
ask their Admin/Trainer for an invite instead (all other accounts are
created via `POST /api/trainers` or `POST /api/clients`).

- Body: `{ name, email, password }` (password ≥ 8 chars)
- `200` → `{ user }` · `400` invalid input · `403` an Admin already exists

### `GET /api/auth/callback?code=...&locale=en`

OAuth (Google/Apple) redirect target. Exchanges the auth code for a
session, then redirects to `/{locale}/admin|trainer|client` based on the
resulting `app_metadata.role`, or to `/{locale}/login` if there's no code.

## Clients

### `GET /api/clients?q=search`

Roles: `ADMIN`, `TRAINER`. Trainers see only their own roster; Admins see
everyone. Optional `q` filters by client name (case-insensitive).
→ `{ clients: ClientProfile[] }` (each with `user`, `trainer`, and their
latest `measurements` entry).

### `POST /api/clients`

Roles: `ADMIN`, `TRAINER`. Body validated by `clientIntakeSchema`
(`src/lib/validation.ts`): name, email, age, gender, heightCm, weightKg,
goal, activityLevel, experience, plus optional injuries/diseases/sleep/
water/phone/trainerId. Creates a Supabase Auth user + `User` +
`ClientProfile` in one step via `provisionUser`.
→ `201` `{ client }` · `400` validation error

### `GET /api/clients/[id]`

Roles: `ADMIN`, `TRAINER` (own clients only), `CLIENT` (self only). Full
profile: user info, trainer, all measurements, body-analysis reports,
progress photos, the active meal plan, the active workout plan, and the
last 30 attendance records.
→ `200` `{ client }` · `403` forbidden · `404` not found

### `PATCH /api/clients/[id]`

Roles: `ADMIN`, `TRAINER` (own clients only). Updates intake/profile
fields.
→ `200` `{ client }`

### `DELETE /api/clients/[id]`

Roles: `ADMIN`, `TRAINER` (own clients only). Deactivates/removes a client
account.
→ `200` `{ success: true }`

## Trainers

### `GET /api/trainers`

Role: `ADMIN`. Full trainer roster with client counts.
→ `{ trainers: TrainerProfile[] }`

### `POST /api/trainers`

Role: `ADMIN`. Body validated by `createTrainerSchema`: name, email,
phone, bio/specialties/yearsExperience. Creates a Supabase Auth user +
`User` + `TrainerProfile` and sends an invite email.
→ `201` `{ trainer }` · `400` validation error

## Measurements

### `POST /api/measurements`

Roles: `ADMIN`, `TRAINER`, `CLIENT`. Body validated by
`measurementSchema` (date, weightKg, bodyFatPct, muscleMassKg, source,
etc.) plus an optional `clientId` (required for Admin/Trainer; Clients
always log against their own profile). BMI is calculated server-side from
`weightKg` and the client's stored height.
→ `201` `{ measurement }` · `400` validation/missing clientId · `404` client not found

## Progress photos

### `POST /api/photos` (multipart/form-data)

Roles: `ADMIN`, `TRAINER`, `CLIENT`. Fields: `file` (image), `clientId`
(required for Admin/Trainer; Clients upload to their own profile),
`angle` (`FRONT` | `SIDE` | `BACK`, default `FRONT`), optional `notes`.
Uploads to the `progress-photos` Supabase Storage bucket and creates a
`ProgressPhoto` record.
→ `201` `{ photo }` · `400` missing file/clientId

## Attendance

### `POST /api/attendance`

Roles: `ADMIN`, `TRAINER`. Body: `{ clientId, date?, status? = "PRESENT", notes? }`.
Upserts one record per client/day.
→ `201` `{ attendance }` · `400` missing clientId

### `GET /api/attendance?clientId=...`

Roles: `ADMIN`, `TRAINER`, `CLIENT`. Clients always see their own
attendance; Admin/Trainer must pass `clientId` for a specific client's
history (omit for an org-wide rate, Admin/Trainer only).
→ `{ attendances: Attendance[] }` (or an aggregate rate payload when no `clientId` is given)

## Notifications

### `GET /api/notifications`

Roles: `ADMIN`, `TRAINER`, `CLIENT`. The signed-in user's own feed
(latest 50).
→ `{ notifications: Notification[] }`

### `POST /api/notifications`

Role: `ADMIN`. Body validated by `notificationSchema`: `title`, `titleAr`,
`body`, `bodyAr`, `type`, plus either `recipientId` (single user) or
`broadcastRole` (send to every user with that role).
→ `201` `{ notifications }` · `400` validation error / neither recipient given

### `PATCH /api/notifications`

Roles: `ADMIN`, `TRAINER`, `CLIENT`. Marks all of the signed-in user's
notifications as read.
→ `200` `{ success: true }`

## Exercise library

### `GET /api/exercises?muscleGroup=&difficulty=&equipment=&q=`

Roles: `ADMIN`, `TRAINER`, `CLIENT`. All filters optional; `q` searches
name/nameAr.
→ `{ exercises: Exercise[] }`

### `GET /api/exercises/[slug]`

Roles: `ADMIN`, `TRAINER`, `CLIENT`. A single exercise plus its
`alternatives` (resolved from `alternativeSlugs`).
→ `200` `{ exercise, alternatives }` · `404` not found

## AI generation

### `POST /api/nutrition/generate`

Roles: `ADMIN`, `TRAINER`. Body validated by `mealPlanGenerateSchema`:
`{ clientId, goal? }` (defaults to the client's stored goal). Loads the
client's latest intake/measurement, computes BMI/BMR/TDEE/macros/water via
`calculateNutritionTargets`, then generates the meal plan content via the
AI provider (falling back to the deterministic template generator — see
[`ARCHITECTURE.md`](./ARCHITECTURE.md#ai-generation-pipeline)), and saves
it as the client's new `ACTIVE` `MealPlan` (archiving the previous one).
→ `201` `{ mealPlan }` · `400` validation error · `403` not this trainer's client · `422` client missing required intake data (age/gender/height/weight)

### `POST /api/workout/generate`

Roles: `ADMIN`, `TRAINER`. Body validated by `workoutPlanGenerateSchema`:
`{ clientId, style, daysPerWeek?, equipment? }` (`daysPerWeek` defaults by
experience level — 3/4/5 for Beginner/Intermediate/Advanced). Generates a
full weekly schedule via the AI provider (falling back to the
exercise-pool-based deterministic builder) and saves it as the client's
new `ACTIVE` `WorkoutPlan`.
→ `201` `{ workoutPlan }` · `400` validation error · `403` not this trainer's client

## Body-analysis PDF extraction

### `POST /api/pdf-analysis` (multipart/form-data)

Roles: `ADMIN`, `TRAINER`. Fields: `file` (PDF), `clientId`. Uploads the
PDF to the `documents` bucket, extracts text via `pdf-parse`, pulls
structured measurements out via the AI provider (or a regex fallback), and
creates a `BodyAnalysisReport` record.
→ `201` `{ report, summary }` · `400` missing file/clientId · `404` client not found

## Reports

### `POST /api/reports/pdf`

Roles: `ADMIN`, `TRAINER`. Body: `{ clientId, kind }`, `kind` ∈ `progress`
| `meal` | `workout`. Renders the corresponding PDF (client progress,
active meal plan, or active workout plan) via `@react-pdf/renderer`,
stores it in Supabase Storage, and logs a `Report` record.
→ `200` `{ url }` (signed/public download URL) · `400` invalid kind/missing clientId

### `POST /api/reports/excel`

Roles: `ADMIN`, `TRAINER` for `kind: "progress"`; `ADMIN` only for
`kind: "analytics"`. Body: `{ clientId?, kind }`, `kind` ∈ `progress` |
`analytics`. Renders the workbook via `exceljs`, stores it in Supabase
Storage, and logs a `Report` record.
→ `200` `{ url }` · `400` invalid kind · `403` non-admin requesting analytics

## Error shape

Validation failures return `{ error: ZodFlattenedError }` (field-level
messages via `.flatten()`); all other failures return `{ error: string }`.
HTTP status codes follow standard conventions (`400` bad input, `401`
unauthenticated, `403` forbidden, `404` not found, `422` unprocessable,
`201` created, `200` ok).
