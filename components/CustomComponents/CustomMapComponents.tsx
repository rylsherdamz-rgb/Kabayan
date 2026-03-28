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
};

export default function CustomMapComponents({ 
  markerCoordinate, 
  markerLabel, 
  onLocationSelected 
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

      <View pointerEvents="box-none" style={styles.searchWrapper}>
        <View style={styles.topCard}>
          <View style={styles.topCardHeader}>
            <View style={styles.topCardTitleWrap}>
              <Text style={styles.topCardEyebrow}>Map Search</Text>
              <Text style={styles.topCardTitle} numberOfLines={1}>
                {resolvedLabel}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                setSearchError(null);
                autocompleteRef.current?.focus?.();
              }}
              activeOpacity={0.9}
            >
              <Feather name="search" size={16} color="#FFFFFF" />
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

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

      <View pointerEvents="box-none" style={styles.bottomSheetWrap}>
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetIcon}>
            <MaterialIcons name="place" size={18} color="#2563EB" />
          </View>
          <View style={styles.bottomSheetTextWrap}>
            <Text style={styles.bottomSheetEyebrow}>Selected location</Text>
            <Text style={styles.bottomSheetTitle} numberOfLines={2}>
              {resolvedLabel}
            </Text>
          </View>
        </View>
      </View>
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
  topCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  topCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  topCardTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  topCardEyebrow: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  topCardTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  searchButton: {
    height: 40,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  autocompleteContainer: {
    flex: 0,
    zIndex: 20,
  },
  searchText: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
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
    borderRadius: 14,
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
  bottomSheetWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    zIndex: 20,
  },
  bottomSheet: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
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
});
