import { View, Text, TextInput, Pressable } from "react-native"
import { useState } from "react"
import {useDocumentPicker} from "@/context/DocumentPickerContext"

export default function Register() {
  const documentPickerContext = useDocumentPicker()
  const { document, setDocument, pickDocument } = documentPickerContext

  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")

  const [validId, setValidId] = useState<any>(null)
  const [resume, setResume] = useState<any>(null)

  const handlePickValidId = async () => {
    const file = await pickDocument()
    if (file) {
      setValidId(file)
    }
  }

  const handlePickResume = async () => {
     await pickDocument()
    setResume(document)    
  }

  const handleSubmit = () => {
    const data = {
      firstName,
      lastName,
      validId,
      resume
    }
    }

  return (
    <View style={{ padding: 20, gap: 16 }}>

      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
     Registration
      </Text>

      <View>
        <Text>First Name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          style={{
            borderWidth: 1,
            padding: 10,
            borderRadius: 8
          }}
        />
      </View>

      <View>
        <Text>Last Name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          style={{
            borderWidth: 1,
            padding: 10,
            borderRadius: 8
          }}
        />
      </View>

      <Pressable
        onPress={handlePickValidId}
        style={{
          padding: 12,
          backgroundColor: "#ddd",
          borderRadius: 8
        }}
      >
        <Text>
          {validId ? "Valid ID Uploaded ✓" : "Upload Valid ID"}
        </Text>
      </Pressable>

      {/* Resume */}
      <Pressable
        onPress={handlePickResume}
        style={{
          padding: 12,
          backgroundColor: "#ddd",
          borderRadius: 8
        }}
      >
        <Text>
          {resume ? "Resume Uploaded ✓" : "Upload Resume"}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleSubmit}
        style={{
          padding: 14,
          backgroundColor: "black",
          borderRadius: 10,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Submit Registration
        </Text>
      </Pressable>

    </View>
  )
}