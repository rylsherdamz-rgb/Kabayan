import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";

const SAMPLE_TRANSCRIPTS = [
  "Looking for open jobs near your location.",
  "I found 6 open jobs and 9 store items nearby.",
  "You can ask me to compare pay, distance, or store prices.",
];

export default function AssistantLivePage() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);

  const statusLine = useMemo(() => {
    if (isMuted) return "Microphone muted";
    if (isSpeaking) return "Listening live";
    return "Paused";
  }, [isMuted, isSpeaking]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 12 : 0}
      className={`flex-1 ${t.bgPage}`}
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-5" style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 18 }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`h-12 w-12 items-center justify-center rounded-2xl border ${t.border} ${t.bgCard}`}
          >
            <Feather name="arrow-left" size={20} color={t.icon} />
          </TouchableOpacity>
          <View className="items-center">
            <Text className={`text-lg font-black ${t.text}`}>Kabayan Live</Text>
            <Text className={`mt-1 text-xs font-semibold ${t.textMuted}`}>{statusLine}</Text>
          </View>
          <TouchableOpacity className={`h-12 w-12 items-center justify-center rounded-2xl border ${t.border} ${t.bgCard}`}>
            <Feather name="more-horizontal" size={20} color={t.icon} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="h-64 w-64 items-center justify-center rounded-full bg-blue-50">
              <View className="h-52 w-52 items-center justify-center rounded-full bg-blue-100">
                <View className="h-40 w-40 items-center justify-center rounded-full bg-blue-200">
                  <View className="h-28 w-28 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                    <MaterialCommunityIcons name="waveform" size={42} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </View>
            <Text className={`mt-8 text-2xl font-black ${t.text}`}>Talk naturally</Text>
            <Text className={`mt-3 max-w-[280px] text-center text-sm leading-6 ${t.textMuted}`}>
              Ask about nearby jobs, store items, pricing, or what matches your saved location.
            </Text>
          </View>
        </View>

        <View className={`rounded-[32px] border p-5 ${t.border} ${t.bgCard}`}>
          <Text className={`text-[11px] font-black uppercase tracking-[2px] ${t.textMuted}`}>Live transcript</Text>
          <View className="mt-4 gap-3">
            {SAMPLE_TRANSCRIPTS.map((line, index) => (
              <View
                key={line}
                className={`rounded-2xl px-4 py-3 ${index === SAMPLE_TRANSCRIPTS.length - 1 ? "bg-blue-600" : "bg-slate-100"}`}
              >
                <Text className={`text-sm leading-6 ${index === SAMPLE_TRANSCRIPTS.length - 1 ? "text-white" : t.text}`}>
                  {line}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-5 flex-row items-center justify-center gap-4">
            <TouchableOpacity
              onPress={() => setIsMuted((value) => !value)}
              className={`h-14 w-14 items-center justify-center rounded-full border ${t.border} ${t.bgPage}`}
            >
              <Feather name={isMuted ? "mic-off" : "mic"} size={20} color={t.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsSpeaking((value) => !value)}
              className="h-16 w-16 items-center justify-center rounded-full bg-blue-600"
            >
              <MaterialCommunityIcons name={isSpeaking ? "pause" : "play"} size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-14 w-14 items-center justify-center rounded-full bg-red-500"
            >
              <MaterialCommunityIcons name="phone-hangup-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
