import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

const faqs = [
  { q: "How to verify my account?", a: "Upload your permits and IDs in the verification section." },
  { q: "How to withdraw earnings?", a: "Open Wallet > Withdraw, choose your payout method." },
];

export default function SupportScreen() {
  const { t } = useTheme();

  return (
    <View className={`flex-1 ${t.bgPage} p-5`}>
      <Text className={`text-2xl font-black mb-4 ${t.text}`}>Help & Support</Text>

      <View className={`rounded-3xl ${t.bgCard} border ${t.border} p-5 gap-4`}>
        {faqs.map((item, idx) => (
          <View key={idx} className={`pb-4 ${idx < faqs.length - 1 ? `border-b ${t.border}` : ""}`}>
            <Text className={`font-bold ${t.text}`}>{item.q}</Text>
            <Text className={`mt-1 text-sm ${t.textMuted}`}>{item.a}</Text>
          </View>
        ))}
      </View>

      <View className="mt-5 gap-3">
        <TouchableOpacity className="flex-row items-center justify-between p-4 rounded-2xl bg-blue-600">
          <Text className="text-white font-black">Chat with Support</Text>
          <Feather name="message-circle" size={18} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className={`flex-row items-center justify-between p-4 rounded-2xl ${t.bgCard} border ${t.border}`}>
          <Text className={`font-black ${t.text}`}>Email us</Text>
          <MaterialIcons name="email" size={18} color={t.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
