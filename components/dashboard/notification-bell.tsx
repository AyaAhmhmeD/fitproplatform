"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useLocale } from "next-intl";

interface NotificationItem {
  id: string;
  title: string;
  titleAr?: string | null;
  body: string;
  bodyAr?: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Initial fetch-on-mount + polling refresh; `load` sets state once its
    // async fetch resolves (not synchronously in the effect body itself).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = items.filter((i) => !i.read).length;

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface) transition hover:bg-(--surface-muted)"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-400 text-[10px] font-bold text-ink-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute end-0 z-50 mt-2 w-80 rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{t("empty") ? "Notifications" : ""}</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-medium text-brand-500 hover:underline">
                  {t("markAllRead")}
                </button>
              )}
            </div>
            <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-none">
              {!loading && items.length === 0 && (
                <p className="px-2 py-6 text-center text-sm text-ink-400">{t("empty")}</p>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm",
                    item.read ? "text-ink-400" : "bg-(--surface-muted)",
                  )}
                >
                  <p className="font-medium text-(--foreground)">
                    {locale === "ar" && item.titleAr ? item.titleAr : item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {locale === "ar" && item.bodyAr ? item.bodyAr : item.body}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-400">{formatDate(item.createdAt, locale)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
