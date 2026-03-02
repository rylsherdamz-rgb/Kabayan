import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { View,  Text, Pressable  } from "react-native";
import bottomSheet from "@gorhom/bottom-sheet"

//create schema fo rthis to ensure good auth

interface CustomBottomSheet {
  bottomSheetRef : React.ForwardedRef<bottomSheet>
}

export default function CustomBottomSheet({ bottomSheetRef }: CustomBottomSheet) {
  const snapPoints = useMemo(() => ["100%"], []);


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
        <View>

        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}