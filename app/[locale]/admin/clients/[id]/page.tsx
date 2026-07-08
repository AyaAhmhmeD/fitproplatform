import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientDetailView } from "@/components/dashboard/client-detail-view";
import { DeleteClientButton } from "@/components/forms/delete-client-button";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    include: {
      user: true,
      trainer: { include: { user: { select: { name: true } } } },
      measurements: { orderBy: { date: "asc" } },
      mealPlans: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
      workoutPlans: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
      progressPhotos: { orderBy: { takenAt: "desc" } },
      bodyAnalyses: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <DeleteClientButton clientId={client.id} />
      </div>
      <ClientDetailView client={client} locale={locale} />
    </div>
  );
}
