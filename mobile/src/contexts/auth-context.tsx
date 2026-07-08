import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/types";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: Role | null;
  /**
   * ASSUMPTION / KNOWN GAP: the backend has no `GET /api/clients/me` (or
   * equivalent) endpoint — `GET /api/clients/:id` requires the ClientProfile
   * id up front, and while a CLIENT-role user is allowed to read/write their
   * *own* record, they have no way to discover that id from the endpoints
   * documented for this build (`clients`, `clients/:id`, `measurements`,
   * `photos`, `attendance` — the latter two resolve "my own client row"
   * server-side when `clientId` is omitted, but `clients/:id` does not).
   *
   * We mirror the same pattern the backend already uses for `role` (stored
   * in Supabase `app_metadata` and read via JWT, no DB round-trip) and
   * assume a `clientId` claim is similarly stamped into `app_metadata` for
   * CLIENT users when their ClientProfile is provisioned. If that isn't
   * actually the case yet, this is the one thing a backend change should
   * add — see README "Known gaps".
   */
  clientId: string | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string, name: string) => Promise<void>;
  signInWithOAuth: (provider: "google" | "apple") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const role = (user?.app_metadata?.role as string | undefined)?.toUpperCase() as Role | undefined;
  const clientId = (user?.app_metadata?.clientId as string | undefined) ?? null;

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithPassword = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  const signInWithOAuth = async (provider: "google" | "apple") => {
    const redirectTo = Linking.createURL("auth/callback");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("No OAuth URL returned by Supabase");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success" || !result.url) {
      return; // user cancelled — not an error
    }

    const { queryParams } = Linking.parse(result.url);
    const code = queryParams?.code;
    if (typeof code === "string") {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      role: role ?? null,
      clientId,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithOAuth,
      signOut,
    }),
    [session, loading, role, clientId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
