import CustomLoading from "@/components/CustomComponents/CustomLoadingSpinner";
import useLandingPage from "@/hooks/useLandingPage";
import Drawer from "expo-router/drawer";
import { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Index from "./index"
import { SafeAreaProvider } from "react-native-safe-area-context";
import CustomDrawerContent from "@/components/CustomComponents/CustomDrawerContent" 
import "../global.css";
import {DocumentPickerContextProvider} from "@/context/DocumentPickerContext"

export default function RootLayout() {
  const { getIsFirstOpened, setIsFirstOpened } = useLandingPage();
  const [FirstOpened, setFirstOpened] = useState<boolean | null>(false);

  useEffect(() => {
    const hasOpened = getIsFirstOpened();
    const LandingPageValue = hasOpened === undefined ? true : !hasOpened;
    setFirstOpened(LandingPageValue);
  }, []);

  // pass this funciton in the landingpage of the onboarding
  const handleFinishOnBoarding = () => {
    setIsFirstOpened();
    setFirstOpened(false);
  };

  if (FirstOpened === null) {
    return (
      <View className="flex flex-1">
        <CustomLoading />
      </View>
    );
  }

   if (FirstOpened) {
    // change this later to be the landing page
    return <Index  />
   }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <DocumentPickerContextProvider>
        <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
         screenOptions={{ headerShown: false }}>
          <Drawer.Screen
            name="/(tabs)/Home"
            options={{ drawerLabel: "Home" }}
          />
          <Drawer.Screen
            name="index"
            options={{ drawerItemStyle: { display: "none" } }}
          />
        </Drawer>
        </DocumentPickerContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
