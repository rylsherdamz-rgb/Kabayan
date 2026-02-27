import {SafeAreaProvider} from "react-native-safe-area-context"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import {useEffect, useState} from "react"
import Drawer from "expo-router/drawer"
import {StatusBar} from "react-native"
import "../global.css"
import useLandingPage from "@/hooks/useLandingPage"
import Index from "./index"



export default function RootLayout() {
  const {getIsFirstOpened, setIsFirstOpened} = useLandingPage()
  const [FirstOpened, setFirstOpened] = useState<boolean |  null>(null)

   useEffect(() => {
    const hasOpened = getIsFirstOpened() 
    const LandingPageValue = hasOpened === undefined ? true : !hasOpened
    setFirstOpened(LandingPageValue)
   }, [])

   // pass this funciton in the landingpage of the onboarding
   const handleFinishOnBoarding = () => {
    setIsFirstOpened()
    setFirstOpened(false)
   }

   if (FirstOpened === null) {
    // show the loading Page
    return
   }

   if (FirstOpened) {
    // show the onboardingPage
    return <Index onBoardingFunction={handleFinishOnBoarding} />
   }

   // show the tabs

  return <GestureHandlerRootView style={{flex:1}}>
    <SafeAreaProvider>
      <StatusBar />
      <Drawer options={{headerShown: false}}>
        <Drawer.Screen name="index" options={{drawerItemStyle : { display: 'none'}}}/>
        <Drawer.Screen name="(tabs)" options={{drawerLabel : "Home"}} />
        {/* <Drawer.Screen name="other-stacks" options={{drawerItemStyle : { display: 'none'}}}/> */}
      </Drawer>
    </SafeAreaProvider>
  </GestureHandlerRootView>
}
