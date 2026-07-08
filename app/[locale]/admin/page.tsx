import { getTranslations } from "next-intl/server";
import { Users, UserCog, CreditCard, CalendarCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin");

  const [totalClients, totalTrainers, activeSubscriptions, totalAttendance, presentAttendance, recentClients] =
    await Promise.all([
      prisma.clientProfile.count(),
      prisma.trainerProfile.count(),
      prisma.clientProfile.count({ where: { subscriptionStatus: "ACTIVE" } }),
      prisma.attendance.count(),
      prisma.attendance.count({ where: { status: "PRESENT" } }),
      prisma.clientProfile.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: true, trainer: { include: { user: true } } },
      }),
    ]);

  const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;
  const estimatedMonthlyRevenue = activeSubscriptions * 99; // placeholder ARPU, wire to real billing later

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("overview")}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("totalClients")} value={totalClients} icon={Users} />
        <StatCard label={t("totalTrainers")} value={totalTrainers} icon={UserCog} />
        <StatCard label={t("activeSubscriptions")} value={activeSubscriptions} icon={CreditCard} />
        <StatCard label={t("attendanceRate")} value={`${attendanceRate}%`} icon={CalendarCheck} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("monthlyRevenue")}</CardTitle>
        </CardHeader>
        <p className="font-display text-3xl font-semibold">${estimatedMonthlyRevenue.toLocaleString()}</p>
        <p className="mt-1 text-sm text-ink-400">Estimated from {activeSubscriptions} active subscriptions.</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recently Joined Clients</CardTitle>
          <Link href="/admin/clients" className="text-sm font-medium text-brand-500 hover:underline">
            View all
          </Link>
        </CardHeader>
        <div className="flex flex-col divide-y divide-(--border-subtle)">
          {recentClients.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No clients yet.</p>}
          {recentClients.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <Avatar name={client.user.name} src={client.user.avatarUrl} size={36} />
                <div>
                  <p className="text-sm font-medium">{client.user.name}</p>
                  <p className="text-xs text-ink-400">
                    {client.trainer?.user.name ? `Trainer: ${client.trainer.user.name}` : "Unassigned"} ·{" "}
                    {formatDate(client.createdAt, locale)}
                  </p>
                </div>
              </div>
              <Badge tone={client.subscriptionStatus === "ACTIVE" ? "success" : "neutral"}>
                {client.subscriptionStatus}
              </Badge>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
