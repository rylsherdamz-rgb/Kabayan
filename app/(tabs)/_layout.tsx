import React from "react";
import { Tabs, useNavigation } from "expo-router";
import { Alert, Pressable } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context"
import { useTheme } from "@/hooks/useTheme";
import {DrawerActions} from "@react-navigation/native"

export default function TabsLayout() {
  const { t } = useTheme();
  const inset = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
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
            paddingTop: 5,
          },
          tabBarActiveTintColor: "#2563EB",
          tabBarInactiveTintColor: t.isDarkMode ? "#64748B" : "#94A3B8",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          },
          headerRight: () => (
            <Pressable
              className="mr-5 p-2 rounded-xl"
              onPress={() => Alert.alert("Notifications", "Push notifications coming soon!")}
            >
              <Ionicons name="notifications-outline" size={20} color={t.icon} />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} className="ml-5 p-2 rounded-xl ">
              <Feather name="menu" size={20} color={t.icon} />
            </Pressable>
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
      </Tabs>
  );
}
