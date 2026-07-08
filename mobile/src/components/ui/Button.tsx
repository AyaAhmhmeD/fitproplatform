import React from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-volt active:bg-volt-dark",
  secondary: "bg-ink-surface dark:bg-white/10",
  outline: "bg-transparent border border-black/15 dark:border-white/20",
  ghost: "bg-transparent",
};

const VARIANT_TEXT_CLASSES: Record<Variant, string> = {
  primary: "text-ink font-semibold",
  secondary: "text-ink dark:text-paper font-semibold",
  outline: "text-ink dark:text-paper font-semibold",
  ghost: "text-volt-dark dark:text-volt font-semibold",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3.5",
  lg: "px-8 py-4",
};

const TEXT_SIZE_CLASSES: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/** Rounded-full pill button matching the FitPro "obsidian & volt" brand. */
export function Button({
  label,
  variant = "primary",
  size = "md",
  loading,
  icon,
  disabled,
  className = "",
  ...pressableProps
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 rounded-full ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className}`}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#0a0b11" : "#8fef22"} />
      ) : (
        <>
          {icon}
          <Text className={`${VARIANT_TEXT_CLASSES[variant]} ${TEXT_SIZE_CLASSES[size]}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
