import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, MapView, PointAnnotation, UserLocation } from '@maplibre/maplibre-react-native';

const DEFAULT_COORDINATE: [number, number] = [120.9842, 14.5995]; // Manila
const STREET_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export default function CustomMapComponents() {
  const cameraRef = useRef<Camera>(null);
  const [mapStyle, setMapStyle] = useState<string>(STREET_STYLE);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [center, setCenter] = useState(DEFAULT_COORDINATE);

  const marker = useMemo(() => (
    <View style={styles.markerWrap}>
      <View style={styles.markerPin} />
      <View style={styles.markerDot} />
    </View>
  ), []);

  const updateCamera = (payload: { zoom?: number; center?: [number, number]; pitch?: number }) => {
    cameraRef.current?.setCamera({
      centerCoordinate: payload.center ?? center,
      zoomLevel: payload.zoom ?? zoomLevel,
      pitch: payload.pitch ?? 28,
      animationDuration: 320,
    });
  };

  const changeZoom = (delta: number) => {
    const nextZoom = Math.min(18, Math.max(3, zoomLevel + delta));
    setZoomLevel(nextZoom);
    updateCamera({ zoom: nextZoom });
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          style={StyleSheet.absoluteFill}
          mapStyle={mapStyle}
          logoEnabled={false}
          compassEnabled
          attributionEnabled
          attributionPosition={{ bottom: 10, right: 10 }}
          rotateEnabled
          pitchEnabled
          zoomEnabled
          onRegionDidChange={(feature) => {
            const nextCenter = feature.geometry.coordinates as [number, number];
            setCenter(nextCenter);
            setZoomLevel(feature.properties.zoomLevel);
          }}
        >
          <Camera
            ref={cameraRef}
            zoomLevel={zoomLevel}
            centerCoordinate={center}
            pitch={0}
            heading={0}
          />

          <UserLocation visible showsUserHeadingIndicator androidRenderMode="gps" />

          <PointAnnotation id="manilaMarker" coordinate={DEFAULT_COORDINATE}>
            {marker}
          </PointAnnotation>
        </MapView>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <Text style={styles.searchText}>Search places</Text>
        </View>

</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  searchBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.04)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchText: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  controls: {
    position: 'absolute',
    right: 14,
    bottom: 110,
    gap: 8,
  },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  infoCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoSubtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  directionsText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 32,
    height: 32,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f8fafc',
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  markerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});
