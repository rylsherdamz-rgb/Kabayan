import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Modal, SafeAreaView, ActivityIndicator } from "react-native";
import { LegendList } from "@legendapp/list";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import AuthenticationForm from "@/components/Auth/AuthenticationForm";

export default function Inbox() {
  const { t } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("messages")
      .select("id, room_id, sender_id, content, created_at")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error || !data) {
      setLoading(false);
      return;
    }
    const grouped = new Map<string, Conversation>();
    data.forEach((row) => {
      if (!grouped.has(row.room_id)) {
        grouped.set(row.room_id, {
          roomId: row.room_id,
          lastMsg: row.content,
          lastSenderId: row.sender_id,
          lastTime: row.created_at,
        });
      }
    });
    setThreads(Array.from(grouped.values()));
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      supabaseClient.auth.getUser().then(({ data }) => {
        if (!active) return;
        setUserId(data.user?.id ?? null);
        setAuthModalVisible(!data.user);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    if (!userId) return;
    fetchThreads();
    const channel = supabaseClient
      .channel("messages:list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as any;
          if (row.sender_id !== userId && row.receiver_id !== userId) return;
          setThreads((prev) => {
            const filtered = prev.filter((t) => t.roomId !== row.room_id);
            return [
              {
                roomId: row.room_id,
                lastMsg: row.content,
                lastSenderId: row.sender_id,
                lastTime: row.created_at,
              },
              ...filtered,
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId, fetchThreads]);

  const filteredThreads = useMemo(() => {
    const q = search.toLowerCase();
    return threads.filter((t) => t.roomId.toLowerCase().includes(q));
  }, [threads, search]);

  return (
    <View className={`flex-1 ${t.bgPage}`}>
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
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push({ pathname: "/chatRoom/chatRoom", params: { roomId: item.roomId } })}
              className={`flex-row items-center p-5 border-b ${t.border} active:bg-slate-50`}
            >
              <View className="relative">
                <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }} className="w-14 h-14 rounded-[20px]" />
              </View>

              <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-center">
                  <Text className={`font-black text-base ${t.text}`}>Room {item.roomId.slice(0, 6)}</Text>
                  <Text className={`text-[10px] font-bold ${t.textMuted}`}>{formatTime(item.lastTime)}</Text>
                </View>
                <Text className={`text-xs mt-1 font-medium ${t.textMuted}`} numberOfLines={1}>
                  {item.lastMsg || "No messages yet"}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className={`${t.brandSoft} px-2 py-0.5 rounded-md`}>
                     <Text className={`text-[9px] font-black uppercase ${t.brand}`}>Supabase</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={authModalVisible} transparent animationType="slide" onRequestClose={() => setAuthModalVisible(false)}>
        <SafeAreaView className="flex-1 bg-black/50 justify-center px-4">
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-xl font-black text-slate-900 mb-3">Create an account</Text>
            <Text className="text-slate-500 mb-4">Sign in to access your messages.</Text>
            <AuthenticationForm
              mode="signIn"
              onSubmitted={async () => {
                const { data } = await supabaseClient.auth.getUser();
                setUserId(data.user?.id ?? null);
                setAuthModalVisible(false);
                fetchThreads();
              }}
            />
            <TouchableOpacity onPress={() => setAuthModalVisible(false)} className="mt-3 items-center">
              <Text className="text-slate-500 text-sm">Maybe later</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

type Conversation = {
  roomId: string;
  lastMsg: string;
  lastSenderId: string;
  lastTime: string;
};

const formatTime = (iso: string) => {
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
