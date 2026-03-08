import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

const categories = [
  { id: "1", label: "General", threads: 12 },
  { id: "2", label: "Jobs & Gigs", threads: 8 },
  { id: "3", label: "Food & Market", threads: 5 },
];

const threads = [
  { id: "a", title: "Best plumbers in Quezon City?", replies: 14 },
  { id: "b", title: "Where to source fresh chicken bulk?", replies: 7 },
  { id: "c", title: "Permit process timeline", replies: 11 },
];

export default function ForumScreen() {
  const { t } = useTheme();

  return (
    <View className={`flex-1 ${t.bgPage} p-5`}>
      <Text className={`text-2xl font-black mb-4 ${t.text}`}>Community Forum</Text>

      <ScrollView className={`rounded-3xl ${t.bgCard} border ${t.border}`} contentContainerStyle={{ padding: 16 }}>
        <Text className={`text-xs font-bold uppercase tracking-[2px] mb-2 ${t.textMuted}`}>Categories</Text>
        {categories.map((cat, idx) => (
          <View key={cat.id} className={`flex-row justify-between items-center py-3 ${idx < categories.length - 1 ? `border-b ${t.border}` : ""}`}>
            <Text className={`font-bold ${t.text}`}>{cat.label}</Text>
            <Text className={`text-xs ${t.textMuted}`}>{cat.threads} threads</Text>
          </View>
        ))}

        <Text className={`text-xs font-bold uppercase tracking-[2px] mt-6 mb-2 ${t.textMuted}`}>Latest</Text>
        {threads.map((tItem, idx) => (
          <TouchableOpacity key={tItem.id} className={`py-3 ${idx < threads.length - 1 ? `border-b ${t.border}` : ""}`}>
            <Text className={`font-semibold ${t.text}`}>{tItem.title}</Text>
            <View className="flex-row items-center mt-1">
              <Feather name="message-circle" size={12} color={t.icon} />
              <Text className={`text-xs ml-1 ${t.textMuted}`}>{tItem.replies} replies</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
