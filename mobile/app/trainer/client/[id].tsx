import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { generateNutritionPlan, generateWorkoutPlan, getClient } from "@/lib/api";
import type { ClientProfile, TrainingStyle } from "@/types";
import { Badge, Button, Card, ErrorView, LoadingView } from "@/components/ui";

const STYLES: TrainingStyle[] = [
  "FULL_BODY",
  "UPPER_LOWER",
  "PUSH_PULL_LEGS",
  "BRO_SPLIT",
  "STRENGTH",
  "HYPERTROPHY",
  "FAT_LOSS",
  "HOME_WORKOUT",
  "GYM_WORKOUT",
];

export default function TrainerClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<TrainingStyle>("FULL_BODY");
  const [generatingMeal, setGeneratingMeal] = useState(false);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const res = await getClient(id);
      setClient(res.client);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onGenerateMeal = async () => {
    if (!id) return;
    setGeneratingMeal(true);
    try {
      await generateNutritionPlan(id);
      await load();
      Alert.alert("Done", "New meal plan generated.");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : String(err));
    } finally {
      setGeneratingMeal(false);
    }
  };

  const onGenerateWorkout = async () => {
    if (!id) return;
    setGeneratingWorkout(true);
    try {
      await generateWorkoutPlan({ clientId: id, style });
      await load();
      Alert.alert("Done", "New workout plan generated.");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : String(err));
    } finally {
      setGeneratingWorkout(false);
    }
  };

  if (!client && !error) return <LoadingView />;
  if (error && !client) return <ErrorView message={error} onRetry={load} />;
  if (!client) return null;

  const latest = client.measurements?.[client.measurements.length - 1];

  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="gap-4 p-4">
      <Stack.Screen options={{ title: client.user.name }} />

      <Card className="gap-2">
        <Text className="text-lg font-bold text-ink dark:text-paper">{client.user.name}</Text>
        <Text className="text-sm text-black/50 dark:text-white/50">{client.user.email}</Text>
        <View className="flex-row flex-wrap gap-2 pt-1">
          <Badge label={client.goal.replaceAll("_", " ")} tone="volt" />
          <Badge label={client.experience} tone="neutral" />
          <Badge label={client.activityLevel.replaceAll("_", " ")} tone="neutral" />
          <Badge label={client.subscriptionStatus} tone="neutral" />
        </View>
      </Card>

      <Card className="gap-2">
        <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
          Intake
        </Text>
        <View className="flex-row flex-wrap gap-x-6 gap-y-2">
          <InfoRow label="Age" value={client.age ?? "—"} />
          <InfoRow label="Gender" value={client.gender ?? "—"} />
          <InfoRow label="Height" value={client.heightCm ? `${client.heightCm} cm` : "—"} />
          <InfoRow label="Weight" value={latest?.weightKg ? `${latest.weightKg} kg` : "—"} />
          <InfoRow label="Sleep" value={client.sleepHours ? `${client.sleepHours} h` : "—"} />
          <InfoRow label="Water" value={client.waterIntakeMl ? `${client.waterIntakeMl} ml` : "—"} />
        </View>
        {client.injuries ? <Text className="text-sm text-black/60 dark:text-white/60">Injuries: {client.injuries}</Text> : null}
        {client.diseases ? <Text className="text-sm text-black/60 dark:text-white/60">Conditions: {client.diseases}</Text> : null}
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
          Nutrition
        </Text>
        {client.mealPlans?.[0] ? (
          <Text className="text-sm text-black/60 dark:text-white/60">
            Active plan: {client.mealPlans[0].calories} kcal · P {client.mealPlans[0].proteinG}g · C{" "}
            {client.mealPlans[0].carbsG}g · F {client.mealPlans[0].fatG}g
          </Text>
        ) : (
          <Text className="text-sm text-black/50 dark:text-white/50">No active meal plan.</Text>
        )}
        <Button
          label={client.mealPlans?.[0] ? "Regenerate meal plan" : "Generate meal plan"}
          onPress={onGenerateMeal}
          loading={generatingMeal}
        />
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
          Workout
        </Text>
        {client.workoutPlans?.[0] ? (
          <Text className="text-sm text-black/60 dark:text-white/60">
            Active plan: {client.workoutPlans[0].style.replaceAll("_", " ")} ·{" "}
            {client.workoutPlans[0].daysPerWeek} days/week
          </Text>
        ) : (
          <Text className="text-sm text-black/50 dark:text-white/50">No active workout plan.</Text>
        )}
        <View className="flex-row flex-wrap gap-2">
          {STYLES.map((s) => (
            <Pressable key={s} onPress={() => setStyle(s)}>
              <Badge label={s.replaceAll("_", " ")} tone={s === style ? "volt" : "neutral"} />
            </Pressable>
          ))}
        </View>
        <Button
          label={client.workoutPlans?.[0] ? "Regenerate workout plan" : "Generate workout plan"}
          onPress={onGenerateWorkout}
          loading={generatingWorkout}
        />
      </Card>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="min-w-[40%] gap-0.5">
      <Text className="text-xs uppercase text-black/40 dark:text-white/40">{label}</Text>
      <Text className="text-sm font-medium text-ink dark:text-paper">{value}</Text>
    </View>
  );
}
