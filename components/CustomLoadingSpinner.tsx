import {View, ActivityIndicator} from "react-native"

export default function CustomLoadingSpinner(){
    return <View className="flex flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
    </View>
}