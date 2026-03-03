import React, { useState, useRef } from "react";
import { View, Text, Pressable, ImageBackground, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import CustomBottomSheet from "@/components/CustomComponents/CustomBottomSheet";
import { useTheme } from "@/hooks/useTheme";

export default function Login() {
  const { t } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [type, setType] = useState<"signIn" | "signUp">();

  const handleOpenSheet = (mode: string) => {
    setType(mode);
    bottomSheetRef.current?.expand();
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1541976590-713941681591?w=800' }} 
        className="flex-1"
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/60 px-8 justify-center">
          
          <View className="mb-12">
            <Text className="text-blue-500 font-black tracking-[4px] uppercase text-xs mb-2">
              Welcome to
            </Text>
            <Text className="text-6xl font-black text-white tracking-tighter">
              KABAYAN
            </Text>
            <View className="h-1 w-12 bg-blue-600 mt-2 rounded-full" />
            
            <Text className="text-slate-300 text-lg font-medium mt-6 leading-7">
              Your one-stop shop for local food, expert skills, and community growth.
            </Text>
          </View>

          <View className="gap-y-4">
            <Pressable 
              onPress={() => handleOpenSheet("SignIn")}
              className="bg-blue-600 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-blue-600/30 active:opacity-90"
            >
              <Text className="text-white font-black text-base uppercase tracking-widest">
                Sign In
              </Text>
            </Pressable>

            <Pressable 
              onPress={() => handleOpenSheet("signUp")}
              className="bg-white/10 h-16 rounded-[24px] items-center justify-center border border-white/20 backdrop-blur-lg active:opacity-80"
            >
              <Text className="text-white font-black text-base uppercase tracking-widest">
                Create Account
              </Text>
            </Pressable>
          </View>

          <View className="absolute bottom-12 left-0 right-0 items-center">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[2px]">
              By continuing, you agree to our Terms
            </Text>
          </View>
        </View>
      </ImageBackground>

      <CustomBottomSheet type={type} bottomSheetRef={bottomSheetRef} />
    </View>
  );
}