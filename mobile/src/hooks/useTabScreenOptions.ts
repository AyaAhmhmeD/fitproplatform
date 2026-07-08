import { useTheme, brandColors } from "@/contexts/theme-context";

/** Shared look for every role's bottom tab navigator. */
export function useTabScreenOptions() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return {
    headerShown: true,
    headerStyle: {
      backgroundColor: isDark ? brandColors.inkBg : brandColors.paperBg,
    },
    headerShadowVisible: false,
    headerTitleStyle: {
      color: isDark ? brandColors.paperBg : brandColors.inkBg,
      fontWeight: "700" as const,
    },
    tabBarActiveTintColor: brandColors.volt,
    tabBarInactiveTintColor: isDark ? "#8b8f9c" : "#6b7280",
    tabBarStyle: {
      backgroundColor: isDark ? brandColors.inkSurface : brandColors.paperSurface,
      borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" as const },
  };
}
