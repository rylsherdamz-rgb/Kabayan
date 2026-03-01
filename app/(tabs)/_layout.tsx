import { Tabs } from "expo-router";
import {StatusBar} from "react-native"
import { Feather } from "@expo/vector-icons";

export default function TabsLayout() {

  return (<>
    <StatusBar barStyle="light-content" />
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: {
          backgroundColor: "#000",
          shadowOpacity: 0, 
          height :80
        },
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
        },
      }}
    >
    
      <Tabs.Screen
        name="home" 
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="Setting" 
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  </>
  );
}