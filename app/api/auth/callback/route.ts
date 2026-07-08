import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ROLE_HOME: Record<string, string> = { ADMIN: "/admin", TRAINER: "/trainer", CLIENT: "/client" };

/** OAuth (Google/Apple) callback — exchanges the auth code for a session, then routes by role. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const locale = request.nextUrl.searchParams.get("locale") ?? "en";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const role = (data.user?.app_metadata?.role as string | undefined)?.toUpperCase();
    return NextResponse.redirect(new URL(`/${locale}${ROLE_HOME[role ?? ""] ?? ""}`, request.url));
  }

  return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
}
