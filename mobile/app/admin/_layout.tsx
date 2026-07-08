import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/RequireRole";
import { useTabScreenOptions } from "@/hooks/useTabScreenOptions";
import { ScreenHeaderBell } from "@/components/ui";

export default function AdminLayout() {
  const { t } = useTranslation();
  const tabOptions = useTabScreenOptions();

  return (
    <RequireRole role="ADMIN">
      <Tabs screenOptions={{ ...tabOptions, headerRight: () => <ScreenHeaderBell /> }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t("nav.overview"),
            tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="trainers"
          options={{
            title: t("nav.trainers"),
            tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="clients"
          options={{
            title: t("nav.clients"),
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: t("nav.reports"),
            tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
          }}
        />
      </Tabs>
    </RequireRole>
  );
}
