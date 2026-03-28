import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { getAssistantReply, loadAssistantContext } from "@/utils/aiAssistant";
import humanizeError from "@/utils/humanizeError";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const STARTERS = [
  "Jobs near me",
  "Food near me",
  "Show urgent jobs",
  "Cheap meals nearby",
];

export default function AssistantTab() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Kabayan AI is ready. Ask about open jobs, store items, or what is near your saved location.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loadingContext, setLoadingContext] = useState(true);
  const [sending, setSending] = useState(false);
  const [context, setContext] = useState<Awaited<ReturnType<typeof loadAssistantContext>> | null>(null);

  const refreshContext = useCallback(async () => {
    setLoadingContext(true);
    try {
      const nextContext = await loadAssistantContext();
      setContext(nextContext);
    } finally {
      setLoadingContext(false);
    }
  }, []);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  const stats = useMemo(() => {
    return {
      jobs: context?.jobs.filter((job) => job.status === "open").length ?? 0,
      listings: context?.listings.filter((listing) => listing.is_open).length ?? 0,
      location: context?.userLocation ?? "No saved location",
    };
  }, [context]);

  const sendMessage = useCallback(
    async (preset?: string) => {
      const text = (preset ?? input).trim();
      if (!text || sending) return;

      setMessages((prev) => [...prev, { id: `${Date.now()}-user`, role: "user", text }]);
      setInput("");
      setSending(true);

      try {
        const liveContext = context ?? (await loadAssistantContext());
        if (!context) setContext(liveContext);
        const reply = await getAssistantReply(text, liveContext);
        setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: "assistant", text: reply }]);
      } catch (err) {
        const reply = humanizeError(err, "The assistant could not answer right now.");
        setMessages((prev) => [...prev, { id: `${Date.now()}-assistant-error`, role: "assistant", text: reply }]);
      } finally {
        setSending(false);
      }
    },
    [context, input, sending]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 18 : 12}
      style={{ flex: 1 }}
      className={`flex-1 ${t.bgPage}`}
    >
      <View className={`px-5 pt-4 pb-4 border-b ${t.border} ${t.bgCard}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center">
              <MaterialCommunityIcons name="robot-excited-outline" size={24} color="#FFFFFF" />
            </View>
            <View className="ml-3">
              <Text className={`text-xl font-black ${t.text}`}>Kabayan AI</Text>
              <Text className={`text-xs font-semibold ${t.textMuted}`}>Jobs, stores, and nearby help</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={refreshContext}
            className={`h-11 w-11 rounded-2xl border items-center justify-center ${t.border} ${t.bgSurface}`}
          >
            <Ionicons name="refresh" size={18} color={t.icon} />
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row gap-3">
          <StatPill label="Open Jobs" value={`${stats.jobs}`} />
          <StatPill label="Store Items" value={`${stats.listings}`} />
        </View>
        <View className={`mt-3 rounded-2xl px-4 py-3 ${t.bgSurface}`}>
          <Text className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>Saved Location</Text>
          <Text className={`mt-1 text-sm font-semibold ${t.text}`}>{stats.location}</Text>
        </View>
      </View>

      {loadingContext ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className={`mt-2 ${t.textMuted}`}>Loading AI context…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        >
          <View className="flex-row flex-wrap gap-2 mb-4">
            {STARTERS.map((starter) => (
              <TouchableOpacity
                key={starter}
                onPress={() => sendMessage(starter)}
                className={`rounded-full px-4 py-2 ${t.bgCard} border ${t.border}`}
              >
                <Text className={`text-[11px] font-black uppercase tracking-widest ${t.text}`}>{starter}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {messages.map((message) => (
            <View key={message.id} className={`mb-4 flex-row ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <View
                className={`max-w-[82%] rounded-[24px] px-4 py-3 ${
                  message.role === "user" ? "bg-blue-600 rounded-tr-none" : `${t.bgCard} border ${t.border} rounded-tl-none`
                }`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${message.role === "user" ? "text-blue-200" : t.textMuted}`}>
                  {message.role === "user" ? "You" : "Kabayan AI"}
                </Text>
                <Text className={`mt-2 text-sm leading-6 ${message.role === "user" ? "text-white" : t.text}`}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          <View className={`rounded-[28px] border p-4 ${t.border} ${t.bgCard}`}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-sm font-black ${t.text}`}>Voice Assistant</Text>
                <Text className={`mt-1 text-xs ${t.textMuted}`}>Agora voice mode needs your secure token service and app ID configuration.</Text>
              </View>
              <View className="h-12 w-12 rounded-2xl bg-slate-100 items-center justify-center">
                <MaterialCommunityIcons name="microphone-outline" size={22} color="#64748B" />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <View
        className={`border-t px-4 pt-3 ${t.border} ${t.bgCard}`}
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <View className={`flex-row items-end rounded-[24px] border px-4 ${t.border} ${t.bgSurface}`}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about jobs, store items, or what is near you…"
            placeholderTextColor={t.icon}
            className={`flex-1 py-4 text-sm ${t.text}`}
            multiline
            textAlignVertical="top"
            style={{ maxHeight: 120 }}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || sending}
            className={`mb-3 ml-3 h-10 w-10 rounded-full items-center justify-center ${
              !input.trim() || sending ? "bg-slate-300" : "bg-blue-600"
            }`}
          >
            {sending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name="arrow-up" size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-blue-50 px-4 py-3">
      <Text className="text-[10px] font-black uppercase tracking-widest text-blue-700">{label}</Text>
      <Text className="mt-1 text-lg font-black text-blue-900">{value}</Text>
    </View>
  );
}
