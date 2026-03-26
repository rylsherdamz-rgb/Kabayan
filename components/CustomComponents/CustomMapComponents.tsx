import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const DEFAULT_COORDINATE: [number, number] = [120.9842, 14.5995]; 
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY ?? '';

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
  const [ready, setReady] = useState(false);

  const [lng, lat] = markerCoordinate ?? DEFAULT_COORDINATE;

  const region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.animateToRegion(region, 700);
  }, [markerCoordinate, ready]);

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

      <View style={styles.searchWrapper}>
        <GooglePlacesAutocomplete
          placeholder={markerLabel?.trim() ? markerLabel : 'Search location...'}
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              const { lat: newLat, lng: newLng } = details.geometry.location;
              
              mapRef.current?.animateToRegion({
                latitude: newLat,
                longitude: newLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }, 700);

              if (onLocationSelected) {
                onLocationSelected([newLng, newLat], data.description);
              }
            }
          }}
          query={{
            key: GOOGLE_MAPS_KEY,
            language: 'en',
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInput: styles.searchText,
            listView: styles.listView,
          }}
          enablePoweredByContainer={false}
        />
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
    zIndex: 1, 
  },
  autocompleteContainer: {
    flex: 0,
  },
  searchText: {
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginTop: 5,
    elevation: 7,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});