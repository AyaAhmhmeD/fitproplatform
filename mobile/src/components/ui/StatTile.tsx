import React from "react";
import { Text, View } from "react-native";
import { Card } from "./Card";

interface StatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
}

/** Small metric tile used across dashboards (weight, calories, macros, KPIs...). */
export function StatTile({ label, value, unit, accent }: StatTileProps) {
  return (
    <Card className="min-w-[46%] flex-1 gap-1">
      <Text className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
        {label}
      </Text>
      <View className="flex-row items-baseline gap-1">
        <Text
          className={`text-2xl font-bold ${
            accent ? "text-volt-dark dark:text-volt" : "text-ink dark:text-paper"
          }`}
        >
          {value}
        </Text>
        {unit ? (
          <Text className="text-sm font-medium text-black/40 dark:text-white/40">{unit}</Text>
        ) : null}
      </View>
    </Card>
  );
}
