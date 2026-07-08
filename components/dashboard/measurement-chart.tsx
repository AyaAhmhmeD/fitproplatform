"use client";

import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface MeasurementPoint {
  date: string;
  weightKg?: number | null;
  bodyFatPct?: number | null;
  muscleMassKg?: number | null;
}

export function MeasurementChart({ data }: { data: MeasurementPoint[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#1f232f" : "#d4d8e1";
  const textColor = isDark ? "#7c869e" : "#5c6580";

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-400">
        No measurements logged yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" stroke={textColor} fontSize={12} tickLine={false} />
        <YAxis stroke={textColor} fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: isDark ? "#14161f" : "#ffffff",
            border: `1px solid ${gridColor}`,
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="#8fef22" strokeWidth={2} dot={false} />
        <Line
          type="monotone"
          dataKey="bodyFatPct"
          name="Body Fat (%)"
          stroke="#f2cd7a"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="muscleMassKg"
          name="Muscle Mass (kg)"
          stroke="#5c6580"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
