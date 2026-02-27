import {createContext, useContext, useState} from "react"
import * as ImagePicker from "expo-image-picker"


interface imagePickerContextType {
    image : ImagePicker.ImagePickerAsset | null
    setImage : React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerAsset | null>>
}

export const ImagePickerContext = createContext<imagePickerContextType | undefined>(undefined)

export const ImagePickerContextProvider = ({children} : {children : React.ReactNode}) => {
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
    
    return <ImagePickerContext.Provider value={{image, setImage}}>
        {children}
    </ImagePickerContext.Provider>
}

