import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

export default function Setting() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleSwitch = () => setIsDarkMode((prev) => !prev);

  const theme = {
    bg: isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]',
    card: isDarkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white shadow-sm',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    iconColor: isDarkMode ? '#94A3B8' : '#475569',
  };

  return (
    <View className={`flex-1 ${theme.bg}`}>
      <ScrollView showsVerticalScrollIndicator={false} className="px-5">
        
        <View className="items-center py-10">
          <View className="relative">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400' }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-600 w-9 h-9 rounded-full items-center justify-center shadow-md border-2 border-white">
              <Feather name="edit-2" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className={`text-2xl font-black mt-4 tracking-tight ${theme.text}`}>Kuya Jojo</Text>
          <Text className="text-blue-500 font-bold uppercase text-[10px] tracking-widest mt-1">Licensed Tubero • Manila</Text>
          
          <View className="flex-row mt-6 items-center w-full justify-center">
            <View className="items-center px-8">
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#F59E0B" className="mr-1" />
                <Text className={`text-xl font-bold ${theme.text}`}>4.9</Text>
              </View>
              <Text className="text-slate-400 text-[10px] uppercase font-bold">Rating</Text>
            </View>
            <View className={`w-[1px] h-8 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <View className="items-center px-8">
              <Text className={`text-xl font-bold ${theme.text}`}>124</Text>
              <Text className="text-slate-400 text-[10px] uppercase font-bold">Jobs</Text>
            </View>
          </View>
        </View>

        <Text className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Preferences</Text>
        <View className={`rounded-3xl p-2 mb-6 ${theme.card}`}>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="bg-indigo-500/10 w-10 h-10 rounded-2xl items-center justify-center mr-4">
                <Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={20} color="#6366F1" />
              </View>
              <Text className={`text-base font-semibold ${theme.text}`}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
              onValueChange={toggleSwitch}
              value={isDarkMode}
            />
          </View>

          <TouchableOpacity className="flex-row items-center justify-between p-4 border-t border-slate-100/10">
            <View className="flex-row items-center">
              <View className="bg-amber-500/10 w-10 h-10 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
              </View>
              <Text className={`text-base font-semibold ${theme.text}`}>Notifications</Text>
            </View>
            <Text className="text-slate-400 font-bold">On</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Account</Text>
        <View className={`rounded-3xl p-2 mb-8 ${theme.card}`}>
          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="bg-blue-500/10 w-10 h-10 rounded-2xl items-center justify-center mr-4">
                <Feather name="user" size={20} color="#3B82F6" />
              </View>
              <Text className={`text-base font-semibold ${theme.text}`}>Edit Profile</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.iconColor} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-t border-slate-100/10">
            <View className="flex-row items-center">
              <View className="bg-rose-500/10 w-10 h-10 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="card-outline" size={20} color="#EC4899" />
              </View>
              <Text className={`text-base font-semibold ${theme.text}`}>Payout Methods</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.iconColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-rose-500/10 h-16 rounded-3xl items-center justify-center mb-10 flex-row">
          <MaterialIcons name="logout" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text className="text-rose-500 font-black text-base uppercase tracking-widest">Log Out</Text>
        </TouchableOpacity>
        
        <Text className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-10">Kabayan App v1.0.4</Text>
      </ScrollView>
    </View>
  );
}