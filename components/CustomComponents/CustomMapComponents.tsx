import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, MapView, PointAnnotation } from '@maplibre/maplibre-react-native';

const DEFAULT_COORDINATE: [number, number] = [120.9842, 14.5995]; // Manila
const STREET_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

type CustomMapComponentsProps = {
  markerCoordinate?: [number, number] | null;
  markerLabel?: string | null;
};

export default function CustomMapComponents({ markerCoordinate, markerLabel }: CustomMapComponentsProps) {
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [center, setCenter] = useState(DEFAULT_COORDINATE);
  const activeCoordinate = markerCoordinate ?? DEFAULT_COORDINATE;

  useEffect(() => {
    if (!markerCoordinate) return;
    setCenter(markerCoordinate);
    setZoomLevel(15);
    cameraRef.current?.setCamera({
      centerCoordinate: markerCoordinate,
      zoomLevel: 15,
      animationDuration: 700,
    });
  }, [markerCoordinate]);

  const marker = useMemo(() => (
    <View style={styles.markerWrap}>
      <View style={styles.markerPin} />
      <View style={styles.markerDot} />
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          style={StyleSheet.absoluteFill}
          mapStyle={STREET_STYLE}
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

          <PointAnnotation id="targetMarker" key="targetMarker" coordinate={activeCoordinate}>
            {marker}
          </PointAnnotation>
        </MapView>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <Text style={styles.searchText} numberOfLines={1}>
            {markerLabel?.trim() ? markerLabel : 'Pinned location'}
          </Text>
        </View>

      </View>
    </SafeAreaView>
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
