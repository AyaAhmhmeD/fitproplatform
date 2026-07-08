import { getTranslations } from "next-intl/server";
import { LayoutDashboard, UtensilsCrossed, Dumbbell, TrendingUp, Bell } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "CLIENT");
  const t = await getTranslations("nav");
  const tRoles = await getTranslations("roles");
  const tBrand = await getTranslations("brand");

  const navItems = [
    { href: "/client", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/client/nutrition", label: t("nutrition"), icon: UtensilsCrossed },
    { href: "/client/workouts", label: t("workouts"), icon: Dumbbell },
    { href: "/client/progress", label: t("progress"), icon: TrendingUp },
    { href: "/client/notifications", label: t("notifications"), icon: Bell },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      brand={tBrand("name")}
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      roleLabel={tRoles("client")}
    >
      {children}
    </DashboardShell>
  );
}
