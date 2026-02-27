import {View, Pressable, Text} from "react-native"
import {useSafeAreaInsets} from "react-native-safe-area-context"
import {useRouter} from "expo-router"

interface LandingPageProp {
  onBoardingFunction: () => void
}

export default function LandingPage({onBoardingFunction} : LandingPageProp) {
  const router = useRouter()
  const inset = useSafeAreaInsets()
  return <View style={{marginTop : inset.top}}  className="flex flex-1 gap-y-5">
    <Text> this is the loadingFirst for the moment</Text>
    <Pressable className="w-10 h-5 bg-green-900 rounded-lg" onPress={() => router.push("/(tabs)/Home")}>
      <Text>
        Enter
      </Text>
    </Pressable>
  </View>
}