import CustomMapViewComponent from "@/components/CustomComponents/CustomMapComponents";
import { View, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { geocodeAddress } from "@/utils/googleGeocode";

const DEFAULT_COORDINATE: [number, number] = [120.9842, 14.5995];

const normalizeParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const toFiniteNumber = (value?: string) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function CustomMapView() {
  const inset = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    location?: string | string[];
    latitude?: string | string[];
    longitude?: string | string[];
  }>();

  const initialLocation = normalizeParam(params.location) ?? "Pinned location";
  const paramLatitude = toFiniteNumber(normalizeParam(params.latitude));
  const paramLongitude = toFiniteNumber(normalizeParam(params.longitude));

  const [targetCoordinate, setTargetCoordinate] = useState<[number, number]>(DEFAULT_COORDINATE);
  const [currentLabel, setCurrentLabel] = useState(initialLocation);
  const [resolving, setResolving] = useState(false);

  const handleLocationSelected = useCallback((coords: [number, number], label: string) => {
    setTargetCoordinate(coords);
    setCurrentLabel(label);
  }, []);
  useEffect(() => {
    let active = true;

    const resolveTarget = async () => {
      if (paramLatitude !== null && paramLongitude !== null) {
        if (active) setTargetCoordinate([paramLongitude, paramLatitude]);
        return;
      }

      const trimmedLocation = initialLocation.trim();
      if (!trimmedLocation || trimmedLocation === "Pinned location") {
        if (active) setTargetCoordinate(DEFAULT_COORDINATE);
        return;
      }

      setResolving(true);
      try {
        const result = await geocodeAddress(trimmedLocation);
        if (!active) return;

        if (result) {
          setTargetCoordinate([result.longitude, result.latitude]);
        } else {
          setTargetCoordinate(DEFAULT_COORDINATE);
        }
      } finally {
        if (active) setResolving(false);
      }
    };

    resolveTarget();
    return () => {
      active = false;
    };
  }, [initialLocation, paramLatitude, paramLongitude]);

  const markerLabel = useMemo(() => {
    if (currentLabel.trim() && currentLabel !== "Pinned location") return currentLabel;
    return "Pinned location";
  }, [currentLabel]);

  return (
    <View className="flex flex-1" style={{ paddingBottom: inset.bottom, paddingTop: inset.top }}>
      {resolving && (
        <View 
          className="absolute z-50 top-20 self-center bg-white/95 rounded-2xl px-4 py-2 border border-slate-200 flex-row items-center shadow-sm"
          style={{ elevation: 10 }}
        >
          <ActivityIndicator size="small" color="#2563EB" />
          <Text className="ml-2 text-xs font-semibold text-slate-700">Locating {markerLabel}…</Text>
        </View>
      )}

      <CustomMapViewComponent 
        markerCoordinate={targetCoordinate} 
        markerLabel={markerLabel} 
        onLocationSelected={handleLocationSelected}
      />
    </View>
  );
}