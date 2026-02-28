import {Text, View} from "react-native"
import MapView,  {Marker, PROVIDER_DEFAULT, UrlTile} from "react-native-maps"

export default function CustomMapComponents() {
    return <View className="flex flex-1">
        <MapView
         className="w-[100%] h-[100%] flex flex-1 "
        mapType="none" 
        customMapStyle={[]}
         />
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        <Marker coordinate={{ latitude: 14.5995, longitude: 120.9842 }} />
    </View>
}