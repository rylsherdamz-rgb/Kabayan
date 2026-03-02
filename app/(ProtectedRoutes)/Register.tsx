import CustomBottomSheet from "@/components/CustomComponents/CustomBackButtonComponents"
import useAccount from "@/hooks/useAccountHooks"
import {useState} from "react"
import { RegisterFormType, RegisterFormSchema } from "@/schema/loginSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {View, Text, Pressable} from "react-native"

export default function Login() {
    // show only one type of registration screen out of the bottomsheet
    const {register, handleSubmit,formState: {errors}} = useForm<RegisterFormType>({
        resolver : zodResolver(RegisterFormSchema)
    })
    const [visible, setVisible]  = useState<boolean>()
    const {SignUpWithEmailAndPassword, SignInWithPassword, Resend} = useAccount() 

    


return (
    <View className="w-full h-full flex justify-center gap-y-10 items-center  bg-black">
        <View className="">
        <Text className="text-lg scale-x-150 scale-y-125 font-[800] text-white">
            Kabayan one stop shop for   
        </Text>
        </View>
        <View className="flex flex-row gap-x-5">
            <Pressable onPress={() => setVisible(true)} className="">
            <Text className="text-white">
               Register 
            </Text> 
            </Pressable>
            <Pressable onPress={() => setVisible(true)} className="">
            <Text className="text-white">
               Sign Up 
            </Text> 
            </Pressable>


        </View>
    {/* <CustomBottomSheet /> */}
    </View>
)    
}


