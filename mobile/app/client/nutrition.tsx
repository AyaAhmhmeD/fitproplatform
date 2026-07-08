import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMyClient } from "@/hooks/useMyClient";
import { Card, EmptyState, ErrorView, LoadingView } from "@/components/ui";
import type { MealEntry } from "@/types";

function MealCard({ title, meal }: { title: string; meal: MealEntry }) {
  const { t } = useTranslation();
  return (
    <Card className="gap-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-base font-semibold text-ink dark:text-paper">{title}</Text>
        <Text className="text-xs text-black/40 dark:text-white/40">
          {t("nutrition.macros", { cal: meal.calories, p: meal.proteinG, c: meal.carbsG, f: meal.fatG })}
        </Text>
      </View>
      <Text className="text-sm font-medium text-volt-dark dark:text-volt">{meal.name}</Text>
      {meal.description ? (
        <Text className="text-sm text-black/60 dark:text-white/60">{meal.description}</Text>
      ) : null}
      {meal.items?.map((item, i) => (
        <Text key={i} className="text-sm text-black/60 dark:text-white/60">
          •  {item}
        </Text>
      ))}
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <Card className="gap-2">
      <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
        {title}
      </Text>
      {items.map((item, i) => (
        <Text key={i} className="text-sm text-black/60 dark:text-white/60">
          •  {item}
        </Text>
      ))}
    </Card>
  );
}

export default function ClientNutritionScreen() {
  const { t } = useTranslation();
  const { client, loading, error, reload } = useMyClient();

  if (loading) return <LoadingView />;
  if (error || !client) return <ErrorView message={error ?? undefined} onRetry={reload} />;

  const plan = client.mealPlans?.[0];

  if (!plan) {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-6 dark:bg-ink">
        <EmptyState title={t("nutrition.empty")} />
      </View>
    );
  }

  const meals = plan.meals;

  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="gap-3 p-4">
      <MealCard title={t("nutrition.breakfast")} meal={meals.breakfast} />
      <MealCard title={t("nutrition.morningSnack")} meal={meals.morningSnack} />
      <MealCard title={t("nutrition.lunch")} meal={meals.lunch} />
      <MealCard title={t("nutrition.afternoonSnack")} meal={meals.afternoonSnack} />
      <MealCard title={t("nutrition.dinner")} meal={meals.dinner} />
      <ListCard title={t("nutrition.supplements")} items={plan.supplements} />
      <ListCard title={t("nutrition.alternatives")} items={plan.alternatives} />
      <ListCard title={t("nutrition.shoppingList")} items={plan.shoppingList} />
    </ScrollView>
  );
}
