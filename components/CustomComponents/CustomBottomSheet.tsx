import BottomSheet, { BottomSheetBackdrop, BottomSheetView  } from "@gorhom/bottom-sheet";
import React, { useMemo, useCallback, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import useAccount from "@/hooks/useAccountHooks";

interface CustomBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  type: "signIn" | "signUp";
}

export default function CustomBottomSheet({ bottomSheetRef, type }: CustomBottomSheetProps) {
  const snapPoints = useMemo(() => ["100%"], []);

  const { SignUpWithEmailAndPassword, SignInWithPassword, data } = useAccount();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistration = () => {
    if (type === "signIn") {
      SignInWithPassword({email : username, password});
    } else {
      SignUpWithEmailAndPassword({email : username, password});
    }
  };

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
          <Text>{type}</Text>

          <View className="flex flex-col gap-y-3">
            <Text>Gmail</Text>
            <TextInput
              value={username}
              className="border text-black rounded-lg px-3 py-2"
              placeholder="Enter Gmail"
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View className="flex flex-col gap-y-3">
            <Text>Password</Text>
            <TextInput
              value={password}
              placeholder="Enter password"
              className="border rounded-lg text-black px-3 py-2"
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            onPress={handleRegistration}
            className="border rounded-lg justify-center w-20 h-10 items-center"
          >
            <Text>Login</Text>
          </Pressable>

        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}