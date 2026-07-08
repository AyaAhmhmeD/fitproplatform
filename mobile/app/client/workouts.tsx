import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMyClient } from "@/hooks/useMyClient";
import { Badge, Card, EmptyState, ErrorView, LoadingView } from "@/components/ui";
import type { WorkoutDay } from "@/types";

function DayCard({ day }: { day: WorkoutDay }) {
  const { t } = useTranslation();

  if (day.isRestDay) {
    return (
      <Card className="items-center gap-1 border-dashed bg-black/[0.03] dark:bg-white/[0.03]">
        <Text className="text-base font-semibold text-ink dark:text-paper">{day.day}</Text>
        <Badge label={t("workouts.restDay")} tone="neutral" />
      </Card>
    );
  }

  return (
    <Card className="gap-3">
      <View>
        <Text className="text-base font-semibold text-ink dark:text-paper">{day.day}</Text>
        <Text className="text-sm text-black/50 dark:text-white/50">{day.focus}</Text>
      </View>
      <View className="gap-3">
        {day.exercises.map((ex, i) => (
          <View key={i} className="border-t border-black/5 pt-2 dark:border-white/10">
            <Text className="text-sm font-medium text-ink dark:text-paper">{ex.exerciseName}</Text>
            <Text className="text-xs text-black/50 dark:text-white/50">
              {ex.sets} {t("workouts.sets")} · {ex.reps} {t("workouts.reps")} · {ex.restSeconds}s{" "}
              {t("workouts.restSeconds")} · {ex.tempo} {t("workouts.tempo")}
            </Text>
            {ex.notes ? (
              <Text className="text-xs italic text-black/40 dark:text-white/40">{ex.notes}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function ClientWorkoutsScreen() {
  const { t } = useTranslation();
  const { client, loading, error, reload } = useMyClient();

  if (loading) return <LoadingView />;
  if (error || !client) return <ErrorView message={error ?? undefined} onRetry={reload} />;

  const plan = client.workoutPlans?.[0];

  if (!plan) {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-6 dark:bg-ink">
        <EmptyState title={t("workouts.empty")} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="gap-3 p-4">
      <View className="flex-row flex-wrap gap-2">
        <Badge label={plan.style.replaceAll("_", " ")} tone="volt" />
        <Badge label={`${plan.daysPerWeek} ${t("common.days")}`} tone="neutral" />
      </View>
      {plan.schedule.days.map((day, i) => (
        <DayCard key={i} day={day} />
      ))}
    </ScrollView>
  );
}
