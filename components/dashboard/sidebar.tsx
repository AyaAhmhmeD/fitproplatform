"use client";

import type { LucideIcon } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function Sidebar({
  items,
  brand,
  className,
}: {
  items: NavItem[];
  brand: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 flex-col border-e border-(--border-subtle) bg-(--surface) px-4 py-6 lg:flex",
        className,
      )}
    >
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-400 font-display text-lg font-bold text-ink-950">
          F
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">{brand}</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-400/15 text-brand-600 dark:text-brand-300"
                  : "text-ink-500 hover:bg-(--surface-muted) hover:text-(--foreground) dark:text-ink-300",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
