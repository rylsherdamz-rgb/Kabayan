import CustomLoading from "@/components/CustomComponents/CustomLoadingSpinner";
import useLandingPage from "@/hooks/useLandingPage";
import { Redirect } from "expo-router";
import Drawer from "expo-router/drawer";
import { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const { getIsFirstOpened, setIsFirstOpened } = useLandingPage();
  const [FirstOpened, setFirstOpened] = useState<boolean | null>(false);
  const inset = useSafeAreaInsets();

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
    // show the loading Page

    return (
      <View className="flex flex-1">
        <CustomLoading />
      </View>
    );
  }

  //  if (FirstOpened) {
  //   // show the onboardingPage
  //   return <Index onBoardingFunction={handleFinishOnBoarding} />
  //  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <StatusBar />
        <Drawer screenOptions={{ headerShown: false }}>
          <Drawer.Screen
            name="/(tabs)/Home"
            options={{ drawerLabel: "Home" }}
          />
          <Drawer.Screen
            name="index"
            options={{ drawerItemStyle: { display: "none" } }}
          />
          {/* <Drawer.Screen name="other-stacks" options={{drawerItemStyle : { display: 'none'}}}/> */}
        </Drawer>
        {FirstOpened === false && <Redirect href={"/(tabs)/Home"} />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
