import { Stack } from "expo-router";
import {SafeAreaProvider} from "react-native-safe-area-context"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import Drawer from "expo-router/drawer"
import {StatusBar} from "react-native"
import "../global.css"


export default function RootLayout() {
  return <GestureHandlerRootView style={{flex:1}}>
    <SafeAreaProvider>
      <StatusBar />
      <Drawer />
    </SafeAreaProvider>
  </GestureHandlerRootView>
}
