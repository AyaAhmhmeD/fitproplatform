import React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

/** Base surface: rounded corners, soft border, subtle shadow, theme-aware bg. */
export function Card({ className = "", style, children, ...rest }: CardProps) {
  return (
    <View
      className={`rounded-3xl border border-black/5 bg-paper-surface p-4 dark:border-white/10 dark:bg-ink-surface ${className}`}
      style={[
        {
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
