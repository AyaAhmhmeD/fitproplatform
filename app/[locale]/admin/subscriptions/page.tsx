import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CreditCard, Clock, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminSubscriptionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin");

  const [active, trial, expired, clients] = await Promise.all([
    prisma.clientProfile.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.clientProfile.count({ where: { subscriptionStatus: "TRIAL" } }),
    prisma.clientProfile.count({ where: { subscriptionStatus: { in: ["EXPIRED", "CANCELLED"] } } }),
    prisma.clientProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { subscriptionStart: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("subscriptions")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active" value={active} icon={CreditCard} />
        <StatCard label="Trial" value={trial} icon={Clock} />
        <StatCard label="Expired / Cancelled" value={expired} icon={XCircle} />
      </div>

      <Card>
        <div className="flex flex-col divide-y divide-(--border-subtle)">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium">{client.user.name}</p>
                <p className="text-xs text-ink-400">
                  {client.subscriptionStart ? formatDate(client.subscriptionStart, locale) : "—"}
                  {client.subscriptionEnd ? ` → ${formatDate(client.subscriptionEnd, locale)}` : ""}
                </p>
              </div>
              <Badge
                tone={
                  client.subscriptionStatus === "ACTIVE"
                    ? "success"
                    : client.subscriptionStatus === "TRIAL"
                      ? "gold"
                      : "danger"
                }
              >
                {client.subscriptionStatus}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
