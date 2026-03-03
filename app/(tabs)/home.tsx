import { View, Text, Pressable } from "react-native";
import {useRouter} from "expo-router"
import CustomSearchComponent from "@/components/CustomComponents/CustomSearchComponent"
import CustomMapComponents from "@/components/CustomComponents/CustomMapComponents";

export default function Home() {
  const router =useRouter()
  return (
    <View className=" w-full h-full py-4 px-[5%]">
    <View className="w-full h-10 py-2.5 px-5 rounded-2xl border  ">
      <CustomSearchComponent />      
    </View>
    <CustomMapComponents />

        </View>
  );
}
