import {View, Text, TextInput} from "react-native"
import {useState, useEffect} from "react"
import useDocument from "@/context/DocumentPickerContext"



export default function Register () {
    
    const documentPickerContext = useDocument()
    const {document, setDocument, documentPickerFunction}  =  documentPickerContext 

    // adding values
    const [firstname, setFirstName] = useState<string>("")
    const [lastName, setLastNamesetFirstName] = useState<string>("")
    const [validId, setValidId] =  useState<any>() 
    const [resume, setResume] = useState<>()
    



    return <View>

    </View>
}