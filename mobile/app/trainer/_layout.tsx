import React from "react";
import { Stack } from "expo-router";
import { RequireRole } from "@/components/RequireRole";

export default function TrainerLayout() {
  return (
    <RequireRole role="TRAINER">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="client/[id]" options={{ headerShown: true, title: "" }} />
      </Stack>
    </RequireRole>
  );
}
