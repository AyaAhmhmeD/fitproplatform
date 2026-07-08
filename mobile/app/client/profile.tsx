import React from "react";
import { ScrollView, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useMyClient } from "@/hooks/useMyClient";
import { ProfileSettings } from "@/components/ProfileSettings";
import { Badge, Card } from "@/components/ui";

export default function ClientProfileScreen() {
  const { t } = useTranslation();
  const { client } = useMyClient();

  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="p-4">
      <ProfileSettings>
        {client ? (
          <Card className="gap-2">
            <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
              {t("trainerClients.intake")}
            </Text>
            <Badge label={client.subscriptionStatus} tone="volt" />
            <Text className="text-sm text-black/60 dark:text-white/60">
              Goal: {client.goal.replaceAll("_", " ")}
            </Text>
            {client.trainer ? (
              <Text className="text-sm text-black/60 dark:text-white/60">
                Trainer: {client.trainer.user.name}
              </Text>
            ) : null}
          </Card>
        ) : null}
      </ProfileSettings>
    </ScrollView>
  );
}
