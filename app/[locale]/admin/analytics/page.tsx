import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { GoalBreakdownChart } from "@/components/dashboard/goal-breakdown-chart";
import { Users, UserCog, TrendingUp } from "lucide-react";

const GOALS = ["FAT_LOSS", "MUSCLE_GAIN", "RECOMPOSITION", "MAINTENANCE"] as const;

export default async function AdminAnalyticsPage() {
  const t = await getTranslations();

  const [totalClients, totalTrainers, goalCounts, activeMealPlans, activeWorkoutPlans] = await Promise.all([
    prisma.clientProfile.count(),
    prisma.trainerProfile.count(),
    Promise.all(
      GOALS.map((goal) => prisma.clientProfile.count({ where: { goal } }).then((count) => ({ goal, count }))),
    ),
    prisma.mealPlan.count({ where: { status: "ACTIVE" } }),
    prisma.workoutPlan.count({ where: { status: "ACTIVE" } }),
  ]);

  const goalData = goalCounts.map(({ goal, count }) => ({ name: t(`goal.${goal}` as never), value: count }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("admin.overview")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("admin.totalClients")} value={totalClients} icon={Users} />
        <StatCard label={t("admin.totalTrainers")} value={totalTrainers} icon={UserCog} />
        <StatCard label="Active Plans" value={activeMealPlans + activeWorkoutPlans} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients by Goal</CardTitle>
        </CardHeader>
        <GoalBreakdownChart data={goalData} />
      </Card>
    </div>
  );
}
