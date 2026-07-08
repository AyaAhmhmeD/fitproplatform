import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const DASHBOARD_SECTIONS = ["admin", "trainer", "client"] as const;
const AUTH_PAGES = ["login", "register"] as const;

const ROLE_TO_SECTION: Record<string, string> = {
  ADMIN: "admin",
  TRAINER: "trainer",
  CLIENT: "client",
};

/**
 * Combines next-intl's locale routing with a lightweight, JWT-only RBAC
 * guard: the user's role is read from Supabase `app_metadata` (kept in sync
 * whenever a User is created/edited — see src/lib/auth/roles.ts), so this
 * never needs to hit the database on every request.
 */
export async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without Supabase configured (e.g. first run before env vars are set),
  // fall back to pure locale routing so the app is still browsable.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = routing.locales.includes(segments[0] as (typeof routing.locales)[number])
    ? segments[0]
    : routing.defaultLocale;
  const section = routing.locales.includes(segments[0] as (typeof routing.locales)[number])
    ? segments[1]
    : segments[0];

  const role = (user?.app_metadata?.role as string | undefined)?.toUpperCase();

  const isDashboardSection = DASHBOARD_SECTIONS.includes(
    section as (typeof DASHBOARD_SECTIONS)[number],
  );
  const isAuthPage = AUTH_PAGES.includes(section as (typeof AUTH_PAGES)[number]);

  if (isDashboardSection && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isDashboardSection && role && ROLE_TO_SECTION[role] !== section) {
    return NextResponse.redirect(
      new URL(`/${locale}/${ROLE_TO_SECTION[role] ?? "login"}`, request.url),
    );
  }

  if (isAuthPage && user && role) {
    return NextResponse.redirect(
      new URL(`/${locale}/${ROLE_TO_SECTION[role]}`, request.url),
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
