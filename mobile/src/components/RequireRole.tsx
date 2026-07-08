import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { LoadingView } from "@/components/ui";
import type { Role } from "@/types";

const SECTION_FOR_ROLE: Record<Role, string> = {
  ADMIN: "/admin",
  TRAINER: "/trainer",
  CLIENT: "/client",
};

/**
 * Client-side guard for each role's route group — mirrors the redirect
 * rules in the web app's `src/proxy.ts` (unauthenticated → /login,
 * wrong-role → their own section) since Expo Router has no middleware layer
 * to enforce this before a screen mounts.
 */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { session, role: currentRole, loading } = useAuth();

  if (loading) return <LoadingView />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (currentRole && currentRole !== role) {
    return <Redirect href={SECTION_FOR_ROLE[currentRole]} />;
  }
  if (!currentRole) return <Redirect href="/(auth)/login" />;

  return <>{children}</>;
}
