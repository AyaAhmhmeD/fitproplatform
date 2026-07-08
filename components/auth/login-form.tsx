"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const ROLE_HOME: Record<string, string> = { ADMIN: "/admin", TRAINER: "/trainer", CLIENT: "/client" };

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Invalid email or password");
      setLoading(false);
      return;
    }

    const role = (data.user.app_metadata?.role as string | undefined)?.toUpperCase();
    router.push(ROLE_HOME[role ?? ""] ?? "/");
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "apple") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}` },
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={() => handleOAuth("google")} className="w-full justify-center">
          {t("continueWithGoogle")}
        </Button>
        <Button variant="outline" onClick={() => handleOAuth("apple")} className="w-full justify-center">
          {t("continueWithApple")}
        </Button>
      </div>

      <div className="flex items-center gap-3 text-xs text-ink-400">
        <div className="h-px flex-1 bg-(--border-subtle)" />
        {t("orContinueWith")}
        <div className="h-px flex-1 bg-(--border-subtle)" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="email" type="email" label={t("email")} required autoComplete="email" />
        <Input name="password" type="password" label={t("password")} required autoComplete="current-password" />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading} className="w-full justify-center">
          {t("signIn")}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-400">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-brand-500 hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
