"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to register");

      const supabase = createClient();
      await supabase.auth.signInWithPassword({ email, password });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="name" label={t("fullName")} required autoComplete="name" />
        <Input name="email" type="email" label={t("email")} required autoComplete="email" />
        <Input name="password" type="password" label={t("password")} required minLength={8} autoComplete="new-password" />
        <Input
          name="confirmPassword"
          type="password"
          label={t("confirmPassword")}
          required
          minLength={8}
          autoComplete="new-password"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading} className="w-full justify-center">
          {t("signUp")}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-400">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-brand-500 hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
