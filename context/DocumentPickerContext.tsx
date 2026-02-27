import React, {createContext, useContext, useState} from "react"
import * as DocumentPicker from "expo-document-picker" 

// only use this document picker in the unessary page to ensure it works

interface DocumentPickerContextType {
    document? : DocumentPicker.DocumentPickerResult | null
    setDocument : React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerResult| null>> 
}


export const DocumentPickerContext = createContext<DocumentPickerContextType | undefined>(undefined)

export function DocumentPickerContextProvider({children} : {children :React.ReactNode}) {
    const [document, setDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null)
    return <DocumentPickerContext.Provider value={{document, setDocument}}>
        {children}
    </DocumentPickerContext.Provider> 
}


export default function useDocumentPicker() {
    const documentPickerContext = useContext(DocumentPickerContext)
    if (!documentPickerContext) return null
    const {document, setDocument} = documentPickerContext
    const [error, setError] = useState<any>()

    const DocumentPickerFunction  = async () => {
        try {
        const documentPicked = await DocumentPicker.getDocumentAsync({
            type : ["images/*", "pdf/application"],
            copyToCacheDirectory : true,
            multiple : false
        })

        setDocument(documentPicked)
        return documentPicked
        } catch (err) {
           setError(err) 
        }
    }

    return {document, setDocument, DocumentPickerFunction}
}