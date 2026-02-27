import {SafeAreaProvider} from "react-native-safe-area-context"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import {useEffect, useState} from "react"
import Drawer from "expo-router/drawer"
import {StatusBar} from "react-native"
import "../global.css"
import useLandingPage from "@/hooks/useLandingPage"
import {storage} from "@/utils/MMKVConfig"



export default function RootLayout() {
  const {getIsFirstOpened, setIsFirstOpened} = useLandingPage()
  const [FirstOpened, setFirstOpened] = useState<boolean |  null>(null)

   useEffect(() => {
    const hasOpened = getIsFirstOpened() 
    const LandingPageValue = hasOpened === undefined ? true : !hasOpened
    setFirstOpened(LandingPageValue)
   }, [])
  return <GestureHandlerRootView style={{flex:1}}>
    <SafeAreaProvider>
      <StatusBar />
      <Drawer options={{headerShown: false}} />
    </SafeAreaProvider>
  </GestureHandlerRootView>
}
