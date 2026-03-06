import React, { createContext, useContext, useState } from "react"
import * as ImagePicker from "expo-image-picker"

interface ImagePickerContextType {
  image: ImagePicker.ImagePickerAsset | null
  setImage: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerAsset | null>>
}

const ImagePickerContext = createContext<ImagePickerContextType | undefined>(undefined)

export const ImagePickerContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)

  return (
    <ImagePickerContext.Provider value={{ image, setImage }}>
      {children}
    </ImagePickerContext.Provider>
  )
}

export function useImagePicker() {
  const context = useContext(ImagePickerContext)

  if (!context) {
    throw new Error("useImagePicker must be used inside ImagePickerContextProvider")
  }

  const { image, setImage } = context
  const [error, setError] = useState<unknown>(null)

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        throw new Error("Permission denied")
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      })

      if (!result.canceled) {
        setImage(result.assets[0])
        return result.assets[0]
      }
    } catch (err) {
      setError(err)
    }
  }

  return { image, setImage, pickImage, error }
}