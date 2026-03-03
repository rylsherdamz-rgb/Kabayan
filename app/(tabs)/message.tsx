import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { LegendList } from '@legendapp/list';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

const MOCK_CHATS = [
  {
    id: '1',
    name: 'Aling Nena',
    lastMsg: 'Opo, ready na yung 50 sticks of Isaw.',
    time: '2m ago',
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    type: 'Food Order'
  },
  {
    id: '2',
    name: 'Boss Ricardo',
    lastMsg: 'Can you start the plumbing repair tomorrow?',
    time: '1h ago',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    type: 'Job Inquiry'
  }
];

export default function Inbox() {
  const { t } = useTheme();
  const router = useRouter();

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <View className={`pt-3 pb-6 px-6 ${t.bgCard} border-b ${t.border}`}>
        <View className={`flex-row items-center mt-4 px-4 h-12 rounded-2xl ${t.bgSurface} border ${t.border}`}>
          <Feather name="search" size={16} color={t.icon} />
          <TextInput placeholder="Search conversations..." className={`flex-1 ml-3 text-sm ${t.text}`} placeholderTextColor={t.icon} />
        </View>
      </View>

      <LegendList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        estimatedItemSize={90}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push(`/`)}
            className={`flex-row items-center p-5 border-b ${t.border} active:bg-slate-50`}
          >
            <View className="relative">
              <Image source={{ uri: item.avatar }} className="w-14 h-14 rounded-[20px]" />
              {item.unread > 0 && <View className="absolute -top-1 -right-1 bg-blue-600 w-5 h-5 rounded-full border-2 border-white items-center justify-center">
                <Text className="text-[10px] text-white font-bold">{item.unread}</Text>
              </View>}
            </View>

            <View className="flex-1 ml-4">
              <View className="flex-row justify-between items-center">
                <Text className={`font-black text-base ${t.text}`}>{item.name}</Text>
                <Text className={`text-[10px] font-bold ${t.textMuted}`}>{item.time}</Text>
              </View>
              <Text className={`text-xs mt-1 font-medium ${item.unread > 0 ? 'text-slate-900 font-bold' : t.textMuted}`} numberOfLines={1}>
                {item.lastMsg}
              </Text>
              <View className="flex-row items-center mt-2">
                <View className={`${t.brandSoft} px-2 py-0.5 rounded-md`}>
                   <Text className={`text-[9px] font-black uppercase ${t.brand}`}>{item.type}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}