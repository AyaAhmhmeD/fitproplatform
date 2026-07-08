import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...rest }: InputProps) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm font-medium text-black/70 dark:text-white/70">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor="#8b8f9c"
        className={`rounded-2xl border border-black/10 bg-paper-surface px-4 py-3.5 text-base text-ink dark:border-white/10 dark:bg-ink-surface dark:text-paper ${className}`}
        {...rest}
      />
      {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
