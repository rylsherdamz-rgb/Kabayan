import React, { useState } from "react";
import { View, Text, Pressable, ImageBackground, StatusBar, ScrollView } from "react-native";
import AuthenticationForm from "@/components/Auth/AuthenticationForm";

export default function Login() {
  const [mode, setMode] = useState<"signIn" | "signUp" | null>(null);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1541976590-713941681591?w=800' }} 
        className="flex-1"
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 bg-black/60 px-8 pt-16 pb-10 justify-between">
          
          <View className="mb-8">
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
              onPress={() => setMode("signIn")}
              className="bg-blue-600 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-blue-600/30 active:opacity-90"
            >
              <Text className="text-white font-black text-base uppercase tracking-widest">
                Sign In
              </Text>
            </Pressable>

            <Pressable 
              onPress={() => setMode("signUp")}
              className="bg-white/10 h-16 rounded-[24px] items-center justify-center border border-white/20 backdrop-blur-lg active:opacity-80"
            >
              <Text className="text-white font-black text-base uppercase tracking-widest">
                Create Account
              </Text>
            </Pressable>
          </View>

          {mode && (
            <View className="mt-8 gap-y-3">
              <AuthenticationForm mode={mode} />
              <View className="flex-row justify-center">
                <Text className="text-slate-400 text-sm">
                  {mode === "signIn" ? "Don’t have an account? " : "Already have an account? "}
                </Text>
                <Pressable onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}>
                  <Text className="text-blue-400 text-sm font-bold">
                    {mode === "signIn" ? "Sign up" : "Sign in"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <View className="mt-6 items-center">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px]">
              By continuing, you agree to our Terms
            </Text>
          </View>
        </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
