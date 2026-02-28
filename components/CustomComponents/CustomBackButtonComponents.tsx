import {View, Text, Pressable} from "react-native"
import {useRouter} from "expo-router"


export default function CustomBackButton() {
    const router =useRouter()
    // change design
   return <Pressable onPress={() => router.back()}>


   </Pressable> 
}