"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

export function UserMenu({
  name,
  email,
  avatarUrl,
  roleLabel,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  roleLabel: string;
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--surface) py-1 pe-3 ps-1 transition hover:bg-(--surface-muted)"
      >
        <Avatar name={name} src={avatarUrl} size={32} />
        <span className="hidden text-start sm:block">
          <span className="block text-sm font-medium leading-tight">{name}</span>
          <span className="block text-xs leading-tight text-ink-400">{roleLabel}</span>
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute end-0 z-50 mt-2 w-56 rounded-2xl p-2">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-ink-400">{email}</p>
            </div>
            <div className="my-1 h-px bg-(--border-subtle)" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-start text-sm text-red-500 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
