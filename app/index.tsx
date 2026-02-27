import {View, Pressable, Text} from "react-native"

interface LandingPageProp {
  onBoardingFunction: () => void
}

export default function LandingPage({onBoardingFunction} : LandingPageProp) {
  return <View className="flex-1 gap-y-5">
    <Text> this is the loadingFirst for the moment</Text>
    <Pressable className="" onPress={onBoardingFunction}>
      Enter
    </Pressable>
  </View>
}