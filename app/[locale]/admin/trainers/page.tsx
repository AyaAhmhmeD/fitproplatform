import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateTrainerForm } from "@/components/forms/create-trainer-form";
import { UserCog } from "lucide-react";

export default async function AdminTrainersPage() {
  const t = await getTranslations("admin");

  const trainers = await prisma.trainerProfile.findMany({
    include: {
      user: { select: { name: true, email: true, avatarUrl: true, isActive: true, createdAt: true } },
      _count: { select: { clients: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("manageTrainers")}</h1>
        <CreateTrainerForm />
      </div>

      <Card>
        {trainers.length === 0 ? (
          <EmptyState icon={UserCog} title="No trainers yet" description="Create your first trainer to get started." />
        ) : (
          <div className="flex flex-col divide-y divide-(--border-subtle)">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={trainer.user.name} src={trainer.user.avatarUrl} size={40} />
                  <div>
                    <p className="text-sm font-medium">{trainer.user.name}</p>
                    <p className="text-xs text-ink-400">{trainer.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="brand">{trainer._count.clients} clients</Badge>
                  <Badge tone={trainer.user.isActive ? "success" : "danger"}>
                    {trainer.user.isActive ? "Active" : "Deactivated"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
