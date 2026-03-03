import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export default function Setting() {
  const { t, toggleTheme } = useTheme();

  return (
    <View className={`flex-1 ${t.bgPage}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View className="bg-white">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1504150559640-a0ce165d472d?w=800' }}
            className="w-full h-40"
            resizeMode="cover"
          />
          
          <View className="px-5 pb-6">
            <View className="relative -mt-12 mb-4">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400' }}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-sm"
              />
              <TouchableOpacity className="absolute bottom-0 left-20 bg-white w-8 h-8 rounded-full items-center justify-center shadow-md border border-slate-100">
                <Feather name="camera" size={14} color="#475569" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-start">
              <View>
                <Text className={`text-2xl font-bold tracking-tight ${t.text}`}>Kuya Jojo</Text>
                <Text className="text-blue-600 font-semibold text-sm">Licensed Tubero • Master Plumber</Text>
                <Text className={`text-sm mt-1 ${t.textMuted}`}>Manila, Philippines • 500+ Connections</Text>
              </View>
              <TouchableOpacity className="bg-blue-600 px-6 py-2 rounded-full shadow-sm">
                <Text className="text-white font-bold text-sm">Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className={`text-xs font-bold ${t.textMuted} uppercase tracking-widest mb-3 ml-1`}>App Settings</Text>
          <View className={`rounded-2xl overflow-hidden ${t.bgCard}`}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Ionicons name={t.isDarkMode ? "moon" : "sunny"} size={20} color={t.icon} />
                <Text className={`text-base font-medium ml-3 ${t.text}`}>Dark Mode</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                thumbColor="#FFFFFF"
                onValueChange={toggleTheme}
                value={t.isDarkMode}
              />
            </View>
            
            <View className={`h-[1px] mx-4 ${t.border}`} />

            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Ionicons name="notifications-outline" size={20} color={t.icon} />
                <Text className={`text-base font-medium ml-3 ${t.text}`}>Notifications</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={t.icon} />
            </TouchableOpacity>
          </View>

          <Text className={`text-xs font-bold ${t.textMuted} uppercase tracking-widest mt-6 mb-3 ml-1`}>Support</Text>
          <View className={`rounded-2xl overflow-hidden mb-8 ${t.bgCard}`}>
            <TouchableOpacity className={`flex-row items-center justify-between p-4 border-b ${t.border}`}>
              <View className="flex-row items-center">
                <Feather name="help-circle" size={20} color={t.icon} />
                <Text className={`text-base font-medium ml-3 ${t.text}`}>Help Center</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={t.icon} />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Feather name="log-out" size={20} color="#EF4444" />
                <Text className="text-base font-medium ml-3 text-red-500">Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}