import react, {createContext, useContext, useState} from "react"
import * as DocumentPicker from "expo-document-picker" 

// only use this document picker in the unessary page to ensure it works

interface DocumentPickerContext {
    document? : DocumentPicker.DocumentPickerSuccessResult
    setDocument : React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerSuccessResult | null>> 
    documentPickerFunction :  () => Promise<DocumentPicker.DocumentPickerSuccessResult | null>
}


export const DocumentPickerContext = createContext<DocumentPickerContext | undefined>(undefined)



