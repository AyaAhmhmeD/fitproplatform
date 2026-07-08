import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role key. Bypasses Row Level
 * Security — only ever import this in server-only code (API routes, server
 * actions) that has already authorized the caller. Never expose to the client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
