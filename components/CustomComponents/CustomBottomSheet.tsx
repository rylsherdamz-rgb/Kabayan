import React, { useMemo, useCallback, useState } from "react";
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import useAccount from "@/hooks/useAccountHooks";
import { useTheme } from "@/hooks/useTheme";

interface CustomBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  type: "signIn" | "signUp";
}

export default function CustomBottomSheet({ bottomSheetRef, type }: CustomBottomSheetProps) {
  const { t } = useTheme();
  const snapPoints = useMemo(() => ["65%", "90%"], []);
  const { SignUpWithEmailAndPassword, SignInWithPassword } = useAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistration = () => {
    if (type === "signIn") {
      SignInWithPassword({ email, password });
    } else {
      SignUpWithEmailAndPassword({ email, password });
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: t.isDarkMode ? "#334155" : "#CBD5E1", width: 45 }}
      backgroundStyle={{ 
        backgroundColor: t.isDarkMode ? "#0F172A" : "#FFFFFF", 
        borderRadius: 40 
      }}
    >
      <BottomSheetView className="p-8">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          
          <View className="mb-8">
            <Text className={`text-3xl font-black tracking-tighter ${t.text}`}>
              {type === "signIn" ? "Welcome Back" : "Join Kabayan"}
            </Text>
            <Text className={`text-sm font-medium mt-1 ${t.textMuted}`}>
              {type === "signIn" ? "Sign in to access your community." : "Create an account to start earning or hiring."}
            </Text>
          </View>

          <View className="gap-y-6">
            <View>
              <Text className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 ${t.textMuted}`}>Email Address</Text>
              <View className={`flex-row items-center px-4 h-14 rounded-2xl border ${t.border} ${t.bgSurface}`}>
                <Feather name="mail" size={18} color={t.icon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@gmail.com"
                  placeholderTextColor={t.isDarkMode ? "#475569" : "#94A3B8"}
                  className={`flex-1 ml-3 font-semibold ${t.text}`}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View>
              <Text className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 ${t.textMuted}`}>Password</Text>
              <View className={`flex-row items-center px-4 h-14 rounded-2xl border ${t.border} ${t.bgSurface}`}>
                <Feather name="lock" size={18} color={t.icon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={t.isDarkMode ? "#475569" : "#94A3B8"}
                  className={`flex-1 ml-3 font-semibold ${t.text}`}
                  secureTextEntry
                />
              </View>
              {type === "signIn" && (
                <TouchableOpacity className="mt-3 self-end">
                  <Text className="text-blue-600 font-bold text-xs">Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleRegistration}
              activeOpacity={0.8}
              className="bg-blue-600 h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-500/30 mt-4"
            >
              <Text className="text-white font-black uppercase text-base tracking-widest">
                {type === "signIn" ? "Log In" : "Register"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-4">
              <View className={`h-[1px] flex-1 ${t.border}`} />
              <Text className={`mx-4 text-[10px] font-bold ${t.textMuted} uppercase`}>Or continue with</Text>
              <View className={`h-[1px] flex-1 ${t.border}`} />
            </View>

            <View className="flex-row gap-x-4">
              <TouchableOpacity className={`flex-1 h-14 rounded-2xl border ${t.border} items-center justify-center ${t.bgCard}`}>
                <MaterialCommunityIcons name="google" size={20} color={t.isDarkMode ? "white" : "#475569"} />
              </TouchableOpacity>
              <TouchableOpacity className={`flex-1 h-14 rounded-2xl border ${t.border} items-center justify-center ${t.bgCard}`}>
                <MaterialCommunityIcons name="apple" size={20} color={t.isDarkMode ? "white" : "#475569"} />
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
}