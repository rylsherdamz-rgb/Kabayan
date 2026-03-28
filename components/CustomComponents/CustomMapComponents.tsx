import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { GOOGLE_MAPS_KEY, hasGoogleMapsKey } from "@/utils/googleMapsConfig";

const DEFAULT_COORDINATE: [number, number] = [120.9842, 14.5995]; 

type CustomMapComponentsProps = {
  markerCoordinate?: [number, number] | null;
  markerLabel?: string | null;
  onLocationSelected?: (coords: [number, number], address: string) => void;
  mode?: "full" | "preview";
};

export default function CustomMapComponents({ 
  markerCoordinate, 
  markerLabel, 
  onLocationSelected,
  mode = "full",
}: CustomMapComponentsProps) {
  const mapRef = useRef<MapView>(null);
  const autocompleteRef = useRef<GooglePlacesAutocomplete>(null);
  const [ready, setReady] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [lng, lat] = markerCoordinate ?? DEFAULT_COORDINATE;

  const region = useMemo(
    () => ({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [lat, lng]
  );

  const resolvedLabel = markerLabel?.trim() ? markerLabel : "Pinned location";

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.animateToRegion(region, 700);
  }, [ready, region]);

  useEffect(() => {
    if (!autocompleteRef.current) return;

    const nextText = markerLabel?.trim() && markerLabel !== "Pinned location" ? markerLabel : "";
    autocompleteRef.current.setAddressText(nextText);
    setSearchError(null);
  }, [markerLabel]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onMapReady={() => setReady(true)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
        mapType="standard"
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lng }}
          title={markerLabel?.trim() ? markerLabel : 'Pinned location'}
          pinColor="#2563EB"
        />
      </MapView>

      {mode === "full" ? (
        <View pointerEvents="box-none" style={styles.searchWrapper}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.leadingSearchIcon}
              onPress={() => {
                setSearchError(null);
                autocompleteRef.current?.focus?.();
              }}
              activeOpacity={0.9}
            >
              <Feather name="search" size={18} color="#334155" />
            </TouchableOpacity>
            {hasGoogleMapsKey ? (
              <GooglePlacesAutocomplete
                ref={autocompleteRef}
                placeholder={markerLabel?.trim() ? markerLabel : 'Search location...'}
                fetchDetails={true}
                minLength={2}
                debounce={250}
                nearbyPlacesAPI="GooglePlacesSearch"
                keyboardShouldPersistTaps="handled"
                onFail={(error) => {
                  const normalizedError = typeof error === "string" ? error : "Location search failed.";
                  setSearchError(normalizedError);
                }}
                onNotFound={() => setSearchError("No matching locations found.")}
                onPress={(data, details = null) => {
                  setSearchError(null);

                  if (!details?.geometry?.location) return;

                  const { lat: newLat, lng: newLng } = details.geometry.location;

                  mapRef.current?.animateToRegion({
                    latitude: newLat,
                    longitude: newLng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 700);

                  onLocationSelected?.([newLng, newLat], data.description);
                }}
                query={{
                  key: GOOGLE_MAPS_KEY,
                  language: 'en',
                }}
                styles={{
                  container: styles.autocompleteContainer,
                  textInput: styles.searchText,
                  listView: styles.listView,
                  row: styles.listRow,
                  description: styles.listDescription,
                }}
                textInputProps={{
                  autoCorrect: false,
                  clearButtonMode: "while-editing",
                  onFocus: () => setSearchError(null),
                }}
                enablePoweredByContainer={false}
              />
            ) : (
              <View style={styles.missingKeyBanner}>
                <Text style={styles.missingKeyText}>Location search is unavailable because the Google Maps API key is missing.</Text>
              </View>
            )}
          </View>

          {searchError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{searchError}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View pointerEvents="none" style={styles.previewOverlay}>
          <View style={styles.previewChip}>
            <MaterialIcons name="place" size={14} color="#2563EB" />
            <Text style={styles.previewChipText} numberOfLines={1}>
              {resolvedLabel}
            </Text>
          </View>
        </View>
      )}

      {mode === "full" ? (
        <>
          <View pointerEvents="box-none" style={styles.actionsWrap}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.9}
              onPress={() => {
                mapRef.current?.animateToRegion(region, 700);
                setSearchError(null);
              }}
            >
              <Feather name="crosshair" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View pointerEvents="box-none" style={styles.bottomSheetWrap}>
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetHandle} />
              <View style={styles.bottomSheetRow}>
                <View style={styles.bottomSheetIcon}>
                  <MaterialIcons name="place" size={18} color="#2563EB" />
                </View>
                <View style={styles.bottomSheetTextWrap}>
                  <Text style={styles.bottomSheetEyebrow}>Selected location</Text>
                  <Text style={styles.bottomSheetTitle} numberOfLines={2}>
                    {resolvedLabel}
                  </Text>
                  <Text style={styles.bottomSheetCaption}>Search above to change the pin and map focus.</Text>
                </View>
              </View>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  searchWrapper: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    zIndex: 20, 
  },
  topBar: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.98)',
    minHeight: 56,
    paddingLeft: 12,
    paddingRight: 14,
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  leadingSearchIcon: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autocompleteContainer: {
    flex: 0,
    zIndex: 20,
  },
  searchText: {
    height: 56,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 42,
    paddingRight: 12,
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 18,
    marginTop: 8,
    elevation: 7,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 30,
    maxHeight: 220,
  },
  listRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listDescription: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  missingKeyBanner: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  missingKeyText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '600',
  },
  previewOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 12,
    zIndex: 10,
  },
  previewChip: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  previewChipText: {
    marginLeft: 6,
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  bottomSheetWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    zIndex: 20,
  },
  actionsWrap: {
    position: 'absolute',
    right: 14,
    bottom: 160,
    zIndex: 20,
    gap: 10,
  },
  actionButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  bottomSheet: {
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  bottomSheetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bottomSheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bottomSheetTextWrap: {
    flex: 1,
  },
  bottomSheetEyebrow: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  bottomSheetTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  bottomSheetCaption: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
});
