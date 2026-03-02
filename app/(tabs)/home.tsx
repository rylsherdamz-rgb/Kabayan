import { View, Text, } from "react-native";
import CustomSearchComponent from "@/components/CustomComponents/CustomSearchComponent"

export default function Home() {
  return (
    <View className=" w-full h-full py-4 px-[5%]">
    <View className="w-full h-10 py-2.5 px-5 rounded-2xl border  ">
      <CustomSearchComponent />      
    </View>

    </View>
  );
}
