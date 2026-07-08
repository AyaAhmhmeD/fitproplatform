import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateClientForm } from "@/components/forms/create-client-form";
import { Link } from "@/i18n/navigation";

export default async function TrainerClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "TRAINER");
  const t = await getTranslations("trainer");

  const trainerProfile = await prisma.trainerProfile.findUnique({ where: { userId: user.id } });

  const clients = trainerProfile
    ? await prisma.clientProfile.findMany({
        where: { trainerId: trainerProfile.id },
        include: { user: true, measurements: { orderBy: { date: "desc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("myClients")}</h1>
        <CreateClientForm />
      </div>

      <Card>
        {clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients yet" description="Add your first client to get started." />
        ) : (
          <div className="flex flex-col divide-y divide-(--border-subtle)">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/trainer/clients/${client.id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={client.user.name} src={client.user.avatarUrl} size={40} />
                  <div>
                    <p className="text-sm font-medium">{client.user.name}</p>
                    <p className="text-xs text-ink-400">{client.user.email}</p>
                  </div>
                </div>
                <Badge tone={client.subscriptionStatus === "ACTIVE" ? "success" : "neutral"}>
                  {client.subscriptionStatus}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
