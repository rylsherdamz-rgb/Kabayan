import AuthenticationForm from "@/components/Auth/AuthenticationForm"
import {View} from "react-native"


export default function AuthenticationPage () {
    return <View className=" flex-1 flex justify-center">
    <AuthenticationForm mode="signIn"   />
    </View>
}