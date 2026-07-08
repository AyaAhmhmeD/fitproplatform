import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTabScreenOptions } from "@/hooks/useTabScreenOptions";
import { ScreenHeaderBell } from "@/components/ui";

export default function TrainerTabsLayout() {
  const { t } = useTranslation();
  const tabOptions = useTabScreenOptions();

  return (
    <Tabs screenOptions={{ ...tabOptions, headerRight: () => <ScreenHeaderBell /> }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.clients"),
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: t("nav.exercises"),
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile"),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
