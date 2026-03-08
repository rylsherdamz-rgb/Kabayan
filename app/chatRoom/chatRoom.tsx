import React, { useEffect, useRef, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  FlatList, 
  Image,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";

export default function ChatRoomLayout() {
  const { t } = useTheme();
  const router = useRouter();
  const { roomId = "demo-room", name, jobTitle } = useLocalSearchParams<{
    roomId?: string;
    name?: string;
    jobTitle?: string;
  }>();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadMessages = async () => {
      const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (!error && isMounted && data) {
        setMessages(data.map(mapMessage));
      }
    };
    loadMessages();

    const channel = supabaseClient
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, mapMessage(payload.new as any)]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabaseClient.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || !userId || sending) return;
    setSending(true);
    setMessage("");
    const { error } = await supabaseClient
      .from("messages")
      .insert({ room_id: roomId, sender_id: userId, content: text });
    if (error) {
      // roll back local clear if needed
      setMessage(text);
    }
    setSending(false);
  };

  const headerName = name ?? "Chat Partner";
  const headerJob = jobTitle ?? "Conversation";

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <View className={`pt-12 pb-4 px-4 ${t.bgCard} border-b ${t.border} flex-row items-center justify-between shadow-sm`}>
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1">
            <Feather name="chevron-left" size={26} color={t.text} />
          </TouchableOpacity>
          
          <View className="relative">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }} 
              className="w-10 h-10 rounded-full" 
            />
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </View>

          <View className="ml-3">
            <Text className={`font-black text-sm tracking-tight ${t.text}`}>{headerName}</Text>
            <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Now</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity className={`${t.bgSurface} p-2.5 rounded-xl border ${t.border}`}>
            <Feather name="phone" size={18} color={t.accent} />
          </TouchableOpacity>
          <TouchableOpacity className={`${t.bgSurface} p-2.5 rounded-xl border ${t.border}`}>
            <Feather name="more-vertical" size={18} color={t.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View className={`${t.brandSoft} px-5 py-3 border-b ${t.border} flex-row justify-between items-center`}>
        <View className="flex-row items-center flex-1">
          <MaterialCommunityIcons name="hammer-wrench" size={16} color={t.accent} />
          <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${t.textMuted}`} numberOfLines={1}>
            {`Job: ${headerJob}`}
          </Text>
        </View>
        <TouchableOpacity>
          <Text className={`text-[10px] font-black text-blue-600 uppercase`}>View Details</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ChatBubble item={item} t={t} userId={userId} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className={`${t.bgCard} border-t ${t.border} p-4 flex-row items-end gap-x-3`}>
          <TouchableOpacity className={`${t.bgSurface} h-12 w-12 rounded-2xl items-center justify-center border ${t.border}`}>
            <Feather name="plus" size={20} color={t.icon} />
          </TouchableOpacity>

          <View className={`flex-1 flex-row items-center min-h-[48px] px-4 rounded-2xl ${t.bgSurface} border ${t.border}`}>
            <TextInput
              placeholder="Message..."
              placeholderTextColor={t.icon}
              multiline
              value={message}
              onChangeText={setMessage}
              className={`flex-1 py-3 text-sm font-medium ${t.text}`}
              style={{ maxHeight: 100 }}
            />
            {message.length > 0 && (
              <TouchableOpacity 
                onPress={handleSend}
                className="ml-2 bg-blue-600 w-8 h-8 rounded-full items-center justify-center shadow-sm"
              >
                <Ionicons name="arrow-up" size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
          
          {message.length === 0 && (
            <TouchableOpacity className="h-12 w-12 items-center justify-center">
              <MaterialCommunityIcons name="microphone-outline" size={24} color={t.icon} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ChatBubble({ item, t, userId }: { item: ChatMessage; t: any; userId: string | null }) {
  const isMe = userId ? item.senderId === userId : item.senderId === "me";
  return (
    <View className={`mb-4 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
      <View 
        className={`max-w-[75%] px-4 py-3 rounded-[24px] shadow-sm 
        ${isMe ? "bg-blue-600 rounded-tr-none" : `${t.bgSurface} border ${t.border} rounded-tl-none`}`}
      >
        <Text className={`text-sm font-medium leading-5 ${isMe ? "text-white" : t.text}`}>
          {item.text}
        </Text>
        <Text className={`text-[8px] font-black uppercase mt-1 text-right ${isMe ? "text-blue-200" : t.textMuted}`}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  );
}

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
};

const mapMessage = (row: any): ChatMessage => ({
  id: row.id,
  text: row.content,
  senderId: row.sender_id,
  createdAt: row.created_at,
});
