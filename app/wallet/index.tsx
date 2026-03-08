import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export default function WalletScreen() {
  const { t } = useTheme();

  const actions = [
    { label: "Add Funds", icon: "plus-circle" },
    { label: "Withdraw", icon: "arrow-down-circle" },
    { label: "History", icon: "clock" },
  ];

  const transactions = [
    { id: "1", title: "Job Payout", amount: "+₱1,500", time: "Today" },
    { id: "2", title: "Order Payment", amount: "-₱320", time: "Yesterday" },
    { id: "3", title: "Top Up", amount: "+₱1,000", time: "Mar 4" },
  ];

  return (
    <View className={`flex-1 ${t.bgPage} p-5`}>
      <View className={`p-5 rounded-3xl ${t.bgCard} border ${t.border} shadow-sm`}>
        <Text className={`text-xs font-bold uppercase tracking-[2px] ${t.textMuted}`}>Available Balance</Text>
        <Text className={`text-3xl font-black mt-2 ${t.text}`}>₱5,420.00</Text>
        <View className="flex-row mt-4 gap-3">
          {actions.map((a) => (
            <TouchableOpacity key={a.label} className={`flex-1 py-3 rounded-2xl ${t.bgSurface} border ${t.border} items-center`}>
              <Feather name={a.icon as any} size={18} color={t.accent} />
              <Text className={`mt-1 font-semibold ${t.text}`}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text className={`mt-6 mb-2 text-sm font-black ${t.text}`}>Recent Activity</Text>
      <ScrollView className={`rounded-3xl ${t.bgCard} border ${t.border}`}>
        {transactions.map((tx, idx) => (
          <View
            key={tx.id}
            className={`flex-row justify-between items-center p-4 ${idx < transactions.length - 1 ? `border-b ${t.border}` : ""}`}
          >
            <View>
              <Text className={`font-bold ${t.text}`}>{tx.title}</Text>
              <Text className={`text-xs ${t.textMuted}`}>{tx.time}</Text>
            </View>
            <Text className={`font-black ${tx.amount.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>
              {tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
