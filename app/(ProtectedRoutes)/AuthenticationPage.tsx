import AuthenticationForm from "@/components/Auth/AuthenticationForm"
import {View} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"


export default function AuthenticationPage () {
    const inset = useSafeAreaInsets()
    return <View style={{paddingTop :90 +  inset.top}} className=" flex-1 flex  ">
    <AuthenticationForm mode="signIn" />
    </View>
}