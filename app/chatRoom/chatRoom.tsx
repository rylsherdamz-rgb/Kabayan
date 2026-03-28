import React, { useEffect, useRef, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  FlatList,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context"
import { useTheme } from "@/hooks/useTheme";
import { supabaseClient } from "@/utils/supabase";
import AppFlashMessage from "@/components/CustomComponents/AppFlashMessage";
import useFlashMessage from "@/hooks/useFlashMessage";
import humanizeError from "@/utils/humanizeError";

export default function ChatRoomLayout() {
  const { t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets()
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
  const { flashMessage, showFlashMessage, hideFlashMessage } = useFlashMessage();

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadMessages = async () => {
      const { data, error } = await supabaseClient
        .rpc("rpc_get_messages_by_room", { p_room_id: roomId });
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
          const incoming = mapMessage(payload.new as any);
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
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
    if (!text || sending) return;
    if (!userId) {
      showFlashMessage("Sign in required", "Please sign in before sending a message.", "warning");
      return;
    }
    setSending(true);
    setMessage("");
    const { data: newMessageId, error } = await supabaseClient.rpc("rpc_send_message", {
      p_room_id: roomId,
      p_sender_id: userId,
      p_content: text,
    });
    if (error) {
      // roll back local clear if needed
      setMessage(text);
      showFlashMessage("Send failed", humanizeError(error, "Unable to send message."), "error");
    } else if (newMessageId) {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessageId)) return prev;
        return [
          ...prev,
          {
            id: newMessageId,
            text,
            senderId: userId,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    }
    setSending(false);
  };

  const headerName = name ?? "Chat Partner";
  const headerJob = jobTitle ?? "Conversation";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      className={`flex-1 ${t.bgPage}`}
    >
      <View
        className={`${t.bgCard} border-b ${t.border} flex-row items-center justify-between shadow-sm`}
        style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16 }}
      >
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1">
            <Feather name="chevron-left" size={26} color={t.icon} />
          </TouchableOpacity>
          
          <View className="relative">
            <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-white font-black text-base">
                {headerName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </View>

          <View className="ml-3">
            <Text className={`font-black text-sm tracking-tight ${t.text}`}>{headerName}</Text>
            <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Now</Text>
          </View>
        </View>

        <TouchableOpacity className={`${t.bgSurface} p-2.5 rounded-xl border ${t.border}`}>
          <Feather name="more-vertical" size={18} color={t.icon} />
        </TouchableOpacity>
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        renderItem={({ item }) => <ChatBubble item={item} t={t} userId={userId} otherName={headerName} />}
      />

      <AppFlashMessage message={flashMessage} onClose={hideFlashMessage} />

      <View
        className={`${t.bgCard} border-t ${t.border} p-4 flex-row items-end gap-x-3`}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
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
              textAlignVertical="top"
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
  );
}

function ChatBubble({
  item,
  t,
  userId,
  otherName,
}: {
  item: ChatMessage;
  t: any;
  userId: string | null;
  otherName: string;
}) {
  const isMe = userId ? item.senderId === userId : item.senderId === "me";
  return (
    <View className={`mb-4 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
      <View 
        className={`max-w-[75%] px-4 py-3 rounded-[24px] shadow-sm 
        ${isMe ? "bg-blue-600 rounded-tr-none" : `${t.bgSurface} border ${t.border} rounded-tl-none`}`}
      >
        <Text className={`text-[9px] mb-1 font-black uppercase tracking-widest ${isMe ? "text-blue-200" : t.textMuted}`}>
          {isMe ? "You" : otherName}
        </Text>
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
