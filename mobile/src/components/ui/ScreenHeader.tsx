import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/contexts/theme-context";

/**
 * Shared header for tab-root screens: title on one side, a notifications
 * bell on the other (per spec: "a bell icon in each tab layout's header").
 * Used via each `_layout.tsx`'s `headerRight` / `headerTitle` options, or
 * directly at the top of a screen when a stack header is hidden.
 */
export function ScreenHeaderBell() {
  const { mode } = useTheme();
  return (
    <Pressable
      accessibilityLabel="Notifications"
      onPress={() => router.push("/notifications")}
      hitSlop={12}
      className="mr-1 h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
    >
      <Ionicons name="notifications-outline" size={18} color={mode === "dark" ? "#f6f7f9" : "#0a0b11"} />
    </Pressable>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View>
      <Text className="text-2xl font-bold text-ink dark:text-paper">{title}</Text>
      {subtitle ? (
        <Text className="text-sm text-black/50 dark:text-white/50">{subtitle}</Text>
      ) : null}
    </View>
  );
}
