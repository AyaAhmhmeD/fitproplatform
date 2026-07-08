import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dumbbell } from "lucide-react";
import { PdfExportButton } from "@/components/forms/report-export-buttons";
import type { WorkoutSchedule } from "@/types";

export default async function ClientWorkoutsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "CLIENT");
  const t = await getTranslations();

  const client = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
    include: { workoutPlans: { where: { status: "ACTIVE" }, take: 1 } },
  });

  if (!client) notFound();
  const plan = client.workoutPlans[0];

  if (!plan) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No workout plan yet"
        description="Your trainer hasn't generated a training program for you yet."
      />
    );
  }

  const schedule = plan.schedule as WorkoutSchedule;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("client.workoutPlan")}</h1>
          <p className="text-sm text-ink-400">
            {t(`trainingStyle.${plan.style}` as never)} · {plan.daysPerWeek} days/week
          </p>
        </div>
        <PdfExportButton kind="workout" clientId={client.id} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {schedule.days.map((day) => (
          <Card key={day.day}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-semibold">{day.day}</p>
              {day.isRestDay ? (
                <Badge tone="neutral">{t("workout.restDay")}</Badge>
              ) : (
                <Badge tone="brand">{day.focus}</Badge>
              )}
            </div>
            {!day.isRestDay && (
              <div className="flex flex-col gap-2">
                {day.exercises.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-(--surface-muted) p-3 text-sm">
                    <p className="font-medium">{ex.exerciseName}</p>
                    <p className="text-xs text-ink-400">
                      {ex.sets} × {ex.reps} · {t("workout.rest")}: {ex.restSeconds}s · {t("workout.tempo")}: {ex.tempo}
                    </p>
                    {ex.notes && <p className="mt-1 text-xs text-ink-400">{ex.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
