import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateClientForm } from "@/components/forms/create-client-form";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getTranslations("admin");

  const clients = await prisma.clientProfile.findMany({
    where: q ? { user: { name: { contains: q, mode: "insensitive" } } } : undefined,
    include: {
      user: true,
      trainer: { include: { user: { select: { name: true } } } },
      measurements: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("manageClients")}</h1>
        <CreateClientForm />
      </div>

      <form method="get" className="max-w-sm">
        <Input name="q" defaultValue={q} placeholder="Search clients…" />
      </form>

      <Card>
        {clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients found" />
        ) : (
          <div className="flex flex-col divide-y divide-(--border-subtle)">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={client.user.name} src={client.user.avatarUrl} size={40} />
                  <div>
                    <p className="text-sm font-medium">{client.user.name}</p>
                    <p className="text-xs text-ink-400">
                      {client.trainer?.user.name ? `Trainer: ${client.trainer.user.name}` : "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {client.measurements[0]?.weightKg && (
                    <span className="text-sm text-ink-400">{client.measurements[0].weightKg}kg</span>
                  )}
                  <Badge tone={client.subscriptionStatus === "ACTIVE" ? "success" : "neutral"}>
                    {client.subscriptionStatus}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
