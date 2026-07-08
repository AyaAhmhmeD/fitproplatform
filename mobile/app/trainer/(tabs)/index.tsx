import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { getClients } from "@/lib/api";
import type { ClientProfile } from "@/types";
import { EmptyState, ErrorView, Input, LoadingView } from "@/components/ui";
import { ClientListItem } from "@/components/ClientListItem";

export default function TrainerClientsScreen() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q?: string) => {
    setError(null);
    try {
      const res = await getClients(q);
      setClients(res.clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(search);
    setRefreshing(false);
  };

  if (!clients && !error) return <LoadingView />;
  if (error && !clients) return <ErrorView message={error} onRetry={() => load(search)} />;

  return (
    <View className="flex-1 bg-paper dark:bg-ink p-4">
      <Input
        placeholder={t("trainerClients.search")}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => load(search)}
        className="mb-4"
      />
      <FlatList
        data={clients ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8fef22" />}
        ListEmptyComponent={<EmptyState title={t("trainerClients.empty")} />}
        renderItem={({ item }) => (
          <ClientListItem client={item} onPress={() => router.push(`/trainer/client/${item.id}`)} />
        )}
      />
    </View>
  );
}
