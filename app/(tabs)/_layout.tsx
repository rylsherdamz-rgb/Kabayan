import { Tabs } from "expo-router";
import {StatusBar, Pressable,} from "react-native"
import { Feather } from "@expo/vector-icons";
import CustomBackButton from "@/components/CustomComponents/CustomBackButtonComponents"
import {useNavigation} from "expo-router"
import {DrawerActions} from"@react-navigation/native"


export default function TabsLayout() {
  const navigator = useNavigation()

  return (<>
    <StatusBar barStyle="light-content" />
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: {
          backgroundColor: "#000",
          shadowOpacity: 0, 
          height :80,

        },
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
        },
        headerLeft :  () => (<Pressable className="" onPress={() => navigator.dispatch(DrawerActions.toggleDrawer())}>
          <Feather name="menu" color="#fff" size={24} />
        </Pressable>),
        headerRightContainerStyle: {
      paddingRight: 5, // Adds padding inside the right container
      },
      headerLeftContainerStyle: {
      paddingLeft: 5,     },
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