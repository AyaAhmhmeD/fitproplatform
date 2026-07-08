import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { createTrainer, getTrainers } from "@/lib/api";
import type { TrainerProfile } from "@/types";
import { Badge, Button, Card, EmptyState, ErrorView, Input, LoadingView } from "@/components/ui";

export default function AdminTrainersScreen() {
  const { t } = useTranslation();
  const [trainers, setTrainers] = useState<TrainerProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getTrainers();
      setTrainers(res.trainers);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onAdd = async () => {
    setSubmitting(true);
    try {
      await createTrainer({ name, email });
      setName("");
      setEmail("");
      setShowAdd(false);
      await load();
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!trainers && !error) return <LoadingView />;
  if (error && !trainers) return <ErrorView message={error} onRetry={load} />;

  return (
    <View className="flex-1 bg-paper dark:bg-ink p-4">
      <View className="mb-4 flex-row justify-end">
        <Button label={showAdd ? t("common.cancel") : "+ " + t("nav.trainers")} size="sm" variant="outline" onPress={() => setShowAdd((v) => !v)} />
      </View>

      {showAdd ? (
        <Card className="mb-4 gap-3">
          <Input label={t("auth.fullName")} value={name} onChangeText={setName} />
          <Input label={t("auth.email")} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Button label={t("common.save")} onPress={onAdd} loading={submitting} disabled={!name || !email} />
        </Card>
      ) : null}

      <FlatList
        data={trainers ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={<EmptyState title={t("trainerClients.empty")} />}
        renderItem={({ item }) => (
          <Card className="flex-row items-center justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-ink dark:text-paper">
                {item.user.name}
              </Text>
              <Text className="text-sm text-black/50 dark:text-white/50">{item.user.email}</Text>
              {item.specialties?.length ? (
                <Text className="text-xs text-black/40 dark:text-white/40">
                  {item.specialties.join(" · ")}
                </Text>
              ) : null}
            </View>
            <Badge label={`${item._count?.clients ?? 0}`} tone="volt" />
          </Card>
        )}
      />
    </View>
  );
}
