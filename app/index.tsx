import {View, Pressable, Text} from "react-native"
import {useSafeAreaInsets} from "react-native-safe-area-context"

interface LandingPageProp {
  onBoardingFunction: () => void
}

export default function LandingPage({onBoardingFunction} : LandingPageProp) {
  const inset = useSafeAreaInsets()
  return <View style={{marginTop : inset.top}}  className="flex-1 gap-y-5">
    <Text> this is the loadingFirst for the moment</Text>
    <Pressable className="w-20 h-5 bg-green-200 rounded-lg" onPress={onBoardingFunction}>
      Enter
    </Pressable>
  </View>
}