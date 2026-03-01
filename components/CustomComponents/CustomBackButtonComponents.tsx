import {View, Text, Pressable} from "react-native"
import {useRouter} from "expo-router"
import {Feather} from "@expo/vector-icons"


export default function CustomBackButton() {
    const router =useRouter()
   return <Pressable className="ml-5" onPress={() => router.back()}>
    <Feather  size={18} color="#fff" name="arrow-left" />
   </Pressable> 
}