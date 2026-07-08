import React from "react";
import { ScrollView } from "react-native";
import { ProfileSettings } from "@/components/ProfileSettings";

export default function TrainerProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-paper dark:bg-ink" contentContainerClassName="p-4">
      <ProfileSettings />
    </ScrollView>
  );
}
