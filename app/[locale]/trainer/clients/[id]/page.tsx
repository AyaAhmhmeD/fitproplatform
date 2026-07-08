import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ClientDetailView } from "@/components/dashboard/client-detail-view";

export default async function TrainerClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await requireRole(locale, "TRAINER");

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    include: {
      user: true,
      trainer: { include: { user: { select: { name: true, id: true } } } },
      measurements: { orderBy: { date: "asc" } },
      mealPlans: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
      workoutPlans: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
      progressPhotos: { orderBy: { takenAt: "desc" } },
      bodyAnalyses: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();
  if (client.trainer?.user.id !== user.id) {
    // `forbidden()` requires the experimental authInterrupts flag; fall back to notFound for now.
    notFound();
  }

  return <ClientDetailView client={client} locale={locale} />;
}
