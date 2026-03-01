import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { View,  Text, Pressable  } from "react-native";

//create schema fo rthis to ensure good auth

export default function CustomBottomSheet({ bottomSheetRef, gmail, password difficulty, setDifficulty }: any) {
  const snapPoints = useMemo(() => ["50%"], []);
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);

  useEffect(() => {
    setLocalDifficulty(difficulty);
  }, [difficulty]);

  const levels = useMemo(() => ["Easy", "Balanced", "Hard"], []);

  const handleApply = useCallback(() => {
    setDifficulty(localDifficulty); 
    bottomSheetRef.current?.close();
  }, [localDifficulty, setDifficulty, bottomSheetRef]);

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