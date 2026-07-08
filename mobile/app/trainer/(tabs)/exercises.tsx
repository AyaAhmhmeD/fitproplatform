import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getExercises } from "@/lib/api";
import type { Exercise } from "@/types";
import { Badge, Card, EmptyState, ErrorView, Input, LoadingView } from "@/components/ui";

export default function TrainerExercisesScreen() {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async (q?: string) => {
    setError(null);
    try {
      const res = await getExercises({ q });
      setExercises(res.exercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!exercises && !error) return <LoadingView />;
  if (error && !exercises) return <ErrorView message={error} onRetry={() => load(search)} />;

  return (
    <View className="flex-1 bg-paper dark:bg-ink p-4">
      <Input
        placeholder="Search exercises"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => load(search)}
        className="mb-4"
      />
      <FlatList
        data={exercises ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={<EmptyState title="No exercises found." />}
        renderItem={({ item }) => (
          <Card className="gap-1">
            <Text className="text-base font-semibold text-ink dark:text-paper">{item.name}</Text>
            <View className="flex-row flex-wrap gap-2">
              <Badge label={item.muscleGroup} tone="neutral" />
              <Badge label={item.difficulty} tone="volt" />
              <Badge label={item.equipment} tone="neutral" />
            </View>
            <Text className="text-sm text-black/60 dark:text-white/60" numberOfLines={2}>
              {item.instructions}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}
