import { getTranslations } from "next-intl/server";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BarChart3,
  CreditCard,
  CalendarCheck,
  Bell,
  FileText,
} from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "ADMIN");
  const t = await getTranslations("nav");
  const tRoles = await getTranslations("roles");
  const tBrand = await getTranslations("brand");

  const navItems = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/trainers", label: t("trainers"), icon: UserCog },
    { href: "/admin/clients", label: t("clients"), icon: Users },
    { href: "/admin/analytics", label: t("analytics"), icon: BarChart3 },
    { href: "/admin/subscriptions", label: t("subscriptions"), icon: CreditCard },
    { href: "/admin/attendance", label: t("attendance"), icon: CalendarCheck },
    { href: "/admin/notifications", label: t("notifications"), icon: Bell },
    { href: "/admin/reports", label: t("reports"), icon: FileText },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      brand={tBrand("name")}
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      roleLabel={tRoles("admin")}
    >
      {children}
    </DashboardShell>
  );
}
