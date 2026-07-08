import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { LoadingView } from "@/components/ui";

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingView />;
  // Already signed in — bounce back to the role router instead of showing
  // login/register again (e.g. deep link to /login while a session exists).
  if (session) return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
