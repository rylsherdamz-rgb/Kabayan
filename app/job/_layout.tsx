import {Stack} from "expo-router"
import {Pressable} from "react-native"
import {Feather} from "@expo/vector-icons"



export default function JobLayout() {
    <Stack screenOptions={{
        headerRight : () => null,
        headerTitle : () => null,
        headerLeft : () => (
            <Pressable>
                <Feather name="arrow-left" color="#fff" size={20} />
            </Pressable>
        ),
    }}/>
        

}