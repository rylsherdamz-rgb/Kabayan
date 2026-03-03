import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from '@/hooks/useTheme';

export default function Landing() {
  const router = useRouter();
  const { t } = useTheme();

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1541976590-713941681591?w=800' }} 
        className="flex-1"
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/50 px-8 justify-end pb-16">
          
          <View className="mb-10">
            <View className="bg-blue-600 w-16 h-16 rounded-[22px] items-center justify-center mb-6 shadow-2xl shadow-blue-500">
              <MaterialCommunityIcons name="handshake" size={32} color="white" />
            </View>
            
            <Text className="text-5xl font-black text-white tracking-tighter leading-[48px]">
              KABAYAN
            </Text>
            <Text className="text-blue-400 text-lg font-bold tracking-widest mt-1 uppercase">
              Community Power
            </Text>
            
            <Text className="text-slate-300 text-base font-medium mt-6 leading-6">
              The #1 marketplace for local Filipino talent. Find expert help or start earning today.
            </Text>
          </View>

          <View className="gap-y-4">
            <TouchableOpacity 
              onPress={() => router.push('/home')}
              activeOpacity={0.9}
              className="bg-blue-600 h-16 rounded-3xl flex-row items-center justify-center shadow-xl shadow-blue-600/40"
            >
              <Text className="text-white font-black text-base uppercase tracking-widest">Get Started</Text>
              <Feather name="arrow-right" size={20} color="white" style={{ marginLeft: 10 }} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(ProtectedRoutes)/Register')}
              activeOpacity={0.7}
              className="bg-white/10 h-16 rounded-3xl items-center justify-center border border-white/20 backdrop-blur-md"
            >
              <Text className="text-white font-black text-base uppercase tracking-widest">Sign In</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-10 items-center">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[3px]">
              Proudly Made in the Philippines
            </Text>
          </View>

        </View>
      </ImageBackground>
    </View>
  );
}