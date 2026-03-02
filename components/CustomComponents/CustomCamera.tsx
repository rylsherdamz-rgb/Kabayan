import  {CameraType,  CameraView, } from "expo-camera"
import {View, Text, Pressable } from "react-native"
import {useRouter} from "expo-router"
import useCamera from "@/hooks/useCamera"


export default function CustomCameraComponent() {
    const {toggleCameraFacing, facing, permission, requestPermission

    } = useCamera()
    const router = useRouter()
    

    return permission?.status === "granted"?  (<RequestPermissionComponent router={router} requestPermisson={requestPermission} />) : (<View className="flex-1">
        <CameraView className="flex-1" facing={facing} />


    </View>) 
}


function RequestPermissionComponent({requestPermission, router} : any) {
    return <View className="flex flex-col gap-y-10  justify-center items-center">
        <View className="text-lg">
            <Text className="text-black">
                Kabayan would like to Request Permission to access the Camera
            </Text>
        </View>
       <View className="flex flex-row gap-x-5">
            <Pressable onPress={requestPermission}>
                <Text className="text-md text-black">
                    Allow
                </Text>
            </Pressable>
            <Pressable onPress={()   => router.back()}>
                <Text className="text-md text-black">
                   Cancel 
                </Text>
            </Pressable>

       </View> 
    </View>
}