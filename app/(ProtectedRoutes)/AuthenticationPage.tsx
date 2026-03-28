import React from "react";
import { View, Text, StatusBar, ImageBackground } from "react-native";
import AuthenticationForm from "@/components/Auth/AuthenticationForm";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthenticationPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1541976590-713941681591?w=800" }}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-black/65" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="px-5 pt-4 mb-4 flex-row items-center">
          <View className="w-10 h-10 bg-white/15 rounded-full items-center justify-center">
            <Feather name="chevron-left" size={22} color="white" onPress={() => router.back()} />
          </View>
        </View>

        <View className="flex-1 px-5 justify-center">
          <AuthenticationForm mode="signIn" />
        </View>
      </View>
    </ImageBackground>
  );
}
