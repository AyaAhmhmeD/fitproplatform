"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { UserMenu } from "@/components/dashboard/user-menu";

export function DashboardShell({
  navItems,
  brand,
  user,
  roleLabel,
  children,
}: {
  navItems: NavItem[];
  brand: string;
  user: { name: string; email: string; avatarUrl?: string | null };
  roleLabel: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} brand={brand} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex w-72 flex-col bg-(--surface) p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="mb-4 flex h-9 w-9 items-center justify-center self-end rounded-full bg-(--surface-muted)"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar items={navItems} brand={brand} className="flex w-full border-none p-0" />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-(--border-subtle) bg-(--background)/80 px-4 py-3 backdrop-blur-lg sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border-subtle) lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle />
            <NotificationBell />
            <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} roleLabel={roleLabel} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
