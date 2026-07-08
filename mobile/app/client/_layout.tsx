import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/RequireRole";
import { useTabScreenOptions } from "@/hooks/useTabScreenOptions";
import { ScreenHeaderBell } from "@/components/ui";

export default function ClientLayout() {
  const { t } = useTranslation();
  const tabOptions = useTabScreenOptions();

  return (
    <RequireRole role="CLIENT">
      <Tabs screenOptions={{ ...tabOptions, headerRight: () => <ScreenHeaderBell /> }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t("nav.dashboard"),
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: t("nav.nutrition"),
            tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: t("nav.workouts"),
            tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: t("nav.progress"),
            tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} />,
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
    </RequireRole>
  );
}
