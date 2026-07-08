import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Weight, Percent, TrendingUp, Ruler, Flame, Droplets, Beef, Wheat } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateBMI } from "@/lib/nutrition/calculations";
import { PhotoUploadForm } from "@/components/forms/photo-upload-form";
import { MeasurementForm } from "@/components/forms/measurement-form";
import { Link } from "@/i18n/navigation";

export default async function ClientOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "CLIENT");
  const t = await getTranslations("client");

  const client = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
    include: {
      measurements: { orderBy: { date: "desc" }, take: 1 },
      mealPlans: { where: { status: "ACTIVE" }, take: 1 },
      workoutPlans: { where: { status: "ACTIVE" }, take: 1 },
    },
  });

  if (!client) notFound();

  const latest = client.measurements[0];
  const bmi = latest?.bmi ?? (latest?.weightKg && client.heightCm ? calculateBMI(latest.weightKg, client.heightCm) : null);
  const mealPlan = client.mealPlans[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("myDashboard")}</h1>
        <div className="flex gap-2">
          <MeasurementForm />
          <PhotoUploadForm />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("weight")} value={latest?.weightKg ?? "—"} unit="kg" icon={Weight} />
        <StatCard label={t("bodyFat")} value={latest?.bodyFatPct ?? "—"} unit="%" icon={Percent} />
        <StatCard label={t("muscleMass")} value={latest?.muscleMassKg ?? "—"} unit="kg" icon={TrendingUp} />
        <StatCard label={t("bmi")} value={bmi ?? "—"} icon={Ruler} />
      </div>

      {mealPlan && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t("calories")} value={mealPlan.calories} unit="kcal" icon={Flame} />
          <StatCard label={t("protein")} value={mealPlan.proteinG} unit="g" icon={Beef} />
          <StatCard label={t("carbs")} value={mealPlan.carbsG} unit="g" icon={Wheat} />
          <StatCard label={t("water")} value={mealPlan.waterMl} unit="ml" icon={Droplets} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("mealPlan")}</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-ink-400">
            {mealPlan ? `${mealPlan.calories} kcal/day` : "No active plan yet — ask your trainer to generate one."}
          </p>
          <Link href="/client/nutrition" className="text-sm font-medium text-brand-500 hover:underline">
            {t("mealPlan")} →
          </Link>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("workoutPlan")}</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-ink-400">
            {client.workoutPlans[0] ? "Your plan is ready." : "No active plan yet — ask your trainer to generate one."}
          </p>
          <Link href="/client/workouts" className="text-sm font-medium text-brand-500 hover:underline">
            {t("workoutPlan")} →
          </Link>
        </Card>
      </div>
    </div>
  );
}
