import { router } from "expo-router";
import { Modal, Text, KeyboardAvoidingView, Platform, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


interface CustomModalProps {
  authModalVisible : boolean
  setAuthModalVisible : React.Dispatch<React.SetStateAction<boolean>>
}

export default function CustomModal({authModalVisible, setAuthModalVisible} : CustomModalProps) {
    const insets = useSafeAreaInsets();
    return <Modal visible={authModalVisible} transparent animationType="slide" onRequestClose={() => setAuthModalVisible(false)}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <View className="flex-1 bg-black/50 justify-center px-4">
            <View className="bg-white rounded-3xl p-6">
              <Text className="text-xl font-black text-slate-900 mb-3">Create an account</Text>
              <Text className="text-black mb-4">Sign in to access your messages.</Text>
              <View className="flex flex-row  justify-around ">
             <TouchableOpacity  onPress={() => router.push("/(ProtectedRoutes)/AuthenticationPage")} className="mt-3 rounded-2xl px-5 py-2  bg-blue-600 text-white items-center">
                <Text className="text-white text-sm">Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => setAuthModalVisible(false)} className="mt-3 rounded-2xl px-5 py-2  border items-center">
                <Text className="text-slate-500 text-sm">Maybe later</Text>
              </TouchableOpacity>
              </View>
            </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

}
