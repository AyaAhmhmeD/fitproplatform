import React from "react";
import { Pressable, Text, View } from "react-native";
import { Badge, Card } from "@/components/ui";
import type { ClientProfile } from "@/types";

const SUBSCRIPTION_TONE: Record<ClientProfile["subscriptionStatus"], "volt" | "neutral" | "warning" | "danger"> = {
  ACTIVE: "volt",
  TRIAL: "neutral",
  EXPIRED: "warning",
  CANCELLED: "danger",
};

export function ClientListItem({ client, onPress }: { client: ClientProfile; onPress?: () => void }) {
  const latest = client.measurements?.[0];
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper onPress={onPress}>
      <Card className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-ink dark:text-paper">
            {client.user.name}
          </Text>
          <Text className="text-sm text-black/50 dark:text-white/50">{client.user.email}</Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            <Badge label={client.goal.replaceAll("_", " ")} tone="neutral" />
            <Badge label={client.subscriptionStatus} tone={SUBSCRIPTION_TONE[client.subscriptionStatus]} />
          </View>
        </View>
        {latest?.weightKg ? (
          <View className="items-end">
            <Text className="text-lg font-bold text-ink dark:text-paper">
              {latest.weightKg}
              <Text className="text-xs font-normal"> kg</Text>
            </Text>
          </View>
        ) : null}
      </Card>
    </Wrapper>
  );
}
