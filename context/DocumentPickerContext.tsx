import React, { createContext, useContext, useState } from "react"
import * as DocumentPicker from "expo-document-picker"

interface DocumentPickerContextType {
  document: DocumentPicker.DocumentPickerResult | null
  setDocument: React.Dispatch<
    React.SetStateAction<DocumentPicker.DocumentPickerResult | null>
  >
}

const DocumentPickerContext = createContext<DocumentPickerContextType | undefined>(
  undefined
)

export function DocumentPickerContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [document, setDocument] =
    useState<DocumentPicker.DocumentPickerResult | null>(null)

  return (
    <DocumentPickerContext.Provider value={{ document, setDocument }}>
      {children}
    </DocumentPickerContext.Provider>
  )
}

export function useDocumentPicker() {
  const context = useContext(DocumentPickerContext)

  if (!context) {
    throw new Error(
      "useDocumentPicker must be used inside DocumentPickerContextProvider"
    )
  }

  const { document, setDocument } = context
  const [error, setError] = useState<unknown>(null)

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      })

      setDocument(result)
      return result
    } catch (err) {
      setError(err)
    }
  }

  return { document, setDocument, pickDocument, error }
}