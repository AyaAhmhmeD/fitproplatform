import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getAttendance, getClients, getTrainers } from "@/lib/api";
import { StatTile, ErrorView, LoadingView } from "@/components/ui";

interface Overview {
  totalClients: number;
  totalTrainers: number;
  activeSubscriptions: number;
  attendanceRate: number;
}

/**
 * KNOWN GAP: there's no single `/api/admin/overview` aggregate endpoint, so
 * this composes three existing calls client-side (`GET /api/clients`,
 * `GET /api/trainers`, `GET /api/attendance` with no clientId — which the
 * backend already special-cases to return an org-wide `{ rate, total,
 * present }` for ADMIN/TRAINER callers). Fine at today's scale; a dedicated
 * endpoint would be a good backend addition if this grows more KPIs.
 */
export default function AdminOverviewScreen() {
  const { t } = useTranslation();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [clientsRes, trainersRes, attendanceRes] = await Promise.all([
        getClients(),
        getTrainers(),
        getAttendance(),
      ]);
      const activeSubscriptions = clientsRes.clients.filter(
        (c) => c.subscriptionStatus === "ACTIVE",
      ).length;
      const rate = "rate" in attendanceRes ? attendanceRes.rate : 0;

      setData({
        totalClients: clientsRes.clients.length,
        totalTrainers: trainersRes.trainers.length,
        activeSubscriptions,
        attendanceRate: rate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data && !error) return <LoadingView />;
  if (error && !data) return <ErrorView message={error} onRetry={load} />;

  return (
    <ScrollView
      className="flex-1 bg-paper dark:bg-ink"
      contentContainerClassName="gap-4 p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8fef22" />}
    >
      <View className="flex-row flex-wrap gap-4">
        <StatTile label={t("admin.totalClients")} value={data?.totalClients ?? 0} accent />
        <StatTile label={t("admin.totalTrainers")} value={data?.totalTrainers ?? 0} />
        <StatTile label={t("admin.activeSubscriptions")} value={data?.activeSubscriptions ?? 0} />
        <StatTile
          label={t("admin.attendanceRate")}
          value={data?.attendanceRate ?? 0}
          unit="%"
        />
      </View>
    </ScrollView>
  );
}
