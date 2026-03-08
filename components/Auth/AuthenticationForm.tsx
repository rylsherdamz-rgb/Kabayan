import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable } from "react-native";
import {useRouter} from "expo-router"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import useAccount from "@/hooks/useAccountHooks";
import { useTheme } from "@/hooks/useTheme";

type AuthMode = "signIn" | "signUp";

interface AuthenticationFormProps {
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

export default function AuthenticationForm({ mode = "signIn", onModeChange }: AuthenticationFormProps) {
  const { t } = useTheme();
  const router= useRouter()
  const { SignUpWithEmailAndPassword, SignInWithPassword, error, data } = useAccount();

  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const toggleMode = () => {
    const next = currentMode === "signIn" ? "signUp" : "signIn";
    setCurrentMode(next);
    onModeChange?.(next);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (currentMode === "signIn") {
      await SignInWithPassword({ email, password });
    } else {
      await SignUpWithEmailAndPassword({ email, password });
    }
    setSubmitting(false);
    if (!data || error) return
    router.push("/home")

  };

  return (
    <View className="w-full bg-white/95 rounded-[28px] p-6 border border-slate-200 shadow-xl shadow-slate-900/10">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          {currentMode === "signIn" ? "Welcome Back" : "Join Kabayan"}
        </Text>
        <TouchableOpacity className="flex-row rounded-full p-1" onPress={() => router.push("/(tabs)/home")}>
          <Feather name="x-circle" color="#0f172a" size={20} />
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-slate-500 mb-6">
        {currentMode === "signIn"
          ? "Sign in to access your community."
          : "Create an account to start earning or hiring."}
      </Text>

      <View className="gap-y-5">
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">Email Address</Text>
          <View className="flex-row items-center px-4 h-14 rounded-2xl border border-slate-200 bg-slate-50">
            <Feather name="mail" size={18} color={t.icon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@gmail.com"
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 font-semibold text-slate-900"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">Password</Text>
          <View className="flex-row items-center px-4 h-14 rounded-2xl border border-slate-200 bg-slate-50">
            <Feather name="lock" size={18} color={t.icon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 font-semibold text-slate-900"
              secureTextEntry
            />
          </View>
          {currentMode === "signIn" && (
            <TouchableOpacity className="mt-3 self-end">
              <Text className="text-blue-600 font-bold text-xs">Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          className="bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30 mt-2"
          disabled={submitting}
        >
          <Text className="text-white font-black uppercase text-base tracking-widest">
            {submitting ? "Please wait…" : currentMode === "signIn" ? "Log In" : "Register"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-3">
          <Text className="text-slate-400 text-sm">
            {currentMode === "signIn" ? "Don’t have an account? " : "Already have an account? "}
          </Text>
          <Pressable onPress={toggleMode}>
            <Text className="text-blue-400 text-sm font-bold">
              {currentMode === "signIn" ? "Sign up" : "Sign in"}
            </Text>
          </Pressable>
        </View>

        {error && (
          <Text className="mt-3 text-red-500 text-sm font-semibold">
            {error.message ?? "Something went wrong"}
          </Text>
        )}

        <View className="flex-row items-center justify-center mt-2">
          <View className="h-[1px] flex-1 bg-slate-200" />
          <Text className="mx-4 text-[10px] font-bold text-slate-400 uppercase">Or continue with</Text>
          <View className="h-[1px] flex-1 bg-slate-200" />
        </View>

        <View className="flex-row gap-x-4">
          <TouchableOpacity className="flex-1 h-14 rounded-2xl border border-slate-200 items-center justify-center bg-white">
            <MaterialCommunityIcons name="google" size={20} color={t.isDarkMode ? "white" : "#475569"} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 h-14 rounded-2xl border border-slate-200 items-center justify-center bg-white">
            <MaterialCommunityIcons name="apple" size={20} color={t.isDarkMode ? "white" : "#475569"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
