import React, { useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { generateExcelReport } from "@/lib/api";
import { Button, Card } from "@/components/ui";

export default function AdminReportsScreen() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<"analytics" | "overview" | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  const run = async (kind: "analytics" | "overview") => {
    setBusy(kind);
    try {
      const res = await generateExcelReport({ kind: kind === "analytics" ? "analytics" : "progress" });
      setLastUrl(res.url);
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="gap-4 p-4">
      <Card className="gap-3">
        <Text className="text-base font-semibold text-ink dark:text-paper">
          Platform analytics (Excel)
        </Text>
        <Text className="text-sm text-black/50 dark:text-white/50">
          Client counts, trainer counts, active subscriptions, attendance rate, revenue and goal
          breakdown across the whole platform.
        </Text>
        <Button
          label={t("common.generate")}
          onPress={() => run("analytics")}
          loading={busy === "analytics"}
        />
      </Card>

      <Card className="gap-3">
        <Text className="text-base font-semibold text-ink dark:text-paper">
          Full client roster (Excel)
        </Text>
        <Text className="text-sm text-black/50 dark:text-white/50">
          Every client with goal, trainer, subscription status and latest weight/BMI.
        </Text>
        <Button
          label={t("common.generate")}
          variant="outline"
          onPress={() => run("overview")}
          loading={busy === "overview"}
        />
      </Card>

      {lastUrl ? (
        <Card className="gap-2">
          <Text className="text-sm font-medium text-ink dark:text-paper">Latest report ready</Text>
          <Button label="Open report" size="sm" onPress={() => Linking.openURL(lastUrl)} />
        </Card>
      ) : null}
    </ScrollView>
  );
}
