import {Text, View} from "react-native"
import MapView from "react-native-maps"


export default function CustomMapComponents() {
    return <View className="flex flex-1">
        <MapView className="w-[100%] h-[100%]" />
    </View>
}