import {View, Pressable, Text} from "react-native"

interface LandingPageProp {
  onBoardingFunction: () => void
}

export default function LandingPage({onBoardingFunction} : LandingPageProp) {
  return <View className="flex-1">
    <Text> this is the loadingFirst for the moment</Text>
  </View>
}