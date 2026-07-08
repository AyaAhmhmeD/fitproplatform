import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  points: TrendPoint[];
  color?: string;
  height?: number;
  unit?: string;
}

/**
 * Minimal hand-rolled line chart (react-native-svg) — deliberately simple:
 * no pan/zoom/tooltips, just a readable trend line for weight / body-fat
 * history. Keeps the dependency footprint small vs. a full charting lib.
 */
export function TrendChart({ points, color = "#8fef22", height = 160, unit }: TrendChartProps) {
  const width = 320;
  const padding = 24;

  if (points.length === 0) {
    return null;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = padding + i * step;
    const y = padding + (1 - (p.value - min) / range) * (height - padding * 2);
    return { x, y, value: p.value, label: p.label };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#8b8f9c"
          strokeOpacity={0.2}
          strokeWidth={1}
        />
        <Polyline points={polylinePoints} fill="none" stroke={color} strokeWidth={3} />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={4} fill={color} />
        ))}
      </Svg>
      <View className="mt-1 flex-row justify-between">
        <Text className="text-xs text-black/40 dark:text-white/40">
          {min.toFixed(1)}
          {unit}
        </Text>
        <Text className="text-xs text-black/40 dark:text-white/40">
          {max.toFixed(1)}
          {unit}
        </Text>
      </View>
    </View>
  );
}
