import {useCameraPermissions, 
    CameraType, 
    FlashMode,
     CameraMode,
      CameraRatio,
       VideoQuality,
       VideoStabilization,
    } from "expo-camera"
import {useState} from "react"

export default function useCamera() {
    // define type for other things in the componente  in other to use this more safely
    const [facing, setFacing] = useState<CameraType>("back")
    const [flash, setFlash] = useState<FlashMode>("off")
    const [cameraMode, setCameraMode] = useState<CameraMode>("picture")
    const [permission, requestPermission]  = useCameraPermissions()
    const [videoQuality, setVideoQuality] = useState<VideoQuality>("720p")
    const [cameraRatio, setCameraRatio] = useState<CameraRatio>("4:3")
    const [videoStabilization, setVideoStabilization] = useState<VideoStabilization>("off")
    
    const toggleCameraFacing = () => {
        setFacing(current => current === "back" ? "front" : "back")
    }
    const toggleCameraFlash = () => {
        setFlash(current => current === "off" ? "on" : "off")
    }
    const toggleCameraMode = () => {
        setCameraMode(current => current === "picture" ? "video"  : "picture")
    } 

    return {toggleCameraMode, toggleCameraFlash, toggleCameraFacing, facing,
            flash, cameraMode,permission, requestPermission, videoQuality, setVideoQuality,
            cameraRatio, setCameraRatio, videoStabilization,setVideoStabilization
    }
}