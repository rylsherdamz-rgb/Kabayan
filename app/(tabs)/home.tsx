import { View, Text, } from "react-native";


export default function Home() {
  return (
    <View className="bg-black flex flex-1">
      <Text className="text-blue-300">Home</Text>
      <View className="text-ellipsis">
        <Text>Hello</Text>
      </View>
    </View>
  );
}
