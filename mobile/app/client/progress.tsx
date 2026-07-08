import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useMyClient } from "@/hooks/useMyClient";
import { postPhoto } from "@/lib/api";
import { Button, Card, EmptyState, ErrorView, LoadingView } from "@/components/ui";
import { TrendChart } from "@/components/charts/TrendChart";

export default function ClientProgressScreen() {
  const { t } = useTranslation();
  const { client, loading, error, reload } = useMyClient();
  const [uploading, setUploading] = useState(false);

  if (loading) return <LoadingView />;
  if (error || !client) return <ErrorView message={error ?? undefined} onRetry={reload} />;

  const measurements = client.measurements ?? [];
  const weightPoints = measurements
    .filter((m) => m.weightKg != null)
    .map((m) => ({ label: m.date, value: m.weightKg as number }));
  const bodyFatPoints = measurements
    .filter((m) => m.bodyFatPct != null)
    .map((m) => ({ label: m.date, value: m.bodyFatPct as number }));

  const onAddPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("common.error"), "Photo library permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      await postPhoto({
        uri: asset.uri,
        fileName: asset.fileName ?? `progress-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
        angle: "FRONT",
      });
      await reload();
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="gap-4 p-4">
      <Card className="gap-2">
        <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
          {t("progress.weightTrend")}
        </Text>
        {weightPoints.length > 1 ? (
          <TrendChart points={weightPoints} unit=" kg" />
        ) : (
          <Text className="text-sm text-black/50 dark:text-white/50">{t("progress.noData")}</Text>
        )}
      </Card>

      <Card className="gap-2">
        <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
          {t("progress.bodyFatTrend")}
        </Text>
        {bodyFatPoints.length > 1 ? (
          <TrendChart points={bodyFatPoints} color="#57ab09" unit=" %" />
        ) : (
          <Text className="text-sm text-black/50 dark:text-white/50">{t("progress.noData")}</Text>
        )}
      </Card>

      <Button label={t("progress.addPhoto")} onPress={onAddPhoto} loading={uploading} />

      <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
        {t("progress.photos")}
      </Text>
      {client.progressPhotos && client.progressPhotos.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {client.progressPhotos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.url }}
              className="h-28 w-28 rounded-2xl"
              resizeMode="cover"
            />
          ))}
        </View>
      ) : (
        <EmptyState title={t("progress.noData")} />
      )}
    </ScrollView>
  );
}
