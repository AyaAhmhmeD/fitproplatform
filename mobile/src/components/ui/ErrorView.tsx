import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

export function ErrorView({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-paper p-6 dark:bg-ink">
      <Text className="text-center text-base font-semibold text-ink dark:text-paper">
        {message ?? t("common.error")}
      </Text>
      {onRetry ? <Button label={t("common.retry")} onPress={onRetry} size="sm" /> : null}
    </View>
  );
}
