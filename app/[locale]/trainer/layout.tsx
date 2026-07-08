import { getTranslations } from "next-intl/server";
import { LayoutDashboard, Users, Dumbbell, Bell } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function TrainerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "TRAINER");
  const t = await getTranslations("nav");
  const tRoles = await getTranslations("roles");
  const tBrand = await getTranslations("brand");

  const navItems = [
    { href: "/trainer", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/trainer/clients", label: t("clients"), icon: Users },
    { href: "/trainer/exercises", label: t("exercises"), icon: Dumbbell },
    { href: "/trainer/notifications", label: t("notifications"), icon: Bell },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      brand={tBrand("name")}
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      roleLabel={tRoles("trainer")}
    >
      {children}
    </DashboardShell>
  );
}
