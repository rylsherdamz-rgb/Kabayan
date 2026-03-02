import { Tabs } from "expo-router";
import {StatusBar, Pressable,} from "react-native"
import { Feather, Entypo, Ionicons } from "@expo/vector-icons";
import CustomBackButton from "@/components/CustomComponents/CustomBackButtonComponents"
import {useNavigation} from "expo-router"
import {DrawerActions} from"@react-navigation/native"


export default function TabsLayout() {
  // const navigator = useNavigation()

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
        // headerLeft :  () => (<Pressable className="" onPress={() => navigator.dispatch(DrawerActions.toggleDrawer())}>
        //   <Feather name="menu" color="#fff" size={24} />
        // </Pressable>),
        headerRight : () => (<Pressable>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
        </Pressable>),
        headerRightContainerStyle: {
      paddingRight: 10, // Adds padding inside the right container
      },
      headerLeftContainerStyle: {
      paddingLeft: 10,     },
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
        name="jobs" 
        options={{
          title: "Job",
          tabBarLabel: "Job",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="man" color={color} size={size} />
          ),
        }}
      />
    <Tabs.Screen
        name="marketPlace" 
        options={{
          title: "Market Place",
          tabBarLabel: "Market Place",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />



      <Tabs.Screen
        name="setting" 
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