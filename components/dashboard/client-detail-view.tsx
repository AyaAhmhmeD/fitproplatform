import { getTranslations } from "next-intl/server";
import { Weight, Percent, TrendingUp, Ruler } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { MeasurementChart } from "@/components/dashboard/measurement-chart";
import { GenerateMealPlanButton, GenerateWorkoutPlanButton } from "@/components/forms/generate-plan-buttons";
import { MeasurementForm } from "@/components/forms/measurement-form";
import { PdfExportButton } from "@/components/forms/report-export-buttons";
import { PhotoUploadForm } from "@/components/forms/photo-upload-form";
import { BodyAnalysisUploadForm } from "@/components/forms/body-analysis-upload-form";
import { calculateBMI } from "@/lib/nutrition/calculations";
import { formatDate } from "@/lib/utils";
import type {
  ActivityLevel,
  ExperienceLevel,
  Gender,
  Goal,
  MealPlanContent,
  SubscriptionStatus,
  WorkoutSchedule,
} from "@/types";

export interface ClientDetailData {
  id: string;
  age: number | null;
  gender: Gender | null;
  heightCm: number | null;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: ExperienceLevel;
  injuries: string | null;
  diseases: string | null;
  sleepHours: number | null;
  waterIntakeMl: number | null;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  user: { name: string; email: string; avatarUrl: string | null; phone: string | null };
  trainer: { user: { name: string } } | null;
  measurements: Array<{
    date: Date;
    weightKg: number | null;
    bodyFatPct: number | null;
    muscleMassKg: number | null;
    bmi: number | null;
  }>;
  mealPlans: Array<{
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    waterMl: number;
    meals: unknown;
  }>;
  workoutPlans: Array<{ style: string; daysPerWeek: number; schedule: unknown }>;
  progressPhotos: Array<{ id: string; url: string; angle: string; takenAt: Date }>;
  bodyAnalyses?: Array<{ id: string; fileUrl: string; fileName: string; summary: string | null; createdAt: Date }>;
}

export async function ClientDetailView({
  client,
  locale,
  canGeneratePlans = true,
}: {
  client: ClientDetailData;
  locale: string;
  canGeneratePlans?: boolean;
}) {
  const t = await getTranslations();
  const latest = client.measurements[client.measurements.length - 1];
  const bmi = latest?.bmi ?? (latest?.weightKg && client.heightCm ? calculateBMI(latest.weightKg, client.heightCm) : null);
  const mealPlan = client.mealPlans[0];
  const workoutPlan = client.workoutPlans[0];
  const meals = mealPlan?.meals as MealPlanContent | undefined;
  const schedule = workoutPlan?.schedule as WorkoutSchedule | undefined;

  const chartData = client.measurements.map((m) => ({
    date: formatDate(m.date, locale),
    weightKg: m.weightKg,
    bodyFatPct: m.bodyFatPct,
    muscleMassKg: m.muscleMassKg,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Avatar name={client.user.name} src={client.user.avatarUrl} size={56} />
          <div>
            <h1 className="font-display text-xl font-semibold">{client.user.name}</h1>
            <p className="text-sm text-ink-400">{client.user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="brand">{t(`goal.${client.goal}`)}</Badge>
              <Badge tone="neutral">{t(`experience.${client.experience}`)}</Badge>
              <Badge tone={client.subscriptionStatus === "ACTIVE" ? "success" : "warning"}>
                {client.subscriptionStatus}
              </Badge>
              {client.trainer && <Badge tone="neutral">Trainer: {client.trainer.user.name}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canGeneratePlans && (
            <>
              <GenerateMealPlanButton clientId={client.id} />
              <GenerateWorkoutPlanButton clientId={client.id} />
            </>
          )}
          <MeasurementForm clientId={client.id} />
          <PhotoUploadForm clientId={client.id} />
          <BodyAnalysisUploadForm clientId={client.id} />
          <PdfExportButton kind="progress" clientId={client.id} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("client.weight")} value={latest?.weightKg ?? "—"} unit="kg" icon={Weight} />
        <StatCard label={t("client.bodyFat")} value={latest?.bodyFatPct ?? "—"} unit="%" icon={Percent} />
        <StatCard label={t("client.muscleMass")} value={latest?.muscleMassKg ?? "—"} unit="kg" icon={TrendingUp} />
        <StatCard label={t("client.bmi")} value={bmi ?? "—"} icon={Ruler} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("client.myProgress")}</CardTitle>
        </CardHeader>
        <MeasurementChart data={chartData} />
      </Card>

      {mealPlan && meals && (
        <Card>
          <CardHeader>
            <CardTitle>{t("client.mealPlan")}</CardTitle>
          </CardHeader>
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-ink-400">
            <span>{mealPlan.calories} kcal</span>
            <span>P {mealPlan.proteinG}g</span>
            <span>C {mealPlan.carbsG}g</span>
            <span>F {mealPlan.fatG}g</span>
            <span>{mealPlan.waterMl}ml water</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(meals).map(([key, meal]) => (
              <div key={key} className="rounded-2xl border border-(--border-subtle) p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                  {t(`nutrition.${key}` as never)}
                </p>
                <p className="mt-1 font-medium">{locale === "ar" ? meal.nameAr || meal.name : meal.name}</p>
                <p className="mt-1 text-xs text-ink-400">
                  {meal.calories} kcal · P{meal.proteinG} C{meal.carbsG} F{meal.fatG}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {workoutPlan && schedule && (
        <Card>
          <CardHeader>
            <CardTitle>{t("client.workoutPlan")}</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-ink-400">
            {t(`trainingStyle.${workoutPlan.style}` as never)} · {workoutPlan.daysPerWeek} days/week
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {schedule.days.map((day) => (
              <div key={day.day} className="rounded-2xl border border-(--border-subtle) p-4">
                <p className="text-sm font-medium">
                  {day.day} — {day.isRestDay ? t("workout.restDay") : day.focus}
                </p>
                {!day.isRestDay && (
                  <ul className="mt-2 space-y-1 text-xs text-ink-400">
                    {day.exercises.map((ex, i) => (
                      <li key={i}>
                        {ex.exerciseName} — {ex.sets}×{ex.reps} · {ex.restSeconds}s rest
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {client.bodyAnalyses && client.bodyAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Body Analysis Reports</CardTitle>
          </CardHeader>
          <div className="flex flex-col divide-y divide-(--border-subtle)">
            {client.bodyAnalyses.map((report) => (
              <a
                key={report.id}
                href={report.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-3 text-sm transition hover:opacity-80"
              >
                <span>{report.summary ?? report.fileName}</span>
                <span className="text-ink-400">{formatDate(report.createdAt, locale)}</span>
              </a>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("nav.photos")}</CardTitle>
        </CardHeader>
        {client.progressPhotos.length === 0 ? (
          <p className="text-sm text-ink-400">No progress photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {client.progressPhotos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.angle}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
