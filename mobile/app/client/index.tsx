import React from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useMyClient } from "@/hooks/useMyClient";
import { useAuth } from "@/contexts/auth-context";
import { Button, ErrorView, LoadingView, StatTile } from "@/components/ui";

export default function ClientDashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { client, loading, error, reload } = useMyClient();

  if (loading) return <LoadingView />;
  if (error || !client) return <ErrorView message={error ?? undefined} onRetry={reload} />;

  const latest = client.measurements?.[client.measurements.length - 1];
  const mealPlan = client.mealPlans?.[0];
  const firstName = (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ?? client.user.name.split(" ")[0];

  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="gap-4 p-4">
      <Text className="text-2xl font-bold text-ink dark:text-paper">
        {t("dashboard.greeting", { name: firstName })}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        <StatTile label={t("stats.weight")} value={latest?.weightKg ?? "—"} unit="kg" accent />
        <StatTile label={t("stats.bodyFat")} value={latest?.bodyFatPct ?? "—"} unit="%" />
        <StatTile label={t("stats.muscleMass")} value={latest?.muscleMassKg ?? "—"} unit="kg" />
        <StatTile label={t("stats.bmi")} value={latest?.bmi?.toFixed(1) ?? "—"} />
      </View>

      <Text className="mt-2 text-sm font-semibold uppercase text-black/40 dark:text-white/40">
        {t("dashboard.activePlan")}
      </Text>
      {mealPlan ? (
        <View className="flex-row flex-wrap gap-3">
          <StatTile label={t("stats.calories")} value={mealPlan.calories} unit="kcal" accent />
          <StatTile label={t("stats.water")} value={Math.round(mealPlan.waterMl / 1000)} unit="L" />
          <StatTile label={t("stats.protein")} value={mealPlan.proteinG} unit="g" />
          <StatTile label={t("stats.carbs")} value={mealPlan.carbsG} unit="g" />
          <StatTile label={t("stats.fat")} value={mealPlan.fatG} unit="g" />
        </View>
      ) : (
        <Text className="text-sm text-black/50 dark:text-white/50">{t("dashboard.noPlan")}</Text>
      )}

      <Text className="mt-2 text-sm font-semibold uppercase text-black/40 dark:text-white/40">
        {t("dashboard.quickLinks")}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        <Button label={t("nav.nutrition")} variant="secondary" size="sm" onPress={() => router.push("/client/nutrition")} />
        <Button label={t("nav.workouts")} variant="secondary" size="sm" onPress={() => router.push("/client/workouts")} />
        <Button label={t("nav.progress")} variant="secondary" size="sm" onPress={() => router.push("/client/progress")} />
      </View>
    </ScrollView>
  );
}
