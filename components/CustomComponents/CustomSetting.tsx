import { Ionicons, Feather } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";


export default function SettingButton({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
      activeOpacity={0.85}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color="#2563eb" />
        <Text className="ml-3 text-base font-semibold text-slate-900">{label}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}
