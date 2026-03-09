import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Modal, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { LegendList } from "@legendapp/list";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import AuthenticationForm from "@/components/Auth/AuthenticationForm";

type Conversation = {
  roomId: string;
  lastMsg: string;
  lastSenderId: string | null;
  lastTime: string | null;
  otherUserId: string | null;
  otherDisplayName: string;
  otherAvatarUrl: string | null;
  jobId: string | null;
  jobTitle: string | null;
};

export default function Inbox() {
  const { t } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async (targetUserId?: string | null) => {
    const resolvedUserId = targetUserId ?? userId;
    if (!resolvedUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabaseClient.rpc("rpc_get_conversation_threads_for_user", {
      p_user_id: resolvedUserId,
    });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const mapped: Conversation[] = (data ?? []).map((row: any) => ({
      roomId: row.room_id,
      lastMsg: row.last_message ?? "",
      lastSenderId: row.last_sender_id ?? null,
      lastTime: row.last_time ?? null,
      otherUserId: row.other_user_id ?? null,
      otherDisplayName: row.other_display_name ?? "Unknown User",
      otherAvatarUrl: row.other_avatar_url ?? null,
      jobId: row.job_id ?? null,
      jobTitle: row.job_title ?? null,
    }));

    setThreads(mapped);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      supabaseClient.auth.getUser().then(({ data }) => {
        if (!active) return;
        const uid = data.user?.id ?? null;
        setUserId(uid);
        setAuthModalVisible(!data.user);
        if (uid) {
          fetchThreads(uid);
        } else {
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }, [fetchThreads])
  );

  useEffect(() => {
    if (!userId) return;
    fetchThreads();
    const channel = supabaseClient
      .channel("messages:list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId, fetchThreads]);

  const filteredThreads = useMemo(() => {
    const q = search.toLowerCase();
    return threads.filter((thread) => {
      return (
        thread.otherDisplayName.toLowerCase().includes(q) ||
        thread.roomId.toLowerCase().includes(q) ||
        (thread.jobTitle ?? "").toLowerCase().includes(q)
      );
    });
  }, [threads, search]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className={`flex-1 ${t.bgPage}`}>
      <View className={`pt-3 pb-6 px-6 ${t.bgCard} border-b ${t.border}`}>
        <View className={`flex-row items-center mt-4 px-4 h-12 rounded-2xl ${t.bgSurface} border ${t.border}`}>
          <Feather name="search" size={16} color={t.icon} />
          <TextInput
            placeholder="Search conversations..."
            value={search}
            onChangeText={setSearch}
            className={`flex-1 ml-3 text-sm ${t.text}`}
            placeholderTextColor={t.icon}
            autoCorrect={false}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className={`mt-2 ${t.textMuted}`}>Loading messages…</Text>
        </View>
      ) : (
        <LegendList
          data={filteredThreads}
          keyExtractor={(item) => item.roomId}
          estimatedItemSize={90}
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text className={`text-sm ${t.textMuted}`}>No messages</Text>
            </View>
          }
          renderItem={({ item }) => {
            const preview = item.lastMsg ? `${item.lastSenderId === userId ? "You: " : ""}${item.lastMsg}` : "No messages yet";
            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/chatRoom/chatRoom",
                    params: {
                      roomId: item.roomId,
                      name: item.otherDisplayName,
                      jobTitle: item.jobTitle ?? undefined,
                    },
                  })
                }
                className={`flex-row items-center p-5 border-b ${t.border} active:bg-slate-50`}
              >
                <View className="relative">
                  {item.otherAvatarUrl ? (
                    <Image source={{ uri: item.otherAvatarUrl }} className="w-14 h-14 rounded-[20px]" />
                  ) : (
                    <View className="w-14 h-14 rounded-[20px] bg-slate-200 items-center justify-center">
                      <Text className="text-slate-600 font-black text-lg">{item.otherDisplayName.slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                </View>

                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center">
                    <Text className={`font-black text-base ${t.text}`}>{item.otherDisplayName}</Text>
                    <Text className={`text-[10px] font-bold ${t.textMuted}`}>{formatTime(item.lastTime)}</Text>
                  </View>
                  <Text className={`text-xs mt-1 font-medium ${t.textMuted}`} numberOfLines={1}>
                    {preview}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className={`${t.brandSoft} px-2 py-0.5 rounded-md`}>
                      <Text className={`text-[9px] font-black uppercase ${t.brand}`}>
                        {item.jobTitle ? `Job: ${item.jobTitle}` : "Direct Message"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal visible={authModalVisible} transparent animationType="slide" onRequestClose={() => setAuthModalVisible(false)}>
        <KeyboardAvoidingView className="" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View className="flex-1 bg-black/50 justify-center px-4">
            <View className="bg-white rounded-3xl p-6">
              <Text className="text-xl font-black text-slate-900 mb-3">Create an account</Text>
              <Text className="text-slate-500 mb-4">Sign in to access your messages.</Text>
              <View className="flex flex-row  justify-around ">
             <TouchableOpacity  onPress={() => router.push("/(ProtectedRoutes)/AuthenticationPage")} className="mt-3 rounded-2xl px-5 py-2  bg-blue-600 text-white items-center">
                <Text className="text-black text-sm">Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => setAuthModalVisible(false)} className="mt-3 rounded-2xl px-5 py-2  border items-center">
                <Text className="text-slate-500 text-sm">Maybe later</Text>
              </TouchableOpacity>
              </View>
            </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const formatTime = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
};
