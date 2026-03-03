import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from '@/hooks/useTheme';

export default function EditProfile() {
  const { t } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    name: 'Kuya Jojo',
    bio: 'Licensed Master Plumber with 10 years of experience in residential and commercial piping.',
    location: 'Manila, Philippines',
    phone: '+63 912 345 6789'
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className={`flex-1 ${t.bgPage}`}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View className="h-32 bg-blue-600 w-full relative">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-12 left-5 z-10 bg-white/20 p-2 rounded-full"
          >
            <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-5 -mt-12">
          <View className="items-center">
            <View className="relative">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400' }}
                className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                <Feather name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-8">
            <Text className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 ${t.textMuted}`}>Personal Info</Text>
            <View className={`rounded-3xl p-4 ${t.bgCard} border ${t.border}`}>
              
              <View className="mb-5">
                <Text className={`text-[11px] font-bold mb-2 ${t.textMuted}`}>Full Name</Text>
                <TextInput 
                  value={form.name}
                  onChangeText={(txt) => setForm({...form, name: txt})}
                  className={`text-base font-semibold pb-2 border-b ${t.border} ${t.text}`}
                />
              </View>

              <View className="mb-5">
                <Text className={`text-[11px] font-bold mb-2 ${t.textMuted}`}>Bio / Headline</Text>
                <TextInput 
                  value={form.bio}
                  multiline
                  numberOfLines={3}
                  onChangeText={(txt) => setForm({...form, bio: txt})}
                  className={`text-sm font-medium pb-2 border-b ${t.border} ${t.text}`}
                />
              </View>

              <View className="mb-2">
                <Text className={`text-[11px] font-bold mb-2 ${t.textMuted}`}>Mobile Number</Text>
                <View className="flex-row items-center">
                   <Text className={`mr-2 font-bold ${t.text}`}>🇵🇭</Text>
                   <TextInput 
                    value={form.phone}
                    keyboardType="phone-pad"
                    className={`flex-1 text-base font-semibold pb-2 border-b ${t.border} ${t.text}`}
                  />
                </View>
              </View>

            </View>
          </View>

          <View className="mt-8">
            <Text className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 ${t.textMuted}`}>Verification</Text>
            <View className={`rounded-3xl p-5 ${t.bgCard} border ${t.border} flex-row items-center justify-between`}>
              <View className="flex-row items-center">
                <View className="bg-blue-100 p-2 rounded-xl mr-3">
                  <MaterialCommunityIcons name="badge-account-horizontal" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text className={`font-black text-sm ${t.text}`}>Government ID</Text>
                  <Text className="text-emerald-600 text-[10px] font-bold">Verified</Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
          </View>

          <TouchableOpacity className="bg-blue-600 h-14 rounded-2xl items-center justify-center mt-10 mb-20 shadow-lg shadow-blue-500/40">
            <Text className="text-white font-black text-base uppercase tracking-widest">Save Changes</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}