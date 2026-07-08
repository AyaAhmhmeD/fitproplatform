import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

export interface SessionUser {
  id: string; // Prisma User.id
  supabaseId: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  locale: string;
}

/**
 * Returns the signed-in user (Supabase auth + Prisma profile merged), or `null`.
 *
 * Supports two auth transports so the same route handlers work for both
 * clients:
 * - Web app: session cookie, refreshed by `src/proxy.ts` on every request.
 * - Mobile app (`mobile/src/lib/api.ts`): `Authorization: Bearer <access_token>`
 *   header, since React Native has no shared cookie jar with the browser.
 *
 * `supabase.auth.getUser(jwt)` validates a raw access token against Supabase
 * Auth directly, independent of cookies, so passing the bearer token there
 * (when present) covers the mobile case without touching the web cookie flow.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const authHeader = (await headers()).get("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  const {
    data: { user: authUser },
  } = bearerToken
    ? await supabase.auth.getUser(bearerToken)
    : await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } });
  if (!dbUser || !dbUser.isActive) return null;

  return {
    id: dbUser.id,
    supabaseId: dbUser.supabaseId,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    avatarUrl: dbUser.avatarUrl,
    locale: dbUser.locale,
  };
}

/** Server Component / Route Handler guard — redirects to login if unauthenticated or wrong role. */
export async function requireRole(locale: string, ...roles: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (roles.length > 0 && !roles.includes(user.role)) {
    redirect(`/${locale}/${user.role.toLowerCase()}`);
  }
  return user;
}

/** Route Handler guard — returns the user or a 401/403 Response, never redirects. */
export async function requireApiRole(...roles: Role[]): Promise<SessionUser | Response> {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (roles.length > 0 && !roles.includes(user.role)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  return user;
}

export function isSessionUser(value: SessionUser | Response): value is SessionUser {
  return !(value instanceof Response);
}
