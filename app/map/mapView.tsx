import CustomMapViewComponent from "@/components/CustomComponents/CustomMapComponents";
import { View, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";

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

  const locationLabel = normalizeParam(params.location) ?? "Pinned location";
  const paramLatitude = toFiniteNumber(normalizeParam(params.latitude));
  const paramLongitude = toFiniteNumber(normalizeParam(params.longitude));

  const [targetCoordinate, setTargetCoordinate] = useState<[number, number]>(DEFAULT_COORDINATE);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    let active = true;

    const resolveTarget = async () => {
      if (paramLatitude !== null && paramLongitude !== null) {
        if (active) setTargetCoordinate([paramLongitude, paramLatitude]);
        return;
      }

      const trimmedLocation = locationLabel.trim();
      if (!trimmedLocation) {
        if (active) setTargetCoordinate(DEFAULT_COORDINATE);
        return;
      }

      setResolving(true);
      try {
        const geocoded = await Location.geocodeAsync(trimmedLocation);
        if (!active) return;

        if (geocoded.length > 0) {
          setTargetCoordinate([geocoded[0].longitude, geocoded[0].latitude]);
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
  }, [locationLabel, paramLatitude, paramLongitude]);

  const markerLabel = useMemo(() => {
    if (locationLabel.trim()) return locationLabel;
    return "Pinned location";
  }, [locationLabel]);

  return (
    <View className="flex flex-1" style={{ paddingBottom: inset.bottom, paddingTop: inset.top }}>
      {resolving ? (
        <View className="absolute z-10 top-3 self-center bg-white/95 rounded-2xl px-4 py-2 border border-slate-200 flex-row items-center">
          <ActivityIndicator size="small" />
          <Text className="ml-2 text-xs font-semibold text-slate-700">Locating {markerLabel}…</Text>
        </View>
      ) : null}

      <CustomMapViewComponent markerCoordinate={targetCoordinate} markerLabel={markerLabel} />
    </View>
  );
}
