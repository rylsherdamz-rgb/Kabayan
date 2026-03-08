import CustomMapViewComponent from "@/components/CustomComponents/CustomMapComponents"
import {View} from "react-native"
import {useSafeAreaInsets} from "react-native-safe-area-context"


export default function CustomMapView () {
    const inset = useSafeAreaInsets()
    return <View className="flex flex-1" style={{paddingBottom : inset.bottom, paddingTop : inset.top}}>
    <CustomMapViewComponent />
    </View>
}