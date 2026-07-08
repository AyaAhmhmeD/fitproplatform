import "../global.css";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { LocaleProvider } from "@/contexts/locale-context";
import { AuthProvider } from "@/contexts/auth-context";

function RootNavigator() {
  const { mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="trainer" />
        <Stack.Screen name="client" />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            presentation: "modal",
            title: "Notifications",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
