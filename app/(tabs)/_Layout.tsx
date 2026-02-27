import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const inset = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: {
          backgroundColor: "#000",
        },
        headerLeft: () => null,
        headerRight: () => null,

        tabBarStyle: {
          backgroundColor: "#000",
          height: 80,
          
        },

        tabBarActiveTintColor: "#ff0",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}