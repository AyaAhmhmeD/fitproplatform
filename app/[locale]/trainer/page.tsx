import { getTranslations } from "next-intl/server";
import { Users, Dumbbell, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";

export default async function TrainerOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "TRAINER");
  const t = await getTranslations();

  const trainerProfile = await prisma.trainerProfile.findUnique({ where: { userId: user.id } });

  const clients = trainerProfile
    ? await prisma.clientProfile.findMany({
        where: { trainerId: trainerProfile.id },
        include: { user: true, measurements: { orderBy: { date: "desc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 6,
      })
    : [];

  const [activePlans, totalClients] = await Promise.all([
    trainerProfile
      ? prisma.mealPlan.count({ where: { client: { trainerId: trainerProfile.id }, status: "ACTIVE" } })
      : Promise.resolve(0),
    trainerProfile ? prisma.clientProfile.count({ where: { trainerId: trainerProfile.id } }) : Promise.resolve(0),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t("nav.dashboard")}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("trainer.myClients")} value={totalClients} icon={Users} />
        <StatCard label="Active Meal Plans" value={activePlans} icon={Dumbbell} />
        <StatCard label="Avg. Progress" value="On track" icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("trainer.myClients")}</CardTitle>
          <Link href="/trainer/clients" className="text-sm font-medium text-brand-500 hover:underline">
            {t("common.viewAll")}
          </Link>
        </CardHeader>
        <div className="flex flex-col divide-y divide-(--border-subtle)">
          {clients.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No clients yet.</p>}
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/trainer/clients/${client.id}`}
              className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <Avatar name={client.user.name} src={client.user.avatarUrl} size={36} />
                <div>
                  <p className="text-sm font-medium">{client.user.name}</p>
                  <p className="text-xs text-ink-400">Joined {formatDate(client.createdAt, locale)}</p>
                </div>
              </div>
              {client.measurements[0]?.weightKg && (
                <span className="text-sm text-ink-400">{client.measurements[0].weightKg}kg</span>
              )}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
