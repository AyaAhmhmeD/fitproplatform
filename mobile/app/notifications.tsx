import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getNotifications, markAllNotificationsRead } from "@/lib/api";
import type { AppNotification } from "@/types";
import { Badge, Button, Card, EmptyState, ErrorView, LoadingView } from "@/components/ui";

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onMarkAllRead = async () => {
    setMarking(true);
    try {
      await markAllNotificationsRead();
      await load();
    } finally {
      setMarking(false);
    }
  };

  if (!notifications && !error) return <LoadingView />;
  if (error && !notifications) return <ErrorView message={error} onRetry={load} />;

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <View className="flex-1 bg-paper dark:bg-ink p-4">
      {unreadCount > 0 ? (
        <View className="mb-4 flex-row justify-end">
          <Button
            label={t("notifications.markAllRead")}
            size="sm"
            variant="outline"
            onPress={onMarkAllRead}
            loading={marking}
          />
        </View>
      ) : null}
      <FlatList
        data={notifications ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<EmptyState title={t("notifications.empty")} />}
        renderItem={({ item }) => (
          <Card className={`gap-1 ${item.read ? "" : "border-volt/50"}`}>
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-sm font-semibold text-ink dark:text-paper">
                {item.title}
              </Text>
              {!item.read ? <Badge label="new" tone="volt" /> : null}
            </View>
            <Text className="text-sm text-black/60 dark:text-white/60">{item.body}</Text>
            <Text className="text-xs text-black/40 dark:text-white/40">
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}
