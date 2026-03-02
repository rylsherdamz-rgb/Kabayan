import {TextInput,Text, View, Pressable} from "react-native"
import {Feather, Ionicons, FontAwesome5} from "@expo/vector-icons"
import {useState} from "react"


export default function CustomSearchComponent() {

    function NavigateToMap() {

    }

    return <Pressable className=" text-black h-10 -mt-1 flex flex-row gap-x-3">
        <Feather name="search" className="w-1/8"  color="black" size={20} />
        <TextInput className=" w-3/4 -mt-4   placeholder:text-gray-400 "    placeholder="Search here..." />  
        <Pressable className="w-1/8 " >
        <FontAwesome5 name="map-marked-alt"   color="black" size={20}  />
        </Pressable>
    </Pressable> 
}