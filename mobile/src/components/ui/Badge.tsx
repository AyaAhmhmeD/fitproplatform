import React from "react";
import { Text, View } from "react-native";

type Tone = "volt" | "neutral" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  volt: "bg-volt/15 border-volt/40",
  neutral: "bg-black/5 border-black/10 dark:bg-white/10 dark:border-white/10",
  warning: "bg-amber-500/15 border-amber-500/40",
  danger: "bg-red-500/15 border-red-500/40",
};

const TONE_TEXT_CLASSES: Record<Tone, string> = {
  volt: "text-volt-dark dark:text-volt",
  neutral: "text-black/70 dark:text-white/70",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <View className={`self-start rounded-full border px-3 py-1 ${TONE_CLASSES[tone]}`}>
      <Text className={`text-xs font-medium ${TONE_TEXT_CLASSES[tone]}`}>{label}</Text>
    </View>
  );
}
