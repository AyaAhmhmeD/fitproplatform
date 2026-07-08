import React from "react";
import { ActivityIndicator, View } from "react-native";

export function LoadingView() {
  return (
    <View className="flex-1 items-center justify-center bg-paper dark:bg-ink">
      <ActivityIndicator size="large" color="#8fef22" />
    </View>
  );
}
