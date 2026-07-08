import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { LoadingView } from "@/components/ui";

/**
 * Root route: gates on auth state, then routes each of the three roles to
 * its own top-level tab group. Mirrors the role → section mapping in the
 * web app's `src/proxy.ts` (ADMIN → /admin, TRAINER → /trainer, CLIENT →
 * /client), just done client-side here since there's no middleware layer.
 */
export default function Index() {
  const { session, role, loading } = useAuth();

  if (loading) return <LoadingView />;
  if (!session) return <Redirect href="/(auth)/login" />;

  switch (role) {
    case "ADMIN":
      return <Redirect href="/admin" />;
    case "TRAINER":
      return <Redirect href="/trainer" />;
    case "CLIENT":
      return <Redirect href="/client" />;
    default:
      // Session exists but no role claim yet (e.g. app_metadata not synced) —
      // safest fallback is back to login rather than guessing a section.
      return <Redirect href="/(auth)/login" />;
  }
}
