import React from "react";
import { Text, View } from "react-native";

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="items-center justify-center gap-1 rounded-3xl border border-dashed border-black/10 p-8 dark:border-white/15">
      <Text className="text-center text-base font-semibold text-ink dark:text-paper">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-center text-sm text-black/50 dark:text-white/50">{subtitle}</Text>
      ) : null}
    </View>
  );
}
