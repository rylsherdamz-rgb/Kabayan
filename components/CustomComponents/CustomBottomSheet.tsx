import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { View,  Text, Pressable, TextInput  } from "react-native";
import bottomSheet from "@gorhom/bottom-sheet"
import useAccount from "@/hooks/useAccountHooks";
import { RegisterFormType, RegisterFormSchema } from "@/schema/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";


//create schema fo rthis to ensure good auth

interface CustomBottomSheet {
  bottomSheetRef : React.ForwardedRef<bottomSheet>
  type : string
}

export default function CustomBottomSheet({ bottomSheetRef, type }: CustomBottomSheet) {
  const snapPoints = useMemo(() => ["100%"], []);
  const {register, handleSubmit,formState: {errors}} = useForm<RegisterFormType>({
        resolver : zodResolver(RegisterFormSchema)
    })
    const [isSignIn, setIsSignIn]  = useState<boolean>()

    const {SignUpWithEmailAndPassword, SignInWithPassword, Resend, data, error, setData, setError} = useAccount() 
    const [username, setUsername] = useState<any >("")
    const [password, setPassword] = useState<any >("")

    
    const handleRegistration = () => {
      type === "signIn" ? SignInWithPassword(username, password) : SignUpWithEmailAndPassword(username, password)
    }
    
    





  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop 
        {...props} 
        disappearsOnIndex={-1} 
        appearsOnIndex={0} 
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#D4D4D4", width: 40 }}
      backgroundStyle={{ borderRadius: 40 }}
    >
      <BottomSheetView style={{ padding: 32 }}>
        <View className="flex flex-col gap-y-5">
          <Text>
            {type}
          </Text>
          <View className="flex flex-col text-black gap-y-3">
          <Text className="">
            Gmail
          </Text>
          <TextInput
           value={username}
           className="border text-black rounded-lg"
           placeholder="Enter Gmail"
           onChange={(text) => setUsername(text)}
           />
          </View>
         <View className="flex flex-col text-black gap-y-3">
          <Text className="">
           Password 
          </Text>
          <TextInput
           value={password}
           placeholder="Enter Gmail"
           className="border rounded-lg text-black"
           onChange={(text) => setPassword(text)}
           />
          </View>
          <Pressable
            onPress={handleRegistration}
           className="border rounded-lg  justify-center w-20 h-10 items-center">
            <Text>
              Login
            </Text>
          </Pressable>
          <Text>{data}</Text>
       </View>
      </BottomSheetView>
    </BottomSheet>
  );
}