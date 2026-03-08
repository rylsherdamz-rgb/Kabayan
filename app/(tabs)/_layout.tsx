import React from "react";
import { Tabs } from "expo-router";
import { StatusBar, Pressable, View, Text } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context"
import { useTheme } from "@/hooks/useTheme";

export default function TabsLayout() {
  const { t } = useTheme();
  const inset = useSafeAreaInsets()

  return (
    <>
      <StatusBar barStyle={t.isDarkMode ? "light-content" : "dark-content"} />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: t.isDarkMode ? "#0F172A" : "#FFFFFF",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: t.isDarkMode ? "#1E293B" : "#F1F5F9",
            height: 100,
          },
          tabBarStyle: {
            backgroundColor: t.isDarkMode ? "#0F172A" : "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: t.isDarkMode ? "#1E293B" : "#F1F5F9",
            height: 65 ,
            marginBottom : inset.bottom,
            paddingBottom: 10,
            paddingTop: 5, },
          tabBarActiveTintColor: "#2563EB",
          tabBarInactiveTintColor: t.isDarkMode ? "#64748B" : "#94A3B8",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          },
          headerRight: () => (
            <Pressable className="mr-5 p-2 rounded-xl ">
              <Ionicons name="notifications-outline" size={20} color={t.icon} />
            </Pressable>
          ),
          headerLeft: () => (
            <View className="ml-5">
              <Text className="text-blue-600 font-black tracking-tighter text-xl">KABAYAN</Text>
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarLabel: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Feather name="grid" color={color} size={focused ? 24 : 22} />
            ),
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            title: "Jobs",
            tabBarLabel: "Jobs",
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name="briefcase-variant-outline" color={color} size={focused ? 24 : 22} />
            ),
          }}
        />
        <Tabs.Screen
          name="marketPlace"
          options={{
            title: "Market",
            tabBarLabel: "Market",
            tabBarIcon: ({ color, focused }) => (
              <Feather name="shopping-bag" color={color} size={focused ? 24 : 22} />
            ),
          }}
        />
        <Tabs.Screen
          name="message"
          options={{
            title: "Message",
            tabBarLabel: "Message",
            tabBarIcon: ({ color, focused }) => (
              <Feather name="message-circle" color={color} size={focused ? 24 : 22} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Feather name="user" color={color} size={focused ? 24 : 22} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}