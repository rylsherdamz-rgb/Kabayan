import React from 'react';
import { TextInput, View, Pressable } from 'react-native';
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from '@/hooks/useTheme';

export default function CustomSearchComponent({ onNavigateToMap, onSearch }) {
  const { t } = useTheme();

  return (
    <View className={`flex-row items-center h-12 px-4 rounded-2xl border ${t.border} ${t.bgSurface}`}>
      
      <Feather name="search" color={t.icon} size={18} />
      
      <TextInput 
        className={`flex-1 h-full ml-3 text-sm font-medium ${t.text}`}
        placeholder="Search for skills or food..."
        placeholderTextColor={t.isDarkMode ? "#64748B" : "#94A3B8"}
        onChangeText={onSearch}
        selectionColor="#2563EB"
      />

      <View className={`w-[1px] h-6 mx-3 ${t.border}`} />

      <Pressable 
        onPress={onNavigateToMap}
        className="p-1 active:opacity-50"
      >
        <FontAwesome5 name="map-marked-alt" color={t.accent} size={18} />
      </Pressable>
      
    </View>
  );
}